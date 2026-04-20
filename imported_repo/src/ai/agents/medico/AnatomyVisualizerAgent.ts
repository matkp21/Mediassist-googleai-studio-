'use server';
/**
 * @fileOverview A Genkit flow for providing descriptions of anatomical structures for medico users.
 *
 * - getAnatomyDescription - A function that handles the anatomy description process.
 * - MedicoAnatomyVisualizerInput - The input type.
 * - MedicoAnatomyVisualizerOutput - The output type.
 */

import { ai } from '@/ai/genkit';
import { MedicoAnatomyVisualizerInputSchema, MedicoAnatomyVisualizerOutputSchema } from '@/ai/schemas/medico-tools-schemas';
import type { z } from 'zod';

export type MedicoAnatomyVisualizerInput = z.infer<typeof MedicoAnatomyVisualizerInputSchema>;
export type MedicoAnatomyVisualizerOutput = z.infer<typeof MedicoAnatomyVisualizerOutputSchema>;

export async function getAnatomyDescription(input: MedicoAnatomyVisualizerInput): Promise<MedicoAnatomyVisualizerOutput> {
  return anatomyVisualizerFlow(input);
}

const anatomyVisualizerPrompt = ai.definePrompt({
  name: 'medicoAnatomyVisualizerPrompt',
  input: { schema: MedicoAnatomyVisualizerInputSchema },
  output: { schema: MedicoAnatomyVisualizerOutputSchema },
  prompt: `You are an AI medical educator specializing in anatomy. Your primary task is to generate a JSON object containing a detailed anatomical description AND a list of relevant next study steps for the structure: {{{anatomicalStructure}}}.

The JSON object you generate MUST have a 'description' field and a 'nextSteps' field.

**CRITICAL: The 'nextSteps' field is mandatory and must not be omitted.** Generate at least two relevant suggestions.

Example for 'nextSteps':
[
  {
    "title": "Test Your Knowledge",
    "description": "Generate MCQs to test your recall on the anatomy of the {{{anatomicalStructure}}}.",
    "toolId": "mcq",
    "prefilledTopic": "Anatomy of the {{{anatomicalStructure}}}",
    "cta": "Generate 5 MCQs"
  },
  {
    "title": "Create Flashcards",
    "description": "Create flashcards for the key features and clinical correlations of the {{{anatomicalStructure}}}.",
    "toolId": "flashcards",
    "prefilledTopic": "Key clinical correlations of {{{anatomicalStructure}}}",
    "cta": "Create Flashcards"
  }
]
---

**Instructions for description generation:**
Provide a detailed description covering:
1.  **Location**: Where is the structure found in the body?
2.  **Key Features/Parts**: What are its main components?
3.  **Primary Functions**: What does it do?
4.  **Important Clinical Correlations**: Why is it important in medicine (common diseases, injuries, procedures)?
5.  **Related Structures**: List a few anatomically or functionally related structures.

Format the entire output as a valid JSON object.
`,
  config: {
    temperature: 0.3, // Factual and detailed
  }
});

const anatomyVisualizerFlow = ai.defineFlow(
  {
    name: 'medicoAnatomyVisualizerFlow',
    inputSchema: MedicoAnatomyVisualizerInputSchema,
    outputSchema: MedicoAnatomyVisualizerOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await anatomyVisualizerPrompt(input);

      if (!output || !output.description) {
        console.error('MedicoAnatomyVisualizerPrompt did not return a valid description for:', input.anatomicalStructure);
        throw new Error('Failed to get anatomy description. The AI model did not return the expected output.');
      }
      
      return output;
    } catch (err) {
      console.error(`[AnatomyVisualizerAgent] Error: ${err instanceof Error ? err.message : String(err)}`);
      throw new Error('An unexpected error occurred while fetching the anatomy description. Please try again.');
    }
  }
);
