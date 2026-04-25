import { z } from 'zod';

export const ChatInputSchema = z.object({
  sessionId: z.string(),
  message: z.string(),
  tools: z.array(z.string()).default([]),
  kbIds: z.array(z.string()).default([]),
  mode: z.enum(["chat","deepSolve","quiz","research","animate","visualize"]).default("chat"),
});

export const DeepSolveInputSchema = z.object({
  question: z.string(),
  uid: z.string(),
  kbIds: z.array(z.string()).default([]),
  sessionId: z.string(),
});

export const StepResultSchema = z.object({
  step: z.string(),
  content: z.string(),
  sources: z.array(z.string()).optional(),
});

export const ResearchInputSchema = z.object({
  topic: z.string(),
  uid: z.string(),
  kbIds: z.array(z.string()).default([]),
  saveToNotebook: z.boolean().default(true),
  notebookId: z.string().optional(),
});

export const ResearchChunkSchema = z.object({
  source: z.string(),
  title: z.string(),
  content: z.string(),
  url: z.string().optional(),
});
