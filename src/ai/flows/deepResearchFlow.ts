import { z } from "genkit";
import { ai } from "@/ai/genkit";
import { ResearchInputSchema, ResearchChunkSchema } from "@/lib/schemas/medi-schemas";
import { gemini20Pro } from "@genkit-ai/googleai";

const pubmedAgent = ai.defineFlow(
  { name: "pubmedAgent", inputSchema: z.object({ query: z.string() }), outputSchema: z.array(ResearchChunkSchema) },
  async ({ query }) => {
    // Simplified PubMed
    return [{ source: "PubMed", title: query, content: "Synthesized clinical evidence from PubMed database.", url: "https://pubmed.ncbi.nlm.nih.gov" }];
  }
);

const synthesisAgent = ai.defineFlow(
  { name: "synthesisAgent", inputSchema: z.object({ topic: z.string(), chunks: z.array(ResearchChunkSchema) }), outputSchema: z.object({ report: z.string() }) },
  async ({ topic, chunks }) => {
    const context = chunks.map(c => `[${c.source}]: ${c.title}`).join("\n");
    const resp = await ai.generate({ model: gemini20Pro, prompt: `Report: ${topic}\nContext: ${context}` });
    return { report: resp.text };
  }
);

export const deepResearchFlow = ai.defineFlow(
  { name: "deepResearchFlow", inputSchema: ResearchInputSchema, outputSchema: z.object({ report: z.string() }) },
  async (input) => {
    const chunks = await pubmedAgent({ query: input.topic });
    return await synthesisAgent({ topic: input.topic, chunks });
  }
);
