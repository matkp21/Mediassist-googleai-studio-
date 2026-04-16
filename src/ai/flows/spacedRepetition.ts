import { z } from 'genkit';
import { ai } from '@/ai/genkit';

// Mocking Google Cloud Tasks
const scheduleCloudTask = async (studentId: string, concept: string, delayDays: number) => {
  console.log(`Scheduled task for student ${studentId} on concept ${concept} in ${delayDays} days.`);
};

export const scheduleSpacedRepetitionFlow = ai.defineFlow({
  name: 'scheduleSpacedRepetition',
  inputSchema: z.object({ studentId: z.string(), concept: z.string() }),
  outputSchema: z.object({ success: z.boolean() })
}, async (input) => {
  await scheduleCloudTask(input.studentId, input.concept, 3);
  return { success: true };
});

export const generateSpacedRepetitionMCQFlow = ai.defineFlow({
  name: 'generateSpacedRepetitionMCQ',
  inputSchema: z.object({ concept: z.string() }),
  outputSchema: z.object({ question: z.string(), options: z.array(z.string()), answer: z.string() })
}, async (input) => {
  const response = await ai.generate({
    model: 'googleai/gemini-2.5-pro',
    prompt: `Generate a multiple choice question about ${input.concept} for spaced repetition.`,
    output: {
      schema: z.object({
        question: z.string(),
        options: z.array(z.string()),
        answer: z.string()
      })
    }
  });
  return response.output as any;
});
