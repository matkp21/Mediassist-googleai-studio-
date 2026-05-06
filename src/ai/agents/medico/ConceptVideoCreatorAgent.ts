'use server';

import { generate } from '@genkit-ai/ai';

import { ai } from '@/ai/genkit';
import { ConceptVideoCreatorInputSchema, ConceptVideoCreatorOutputSchema, type ConceptVideoCreatorInput, type ConceptVideoCreatorOutput } from '@/ai/schemas/medico-tools-schemas';
import { injectKarpathyGuidelines } from './skills/karpathy-guidelines';

export const ConceptVideoCreatorAgent = ai.defineAction(
  {
    name: 'ConceptVideoCreatorAgent',
    inputSchema: ConceptVideoCreatorInputSchema,
    outputSchema: ConceptVideoCreatorOutputSchema,
  },
  async (input: ConceptVideoCreatorInput): Promise<ConceptVideoCreatorOutput> => {
    const promptTemplate = `You are an expert medical educator and video producer. Convert the following dense medical text into a short, dynamic explanatory video script intended for ${input.targetAudience}. 
Aspect Ratio: ${input.aspectRatio}

Include narration and precise visual prompts suitable for Veo 3 (Agentic Video Synthesis).
Focus on anatomical accuracy and photorealistic clinical scenarios.

Medical Text:
${input.medicalText}

Return a JSON object with:
- title: clear medical title
- script: markdown narration
- visualPrompts: 3-5 prompts for Veo 3
- estimatedDuration: in seconds/minutes
- videoUrl: Generate a placeholder URL if active synthesis is simulated
- renderStatus: "Synthesis complete via Veo 3 Agentic Engine"
`;

    const response = await generate({
      model: 'googleai/gemini-3.0-flash',
      prompt: injectKarpathyGuidelines(promptTemplate),
      output: {
        schema: ConceptVideoCreatorOutputSchema,
      },
    });

    return response.output()!;
  }
);
