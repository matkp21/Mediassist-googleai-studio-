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
import { pubmedSearchSkill } from '../../skills/pubmed-search';
import { injectKarpathyGuidelines } from './skills/karpathy-guidelines';

export type StudyNotesGeneratorInput = z.infer<typeof StudyNotesGeneratorInputSchema>;
export type StudyNotesGeneratorOutput = z.infer<typeof StudyNotesGeneratorOutputSchema>;

export async function generateStudyNotes(input: StudyNotesGeneratorInput): Promise<StudyNotesGeneratorOutput> {
  const result = await studyNotesFlow(input);
  return result;
}

const studyNotesFlow = ai.defineFlow(
  {
    name: 'medicoStudyNotesFlow',
    inputSchema: StudyNotesGeneratorInputSchema,
    outputSchema: StudyNotesGeneratorOutputSchema,
  },
  async (input) => {
    try {
      const isSurgicalEdit = input.surgicalEdit && input.previousNotes;
      
      const response = await ai.generate({
        model: 'vertexai/gemini-2.5-pro',
        tools: [pubmedSearchSkill],
        output: { schema: StudyNotesGeneratorOutputSchema },
        config: { temperature: 0.3 },
        prompt: injectKarpathyGuidelines(`You are an AI medical expert (Theory Coach & EBM Assistant).
${isSurgicalEdit ? `
SURGICAL EDIT MODE ACTIVE:
The user wants you to modify specific parts of the existing notes below based on their latest request: "${input.topic}".
DO NOT rewrite the entire document from scratch. ONLY output the updated full document with the specific changes applied.
Existing Notes:
${input.previousNotes}
` : `
Your primary task is to generate a comprehensive JSON object containing structured study notes, summary points, a Mermaid.js diagram, and next study steps.
`}

CRITICAL INSTRUCTION: You MUST use the 'pubmedSearchSkill' tool to find 2-3 recent Evidence-Based Medicine (EBM) articles on "${input.topic}". 
Append the PubMed findings into the final 'notes' section under a heading "Evidence-Based Medicine (EBM) Context".

The JSON object you generate MUST have five fields: 'notes', 'summaryPoints', 'diagram', 'imagePrompts', and 'nextSteps'.

**Instructions for Image Generation (Imagen 3):**
The 'imagePrompts' field should contain 2-3 detailed prompts for generating medical concept art, anatomical diagrams, or histological slides relevant to the topic. These prompts specify custom aspect ratios (e.g., "16:9 cinematic medical illustration...").

**CRITICAL: The 'nextSteps' field is mandatory and must not be omitted.** Generate at least two relevant suggestions based on the topic. Example:
[
  {
    "title": "Test Your Knowledge",
    "description": "Generate MCQs to test your recall on ${input.topic}.",
    "toolId": "mcq",
    "prefilledTopic": "${input.topic}",
    "cta": "Generate 5 MCQs"
  }
]

**Instructions for notes generation:**
Topic/Question: ${input.topic}
Desired Answer Length: ${input.answerLength}

The core medical content MUST be organized sequentially into these exact sections:
1. Definition
2. Etiology
3. Clinical Features
4. Investigations
5. Management
6. Evidence-Based Medicine (EBM) Context (Fetch this using the tool!)

- Use clear, hierarchical Headings.
- Emphasize High-yield points.

2.  **'summaryPoints' field**: Array of 3-5 key, high-yield summary points for quick revision.
3.  **'diagram' field**: Generate a flowchart or diagram using Mermaid.js syntax. Or null.
4.  **'imagePrompts' field**: Array of 2-3 Imagen 3 prompts for concept art.

Constraint: For a '10-mark' answer, the 'notes' content should be detailed. For a '5-mark' answer, it should be concise.
Ensure the response is valid JSON matching the schema.`),
      });
      
      const output = response.output();
      if (!output || !output.notes) {
        console.error('StudyNotesPrompt did not return an output for topic:', input.topic);
        throw new Error('Failed to generate study notes. The AI model did not return the expected output.');
      }
      return output;
    } catch (err) {
      console.error(`[StudyNotesAgent] Error: ${err instanceof Error ? err.message : String(err)}`);
      throw new Error('An unexpected error occurred while generating study notes. Please try again.');
    }
  }
);
