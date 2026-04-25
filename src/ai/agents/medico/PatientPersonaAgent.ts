'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

/**
 * MULTILINGUAL PATIENT PERSONAS
 * Providing Voice Design capabilities to generate expressive patient voices.
 */
export const runPatientPersonaGenerator = ai.defineFlow(
  {
    name: 'runPatientPersonaGenerator',
    inputSchema: z.object({ 
        age: z.number(),
        gender: z.string(),
        condition: z.string(),
        language: z.string().default('English'),
        emotions: z.array(z.string()).default(['Anxious', 'In pain'])
    }),
    outputSchema: z.object({ 
        personaDescription: z.string(),
        voiceProfile: z.object({
            pitch: z.number(),
            stability: z.number(),
            expressiveness: z.number(),
            clonedVoiceId: z.string().optional()
        }),
        sampleScript: z.string()
    }),
  },
  async (input) => {
    const prompt = `Design a patient persona for a clinical simulation.
    Age: ${input.age}, Gender: ${input.gender}, Condition: ${input.condition}
    Language: ${input.language}, Emotions: ${input.emotions.join(', ')}
    
    Describe their voice characteristics and generate a sample script of their opening statement when meeting a doctor.`;

    const response = await ai.generate({
       model: 'vertexai/gemini-1.5-flash',
       prompt: prompt,
    });

    return { 
        personaDescription: `A ${input.age}yo ${input.gender} with ${input.condition}, feeling ${input.emotions.join(' and ')}.`,
        voiceProfile: {
            pitch: input.age < 30 ? 1.2 : 0.8,
            stability: 0.5,
            expressiveness: 0.9
        },
        sampleScript: response.text()
    };
  }
);
