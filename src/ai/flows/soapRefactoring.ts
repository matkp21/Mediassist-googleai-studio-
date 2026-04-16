import { z } from 'genkit';
import { ai } from '@/ai/genkit';

const SOAPSchema = z.object({
  subjective: z.string(),
  objective: z.string(),
  assessment: z.string(),
  plan: z.string()
});

export const soapRefactoringFlow = ai.defineFlow({
  name: 'soapRefactoring',
  inputSchema: z.string().describe("Unstructured voice dictation"),
  outputSchema: SOAPSchema
}, async (dictation) => {
  const response = await ai.generate({
    model: 'googleai/gemini-2.5-pro',
    prompt: `Refactor the following unstructured dictation into a structured SOAP note.\n\nDictation:\n${dictation}`,
    output: { schema: SOAPSchema }
  });
  
  // Mock saving to database
  console.log("Saving structured SOAP note to database:", response.output);
  
  return response.output as any;
});
