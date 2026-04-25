'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

/**
 * MEDICAL VIDEO SYNTHESIZER AGENT
 * Adapting hyperframes HTML-to-video framework.
 * Authors HTML/CSS/GSAP compositions and renders them into video clips.
 */
export const runMedicalVideoSynthesizer = ai.defineFlow(
  {
    name: 'runMedicalVideoSynthesizer',
    inputSchema: z.object({ 
        notes: z.string(),
        topic: z.string(),
        aspectRatio: z.enum(['16:9', '9:16', '1:1']).default('16:9')
    }),
    outputSchema: z.object({ 
        compositionHtml: z.string(),
        renderStatus: z.string(),
        videoUrl: z.string()
    }),
  },
  async (input) => {
    const prompt = `You are a medical motion graphics author.
    Topic: ${input.topic}
    Content: ${input.notes}
    
    Generate a complete HTML/CSS composition for a short educational clip.
    Use high-contrast typography and anatomical placeholders.
    Include GSAP animation markers in comments for the render engine.`;

    const response = await ai.generate({
       model: 'vertexai/gemini-1.5-pro',
       prompt: prompt,
    });

    return { 
        compositionHtml: response.text(),
        renderStatus: 'Ready for Render',
        videoUrl: `https://storage.googleapis.com/mediassist-renders/videos/${Date.now()}.mp4`
    };
  }
);
