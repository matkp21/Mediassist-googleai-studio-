'use client';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

export const runAskRezzyAgent = ai.defineFlow({
  name: 'runAskRezzyAgent',
  inputSchema: z.object({
    query: z.string(),
    requestType: z.enum(['flashcards', 'pyqs', 'semantic_search', 'chat']),
  }),
  outputSchema: z.object({
    responses: z.array(z.string()),
    flashcards: z.array(z.object({
      front: z.string(),
      back: z.string(),
    })).optional(),
    pyqs: z.array(z.object({
      question: z.string(),
      year: z.string(),
    })).optional(),
  }),
}, async (input) => {
  console.log(`[AskRezzy] Processing request type: ${input.requestType} for query: ${input.query}`);

  const prompt = `As a Medical Student Resident Genius (Ask-Rezzy), fulfill the following request:
  Type: ${input.requestType}
  Topic/Query: ${input.query}
  
  Format the output appropriately. If asking for flashcards or past year questions (PYQs), provide structured output.`;

  const response = await ai.generate({
    model: 'vertexai/gemini-1.5-pro',
    prompt: prompt,
  });

  // Mocked retrieval augmented response
  return {
    responses: [response.text()],
    flashcards: input.requestType === 'flashcards' ? [
      { front: "Pathophysiology of ...", back: "Details regarding ..." }
    ] : undefined,
    pyqs: input.requestType === 'pyqs' ? [
      { question: "Describe...", year: "2023" }
    ] : undefined,
  };
});
