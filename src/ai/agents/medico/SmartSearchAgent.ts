'use server';

import { ai } from '@/ai/genkit';
import { gemini25Flash } from '@genkit-ai/googleai';
import { z } from 'zod';

export const SmartSearchCompletionInputSchema = z.object({
  query: z.string().describe("The partial search query to autocomplete."),
});

export const SmartSearchCompletionOutputSchema = z.object({
  suggestions: z.array(z.string()).describe("A list of 3-5 autocomplete suggestions."),
});

export type SmartSearchCompletionInput = z.infer<typeof SmartSearchCompletionInputSchema>;
export type SmartSearchCompletionOutput = z.infer<typeof SmartSearchCompletionOutputSchema>;

export async function getSmartSearchSuggestions(input: SmartSearchCompletionInput): Promise<SmartSearchCompletionOutput> {
  return smartSearchCompletionFlow(input);
}

const smartSearchCompletionPrompt = ai.definePrompt({
  name: 'smartSearchCompletionPrompt',
  input: { schema: SmartSearchCompletionInputSchema },
  output: { schema: SmartSearchCompletionOutputSchema },
  prompt: `You are a lightning-fast medical autocomplete search assistant. 
Given the user's partial query in a medical app: "{{{query}}}", provide 3 to 5 realistic, helpful autocomplete string suggestions.
Make them concise, relevant to medical studies, tools (like Flashcards, MCQs, Diagnosis), or common medical conditions.

Return your response as a JSON object containing a 'suggestions' array of strings.
  `,
});

const smartSearchCompletionFlow = ai.defineFlow(
  {
    name: 'smartSearchCompletionFlow',
    inputSchema: SmartSearchCompletionInputSchema,
    outputSchema: SmartSearchCompletionOutputSchema,
  },
  async (input) => {
    try {
      if (!input.query || input.query.trim().length < 2) {
        return { suggestions: [] };
      }
      const { output } = await smartSearchCompletionPrompt({ ...input }, { model: gemini25Flash });
      if (!output || !output.suggestions) {
        return { suggestions: [] };
      }
      return output;
    } catch (err) {
      console.error('SmartSearchAgent Error:', err);
      return { suggestions: [] };
    }
  }
);
