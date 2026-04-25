'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { GoogleGenAI } from '@google/genai';
import { pubmedSearchSkill } from '../skills/pubmed-search';
import { injectKarpathyGuidelines } from './skills/karpathy-guidelines';

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

const googleGenAi = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });

import { clinicalLiteratureScraper, interactiveMedicalScraper } from '@/ai/tools/webScraper';

const medicoClinicalResearchPrompt = ai.definePrompt({
  name: 'medicoClinicalResearchPrompt',
  input: { schema: EbmResearchInputSchema },
  output: { schema: EbmResearchOutputSchema },
  tools: [clinicalLiteratureScraper, interactiveMedicalScraper],
  prompt: `You are an EBM Clinical Assistant utilizing Firecrawl web extraction technology.
  Task: Take clinical query "{{{query}}}", use tools to scrape medical journals (NIH, PubMed, WHO) and synthesize a clinical summary. 
  
  Instructions:
  1. Use 'clinicalLiteratureScraper' for static journal pages.
  2. Use 'interactiveMedicalScraper' for gated databases or search forms.
  3. Synthesize clean markdown results into a clinical answer.`
});

const ebmResearchFlow = ai.defineFlow(
  {
    name: 'medicoEbmResearchFlow',
    inputSchema: EbmResearchInputSchema,
    outputSchema: EbmResearchOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await medicoClinicalResearchPrompt(input);
      return output;
    } catch (err: any) {
      console.error(err);
      throw new Error(`Research Fault: ${err.message}`);
    }
  }
);
