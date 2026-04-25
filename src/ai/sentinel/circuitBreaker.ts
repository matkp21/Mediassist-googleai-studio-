/**
 * MediAssistant — Circuit Breaker
 * Inspired by OpenHands runtime stability patterns + crewAI Flow state management
 *
 * Prevents cascade failures when Gemini API is overloaded.
 * Three states: CLOSED (normal) → OPEN (tripping) → HALF_OPEN (probing)
 */

import { z } from "zod";

export const CircuitStateSchema = z.enum(["CLOSED", "OPEN", "HALF_OPEN"]);
export type CircuitState = z.infer<typeof CircuitStateSchema>;

export const CircuitConfigSchema = z.object({
  failureThreshold: z.number().default(5),      // failures before OPEN
  successThreshold: z.number().default(2),       // successes in HALF_OPEN before CLOSED
  openDurationMs: z.number().default(30_000),    // 30s before trying HALF_OPEN
  windowMs: z.number().default(60_000),          // rolling window for failure count
});
export type CircuitConfig = z.infer<typeof CircuitConfigSchema>;

export class CircuitBreaker {
  private state: CircuitState = "CLOSED";
  private failures: number[] = [];   // timestamps of recent failures
  private successes = 0;
  private openedAt?: number;
  private readonly name: string;
  private readonly config: Required<CircuitConfig>;

  constructor(name: string, config?: Partial<CircuitConfig>) {
    this.name = name;
    this.config = CircuitConfigSchema.parse(config ?? {}) as Required<CircuitConfig>;
  }

  get currentState(): CircuitState { return this.state; }
  get circuitName(): string { return this.name; }

  /** Call before making an AI request. Throws if circuit is OPEN. */
  async guard<T>(fn: () => Promise<T>): Promise<T> {
    this.maybeTransitionToHalfOpen();

    if (this.state === "OPEN") {
      const remainingMs = this.config.openDurationMs - (Date.now() - (this.openedAt ?? 0));
      throw new Error(
        `[CircuitBreaker:${this.name}] OPEN — retry in ${Math.ceil(remainingMs / 1000)}s`
      );
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (err) {
      this.onFailure();
      throw err;
    }
  }

  private onSuccess() {
    if (this.state === "HALF_OPEN") {
      this.successes++;
      if (this.successes >= this.config.successThreshold) {
        this.state = "CLOSED";
        this.failures = [];
        this.successes = 0;
        console.info(`[CircuitBreaker:${this.name}] → CLOSED (recovered)`);
      }
    }
  }

  private onFailure() {
    const now = Date.now();
    this.failures = this.failures.filter(t => now - t < this.config.windowMs);
    this.failures.push(now);

    if (this.state === "HALF_OPEN") {
      this.state = "OPEN";
      this.openedAt = now;
      this.successes = 0;
      console.warn(`[CircuitBreaker:${this.name}] → OPEN (HALF_OPEN failed)`);
      return;
    }

    if (this.failures.length >= this.config.failureThreshold) {
      this.state = "OPEN";
      this.openedAt = now;
      console.warn(
        `[CircuitBreaker:${this.name}] → OPEN (${this.failures.length} failures in window)`
      );
    }
  }

  private maybeTransitionToHalfOpen() {
    if (
      this.state === "OPEN" &&
      this.openedAt &&
      Date.now() - this.openedAt >= this.config.openDurationMs
    ) {
      this.state = "HALF_OPEN";
      this.successes = 0;
      console.info(`[CircuitBreaker:${this.name}] → HALF_OPEN (probing)`);
    }
  }

  snapshot() {
    return {
      name: this.name,
      state: this.state,
      recentFailures: this.failures.length,
      openedAt: this.openedAt,
      successes: this.successes,
    };
  }
}

// ─── Singleton registry (one breaker per AI endpoint) ───────────────────────

const registry = new Map<string, CircuitBreaker>();

export function getBreaker(name: string, config?: Partial<CircuitConfig>): CircuitBreaker {
  if (!registry.has(name)) {
    registry.set(name, new CircuitBreaker(name, config));
  }
  return registry.get(name)!;
}

/** Convenience: pre-configured breakers for MediAssistant AI endpoints */
export const BREAKERS = {
  gemini25Pro:   () => getBreaker("gemini-2.5-pro",   { failureThreshold: 3, openDurationMs: 45_000 }),
  medGemma4B:    () => getBreaker("medgemma-4b",       { failureThreshold: 5, openDurationMs: 20_000 }),
  pubmedMCP:     () => getBreaker("pubmed-mcp",        { failureThreshold: 4, openDurationMs: 30_000 }),
  openFdaMCP:    () => getBreaker("openfda-mcp",       { failureThreshold: 4, openDurationMs: 30_000 }),
} as const;
