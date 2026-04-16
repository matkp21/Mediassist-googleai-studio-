
'use server';
/**
 * @fileOverview A Genkit flow for tracking study progress for medico users.
 * This is a conceptual agent that would typically interact with a database.
 *
 * - trackProgress - A function that handles progress tracking.
 * - MedicoProgressTrackerInput - The input type.
 * - MedicoProgressTrackerOutput - The output type.
 */

import { ai } from '@/ai/genkit';
import { MedicoProgressTrackerInputSchema, MedicoProgressTrackerOutputSchema } from '@/ai/schemas/medico-tools-schemas';
import type { z } from 'zod';

export type MedicoProgressTrackerInput = z.infer<typeof MedicoProgressTrackerInputSchema>;
export type MedicoProgressTrackerOutput = z.infer<typeof MedicoProgressTrackerOutputSchema>;

export async function trackProgress(input: MedicoProgressTrackerInput): Promise<MedicoProgressTrackerOutput> {
  // In a real application, this function would read from and write to a Firestore database
  // to get the user's current progress and update it.
  // For this conceptual agent, we'll simulate this interaction within the prompt.
  return progressTrackerFlow(input);
}

const progressTrackerPrompt = ai.definePrompt({
  name: 'medicoProgressTrackerPrompt',
  input: { schema: MedicoProgressTrackerInputSchema },
  output: { schema: MedicoProgressTrackerOutputSchema },
  prompt: `You are an AI assistant that provides gamified feedback for a medical student's study progress.
Your primary task is to generate a JSON object containing an encouraging progress update message based on a completed activity AND a list of relevant next study steps.

The JSON object you generate MUST have 'progressUpdateMessage', 'newAchievements', 'updatedTopicProgress', and a 'nextSteps' field.

**CRITICAL: The 'nextSteps' field is mandatory and must not be omitted.** Generate at least two relevant suggestions based on the activity.

Example for 'nextSteps':
[
  {
    "title": "Review Another Topic",
    "description": "Generate study notes for a related topic to broaden your knowledge.",
    "toolId": "theorycoach-generator",
    "prefilledTopic": "[Suggest a related topic to {{{topic}}}]",
    "cta": "Generate Notes"
  },
  {
    "title": "Predict High-Yield Topics",
    "description": "See what other topics are important for your upcoming exams.",
    "toolId": "topics",
    "prefilledTopic": "USMLE Step 1",
    "cta": "Predict Topics"
  }
]
---

**Instructions for progress update:**
Activity Details:
Activity Type: {{{activityType}}}
Topic: {{{topic}}}
{{#if score}}Score: {{{score}}}%{{/if}}

1.  Based on this activity, provide an encouraging 'progressUpdateMessage'.
2.  If the score is high (e.g., > 85%), award a conceptual achievement in the 'newAchievements' array (e.g., "Cardiology Whiz", "Pharmacology Pro").
3.  Calculate a new conceptual progress percentage for the topic in 'updatedTopicProgress', assuming they started at a lower percentage.
4.  For 'nextSteps', if they did poorly on a quiz (score < 60), suggest they generate study notes. If they did well, suggest they try a different tool or topic.

Format the entire output as JSON conforming to the MedicoProgressTrackerOutputSchema.
`,
  config: {
    temperature: 0.7, // More creative for gamified messages
  }
});

const progressTrackerFlow = ai.defineFlow(
  {
    name: 'medicoProgressTrackerFlow',
    inputSchema: MedicoProgressTrackerInputSchema,
    outputSchema: MedicoProgressTrackerOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await progressTrackerPrompt(input);

      if (!output || !output.progressUpdateMessage) {
        console.error('MedicoProgressTrackerPrompt did not return a valid progress update for:', input);
        throw new Error('Failed to track progress. The AI model did not return the expected output.');
      }
      // In a real app, you would now use this output to update Firestore.
      // e.g., db.collection('user_progress').doc(userId).update({ ... });
      return output;
    } catch (err) {
      console.error(`[ProgressTrackerAgent] Error: ${err instanceof Error ? err.message : String(err)}`);
      throw new Error('An unexpected error occurred while tracking progress. Please try again.');
    }
  }
);
