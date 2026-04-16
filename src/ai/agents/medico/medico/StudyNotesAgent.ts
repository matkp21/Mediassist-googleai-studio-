// src/ai/agents/medico/StudyNotesAgent.ts
'use server';
/**
 * @fileOverview A Genkit flow for generating structured, exam-style study notes on medical topics.
 * This acts as the "StudyNotesGenerator" for medico users.
 *
 * - generateStudyNotes - A function that handles the answer generation process.
 * - StudyNotesGeneratorInput - The input type for the generateStudyNotes function.
 * - StudyNotesGeneratorOutput - The return type for the generateStudyNotes function.
 */

import { ai } from '@/ai/genkit';
import { StudyNotesGeneratorInputSchema, StudyNotesGeneratorOutputSchema } from '@/ai/schemas/medico-tools-schemas';
import type { z } from 'zod';

export type StudyNotesGeneratorInput = z.infer<typeof StudyNotesGeneratorInputSchema>;
export type StudyNotesGeneratorOutput = z.infer<typeof StudyNotesGeneratorOutputSchema>;

export async function generateStudyNotes(input: StudyNotesGeneratorInput): Promise<StudyNotesGeneratorOutput> {
  const result = await studyNotesFlow(input);
  return result;
}

const studyNotesPrompt = ai.definePrompt({
  name: 'medicoStudyNotesPrompt',
  input: { schema: StudyNotesGeneratorInputSchema },
  output: { schema: StudyNotesGeneratorOutputSchema },
  prompt: `You are an AI medical expert. Your primary task is to generate a comprehensive JSON object containing structured study notes, a separate array of summary points, a Mermaid.js diagram, and a list of relevant next study steps for a medical student.

The JSON object you generate MUST have four fields: 'notes', 'summaryPoints', 'diagram', and 'nextSteps'.

**CRITICAL: The 'nextSteps' field is mandatory and must not be omitted.** Generate at least two relevant suggestions based on the topic.

Example for 'nextSteps':
[
  {
    "title": "Test Your Knowledge",
    "description": "Generate MCQs to test your recall on {{{topic}}}.",
    "toolId": "mcq",
    "prefilledTopic": "{{{topic}}}",
    "cta": "Generate 5 MCQs"
  },
  {
    "title": "Create Flashcards",
    "description": "Create flashcards for the key points of {{{topic}}}.",
    "toolId": "flashcards",
    "prefilledTopic": "{{{topic}}}",
    "cta": "Create Flashcards"
  }
]
---

**Instructions for notes generation:**
Topic/Question: {{{topic}}}
Desired Answer Length: {{{answerLength}}}

1.  **'notes' field**: Generate comprehensive notes on the topic. Use Markdown headings (e.g., '## Definition'). Structure the notes under standard headings like:
    - Definition
    - Etiology/Risk Factors
    - Pathophysiology
    - Clinical Features
    - Investigations (use subheadings like Blood tests, Imaging, etc.)
    - Management (use subheadings like Medical, Surgical, etc.)
    - Complications
    - Prognosis

2.  **'summaryPoints' field**: Separately, create an array of 3-5 key, high-yield summary points for quick revision. Each point must be a string.

3.  **'diagram' field**: Separately, generate a relevant flowchart or diagram using Mermaid.js syntax that visually summarizes a key pathway or classification for the topic. This must be a single string. If no diagram is relevant, this can be null.

Constraint: For a '10-mark' answer, the 'notes' content should be detailed. For a '5-mark' answer, it should be more concise.
Ensure the entire response is a single valid JSON object conforming to the StudyNotesGeneratorOutputSchema.
`,
  config: {
    temperature: 0.3, // Factual for notes
  }
});

const studyNotesFlow = ai.defineFlow(
  {
    name: 'medicoStudyNotesFlow',
    inputSchema: StudyNotesGeneratorInputSchema,
    outputSchema: StudyNotesGeneratorOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await studyNotesPrompt(input);
      if (!output || !output.notes) {
        console.error('StudyNotesPrompt did not return an output for topic:', input.topic);
        throw new Error('Failed to generate study notes. The AI model did not return the expected output. Please try a different topic or rephrase.');
      }
      return output;
    } catch (err) {
      console.error(`[StudyNotesAgent] Error: ${err instanceof Error ? err.message : String(err)}`);
      throw new Error('An unexpected error occurred while generating study notes. Please try again.');
    }
  }
);
