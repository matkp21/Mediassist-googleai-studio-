
'use server';
/**
 * @fileOverview A Genkit flow for generating gamified clinical case challenges for medico users.
 *
 * - generateCaseChallenge - A function that generates a new case challenge.
 * - MedicoCaseChallengeGeneratorInput - The input type.
 * - MedicoCaseChallengeGeneratorOutput - The output type.
 */

import { ai } from '@/ai/genkit';
import { MedicoCaseChallengeGeneratorInputSchema, MedicoCaseChallengeGeneratorOutputSchema } from '@/ai/schemas/medico-tools-schemas';
import type { z } from 'zod';

export type MedicoCaseChallengeGeneratorInput = z.infer<typeof MedicoCaseChallengeGeneratorInputSchema>;
export type MedicoCaseChallengeGeneratorOutput = z.infer<typeof MedicoCaseChallengeGeneratorOutputSchema>;

export async function generateCaseChallenge(input: MedicoCaseChallengeGeneratorInput): Promise<MedicoCaseChallengeGeneratorOutput> {
  return caseChallengeGeneratorFlow(input);
}

const caseChallengeGeneratorPrompt = ai.definePrompt({
  name: 'medicoCaseChallengeGeneratorPrompt',
  input: { schema: MedicoCaseChallengeGeneratorInputSchema },
  output: { schema: MedicoCaseChallengeGeneratorOutputSchema },
  prompt: `You are an AI medical educator creating a gamified diagnostic case challenge for a medical student.
Your task is to generate a single, complete JSON object for a clinical case based on the requested difficulty and topic.

Difficulty: {{{difficulty}}}
{{#if topic}}Specific Topic Focus: {{{topic}}}{{/if}}

The JSON object MUST contain the following fields:
1.  'id': A unique identifier string for this challenge (e.g., "case-12345").
2.  'title': A short, engaging title for the case (e.g., "The Sudden Headache").
3.  'difficulty': The difficulty level you aimed for ('Easy', 'Medium', or 'Hard').
4.  'description': A one-sentence summary of the challenge.
5.  'caseDetails': A paragraph describing the patient's presentation, history, and key examination findings. This should be detailed enough for a medical student to form a primary diagnosis.
6.  'correctAnswer': The single, most likely primary diagnosis.
7.  'timeLimitSeconds': A reasonable time limit in seconds for a student to solve this case based on its difficulty (e.g., Easy: 120s, Medium: 90s, Hard: 60s).
8.  'nextSteps': After the student finishes this challenge, what should they do next? Provide at least two relevant suggestions in the 'nextSteps' field. For example, if the topic is "Myocardial Infarction", suggest generating study notes for it or trying MCQs on cardiology.

**CRITICAL: The 'nextSteps' field is mandatory and must not be omitted.**

Example for 'nextSteps' on a case about "Appendicitis":
[
  {
    "title": "Review the Topic",
    "description": "Generate comprehensive study notes on Acute Appendicitis to solidify your understanding.",
    "toolId": "theorycoach-generator",
    "prefilledTopic": "Acute Appendicitis",
    "cta": "Generate Notes"
  },
  {
    "title": "Try Another Challenge",
    "description": "Test your skills with another case challenge on a similar difficulty.",
    "toolId": "challenges",
    "prefilledTopic": "Surgical abdomen",
    "cta": "Start New Challenge"
  }
]

Ensure the entire output is a single, valid JSON object conforming to the MedicoCaseChallengeGeneratorOutputSchema.
`,
  config: {
    temperature: 0.7, // Creative for varied case scenarios
  }
});

const caseChallengeGeneratorFlow = ai.defineFlow(
  {
    name: 'caseChallengeGeneratorFlow',
    inputSchema: MedicoCaseChallengeGeneratorInputSchema,
    outputSchema: MedicoCaseChallengeGeneratorOutputSchema,
  },
  async (input) => {
    try {
      // Add a unique ID to the input context if not present, for the prompt to use
      const effectiveInput = {
        ...input,
        id: `case-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      };

      const { output } = await caseChallengeGeneratorPrompt(effectiveInput);

      if (!output || !output.caseDetails || !output.correctAnswer) {
        console.error('CaseChallengeGeneratorPrompt did not return a valid case for:', input);
        throw new Error('Failed to generate case challenge. The AI model did not return the expected output.');
      }
      
      return output;
    } catch (err) {
      console.error(`[CaseChallengeGeneratorAgent] Error: ${err instanceof Error ? err.message : String(err)}`);
      throw new Error('An unexpected error occurred while generating the case challenge. Please try again.');
    }
  }
);
