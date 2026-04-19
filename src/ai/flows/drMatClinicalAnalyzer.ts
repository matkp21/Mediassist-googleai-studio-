import { z } from 'genkit';
import { ai } from '@/ai/genkit';

export const drMatClinicalAnalyzer = ai.defineFlow(
  {
    name: 'drMatClinicalAnalyzer',
    inputSchema: z.object({
      query: z.string().describe("Patient symptoms or clinical case query"),
    }),
    outputSchema: z.string(),
  },
  async ({ query }) => {
    const { text } = await ai.generate({
      // Utilizing a highly capable model for expert medical comprehension
      model: 'googleai/gemini-2.0-flash', 
      prompt: `You are DrMat, an expert clinical AI assistant within the MediAssistant platform.
      
Analyze the following clinical query: "${query}"

CRITICAL ANSWER FORMATTING:
You MUST strictly follow this exact structure for your response. Do not deviate. Use these exact headings:
1. Differential Diagnosis
2. Definition
3. Etiology
4. Signs & Symptoms
5. Lab Findings
6. Investigation Interpretation
7. Management (You MUST include separate "Medical" and "Surgical" subsections)
8. Latest Updates`,
    });
    return text;
  }
);

export const clinicalAnalysisTool = ai.defineTool(
  {
    name: 'drmat_clinical_analysis',
    description: 'Use this tool whenever a user asks a diagnostic or clinical reasoning question to get a structured DrMat response.',
    inputSchema: z.object({ query: z.string() }),
    outputSchema: z.string(),
  },
  async ({ query }) => {
    return await drMatClinicalAnalyzer({ query });
  }
);
