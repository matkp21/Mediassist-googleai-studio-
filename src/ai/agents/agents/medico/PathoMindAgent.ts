'use server';
/**
 * @fileOverview The PathoMind agent, responsible for explaining disease pathophysiology.
 *
 * - explainPathophysiology - A function that handles the explanation process.
 * - PathoMindInput - The input type for the agent.
 * - PathoMindOutput - The return type from the agent.
 */

import { ai } from '@/ai/genkit';
import { PathoMindInputSchema, PathoMindOutputSchema } from '@/ai/schemas/medico-tools-schemas';
import type { z } from 'zod';

export type PathoMindInput = z.infer<typeof PathoMindInputSchema>;
export type PathoMindOutput = z.infer<typeof PathoMindOutputSchema>;

export async function explainPathophysiology(input: PathoMindInput): Promise<PathoMindOutput> {
  return pathoMindFlow(input);
}

const pathoMindPrompt = ai.definePrompt({
  name: 'medicoPathoMindPrompt',
  input: { schema: PathoMindInputSchema },
  output: { schema: PathoMindOutputSchema },
  prompt: `You are PathoMind, an AI expert in pathology and physiology.
Your primary task is to generate a JSON object containing a detailed explanation of the pathophysiology of the medical topic "{{{topic}}}", a Mermaid.js diagram summarizing the process, AND a list of relevant next study steps.

The JSON object you generate MUST have an 'explanation' field, a 'diagram' field, and a 'nextSteps' field.

**CRITICAL: The 'nextSteps' field is mandatory and must not be omitted.** Generate at least two relevant suggestions.

Example for 'nextSteps':
[
  {
    "title": "Generate Study Notes",
    "description": "Create a comprehensive, structured note for {{{topic}}} covering clinical features and management.",
    "toolId": "theorycoach-generator",
    "prefilledTopic": "{{{topic}}}",
    "cta": "Generate Comprehensive Notes"
  },
  {
    "title": "Test Your Understanding",
    "description": "Create flashcards based on this pathophysiological process to reinforce your learning.",
    "toolId": "flashcards",
    "prefilledTopic": "Pathophysiology of {{{topic}}}",
    "cta": "Create Flashcards"
  }
]
---

**Instructions for explanation and diagram generation:**
1. Provide a clear, step-by-step explanation of the pathophysiology in the 'explanation' field. Structure the explanation logically, from initial triggers to clinical manifestations.
2. Generate a simple Mermaid.js flowchart (graph TD) in the 'diagram' field that visually summarizes the key steps of the pathophysiological process.

Example for 'Myocardial Infarction':
Explanation: "Coronary artery plaque rupture leads to thrombus formation..."
Diagram: "graph TD; A[Plaque Rupture] --> B[Thrombus Formation]; B --> C[Occlusion of Artery]; C --> D[Myocardial Ischemia]; D --> E[Cell Death / Infarction];"

Format the entire output as a valid JSON object.
`,
  config: {
    temperature: 0.4, // Factual and structured
  }
});

const pathoMindFlow = ai.defineFlow(
  {
    name: 'medicoPathoMindFlow',
    inputSchema: PathoMindInputSchema,
    outputSchema: PathoMindOutputSchema,
  },
  async (input) => {
    try {
        const { output } = await pathoMindPrompt(input);

        if (!output || !output.explanation) {
        console.error('PathoMindPrompt did not return a valid explanation for:', input.topic);
        throw new Error('Failed to explain pathophysiology. The AI model did not return the expected output.');
        }
        
        return output;
    } catch (err) {
        console.error(`[PathoMindAgent] Error: ${err instanceof Error ? err.message : String(err)}`);
        throw new Error('An unexpected error occurred while explaining pathophysiology. Please try again.');
    }
  }
);
