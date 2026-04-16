// src/ai/agents/medico/ExamPaperAgent.ts
'use server';
/**
 * @fileOverview A Genkit flow for generating mock exam papers on medical topics for medico users.
 * This flow acts as the 'ExamPaperAgent'.
 *
 * - generateExamPaper - A function that handles the mock exam paper generation process.
 * - MedicoExamPaperInput - The input type for the generateExamPaper function.
 * - MedicoExamPaperOutput - The return type for the generateExamPaper function.
 */

import { ai } from '@/ai/genkit';
import { MedicoExamPaperInputSchema, MedicoExamPaperOutputSchema } from '@/ai/schemas/medico-tools-schemas';
import type { z } from 'zod';

export type MedicoExamPaperInput = z.infer<typeof MedicoExamPaperInputSchema>;
export type MedicoExamPaperOutput = z.infer<typeof MedicoExamPaperOutputSchema>;

export async function generateExamPaper(input: MedicoExamPaperInput): Promise<MedicoExamPaperOutput> {
  return examPaperFlow(input);
}

const examPaperPrompt = ai.definePrompt({
  name: 'medicoExamPaperPrompt',
  input: { schema: MedicoExamPaperInputSchema },
  output: { schema: MedicoExamPaperOutputSchema },
  prompt: `You are an expert medical examiner creating a mock exam paper based on the following criteria.

Exam Type: {{{examType}}}
{{#if year}}Focus Year (for pattern analysis): {{{year}}}{{/if}}
Number of MCQs to generate: {{{count}}}

Your primary task is to generate a comprehensive JSON object containing a realistic mock paper with MCQs and structured essay questions, plus relevant next study steps.

**Instructions for Essay Questions (CRITICAL):**
Generate 2-3 essay-style questions typical for this exam. For each essay question, you MUST provide:
1.  'question': The text of the essay question.
2.  'answer10M': A detailed, structured 10-mark answer as a JSON object with the following fields: 'definition', 'etiology', 'pathophysiology', 'clinicalFeatures', 'investigations', 'management', and optionally 'anatomyPhysiology', 'complications', 'prognosis', 'references'. Ensure the content for each field is a comprehensive string. Omit the 'diagrams' field.
3.  'answer5M': A separate, concise summary answer suitable for a 5-mark question, provided as a single string.
4.  Ensure the entire response for each essay question fits the 'EssayQuestionSchema'.

**Instructions for MCQs:**
Generate a clear and unambiguous set of Multiple Choice Questions (MCQs) based on the exam type. For each MCQ:
- Provide exactly four distinct options. One option must have 'isCorrect' set to true.
- The other three options should be plausible distractors with 'isCorrect' set to false.
- Provide a brief explanation for the correct answer.
- For each question (both MCQ and essay), include an array of relevant NMC competency codes (e.g., ["IM 1.2", "PE 3.4"]) in the 'competencyIds' field. If no specific competency applies, provide an empty array.

**Output Formatting:**
- The 'topicGenerated' field in your output must be set to "{{{examType}}}".
- The 'nextSteps' field is mandatory. Generate at least two relevant follow-up actions a student could take. Example: suggest generating detailed notes for one of the essay topics or creating a study plan.

Format your entire output as a single, valid JSON object conforming to the MedicoExamPaperOutputSchema.
`,
  config: {
    temperature: 0.6, // More creative for varied questions
  }
});

const examPaperFlow = ai.defineFlow(
  {
    name: 'medicoExamPaperFlow',
    inputSchema: MedicoExamPaperInputSchema,
    outputSchema: MedicoExamPaperOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await examPaperPrompt(input);
      if (!output || (!output.mcqs?.length && !output.essays?.length)) {
        console.error('MedicoExamPaperPrompt did not return valid content for exam:', input.examType);
        throw new Error('Failed to generate exam paper. The AI model did not return the expected output. Please try a different exam type or adjust the parameters.');
      }
      return {...output, topicGenerated: input.examType };
    } catch (err) {
      console.error(`[ExamPaperAgent] Error: ${err instanceof Error ? err.message : String(err)}`);
      throw new Error('An unexpected error occurred while generating the exam paper. Please try again.');
    }
  }
);
