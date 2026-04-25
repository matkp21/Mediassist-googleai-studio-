'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

/**
 * MarkItDown Ingestion Agent
 * Inspired by Microsoft's MarkItDown utility.
 * Uses Gemini 1.5 Pro multimodal capabilities to structuralize medical files into MD.
 */
export const runMarkItDownIngestion = ai.defineFlow(
  {
    name: 'runMarkItDownIngestion',
    inputSchema: z.object({ 
        fileName: z.string(), 
        dataUrl: z.string(), 
        mimeType: z.string() 
    }),
    outputSchema: z.object({ markdown: z.string() }),
  },
  async (input) => {
    const response = await ai.generate({
      model: 'vertexai/gemini-1.5-pro',
      prompt: `You are the MediAssistant MarkItDown Ingestion Agent. 
      Your task is to convert the following medical document ("${input.fileName}") into clean, highly structured Markdown.
      
      Requirements:
      1. PRESERVE medical tables with their exact heading hierarchies.
      2. MAINTAIN mathematical equations in LaTeX formatting.
      3. EXTRACT all anatomical or radiological descriptions into bulleted lists.
      4. DO NOT hallucinate patient data that is not explicitly in the scan.
      
      Convert the attached media into professional markdown.`,
      messages: [{
        role: 'user',
        content: [
          { text: 'Convert this document to Markdown.' },
          { media: { url: input.dataUrl, contentType: input.mimeType } }
        ]
      }]
    });

    return { markdown: response.text() };
  }
);
