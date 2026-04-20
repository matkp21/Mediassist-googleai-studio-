'use server';
/**
 * @fileOverview A Genkit flow for generating flashcards on medical topics for medico users.
 *
 * - generateFlashcards - A function that handles the flashcard generation process.
 * - MedicoFlashcardGeneratorInput - The input type.
 * - MedicoFlashcardGeneratorOutput - The output type.
 */

import { ai } from '@/ai/genkit';
import { MedicoFlashcardGeneratorInputSchema, MedicoFlashcardGeneratorOutputSchema } from '@/ai/schemas/medico-tools-schemas';
import type { z } from 'zod';

export type MedicoFlashcardGeneratorInput = z.infer<typeof MedicoFlashcardGeneratorInputSchema>;
export type MedicoFlashcardGeneratorOutput = z.infer<typeof MedicoFlashcardGeneratorOutputSchema>;
export type { MedicoFlashcard } from '@/ai/schemas/medico-tools-schemas';

export async function generateFlashcards(input: MedicoFlashcardGeneratorInput): Promise<MedicoFlashcardGeneratorOutput> {
  return flashcardGeneratorFlow(input);
}

const flashcardGeneratorPrompt = ai.definePrompt({
  name: 'medicoFlashcardGeneratorPrompt',
  input: { schema: MedicoFlashcardGeneratorInputSchema },
  output: { schema: MedicoFlashcardGeneratorOutputSchema },
  prompt: `You are an AI assistant skilled in creating educational flashcards. Your primary task is to generate a JSON object containing a set of flashcards AND a list of relevant next study steps.

The JSON object you generate MUST have 'flashcards', 'topicGenerated', and a 'nextSteps' field.

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
    "title": "Get the Full Picture",
    "description": "Generate structured study notes to understand the core concepts of {{{topic}}}.",
    "toolId": "theorycoach-generator",
    "prefilledTopic": "{{{topic}}}",
    "cta": "Generate Study Notes"
  }
]
---

**Instructions for flashcard generation:**
Topic: {{{topic}}}
Difficulty: {{{difficulty}}}
Exam Style: {{{examType}}}
Number of flashcards to generate: {{{count}}}

For each flashcard, create a 'front' (question or term) and a 'back' (answer or definition).
The flashcards should be concise and focus on key, high-yield information relevant to the topic, difficulty, and exam style.
The 'topicGenerated' field must be set to "{{{topic}}}".

Format the entire output as a valid JSON object.
`,
  config: {
    temperature: 0.4, // Factual and concise
  }
});

const flashcardGeneratorFlow = ai.defineFlow(
  {
    name: 'medicoFlashcardGeneratorFlow',
    inputSchema: MedicoFlashcardGeneratorInputSchema,
    outputSchema: MedicoFlashcardGeneratorOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await flashcardGeneratorPrompt(input);

      if (!output || !output.flashcards || output.flashcards.length === 0) {
        console.error('MedicoFlashcardGeneratorPrompt did not return valid flashcards for topic:', input.topic);
        throw new Error('Failed to generate flashcards. The AI model did not return the expected output or returned an empty set.');
      }
      // Firestore saving logic could go here
      return { ...output, topicGenerated: input.topic };
    } catch (err) {
      console.error(`[FlashcardGeneratorAgent] Error: ${err instanceof Error ? err.message : String(err)}`);
      throw new Error('An unexpected error occurred while generating flashcards. Please try again.');
    }
  }
);
