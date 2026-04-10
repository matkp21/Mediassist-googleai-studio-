
'use server';

/**
 * @fileOverview This file defines a Genkit flow for retrieving clinical guidelines based on user queries.
 *
 * It includes:
 * - guidelineRetrievalFlow: The main flow for retrieving guidelines.
 * - retrieveGuidelines: An async function that calls the flow.
 * - GuidelineRetrievalInput: The input type from the schema.
 * - GuidelineRetrievalOutput: The return type from the schema, now a list of structured guideline items.
 */

import {ai} from '@/ai/genkit';
import { GuidelineRetrievalInputSchema, GuidelineRetrievalOutputSchema, type GuidelineRetrievalInput, type GuidelineRetrievalOutput } from '@/ai/schemas/guideline-retrieval-schemas';

export type { GuidelineRetrievalInput, GuidelineRetrievalOutput, GuidelineItem } from '@/ai/schemas/guideline-retrieval-schemas';

export async function retrieveGuidelines(input: GuidelineRetrievalInput): Promise<GuidelineRetrievalOutput> {
  return guidelineRetrievalFlow(input);
}

const guidelineRetrievalPrompt = ai.definePrompt({
  name: 'guidelineRetrievalPrompt',
  input: {schema: GuidelineRetrievalInputSchema},
  output: {schema: GuidelineRetrievalOutputSchema},
  prompt: `You are a medical expert. Based on the following query, retrieve a list of relevant and up-to-date clinical guidelines or treatment protocols.
For each guideline/protocol, provide a clear title, a concise summary of its key points, and identify its source (e.g., "WHO 2023", "NICE NGXX", "AHA/ACC Guidelines 2022").
Prioritize guidelines from reputable sources like WHO, NICE, AHA/ACC, or other major national/international medical authorities.
If specific context is provided, use it to refine your search.

Query: {{{query}}}
{{#if context}}
Context: {{{context}}}
{{/if}}

Format your output as JSON conforming to the GuidelineRetrievalOutputSchema, ensuring the 'results' field is an array of objects, where each object has 'title', 'summary', and 'source'.
If no guidelines are found, return an empty array for 'results'.
`,
});

const guidelineRetrievalFlow = ai.defineFlow(
  {
    name: 'guidelineRetrievalFlow',
    inputSchema: GuidelineRetrievalInputSchema,
    outputSchema: GuidelineRetrievalOutputSchema,
  },
  async input => {
    try {
      const {output} = await guidelineRetrievalPrompt(input);
      if (!output) {
        console.error("Guideline retrieval prompt did not return an output for query:", input.query);
        return { results: [] };
      }
      // The prompt now asks the LLM to format the output as per the schema.
      return output;
    } catch (err) {
      console.error(`[GuidelineRetrievalAgent] Error: ${err instanceof Error ? err.message : String(err)}`);
      throw new Error('An unexpected error occurred while retrieving guidelines. Please try again.');
    }
  }
);
