// src/ai/agents/medico/KnowledgeAugmenterAgent.ts
"use server";
import { z } from "zod";
import { genkit } from "genkit";
import { gemini15Pro, googleAI } from "@genkit-ai/googleai";

const ai = genkit({
  plugins: [googleAI()],
});

export const KnowledgeAugmenterInputSchema = z.object({
  briefNotes: z.string().min(5),
});

export type KnowledgeAugmenterInput = z.infer<typeof KnowledgeAugmenterInputSchema>;

export const KnowledgeAugmenterOutputSchema = z.object({
  augmentedText: z.string().describe("The expanded, comprehensive medical context based on the brief notes."),
  keyConcepts: z.array(z.string()).describe("List of key concepts explicitly covered in the augmented text."),
  clinicalRelevance: z.string().describe("Why this topic is clinically relevant according to current standards."),
});

export type KnowledgeAugmenterOutput = z.infer<typeof KnowledgeAugmenterOutputSchema>;

export async function augmentKnowledge(
  input: KnowledgeAugmenterInput
): Promise<KnowledgeAugmenterOutput> {
  const { output } = await ai.generate({
    model: gemini15Pro,
    output: {
        schema: KnowledgeAugmenterOutputSchema
    },
    prompt: `You are an expert medical professor acting as a Knowledge Augmenter.
    
The user has provided the following brief notes:
"""
${input.briefNotes}
"""

Your task is to expand these brief notes into a comprehensive, high-yield medical explanation.
Include necessary pathophysiology, clinical presentations, diagnostic criteria, or management guidelines as appropriate for the topic. Ensure the information is structured, precise, and evidence-based.`,
  });

  if (!output) throw new Error("No output generated");
  return output;
}
