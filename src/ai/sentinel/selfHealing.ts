/**
 * MediAssistant — Self-Healing Subagent Wrapper
 * Inspired by: Cline & Aider (Feedback loops), OpenHands (Runtime recovery)
 */

import { z } from 'zod';
import { getSentinel } from './crashSentinel';

export class AIValidationError extends Error {
  constructor(public message: string, public rawOutput: string) {
    super(message);
    this.name = 'AIValidationError';
  }
}

export class APIHardFaultError extends Error {
  constructor(public message: string, public statusCode: number) {
    super(message);
    this.name = 'APIHardFaultError';
  }
}

/**
 * Executes an AI subagent call with an autonomous feedback loop for self-healing.
 * If the model returns invalid JSON or fails schema validation, it re-prompts 
 * with the error until it self-corrects or hits maxRetries.
 * 
 * @param prompt Initial prompt to the agent
 * @param schema Zod schema the output must adhere to
 * @param agentCall Functional call to the Genkit flow/agent
 * @param maxRetries Self-correction loop limit (default 3)
 */
export async function executeSelfHealingAgent<I, T>(
  input: I,
  schema: z.ZodSchema<T>,
  agentCall: (input: I) => Promise<T>,
  context: { brainModule: string; flowId?: string; userId?: string },
  maxRetries = 3
): Promise<T> {
  const sentinel = getSentinel();
  let currentInput = { ...input };

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Use the Brain-3 Crash Sentinel to guard the underlying call
      // This handles circuit breakers, retries for 429/500s, etc.
      return await sentinel.guard(
        () => agentCall(currentInput),
        { ...context, flowId: context.flowId || 'self-healing-loop' }
      );

    } catch (error: any) {
      // Check if it's a validation error (hallucination)
      const isValidationError = 
        error instanceof z.ZodError || 
        error instanceof SyntaxError || 
        (error.message && /validation|parse|schema|zod/i.test(error.message));

      if (isValidationError) {
        if (attempt === maxRetries) {
           sentinel.capture(error, { ...context, flowId: 'self-healing-exhausted' });
           throw new AIValidationError("Max self-correction limits reached for hallucination/parsing.", error.message);
        }

        console.warn(`[Brain-3] Subagent Validation Failed (Attempt ${attempt}/ ${maxRetries}). Self-healing triggered...`);
        
        // FEEDBACK LOOP: We need to adjust the input to hint at the mistake.
        // For Genkit flows, we might need a specific 'feedback' field in the input if supported,
        // or we simply append to a text field if the input is string-based.
        // Since input 'I' is generic, we attempt a best-effort modification if it's an object with a 'prompt' or similar.
        
        if (typeof currentInput === 'object' && currentInput !== null) {
           const inputObj = currentInput as Record<string, any>;
           const feedback = `\n\n[SYSTEM FEEDBACK]: Your previous output failed validation with error: ${error.message}. Please correct the JSON structure and ensure all required fields match the schema.`;
           
           // Heuristic: append to a likely text field
           if (typeof inputObj.topic === 'string') inputObj.topic += feedback;
           else if (typeof inputObj.patientSymptoms === 'string') inputObj.patientSymptoms += feedback;
           else if (typeof inputObj.query === 'string') inputObj.query += feedback;
           else if (typeof inputObj.text === 'string') inputObj.text += feedback;
        }

        continue;
      }

      // If it's a hard fault (not a validation error), bubble it up
      const statusCode = (error as any).status || (error as any).statusCode || 500;
      throw new APIHardFaultError(error.message || "Unknown hard fault", statusCode);
    }
  }

  throw new Error("Unexpected loop termination in self-healing wrapper.");
}
