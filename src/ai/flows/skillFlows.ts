import { genkit, z } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

const ai = genkit({ 
  plugins: [googleAI()],
  model: 'googleai/gemini-2.0-flash'
});

/**
 * Architectural Mapping: Inspired by midudev/autoskills.
 * Automatically converts unstructured medical text/guidelines into a structured AI skill schema.
 */
export const documentToSkillFlow = ai.defineFlow(
 {
   name: 'documentToSkill',
   inputSchema: z.object({ documentText: z.string() }),
   outputSchema: z.object({
     skillName: z.string(),
     description: z.string(),
     requiredInputs: z.array(z.string()),
     isClinical: z.boolean(),
   }),
 },
 async ({ documentText }) => {
   const response = await ai.generate({
     prompt: `Analyze this medical document and convert its core procedure into a reusable AI skill schema. 
     Document: ${documentText}`,
     output: {
       format: 'json',
       schema: z.object({
         skillName: z.string(),
         description: z.string(),
         requiredInputs: z.array(z.string()),
         isClinical: z.boolean(),
       }),
     },
   });
   return response.output()!;
 }
);
