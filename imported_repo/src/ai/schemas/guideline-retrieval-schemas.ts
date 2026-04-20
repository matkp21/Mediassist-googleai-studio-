
/**
 * @fileOverview Defines Zod schemas for the Guideline Retrieval flow.
 */
import { z } from 'zod';

export const GuidelineRetrievalInputSchema = z.object({
  query: z.string().describe('The medical condition or treatment to query guidelines for.'),
  context: z.string().optional().describe('Optional context, e.g., patient type (pediatric, adult), specific aspect (diagnosis, management), or desired guideline source (WHO, NICE).'),
});
export type GuidelineRetrievalInput = z.infer<typeof GuidelineRetrievalInputSchema>;

export const GuidelineItemSchema = z.object({
  title: z.string().describe('The title of the guideline or protocol.'),
  summary: z.string().describe('A concise summary of the key points of the guideline.'),
  source: z.string().optional().describe('The primary source of the guideline (e.g., "WHO 2023", "NICE NGXX", "AHA/ACC Guidelines 2022").')
});
export type GuidelineItem = z.infer<typeof GuidelineItemSchema>;

export const GuidelineRetrievalOutputSchema = z.object({
  results: z.array(GuidelineItemSchema).describe('A list of relevant clinical guidelines or protocols found. Each item should have a title, summary, and source.'),
});
export type GuidelineRetrievalOutput = z.infer<typeof GuidelineRetrievalOutputSchema>;
