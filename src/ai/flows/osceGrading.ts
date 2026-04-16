import { z } from 'genkit';
import { ai } from '@/ai/genkit';

export const osceGradingAgent = ai.defineFlow({
  name: 'osceGradingAgent',
  inputSchema: z.object({ transcript: z.string(), rubric: z.string() }),
  outputSchema: z.object({ score: z.number(), feedback: z.string() })
}, async (input) => {
  const response = await ai.generate({
    model: 'googleai/gemini-2.5-pro',
    prompt: `Evaluate the following OSCE transcript based on the provided rubric.\n\nRubric:\n${input.rubric}\n\nTranscript:\n${input.transcript}`,
    output: { 
      schema: z.object({
        score: z.number().min(0).max(100),
        feedback: z.string()
      })
    }
  });
  return response.output as any;
});
