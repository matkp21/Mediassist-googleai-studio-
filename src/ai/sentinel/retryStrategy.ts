/**
 * MediAssistant — Retry Strategy Engine
 * Inspired by: n8n retry-node patterns, Aider adaptive recovery, crewAI Flow routing
 *
 * Implements per-strategy retry logic mapped from classifyError() results.
 */

import { ClassifiedError, RecoveryStrategy } from "./errorTaxonomy";

// ─── Backoff Calculator ───────────────────────────────────────────────────────

export function computeBackoffMs(
  attempt: number,
  baseMs = 1_000,
  maxMs = 32_000,
  jitter = true
): number {
  const exp = Math.min(baseMs * Math.pow(2, attempt), maxMs);
  return jitter ? exp * (0.5 + Math.random() * 0.5) : exp;
}

// ─── Context Truncator (TOKEN_LIMIT_EXCEEDED) ─────────────────────────────────

export interface TruncationOptions {
  maxTokenEstimate?: number;  // rough chars/4 heuristic
  keepSystemPrompt?: boolean;
  keepLastNTurns?: number;
}

export function truncateMessages(
  messages: Array<{ role: string; content: string }>,
  opts: TruncationOptions = {}
): Array<{ role: string; content: string }> {
  const { maxTokenEstimate = 900_000, keepSystemPrompt = true, keepLastNTurns = 8 } = opts;

  const system = messages.filter(m => m.role === "system");
  const nonSystem = messages.filter(m => m.role !== "system");

  // Keep last N turns (user+assistant pairs)
  const trimmed = nonSystem.slice(-keepLastNTurns * 2);

  const base = keepSystemPrompt ? [...system, ...trimmed] : trimmed;

  // Rough token estimate: 1 token ≈ 4 chars
  let totalChars = base.reduce((acc, m) => acc + m.content.length, 0);
  if (totalChars / 4 <= maxTokenEstimate) return base;

  // Progressively truncate oldest non-system messages
  const result = [...base];
  while (result.length > (keepSystemPrompt ? system.length + 2 : 2)) {
    const idx = keepSystemPrompt ? system.length : 0;
    result.splice(idx, 1);
    totalChars = result.reduce((acc, m) => acc + m.content.length, 0);
    if (totalChars / 4 <= maxTokenEstimate) break;
  }
  return result;
}

// ─── Retry Orchestrator ────────────────────────────────────────────────────────

export interface RetryContext<T> {
  fn: (attempt: number) => Promise<T>;
  error: ClassifiedError;
  /** Called when switching to fallback model */
  onModelSwitch?: (model: "medgemma-4b") => void;
  /** Called when messages need truncation */
  onTruncate?: (messages: Array<{ role: string; content: string }>) =>
    Array<{ role: string; content: string }>;
}

/**
 * Execute a recovery strategy against a classified error.
 * Mirrors crewAI's @listen + @router event-driven dispatch.
 */
export async function executeRecovery<T>(ctx: RetryContext<T>): Promise<T> {
  const { fn, error, onModelSwitch } = ctx;
  const strategy: RecoveryStrategy = error.recoveryStrategy;

  switch (strategy) {
    // ── Transient: exponential backoff ────────────────────────────────────
    case "RETRY_WITH_BACKOFF": {
      let attempt = error.retryCount;
      while (attempt < error.maxRetries) {
        const delay = computeBackoffMs(attempt);
        console.info(
          `[RetryEngine] ${strategy} attempt ${attempt + 1}/${error.maxRetries} in ${Math.round(delay)}ms`
        );
        await sleep(delay);
        try {
          return await fn(attempt);
        } catch {
          attempt++;
        }
      }
      throw new Error(`[RetryEngine] Exhausted retries for ${error.errorClass}`);
    }

    // ── Context window overflow: truncate then retry once ─────────────────
    case "RETRY_WITH_SMALLER_CONTEXT": {
      console.info("[RetryEngine] Truncating context and retrying...");
      return await fn(1); // caller must use onTruncate internally
    }

    // ── Model overloaded: switch to MedGemma 4B fallback ─────────────────
    case "SWITCH_FALLBACK_MODEL": {
      console.warn("[RetryEngine] Gemini 2.5 Pro overloaded → switching to MedGemma 4B");
      onModelSwitch?.("medgemma-4b");
      await sleep(2_000);
      return await fn(0);
    }

    // ── Genkit model not supplied: surface actionable error ───────────────
    case "FIX_MODEL_IMPORT": {
      throw new Error(
        "[MediAssistant] Genkit model reference missing. " +
        "Fix:  and pass directly to generate(). " +
        "Do NOT use string literals like 'gemini-2.5-pro' without explicit plugin import."
      );
    }

    // ── Schema validation: ask AI to re-emit ──────────────────────────────
    case "SCHEMA_REPAIR_WITH_AI": {
      console.warn("[RetryEngine] Zod validation failed — requesting AI schema repair");
      await sleep(500);
      return await fn(0); // caller should inject schema repair prompt
    }

    // ── Auth: refresh Firebase token ──────────────────────────────────────
    case "REFRESH_AUTH_TOKEN": {
      console.warn("[RetryEngine] Auth failure — triggering token refresh");
      // caller should handle actual token refresh via Firebase Auth SDK
      await sleep(1_000);
      return await fn(0);
    }

    // ── Fatal / non-recoverable ───────────────────────────────────────────
    case "HALT_AND_ALERT":
    case "SURFACE_TO_USER":
    case "NOOP":
    default:
      throw error;
  }
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
