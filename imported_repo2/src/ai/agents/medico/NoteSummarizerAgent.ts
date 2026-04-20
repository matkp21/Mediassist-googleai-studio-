'use server';
/**
 * @fileOverview A Genkit flow for summarizing uploaded text or image content into various formats.
 *
 * - summarizeNoteText - A function that handles the summarization process.
 * - MedicoNoteSummarizerInput - The input type.
 * - MedicoNoteSummarizerOutput - The output type.
 *
 * Note: The agent now incorporates functionality for generating diagrams and flowcharts,
 * specifically using Mermaid.js syntax for flowcharts when the 'flowchart' format is requested.
 */

import { ai } from '@/ai/genkit';
import { MedicoNoteSummarizerInputSchema, MedicoNoteSummarizerOutputSchema } from '@/ai/schemas/medico-tools-schemas';
import type { z } from 'zod';

export type MedicoNoteSummarizerInput = z.infer<typeof MedicoNoteSummarizerInputSchema> & { format: 'bullet' | 'table' | 'flowchart' | 'diagram' }; // Explicitly include format types
export type MedicoNoteSummarizerOutput = z.infer<typeof MedicoNoteSummarizerOutputSchema>;

export async function summarizeNoteText(input: MedicoNoteSummarizerInput): Promise<MedicoNoteSummarizerOutput> {
  return noteSummarizerFlow(input);
}

const noteSummarizerPrompt = ai.definePrompt({
  name: 'medicoNoteSummarizerPrompt',
  input: { schema: MedicoNoteSummarizerInputSchema },
  output: { schema: MedicoNoteSummarizerOutputSchema },
  prompt: `You are an expert at summarizing medical notes for students.
Your primary task is to generate a JSON object containing a summary of the provided content AND a list of relevant next study steps.

The JSON object you generate MUST have a 'summary' field, a 'format' field, and a 'nextSteps' field.

**CRITICAL: The 'nextSteps' field is mandatory and must not be omitted.** Generate at least two relevant suggestions.

Example for 'nextSteps':
[
  {
    "title": "Create Flashcards",
    "description": "Create flashcards from the key points in this summary to aid memorization.",
    "toolId": "flashcards",
    "prefilledTopic": "Summary of uploaded notes",
    "cta": "Create Flashcards"
  },
  {
    "title": "Generate MCQs",
    "description": "Test your understanding of the summarized content with practice questions.",
    "toolId": "mcq",
    "prefilledTopic": "Content of uploaded notes",
    "cta": "Generate MCQs"
  }
]
---

**Instructions for summary generation:**
The summary should be concise, accurate, and focus on the most high-yield information for a medical student.
- The 'format' field must be set to the requested format: {{{format}}}.
- If the requested format is a 'flowchart', generate the summary using Mermaid.js syntax.
- If the requested format is a 'table', use Markdown table syntax.
- If the requested format is 'bullet' or 'diagram', use standard bullet points or a textual description suitable for generating a diagram.

{{#if text}}
Text to summarize:
{{{text}}}
{{/if}}
{{#if imageDataUri}}
Summarize the content from this image. This could be a picture of a textbook page, a diagram, or handwritten notes.
Image to summarize: {{media url=imageDataUri}}
{{/if}}

Format the entire output as a valid JSON object.
`,
  config: {
    temperature: 0.2, // Factual and structured
  }
});

const noteSummarizerFlow = ai.defineFlow(
  {
    name: 'medicoNoteSummarizerFlow',
    inputSchema: MedicoNoteSummarizerInputSchema,
    outputSchema: MedicoNoteSummarizerOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await noteSummarizerPrompt(input);

      if (!output || !output.summary) {
        console.error('MedicoNoteSummarizerPrompt did not return a valid summary for the provided text.');
        throw new Error('Failed to generate summary. The AI model did not return the expected output.');
      }

      return output;
    } catch (err) {
      console.error(`[NoteSummarizerAgent] Error: ${err instanceof Error ? err.message : String(err)}`);
      throw new Error('An unexpected error occurred during note summarization. Please try again.');
    }
  }
);
