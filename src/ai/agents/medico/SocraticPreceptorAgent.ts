'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { googleAI } from '@genkit-ai/googleai';

/**
 * SOCRATIC PRECEPTOR: The "Wait, Why?" Agent
 * Inspired by the "Ward Round" clinical interaction style.
 * Instead of giving answers, it guides students through self-discovery.
 */

export const SocraticPreceptorSchema = z.object({
  topic: z.string(),
  studentAnswer: z.string().optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).default('intermediate')
});

export const SocraticPreceptorOutputSchema = z.object({
  guidedQuestion: z.string(),
  feedbackOnAnswer: z.string().optional(),
  clinicalScenario: z.string(),
  isCorrect: z.boolean().optional(),
  logicalBlindSpot: z.string().optional()
});

export const socraticPreceptorFlow = ai.defineFlow(
  {
    name: 'socraticPreceptor',
    inputSchema: SocraticPreceptorSchema,
    outputSchema: SocraticPreceptorOutputSchema,
  },
  async (input) => {
    const prompt = `You are an expert Clinical Preceptor on a hospital ward round.
    You are teaching a medical student about: ${input.topic}.
    
    Current Difficulty: ${input.difficulty}
    Student's Last Response: ${input.studentAnswer || "Just starting the round"}
    
    CRITICAL: 
    1. NEVER give the student the straight answer.
    2. If they are wrong, ask a question that exposes their logical flaw.
    3. If they are right, ask a 'what if' question to test the depth of their knowledge.
    4. Provide a realistic clinical scenario (Case Vignette) related to the topic.
    
    Respond in JSON format.`;

    const { output } = await ai.generate({
      prompt,
      model: 'googleai/gemini-2.0-flash',
      output: {
        format: 'json',
        schema: SocraticPreceptorOutputSchema
      }
    });

    return output!;
  }
);
