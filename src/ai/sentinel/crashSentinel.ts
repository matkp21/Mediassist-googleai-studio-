/**
 * MediAssistant — Crash Sentinel Brain Module (Brain-3)
 * =========================================================
 * Complements Brain-1 (Orchestrator) and Brain-2 (Clinical Specialist).
 *
 * Design inspirations:
 *  • PostHog: exception fingerprinting, burst protection, before_send hooks
 *  • OpenHands: autonomous runtime recovery with state rollback
 *  • crewAI: @router conditional dispatch, structured state (Pydantic → Zod)
 *  • cline: proactive error surface with actionable suggestions
 *  • n8n: error-workflow branching
 *
 * Responsibilities:
 *  1. Intercept ALL errors from Genkit flows before they propagate
 *  2. Classify → Route → Recover (or escalate)
 *  3. Emit structured telemetry to Firestore audit log
 *  4. Enforce circuit breakers across AI endpoints
 *  5. Health-check dashboard state (queryable by frontend)
 */

import { z } from "zod";
import { classifyError, ClassifiedError } from "./errorTaxonomy";
import { BREAKERS } from "./circuitBreaker";
import { executeRecovery } from "./retryStrategy";

// ─── Sentinel State (queryable snapshot) ─────────────────────────────────────

export const SentinelStateSchema = z.object({
  isHealthy: z.boolean().default(true),
  totalErrorsCaptured: z.number().default(0),
  errorsByClass: z.record(z.number()).default({}),
  activeCircuits: z.array(z.object({
    name: z.string(),
    state: z.enum(["CLOSED", "OPEN", "HALF_OPEN"]),
    recentFailures: z.number(),
  })).default([]),
  lastError: z.custom<ClassifiedError>().nullable().default(null),
  burstWindowErrors: z.number().default(0),
  burstWindowStart: z.number().nullable().default(null),
});
export type SentinelState = z.infer<typeof SentinelStateSchema>;

// ─── Telemetry Sink ───────────────────────────────────────────────────────────

export interface TelemetrySink {
  /** Persist to Firestore /errors/{uid}/events or Cloud Logging */
  logError(err: ClassifiedError): Promise<void>;
  /** Update health dashboard document */
  setHealth(state: SentinelState): Promise<void>;
}

/** No-op sink for testing / local dev */
export const consoleSink: TelemetrySink = {
  async logError(err) {
    console.error("[CrashSentinel]", JSON.stringify(err, null, 2));
  },
  async setHealth(state) {
    console.info("[CrashSentinel:health]", JSON.stringify(state, null, 2));
  },
};

// ─── Before-Send Hook (PostHog pattern) ──────────────────────────────────────

export type BeforeSendHook = (err: ClassifiedError) => ClassifiedError | null;

/** Strip PII from error metadata before logging */
const defaultBeforeSend: BeforeSendHook = (err) => {
  // Drop anything that could contain PHI
  const safe = { ...err };
  if (safe.metadata) {
    const { patientData: _, promptText: __, ...rest } = safe.metadata as Record<string, unknown>;
    safe.metadata = rest;
  }
  return safe;
};

// ─── Burst Protection (PostHog pattern) ──────────────────────────────────────

const BURST_WINDOW_MS = 10_000;
const BURST_MAX = 20; // max errors per 10s before muting

// ─── Crash Sentinel Brain ─────────────────────────────────────────────────────

export class CrashSentinelBrain {
  private state: SentinelState = SentinelStateSchema.parse({});
  private readonly sink: TelemetrySink;
  private readonly beforeSend: BeforeSendHook;

  constructor(sink: TelemetrySink = consoleSink, beforeSend = defaultBeforeSend) {
    this.sink = sink;
    this.beforeSend = beforeSend;
    console.info("[CrashSentinel] Brain-3 initialized");
  }

  // ── Public API ──────────────────────────────────────────────────────────────

