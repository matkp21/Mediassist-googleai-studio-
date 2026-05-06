'use server';

import { generate } from '@genkit-ai/ai';

import { ai } from '@/ai/genkit';
import { FocusMusicGeneratorInputSchema, FocusMusicGeneratorOutputSchema, type FocusMusicGeneratorInput, type FocusMusicGeneratorOutput } from '@/ai/schemas/medico-tools-schemas';

export const FocusMusicGeneratorAgent = ai.defineAction(
  {
    name: 'FocusMusicGeneratorAgent',
    inputSchema: FocusMusicGeneratorInputSchema,
    outputSchema: FocusMusicGeneratorOutputSchema,
  },
  async (input: FocusMusicGeneratorInput): Promise<FocusMusicGeneratorOutput> => {
    const prompt = `You are an AI Music Producer specializing in focus and studying soundtracks. Based on the user's desired vibe "${input.studyVibe}", design an ideal music generation prompt (using Lyria logic) for custom lo-fi beats, ambient sounds, or focus music to aid concentration.

Include the track name, the precise prompt for the Lyria engine, and recommend a few other similar styles.`;

    const response = await generate({
      model: 'googleai/gemini-3.0-flash',
      prompt: prompt,
      output: {
        schema: FocusMusicGeneratorOutputSchema,
      },
    });

    return response.output();
  }
);
