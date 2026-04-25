/**
 * MediAssistant — Error Taxonomy & Classification Engine
 * Inspired by: OpenHands runtime recovery, crewAI Flow routing, PostHog fingerprinting
 *
 * Covers all known Google AI Studio / Firebase Genkit failure modes:
 *  • INVALID_ARGUMENT: Must supply a model (Genkit model import bug)
 *  • 400 Token count exceeds maximum (context window overflow)
 *  • 500 Model is overloaded (transient backpressure)
 *  • 429 Quota exceeded (billing / rate limits)
 *  • AUTH / App Check failures
 *  • Schema validation (Zod parse failures)
 */

import { z } from "zod";

// ─── Error Class Registry ────────────────────────────────────────────────────

export const ErrorClassSchema = z.enum([
  "QUOTA_EXCEEDED",          // 429 – billing tier / IPM limit
  "MODEL_OVERLOADED",        // 500 – transient, retry with backoff
  "TOKEN_LIMIT_EXCEEDED",    // 400 – context window overflow
  "MODEL_NOT_FOUND",         // 404 / INVALID_ARGUMENT – bad model string
  "MODEL_NOT_SUPPLIED",      // INVALID_ARGUMENT: Must supply a model
  "AUTH_FAILURE",            // 401 / App Check rejection
  "NETWORK_TRANSIENT",       // fetch failures, DNS, timeout
  "SCHEMA_VALIDATION",       // Zod parse failure on AI output
  "BRAIN_MODULE_CRASH",      // Internal Brain module unhandled exception
  "FIRESTORE_MUTATION_BLOCKED", // Plan Mode veto
  "STREAM_INTERRUPTED",      // SSE stream drop mid-response
  "UNKNOWN",
]);
export type ErrorClass = z.infer<typeof ErrorClassSchema>;

// ─── Recovery Strategies (crewAI @router pattern) ───────────────────────────

export const RecoveryStrategySchema = z.enum([
  "RETRY_WITH_BACKOFF",       // Transient errors: 429, 500, network
  "RETRY_WITH_SMALLER_CONTEXT", // TOKEN_LIMIT: truncate history then retry
  "SWITCH_FALLBACK_MODEL",    // MODEL_OVERLOADED: route to MedGemma 4B
  "FIX_MODEL_IMPORT",         // MODEL_NOT_SUPPLIED: hot-fix Genkit model ref
  "REFRESH_AUTH_TOKEN",       // AUTH_FAILURE: force token refresh
  "SURFACE_TO_USER",          // Non-recoverable: show graceful error UI
  "HALT_AND_ALERT",           // BRAIN_MODULE_CRASH: stop flow, alert admin
  "SCHEMA_REPAIR_WITH_AI",    // SCHEMA_VALIDATION: ask AI to re-emit valid JSON
  "NOOP",
]);
export type RecoveryStrategy = z.infer<typeof RecoveryStrategySchema>;

// ─── Classified Error Envelope ───────────────────────────────────────────────

export const ClassifiedErrorSchema = z.object({
  id: z.string().uuid(),
  timestamp: z.string().datetime(),
  errorClass: ErrorClassSchema,
  recoveryStrategy: RecoveryStrategySchema,
  httpStatus: z.number().optional(),
  originalMessage: z.string(),
  fingerprint: z.string(),        // PostHog-style grouping key
  retryCount: z.number().default(0),
  maxRetries: z.number().default(3),
  brainModule: z.string().optional(), // Which Brain module triggered this
  flowId: z.string().optional(),
  userId: z.string().optional(),
  isFatal: z.boolean().default(false),
  metadata: z.record(z.unknown()).default({}),
});
export type ClassifiedError = z.infer<typeof ClassifiedErrorSchema>;

// ─── Classification Engine ───────────────────────────────────────────────────

interface RawError {
  message: string;
  status?: number;
  code?: string;
  cause?: unknown;
}

