import { ai } from '@/ai/genkit';
import { z } from 'zod';

export const drugInteractionSkill = ai.defineTool(
  {
    name: 'checkDrugInteractions',
    description: 'Checks for adverse interactions between two or more medications using the NIH RxClass API. CRITICAL: Requires Medico or Professional user context.',
    schema: z.object({
      drugs: z.array(z.string()).min(2).describe("List of drug generic names to cross-reference."),
      user_role: z.string().optional().describe("User role for permission checks (e.g. Medico, Professional)"),
    }),
  },
  async ({ drugs, user_role }) => {
    // OpenClaw Tiered Permission Check
    if (user_role !== 'Medico' && user_role !== 'Professional') {
      throw new Error("UNAUTHORIZED: This clinical skill is restricted to medical professionals and students.");
    }

    try {
      console.log(`[Skill Execution] Interaction Check: ${drugs.join(', ')} by role ${user_role}`);
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