  /**
   * Wraps any async Genkit flow or Cloud Function call with full error handling.
   * This is the primary entry point — wrap every AI call with this.
   */
  async guard<T>(
    fn: () => Promise<T>,
    context?: { brainModule?: string; flowId?: string; userId?: string }
  ): Promise<T> {
    // Pick circuit breaker based on brainModule hint
    const breakerKey = context?.brainModule?.includes("Brain-2") ? "medGemma4B" : "gemini15Pro";
    const breaker = BREAKERS[breakerKey as keyof typeof BREAKERS]();

    try {
      return await breaker.guard(fn);
    } catch (rawErr) {
      return this.handleError(rawErr, fn, context);
    }
  }

  /** Manually capture an error without a recovery attempt */
  capture(raw: unknown, context?: { brainModule?: string; flowId?: string; userId?: string }) {
    const msg = raw instanceof Error ? raw.message : String(raw);
    const status = (raw as { status?: number }).status;
    const classified = classifyError({ message: msg, status }, context);
    this.ingest(classified);
  }

  /** Return a snapshot of Sentinel health (for API /health endpoint) */
  snapshot(): SentinelState {
    return {
      ...this.state,
      activeCircuits: [
        BREAKERS.gemini15Pro(),
        BREAKERS.medGemma4B(),
        BREAKERS.pubmedMCP(),
        BREAKERS.openFdaMCP(),
      ].map(b => b.snapshot()),
    };
  }

  // ── Private ────────────────────────────────────────────────────────────────

  private async handleError<T>(
    rawErr: unknown,
    fn: () => Promise<T>,
    context?: { brainModule?: string; flowId?: string; userId?: string }
  ): Promise<T> {
    const msg = rawErr instanceof Error ? rawErr.message : String(rawErr);
    const status = (rawErr as { status?: number }).status;

    const classified = classifyError({ message: msg, status }, context);
    this.ingest(classified);

    if (classified.isFatal) {
      await this.sink.logError(classified);
      await this.updateHealth();
      throw new Error(`[Brain-3:CrashSentinel] Fatal error — ${classified.errorClass}: ${msg}`);
    }

    // Delegate recovery to RetryEngine
    try {
      return await executeRecovery({
        fn: (_attempt) => fn(),
        error: classified,
        onModelSwitch: (model) => {
          console.warn(`[Brain-3] Model switch → ${model}`);
        },
      });
    } catch (recoveryErr) {
      // Recovery exhausted
      classified.isFatal = true;
      await this.sink.logError(classified);
      await this.updateHealth();
      throw recoveryErr;
    }
  }

  private ingest(err: ClassifiedError) {
    // Burst protection
    const now = Date.now();
    if (!this.state.burstWindowStart || now - this.state.burstWindowStart > BURST_WINDOW_MS) {
      this.state.burstWindowStart = now;
      this.state.burstWindowErrors = 0;
    }
    this.state.burstWindowErrors++;
    if (this.state.burstWindowErrors > BURST_MAX) {
      console.warn("[Brain-3] Burst limit reached — muting error logs");
      return;
    }

    // before_send hook (PHI sanitisation)
    const sanitized = this.beforeSend(err);
    if (!sanitized) return;

    // Update state counters
    this.state.totalErrorsCaptured++;
    this.state.errorsByClass[err.errorClass] =
      (this.state.errorsByClass[err.errorClass] ?? 0) + 1;
    this.state.lastError = sanitized;
    this.state.isHealthy = !err.isFatal;

    // Async side-effects (non-blocking)
    void this.sink.logError(sanitized);
    void this.updateHealth();
  }

  private async updateHealth() {
    const snap = this.snapshot();
    await this.sink.setHealth(snap);
  }
}

// ─── Singleton export ─────────────────────────────────────────────────────────

let _sentinel: CrashSentinelBrain | null = null;

export function getSentinel(sink?: TelemetrySink): CrashSentinelBrain {
  if (!_sentinel) {
    _sentinel = new CrashSentinelBrain(sink ?? consoleSink);
  }
  return _sentinel;
}
