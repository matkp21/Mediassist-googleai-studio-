'use server';
/**
 * @fileOverview A Genkit flow representing an AI agent that compresses large medical
 * context using REFRAG-style techniques to accelerate Retrieval-Augmented Generation.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { injectKarpathyGuidelines } from './skills/karpathy-guidelines';

export const RefragCompressorInputSchema = z.object({
  documentText: z.string().describe("Large document or batch of text to compress."),
  compressionRatio: z.number().default(0.1).describe("Target compression ratio (e.g., 0.1 for 10% of original size).")
});

export const RefragCompressorOutputSchema = z.object({
  compressedText: z.string().describe("The REFRAG-compressed text, retaining high-yield medical facts while discarding semantic fluff."),
  tokenReduction: z.string().describe("Estimated token reduction statement.")
});

export type RefragCompressorInput = z.infer<typeof RefragCompressorInputSchema>;
export type RefragCompressorOutput = z.infer<typeof RefragCompressorOutputSchema>;

export async function compressMedicalContext(input: RefragCompressorInput): Promise<RefragCompressorOutput> {
  return refragCompressorFlow(input);
}

const promptTemplate = `You are a REFRAG Compression Agent for a medical knowledge hub.
Your task is to take the provided large medical document and compress it to approximately {{compressionRatio}} of its original length.

CRITICAL INSTRUCTIONS:
1. Remove all conversational filler, repetitive examples, and non-essential grammatical connectors.
2. Preserve all hard medical facts: dosages, genetic markers, anatomical relationships, diagnostic criteria, and mechanisms of action.
3. Formulate the output as an ultra-dense, bulleted "knowledge graph" representation in plain text.
4. Estimate the token reduction achieved.

Text to compress:
"""
{{{documentText}}}
"""

Return a JSON object conforming strictly to the output schema.
`;

const refragCompressorPrompt = ai.definePrompt({
  name: 'medicoRefragCompressorPrompt',
  input: { schema: RefragCompressorInputSchema },
  output: { schema: RefragCompressorOutputSchema },
  prompt: injectKarpathyGuidelines(promptTemplate),
  config: { temperature: 0.1 } // Highly deterministic for compression
});

const refragCompressorFlow = ai.defineFlow(
  {
    name: 'medicoRefragCompressorFlow',
    inputSchema: RefragCompressorInputSchema,
    outputSchema: RefragCompressorOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await refragCompressorPrompt(input);
      if (!output || !output.compressedText) {
        throw new Error('Compression failed.');
      }
      return output;
    } catch (err) {
      console.error('[RefragCompressorAgent] Error:', err);
      throw new Error('An error occurred during context compression.');
    }
  }
);
