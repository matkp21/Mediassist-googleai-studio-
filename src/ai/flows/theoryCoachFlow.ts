import { z } from 'genkit';
import { ai } from '@/ai/genkit';

export const theoryCoachFlow = ai.defineFlow(
  {
    name: 'theoryCoachFlow',
    inputSchema: z.object({
      topic: z.string().describe("Medical topic for MBBS/PG exam preparation"),
    }),
    outputSchema: z.string(),
  },
  async ({ topic }) => {
    const { text } = await ai.generate({
      // Utilizing Gemini 2.0 Flash for formatting complex, high-yield educational structures
      model: 'googleai/gemini-2.0-flash',
      prompt: `You are TheoryCoach, an expert medical tutor for MBBS and PG students within the MediAssistant platform.
      
Create a comprehensive study guide for the following topic: "${topic}"

CRITICAL ANSWER FORMATTING:
You MUST organize the educational content using the following strict guidelines:
- Use clear, hierarchical Headings.
- Emphasize High-yield points (use bolding, bullet points, or callout blocks).
- Include text-based Flowcharts where applicable to show pathways or mechanisms.

The core medical content MUST be organized sequentially into these exact sections:
1. Definition
2. Etiology
3. Clinical Features
4. Investigations
5. Management`,
    });
    return text;
  }
);

export const theoryCoachTool = ai.defineTool(
  {
    name: 'theory_coach_study_guide',
    description: 'Use this tool whenever a student requests notes, study guides, or exam prep material on a specific topic.',
    inputSchema: z.object({ topic: z.string() }),
    outputSchema: z.string(),
  },
  async ({ topic }) => {
    return await theoryCoachFlow({ topic });
  }
);
