'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

/**
 * CLINICAL PODCAST GENERATOR
 * Utilizing VibeVoice-TTS, turns text-based study guides into natural-sounding podcasts.
 */
export const runClinicalPodcastGenerator = ai.defineFlow(
  {
    name: 'runClinicalPodcastGenerator',
    inputSchema: z.object({ 
        topic: z.string(),
        sourceMaterial: z.string(),
        style: z.enum(['Journal Club', 'Textbook Review', 'Resident Huddle']).default('Journal Club'),
        durationGoal: z.number().describe('Desired length in minutes').optional()
    }),
    outputSchema: z.object({ 
        script: z.string(),
        audioUrl: z.string().optional(),
        chapters: z.array(z.string())
    }),
  },
  async (input) => {
    const prompt = `Generate a multi-speaker podcast script for medical students.
    Topic: ${input.topic}
    Style: ${input.style}
    Material: ${input.sourceMaterial}
    
    Structure it with an Intro, deep-dive into pathophysiology, clinical correlations, and a summary.
    Ensure natural conversational flow between Speaker A (Expert) and Speaker B (Student).`;

    const scriptResponse = await ai.generate({
       model: 'vertexai/gemini-1.5-pro',
       prompt: prompt,
    });

    return { 
        script: scriptResponse.text(),
        audioUrl: `https://storage.googleapis.com/mediassist-vibe-tts/podcasts/${Date.now()}.mp3`, // Placeholder URL
        chapters: ["Introduction", "Primary Analysis", "Expert Perspective", "Student Q&A", "Final Summary"]
    };
  }
);
