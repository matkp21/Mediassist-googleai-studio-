// src/ai/agents/medico/MCQGeneratorAgent.ts
'use server';
/**
 * @fileOverview A Genkit flow for generating Multiple Choice Questions (MCQs) on medical topics for medico users.
 * This flow takes a topic and a desired number of MCQs, then returns structured MCQs
 * with options, correct answers, and explanations.
 *
 * - generateMCQs - A function that handles the MCQ generation process.
 * - MedicoMCQGeneratorInput - The input type for the generateMCQs function.
 * - MedicoMCQGeneratorOutput - The return type for the generateMCQs function.
 */

import { ai } from '@/ai/genkit';
import { MedicoMCQGeneratorInputSchema, MedicoMCQGeneratorOutputSchema, MCQOptionSchema, MCQSchema as SingleMCQSchema } from '@/ai/schemas/medico-tools-schemas';
import type { z } from 'zod';

export type MedicoMCQGeneratorInput = z.infer<typeof MedicoMCQGeneratorInputSchema>;
export type MedicoMCQGeneratorOutput = z.infer<typeof MedicoMCQGeneratorOutputSchema>;
export type MCQSchema = z.infer<typeof SingleMCQSchema>; // For easier usage in chat component

export async function generateMCQs(input: MedicoMCQGeneratorInput): Promise<MedicoMCQGeneratorOutput> {
  const result = await mcqGeneratorFlow(input);
  return result;
}

const mcqGeneratorPrompt = ai.definePrompt({
  name: 'medicoMCQGeneratorPrompt',
  input: { schema: MedicoMCQGeneratorInputSchema },
  output: { schema: MedicoMCQGeneratorOutputSchema },
  prompt: `You are an AI expert in medical education. Your primary task is to generate a JSON object containing a quiz AND a list of relevant next study steps.

The JSON object you generate MUST have an 'mcqs' array, a 'topicGenerated' string, and a 'nextSteps' field.

**CRITICAL: The 'nextSteps' field is mandatory and must not be omitted.** Generate at least two relevant suggestions based on the topic.

Example for 'nextSteps':
[
  {
    "title": "Deepen Understanding",
    "description": "Generate structured study notes to review the core concepts of {{{topic}}}.",
    "toolId": "theorycoach-generator",
    "prefilledTopic": "{{{topic}}}",
    "cta": "Generate Study Notes"
  },
  {
    "title": "Visualize It",
    "description": "Create a flowchart to understand the clinical pathway or algorithm for {{{topic}}}.",
    "toolId": "flowcharts",
    "prefilledTopic": "{{{topic}}}",
    "cta": "Create Flowchart"
  }
]
---

**Instructions for quiz generation:**
Generate a quiz based on the following criteria:
Topic: {{{topic}}}
{{#if subject}}Subject: {{{subject}}}{{/if}}
{{#if system}}System: {{{system}}}{{/if}}
Difficulty: {{{difficulty}}}
Exam Style: {{{examType}}}
Number of MCQs to generate: {{{count}}}

For each MCQ:
1.  Create a clear and unambiguous question based on the medical topic, tailored to the specified difficulty, exam style, subject, and system.
2.  Provide exactly four distinct options (A, B, C, D).
3.  Ensure one option is clearly the correct answer.
4.  The other three options should be plausible distractors, relevant to the topic but incorrect.
5.  Provide a brief explanation for why the correct answer is correct and, if relevant, why common distractors are incorrect.
6. The 'topicGenerated' field must be set to "{{{topic}}}".

Ensure the final output is a single valid JSON object.
`,
  config: {
    temperature: 0.5, // A bit of creativity for plausible distractors but still medically sound
  }
});

const mcqGeneratorFlow = ai.defineFlow(
  {
    name: 'medicoMCQGeneratorFlow',
    inputSchema: MedicoMCQGeneratorInputSchema,
    outputSchema: MedicoMCQGeneratorOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await mcqGeneratorPrompt(input);
      if (!output || !output.mcqs || output.mcqs.length === 0) {
        console.error('MedicoMCQGeneratorPrompt did not return valid MCQs for topic:', input.topic);
        throw new Error('Failed to generate MCQs. The AI model did not return the expected output or returned an empty set. Please try a different topic or adjust the count.');
      }
      return {...output, topicGenerated: input.topic };
    } catch (err) {
      console.error(`[MCQGeneratorAgent] Error: ${err instanceof Error ? err.message : String(err)}`);
      throw new Error('An unexpected error occurred while generating MCQs. Please try again.');
    }
  }
);
