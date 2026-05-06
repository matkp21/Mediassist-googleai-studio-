import { defineTool } from '@genkit-ai/ai';
import { z } from 'zod';

export const drugInteractionSkill = defineTool(
  {
    name: 'checkDrugInteractions',
    description: 'Checks for adverse interactions between two or more medications using the NIH RxClass API. CRITICAL: Requires Medico or Professional user context.',
    schema: z.object({
      drugs: z.array(z.string()).min(2).describe("List of drug generic names to cross-reference."),
    }),
  },
  async ({ drugs }, { context }) => {
    // OpenClaw Tiered Permission Check
    const userRole = context?.auth?.role;
    if (userRole !== 'Medico' && userRole !== 'Professional') {
      throw new Error("UNAUTHORIZED: This clinical skill is restricted to medical professionals and students.");
    }

    try {
      console.log(`[Skill Execution] Interaction Check: ${drugs.join(', ')} by user ${context.auth?.uid}`);
      // In a real implementation, you would call the FDA/NIH RxNorm interaction API here.
      // For this blueprint, we return a structured mock response.
      return JSON.stringify({
        status: "success",
        drugs_analyzed: drugs,
        severity: "Moderate",
        mechanism: "Competitive inhibition of CYP3A4 metabolism.",
        recommendation: "Monitor patient closely; consider alternative therapy if symptoms develop."
      });
    } catch (error: any) {
      return `Interaction Check Failed: ${error.message}`;
    }
  }
);
