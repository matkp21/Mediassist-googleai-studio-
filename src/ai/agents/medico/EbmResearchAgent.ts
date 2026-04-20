'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { pubmedSearchSkill } from '../skills/pubmed-search';

export const EbmResearchInputSchema = z.object({
  query: z.string().describe("The clinical question (e.g. 'PICO formatted query') to search."),
});

export const EbmResearchOutputSchema = z.object({
  synthesizedAnswer: z.string().describe("A comprehensive answer to the clinical question, synthesizing the findings."),
  papers: z.array(z.object({
    title: z.string(),
    summary: z.string(),
    url: z.string()
  })).optional(),
});

export type EbmResearchInput = z.infer<typeof EbmResearchInputSchema>;
export type EbmResearchOutput = z.infer<typeof EbmResearchOutputSchema>;

export async function generateEbmResearch(input: EbmResearchInput): Promise<EbmResearchOutput> {
  return ebmResearchFlow(input);
}

const ebmResearchFlow = ai.defineFlow(
  {
    name: 'medicoEbmResearchFlow',
    inputSchema: EbmResearchInputSchema,
    outputSchema: EbmResearchOutputSchema,
  },
  async (input) => {
    try {
      const response = await ai.generate({
        model: 'vertexai/gemini-2.5-pro',
        tools: [pubmedSearchSkill],
        config: { temperature: 0.2 },
        output: { schema: EbmResearchOutputSchema },
        prompt: `You are an Evidence-Based Medicine (EBM) clinical assistant.
Your task is to take a clinical query: "${input.query}", use the 'pubmedSearchSkill' to find recent literature, and then synthesize the findings into a direct, clinical answer.
Always extract the paper titles and PMC/PMID link (e.g. https://pubmed.ncbi.nlm.nih.gov/[PMID]) and provide a 1-sentence summary of each paper's conclusion in the 'papers' array if found.

IMPORTANT: You must attempt a PubMed search first via the tool before answering.`,
      });
      
      const output = response.output();
      if (!output || !output.synthesizedAnswer) {
        throw new Error('Failed to generate EBM synthesis.');
      }
      return output;
    } catch(err) {
      console.error(err);
      throw new Error("Error generating EBM research summary.");
    }
  }
);