/** Strategy routing table — mirrors crewAI @router conditional dispatch */
const STRATEGY_MAP: Record<ErrorClass, RecoveryStrategy> = {
  QUOTA_EXCEEDED:           "RETRY_WITH_BACKOFF",
  MODEL_OVERLOADED:         "SWITCH_FALLBACK_MODEL",
  TOKEN_LIMIT_EXCEEDED:     "RETRY_WITH_SMALLER_CONTEXT",
  MODEL_NOT_FOUND:          "SURFACE_TO_USER",
  MODEL_NOT_SUPPLIED:       "FIX_MODEL_IMPORT",
  AUTH_FAILURE:             "REFRESH_AUTH_TOKEN",
  NETWORK_TRANSIENT:        "RETRY_WITH_BACKOFF",
  SCHEMA_VALIDATION:        "SCHEMA_REPAIR_WITH_AI",
  BRAIN_MODULE_CRASH:       "HALT_AND_ALERT",
  FIRESTORE_MUTATION_BLOCKED: "SURFACE_TO_USER",
  STREAM_INTERRUPTED:       "RETRY_WITH_BACKOFF",
  UNKNOWN:                  "SURFACE_TO_USER",
};

const FATAL_CLASSES = new Set<ErrorClass>(["BRAIN_MODULE_CRASH", "AUTH_FAILURE"]);

/**
 * Classifies any thrown error into a structured ClassifiedError.
 * Works across Genkit flows, Cloud Functions, and Next.js API routes.
 */
export function classifyError(
  raw: RawError,
  context?: Partial<Pick<ClassifiedError, "brainModule" | "flowId" | "userId">>
): ClassifiedError {
  const msg = raw.message ?? String(raw);
  let errorClass: ErrorClass = "UNKNOWN";

  // ── Google AI / Genkit specific patterns ──────────────────────────────────
  if (/must supply a model/i.test(msg))           errorClass = "MODEL_NOT_SUPPLIED";
  else if (/token count.*exceeds/i.test(msg))      errorClass = "TOKEN_LIMIT_EXCEEDED";
  else if (/model is overloaded/i.test(msg))       errorClass = "MODEL_OVERLOADED";
  else if (raw.status === 500 || /internal.*error/i.test(msg)) errorClass = "MODEL_OVERLOADED";
  else if (raw.status === 429)                     errorClass = "QUOTA_EXCEEDED";
  else if (/quota/i.test(msg))                     errorClass = "QUOTA_EXCEEDED";
  else if (raw.status === 404 || /not found/i.test(msg)) errorClass = "MODEL_NOT_FOUND";
  else if (raw.status === 401 || /unauthenticated|app.?check/i.test(msg)) errorClass = "AUTH_FAILURE";
  else if (/fetch|network|ENOTFOUND|timeout/i.test(msg)) errorClass = "NETWORK_TRANSIENT";
  else if (/zod|parse|schema|validation/i.test(msg))     errorClass = "SCHEMA_VALIDATION";
  else if (/stream.*interrupt|SSE/i.test(msg))           errorClass = "STREAM_INTERRUPTED";
  else if (/brain|module.*crash/i.test(msg))             errorClass = "BRAIN_MODULE_CRASH";
  else if (/firestore.*blocked|plan.?mode/i.test(msg))   errorClass = "FIRESTORE_MUTATION_BLOCKED";

  const errorClass_ = ErrorClassSchema.parse(errorClass);
  const fingerprint = `${errorClass_}::${(msg.slice(0, 80)).replace(/\\s+/g, "_")}`;

  return ClassifiedErrorSchema.parse({
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    errorClass: errorClass_,
    recoveryStrategy: STRATEGY_MAP[errorClass_],
    httpStatus: raw.status,
    originalMessage: msg,
    fingerprint,
    retryCount: 0,
    maxRetries: errorClass_ === "TOKEN_LIMIT_EXCEEDED" ? 1 : 3,
    isFatal: FATAL_CLASSES.has(errorClass_),
    ...context,
  });
}
