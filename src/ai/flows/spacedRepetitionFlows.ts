'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { updateSessionState, getSessionState } from '../memory/sessionMemory';

/**
 * SPACED REPETITION ENGINE (SM-2 Integration)
 * Aligns with the Ebbinghaus forgetting curve.
 * Calculates next review dates based on recall quality (0-5).
 */

export const SpacedRepetitionSchema = z.object({
  userId: z.string(),
  topic: z.string(),
  quality: z.number().min(0).max(5).describe("Recall quality: 0=total blackout, 5=perfect recall")
});

export const spacedRepetitionFlow = ai.defineFlow(
  {
    name: 'spacedRepetition',
    inputSchema: SpacedRepetitionSchema,
    outputSchema: z.object({ nextReviewDate: z.string(), interval: z.number() }),
  },
  async ({ userId, topic, quality }) => {
    const session = await getSessionState(userId);
    const prevData = session?.learningProfile?.sm2Data?.[topic] || { interval: 0, repetition: 0, efactor: 2.5 };

    let { interval, repetition, efactor } = prevData;

    // SM-2 Algorithm Implementation
    if (quality >= 3) {
      if (repetition === 0) {
        interval = 1;
      } else if (repetition === 1) {
        interval = 6;
      } else {
        interval = Math.round(interval * efactor);
      }
      repetition += 1;
    } else {
      repetition = 0;
      interval = 1;
    }

    efactor = efactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    if (efactor < 1.3) efactor = 1.3;

    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + interval);

    // Persist to session brain
    await updateSessionState(userId, {
      learningProfile: {
        ...session?.learningProfile,
        sm2Data: {
          ...(session?.learningProfile?.sm2Data || {}),
          [topic]: { interval, repetition, efactor, nextReview: nextReview.toISOString() }
        }
      } as any
    });

    console.info(`[SM-2] Topic: ${topic}, Quality: ${quality} -> Interval: ${interval} days. Next Review: ${nextReview.toDateString()}`);
    
    return { nextReviewDate: nextReview.toISOString(), interval };
  }
);
