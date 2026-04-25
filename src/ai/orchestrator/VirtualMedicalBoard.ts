'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const BoardMemberAnalysisSchema = z.object({
  specialty: z.string(),
  personaName: z.string(),
  analysis: z.string(),
  recommendation: z.string()
});

const VirtualMedicalBoardOutputSchema = z.object({
  caseSummary: z.string(),
  discussion: z.array(BoardMemberAnalysisSchema),
  consensusDiagnosis: z.string(),
  finalManagementPlan: z.string(),
  disagreements: z.array(z.string()).optional()
});

export const runVirtualMedicalBoard = ai.defineFlow(
  {
    name: 'runVirtualMedicalBoard',
    inputSchema: z.object({ caseDescription: z.string() }),
    outputSchema: VirtualMedicalBoardOutputSchema,
  },
  async (input) => {
    const response = await ai.generate({
      model: 'vertexai/gemini-2.0-flash',
      prompt: `You are the Moderator of a Virtual Medical Board. 
      A complex multi-system failure case has been assigned: "${input.caseDescription}"
      
      Simulate a round-table discussion between:
      1. Dr. Aris (Cardiologist)
      2. Dr. Elena (Nephrologist)
      3. Dr. Marcus (Infectious Disease)
      
      Each should provide their specialized analysis. Then, synthesize a final consensus diagnosis and management plan. 
      Note any conflicting priorities between specialties (e.g. fluid management in heart vs kidney failure).`,
      output: { schema: VirtualMedicalBoardOutputSchema }
    });

    return response.output();
  }
);
