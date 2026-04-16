
'use server';
/**
 * @fileOverview A Genkit flow for structuring raw dictated text into a formatted clinical note.
 *
 * - structureNote - A function that handles the note structuring process.
 * - MedicoNoteStructurerInput - The input type.
 * - MedicoNoteStructurerOutput - The output type.
 */

import { ai } from '@/ai/genkit';
import { MedicoNoteStructurerInputSchema, MedicoNoteStructurerOutputSchema } from '@/ai/schemas/medico-tools-schemas';
import type { z } from 'zod';

export type MedicoNoteStructurerInput = z.infer<typeof MedicoNoteStructurerInputSchema>;
export type MedicoNoteStructurerOutput = z.infer<typeof MedicoNoteStructurerOutputSchema>;

export async function structureNote(input: MedicoNoteStructurerInput): Promise<MedicoNoteStructurerOutput> {
  return noteStructurerFlow(input);
}

const noteStructurerPrompt = ai.definePrompt({
  name: 'medicoNoteStructurerPrompt',
  input: { schema: MedicoNoteStructurerInputSchema },
  output: { schema: MedicoNoteStructurerOutputSchema },
  prompt: `You are an expert clinical note editor AI. Your task is to reformat the following raw, dictated text into a clean and organized note.
The requested format is '{{{template}}}'.

- If the template is 'soap', structure the text under the headings "S (Subjective):", "O (Objective):", "A (Assessment):", and "P (Plan):". Use your clinical knowledge to correctly categorize the information.
- If the template is 'general', simply clean up the text, correct obvious typos, and format it into logical paragraphs.

Raw Dictated Text:
"{{{rawText}}}"

Based on this, generate a JSON object with a single field 'structuredText' containing the newly formatted note.
`,
  config: {
    temperature: 0.2, // Factual and precise for structuring
  }
});

const noteStructurerFlow = ai.defineFlow(
  {
    name: 'noteStructurerFlow',
    inputSchema: MedicoNoteStructurerInputSchema,
    outputSchema: MedicoNoteStructurerOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await noteStructurerPrompt(input);

      if (!output || !output.structuredText) {
        console.error('NoteStructurerPrompt did not return valid structured text for input:', input.rawText.substring(0, 50));
        throw new Error('Failed to structure the note. The AI model did not return the expected output.');
      }
      
      return output;
    } catch (err) {
      console.error(`[NoteStructurerAgent] Error: ${err instanceof Error ? err.message : String(err)}`);
      throw new Error('An unexpected error occurred while structuring the note. Please try again.');
    }
  }
);
