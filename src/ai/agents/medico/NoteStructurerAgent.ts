
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
import { injectKarpathyGuidelines } from './skills/karpathy-guidelines';

export type MedicoNoteStructurerInput = z.infer<typeof MedicoNoteStructurerInputSchema>;
export type MedicoNoteStructurerOutput = z.infer<typeof MedicoNoteStructurerOutputSchema>;

export async function structureNote(input: MedicoNoteStructurerInput): Promise<MedicoNoteStructurerOutput> {
  return noteStructurerFlow(input);
}

const promptTemplate = `You are an expert clinical note editor AI. Your task is to reformat the following raw, dictated text or handwritten image into a clean and organized note.
The requested format is '{{{template}}}'.

CRITICAL INSTRUCTION (VoxCPM/VibeVoice Simulation):
When processing dictated raw text, analyze it for conversational shifts to simulate "Speaker Diarization". Differentiate between the Doctor's assessment and the Patient's reported symptoms if conversational cues exist. 

- If the template is 'soap', structure the text under the headings "S (Subjective):", "O (Objective):", "A (Assessment):", and "P (Plan):". Use your clinical knowledge to correctly categorize the information.
- If the template is 'general', clean up the text, correct medical typos, and format it into logical paragraphs.

{{#if rawText}}
Raw Text:
"{{{rawText}}}"
{{/if}}

{{#if imageDataUri}}
Extract the handwritten text or shorthand from the image and apply the requested template format.
Image: {{media url=imageDataUri}}
{{/if}}

Based on this, generate a JSON object with a single field 'structuredText' containing the newly formatted note.
`;

const noteStructurerPrompt = ai.definePrompt({
  name: 'medicoNoteStructurerPrompt',
  input: { schema: MedicoNoteStructurerInputSchema },
  output: { schema: MedicoNoteStructurerOutputSchema },
  prompt: injectKarpathyGuidelines(promptTemplate),
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
