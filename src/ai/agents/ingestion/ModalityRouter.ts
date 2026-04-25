'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

export const ModalityRouterOutputSchema = z.object({
  modality: z.enum(['text', 'table', 'image', 'radiology', 'handwritten', 'mathematical']),
  suggestedEngine: z.enum(['flash-ocr', 'pro-multimodal', 'vision-expert']),
  initialExtraction: z.string().describe('Highly structured markdown extraction of the content.')
});

export const routeModality = ai.defineFlow(
  {
    name: 'routeModality',
    inputSchema: z.object({ dataUrl: z.string(), mimeType: z.string() }),
    outputSchema: ModalityRouterOutputSchema,
  },
  async (input) => {
    const response = await ai.generate({
      model: 'vertexai/gemini-2.0-flash',
      prompt: `You are a Modality-Aware Content Router for MediAssistant.
      Analyze the provided clinical file/image and:
      1. Detect the primary modality (table, text, radiology, etc).
      2. Suggest the best processing engine.
      3. Perform a high-fidelity initial extraction into clean Markdown.
      
      If it's a table, preserve the headers. If it's radiology, describe findngs concisely.`,
      messages: [{
        role: 'user',
        content: [
          { text: 'Classify and extract this medical content.' },
          { media: { url: input.dataUrl, contentType: input.mimeType } }
        ]
      }],
      output: { schema: ModalityRouterOutputSchema }
    });

    return response.output();
  }
);
