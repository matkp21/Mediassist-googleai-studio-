import { ai } from '../genkit';
import { z } from 'zod';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';

/**
 * CLAW-CODE Inspired: Automation & Scheduling
 * Enables the agent to schedule recurring actions or reminders.
 */

export const scheduleActionTool = ai.defineTool({
  name: 'scheduleAction',
  description: 'Schedules a future action or reminder for the student. Useful for push notifications or proactive coaching.',
  inputSchema: z.object({
    userId: z.string(),
    actionType: z.enum(['reminder', 'mock-exam', 'spaced-repetition', 'flashcard-push']),
    content: z.string(),
    scheduledTime: z.string().describe("ISO timestamp for the action"),
    recurring: z.boolean().optional(),
    cronExpression: z.string().optional().describe("Standard cron expression for recurring tasks")
  }),
  outputSchema: z.object({ scheduleId: z.string(), success: z.boolean() })
}, async (input) => {
  const schedulesRef = collection(firestore, 'schedules');
  const docRef = await addDoc(schedulesRef, {
    ...input,
    status: 'scheduled',
    createdAt: serverTimestamp()
  });
  return { scheduleId: docRef.id, success: true };
});

export const pauseExecutionTool = ai.defineTool({
  name: 'pauseExecution',
  description: 'Delays execution of the current agent turn. Useful for simulating time passing in clinical cases or waiting for user input.',
  inputSchema: z.object({
    durationMs: z.number().describe("Time to wait in milliseconds"),
    reason: z.string()
  }),
  outputSchema: z.object({ status: z.string() })
}, async (input) => {
  await new Promise(resolve => setTimeout(resolve, input.durationMs));
  return { status: `Resumed after ${input.durationMs}ms pause. Reason: ${input.reason}` };
});
