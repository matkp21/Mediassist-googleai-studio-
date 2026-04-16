import { z } from 'genkit';
import { ai } from '@/ai/genkit';
import { VignetteBreakdownSchema } from '@/ai/schemas/vignetteSchema';

export const vignetteDeconstructorFlow = ai.defineFlow({
  name: 'vignetteDeconstructor',
  inputSchema: z.string().describe("The USMLE vignette text"),
  outputSchema: VignetteBreakdownSchema
}, async (vignette) => {
  const response = await ai.generate({
    model: 'googleai/gemini-2.5-pro',
    prompt: `Deconstruct this USMLE vignette. Extract each sentence and classify it as a clinical_anchor, distractor, or background_info.\n\nVignette:\n${vignette}`,
    output: { schema: VignetteBreakdownSchema }
  });
  
  return response.output as any;
});
