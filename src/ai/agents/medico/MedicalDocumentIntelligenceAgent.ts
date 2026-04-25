'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { GoogleGenAI } from '@google/genai';
import { injectKarpathyGuidelines } from './skills/karpathy-guidelines';

export const MedicalDocumentIntelligenceInputSchema = z.object({
  query: z.string().describe("A question regarding the medical document or web data."),
  documentUrlContext: z.string().optional().describe("A Firecrawl scraped markdown text or text data."),
});

export const MedicalDocumentIntelligenceOutputSchema = z.object({
  answer: z.string().describe("Comprehensive MarkItDown-styled markdown answer."),
  sources: z.array(z.string()).describe("List of inferred sources.")
});

export type MedicalDocumentIntelligenceInput = z.infer<typeof MedicalDocumentIntelligenceInputSchema>;
export type MedicalDocumentIntelligenceOutput = z.infer<typeof MedicalDocumentIntelligenceOutputSchema>;

const googleGenAi = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });

export async function processMedicalDocument(input: MedicalDocumentIntelligenceInput): Promise<MedicalDocumentIntelligenceOutput> {
  try {
    const promptTemplate = `You are a Medical Document Intelligence Agent utilizing simulated MarkItDown formatting techniques and simulated verified Firecrawl web ingestion.
    Take the user's query and any provided document context, synthesize the information thoroughly, and output it in a beautifully structured markdown format mimicking MarkItDown's clarity.
    
    Query: ${input.query}
    Context: ${input.documentUrlContext || "No context provided; rely on internal knowledge base or simulated Firecrawl RAG."}
    `;

    const res = await googleGenAi.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: injectKarpathyGuidelines(promptTemplate),
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
             answer: { type: "STRING" },
             sources: { 
                 type: "ARRAY", 
                 items: { type: "STRING" }
             }
          },
          required: ["answer", "sources"]
        }
      }
    });

    const parsed = JSON.parse(res.text || '{}');
    if (!parsed.answer) throw new Error("Document analysis failed.");

    return parsed as MedicalDocumentIntelligenceOutput;
  } catch (error) {
    console.error("Doc Intelligence Error", error);
    throw new Error("Failed to process medical document.");
  }
}
