import { Middleware, GenerateRequest, GenerateResponse } from 'genkit';

/**
 * Architectural Mapping: Inspired by addyosmani/agent-skills & Genkit Middleware.
 * Enforces strict engineering discipline by requiring clinical citations in LLM outputs.
 * Prevents "Rationalization" or "Shortcuts" in diagnostic reasoning.
 */
export function requireClinicalCitationMiddleware(): Middleware<GenerateRequest, GenerateResponse> {
 return async (req: GenerateRequest, next: (req: GenerateRequest) => Promise<GenerateResponse>) => {
   // Inject a strict anti-rationalization prompt into the request messages
   // Check if it's already there to avoid duplicates
   const hasSystemPrompt = req.messages.some(m => m.role === 'system' && m.content.includes('ANTI-RATIONALIZATION'));
   
   if (!hasSystemPrompt) {
     req.messages.push({
       role: 'system',
       content: `
        [ANTI-RATIONALIZATION PROTOCOL ACTIVE]
        Verification is non-negotiable. You MUST provide at least one peer-reviewed clinical citation or evidence block for every significant diagnostic claim.
        Failure to include a 'Citation:' or 'Reference:' block will result in a system rejection.
       `
     });
   }

   const response = await next(req);

   // Post-execution Validation: Verify the output contains a citation block
   const text = response.text;
   const hasCitation = text.includes('Citation:') || text.includes('Reference:') || text.includes('Source:');

   if (!hasCitation) {
     // Instead of just throwing, we could append a warning, but the prompt says throw.
     // However, in production Genkit flows, we might want a retry loop.
     // For this implementation, we follow the strict "Non-Negotiable" requirement.
     throw new Error("Verification Failed: AI attempted to bypass clinical citation requirements. No valid 'Citation:' or 'Reference:' block detected.");
   }

   return response;
 };
}
