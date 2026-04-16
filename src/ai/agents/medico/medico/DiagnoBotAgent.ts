'use server';
/**
 * @fileOverview The DiagnoBot agent, for interpreting clinical data.
 *
 * - interpretLabs - A function that handles lab interpretation.
 * - DiagnoBotInput - The input type for the agent.
 * - DiagnoBotOutput - The return type from the agent.
 */

import { ai } from '@/ai/genkit';
import { DiagnoBotInputSchema, DiagnoBotOutputSchema } from '@/ai/schemas/medico-tools-schemas';
import type { z } from 'zod';

export type DiagnoBotInput = z.infer<typeof DiagnoBotInputSchema>;
export type DiagnoBotOutput = z.infer<typeof DiagnoBotOutputSchema>;

export async function interpretLabs(input: DiagnoBotInput): Promise<DiagnoBotOutput> {
  return diagnoBotFlow(input);
}

const diagnoBotPrompt = ai.definePrompt({
  name: 'medicoDiagnoBotPrompt',
  input: { schema: DiagnoBotInputSchema },
  output: { schema: DiagnoBotOutputSchema },
  prompt: `You are DiagnoBot, an AI expert in interpreting clinical laboratory data for medical students.
Your primary task is to generate a JSON object containing a structured interpretation of the given lab results AND a list of relevant next study steps.

The JSON object you generate MUST have an 'interpretation' field, a 'likelyDifferentials' field, and a 'nextSteps' field.

**CRITICAL: The 'nextSteps' field is mandatory and must not be omitted.** Generate at least two relevant suggestions.

Example for 'nextSteps':
[
  {
    "title": "Explore Pathophysiology",
    "description": "Use PathoMind to understand the disease process behind one of the likely differentials.",
    "toolId": "pathomind",
    "prefilledTopic": "[One of the likely differentials]",
    "cta": "Explain Pathophysiology"
  },
  {
    "title": "Generate Study Notes",
    "description": "Create structured study notes for one of the differential diagnoses.",
    "toolId": "theorycoach-generator",
    "prefilledTopic": "[One of the likely differentials]",
    "cta": "Generate Notes"
  }
]
---

**Instructions for lab interpretation:**
Lab Results to interpret:
"{{{labResults}}}"

Provide a structured interpretation covering:
1.  **Abnormal Values**: Clearly list which values are high, low, or abnormal.
2.  **Potential Implications**: Explain what these abnormalities could suggest (e.g., "Elevated WBC may indicate infection or inflammation").
3.  **Likely Differentials**: List a few possible differential diagnoses suggested by the lab results in the 'likelyDifferentials' field (an array of strings).

Format the entire output as a valid JSON object.
`,
  config: {
    temperature: 0.3, // Factual for data interpretation
  }
});

const diagnoBotFlow = ai.defineFlow(
  {
    name: 'medicoDiagnoBotFlow',
    inputSchema: DiagnoBotInputSchema,
    outputSchema: DiagnoBotOutputSchema,
  },
  async (input) => {
    try {
        const { output } = await diagnoBotPrompt(input);

        if (!output || !output.interpretation) {
        console.error('DiagnoBotPrompt did not return a valid interpretation for:', input.labResults);
        throw new Error('Failed to interpret lab results. The AI model did not return the expected output.');
        }
        
        return output;
    } catch (err) {
        console.error(`[DiagnoBotAgent] Error: ${err instanceof Error ? err.message : String(err)}`);
        throw new Error('An unexpected error occurred while interpreting lab results. Please try again.');
    }
  }
);
