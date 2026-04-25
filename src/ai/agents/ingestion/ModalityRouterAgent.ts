'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { runMarkItDownIngestion } from './MarkItDownAgent';

/**
 * Modality-Aware Content Router
 * Automatically detects whether uploaded medical content is an image, table, or mathematical equation.
 */
export const modalityAwareRouter = ai.defineFlow(
  {
    name: 'modalityAwareRouter',
    inputSchema: z.object({ 
        dataUrl: z.string(), 
        mimeType: z.string() 
    }),
    outputSchema: z.object({ 
        primaryModality: z.enum(['image', 'table', 'text', 'math']),
        recommendedTool: z.string(),
        processedData: z.any() 
    }),
  },
  async (input) => {
    // Step 1: Detect modality using a lightweight vision model (Gemini 1.5 Flash-Lite)
    const detection = await ai.generate({
       model: 'vertexai/gemini-1.5-flash',
       prompt: "Analyze this medical file. Determine if it is primarily an anatomical/radiological image, a data table, a mathematical clinical formula, or standard medical text. Respond with ONLY the modality type: image, table, math, or text.",
       messages: [{
         role: 'user',
         content: [{ media: { url: input.dataUrl, contentType: input.mimeType } }]
       }]
    });

    const modality = detection.text().trim().toLowerCase() as any;

    // Step 2: Route to specialized tools
    if (modality === 'table' || modality === 'text') {
        const result = await runMarkItDownIngestion({ 
            fileName: 'modality_route_file', 
            dataUrl: input.dataUrl, 
            mimeType: input.mimeType 
        });
        return { 
            primaryModality: modality, 
            recommendedTool: 'MarkItDownIngest', 
            processedData: result 
        };
    }

    return { 
        primaryModality: modality, 
        recommendedTool: modality === 'image' ? 'VisionOcclusion' : 'FormulaParser', 
        processedData: { status: 'routed_to_specialist' } 
    };
  }
);
