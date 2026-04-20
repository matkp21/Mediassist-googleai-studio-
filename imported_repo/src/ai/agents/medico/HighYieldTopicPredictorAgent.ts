
'use server';
/**
 * @fileOverview A Genkit flow for predicting high-yield medical topics for medico users.
 *
 * - predictHighYieldTopics - A function that predicts topics based on exam type.
 * - MedicoTopicPredictorInput - The input type.
 * - MedicoTopicPredictorOutput - The output type.
 */

import { ai } from '@/ai/genkit';
import { MedicoTopicPredictorInputSchema, MedicoTopicPredictorOutputSchema } from '@/ai/schemas/medico-tools-schemas';
import type { z } from 'zod';

export type MedicoTopicPredictorInput = z.infer<typeof MedicoTopicPredictorInputSchema>;
export type MedicoTopicPredictorOutput = z.infer<typeof MedicoTopicPredictorOutputSchema>;

export async function predictHighYieldTopics(input: MedicoTopicPredictorInput): Promise<MedicoTopicPredictorOutput> {
  return highYieldTopicPredictorFlow(input);
}

const highYieldTopicPredictorPrompt = ai.definePrompt({
  name: 'medicoTopicPredictorPrompt',
  input: { schema: MedicoTopicPredictorInputSchema },
  output: { schema: MedicoTopicPredictorOutputSchema },
  prompt: `You are an AI expert in medical exam preparation. Your primary task is to generate a JSON object with 'predictedTopics', 'rationale', and 'nextSteps' for the given exam.

The JSON object you generate MUST have 'predictedTopics', 'rationale', and a 'nextSteps' field.

**CRITICAL: The 'nextSteps' field is mandatory and must not be omitted.** Generate a relevant suggestion for at least one predicted topic.

Example for 'nextSteps':
[
  {
    "title": "Generate Study Notes for [First Topic]",
    "description": "Create detailed notes for one of the predicted topics to start studying.",
    "toolId": "theorycoach-generator",
    "prefilledTopic": "[The First Topic from predictedTopics list]",
    "cta": "Generate Notes"
  },
  {
    "title": "Create a Study Plan",
    "description": "Generate a personalized study timetable incorporating these high-yield topics.",
    "toolId": "timetable",
    "prefilledTopic": "{{examType}}",
    "cta": "Create Timetable"
  }
]
---

**Instructions for prediction:**
Exam Type: "{{{examType}}}"
{{#if subject}}And specific subject: "{{{subject}}}"{{/if}}

1.  **'predictedTopics'**: Predict a list of 5-10 high-yield topics that are most likely to be important for this exam. If a subject is specified, focus topics within that subject. Otherwise, provide general high-yield topics for the exam. This should be an array of strings. If you cannot predict any topics, return an empty array.
2.  **'rationale'**: Provide a brief rationale for your predictions (e.g., based on past exam trends, curriculum weightage, clinical importance). This should be a single string.

Format the entire output as a valid JSON object.
`,
  config: {
    temperature: 0.4, // More analytical and based on patterns
  }
});

const highYieldTopicPredictorFlow = ai.defineFlow(
  {
    name: 'medicoHighYieldTopicPredictorFlow',
    inputSchema: MedicoTopicPredictorInputSchema,
    outputSchema: MedicoTopicPredictorOutputSchema,
  },
  async (input) => {
    try {
      // In a real application, this might involve querying a database of past papers,
      // analyzing syllabus documents, or using more sophisticated prediction models.
      // For now, we rely on the LLM's general knowledge.
      const { output } = await highYieldTopicPredictorPrompt(input);

      if (!output || !output.predictedTopics || output.predictedTopics.length === 0) {
        console.error('MedicoTopicPredictorPrompt did not return valid topics for:', input.examType);
        // Still return the structure but with an empty array.
        return {
            predictedTopics: [],
            rationale: "Could not predict topics based on the input. Please try a different exam type.",
            nextSteps: [],
        }
      }
      
      // Firestore saving logic (e.g., for logging predictions) could go here
      return output;
    } catch (err) {
      console.error(`[HighYieldTopicPredictorAgent] Error: ${err instanceof Error ? err.message : String(err)}`);
      throw new Error('An unexpected error occurred while predicting topics. Please try again.');
    }
  }
);
