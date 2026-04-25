import { genkit, z } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

const ai = genkit({ 
  plugins: [googleAI()],
  model: 'googleai/gemini-2.0-flash'
});

/**
 * Architectural Mapping: Feature 2 (Deep Solve - MedGemma Integration).
 * Tool to invoke the custom MedGemma endpoint or high-fidelity clinical reasoning.
 */
const invokeMedGemmaTool = ai.defineTool(
 {
   name: 'invokeMedGemma',
   description: 'Calls the specialized clinical reasoning tool for complex medical scenario generation.',
   inputSchema: z.object({ prompt: z.string() }),
   outputSchema: z.string(),
 },
 async ({ prompt }) => {
   // In a production environment, this would call a Vertex AI endpoint for MedGemma
   // For now, we simulate the high-fidelity clinical output
   console.info("[MedGemma Simulation] Generating complex clinical response...");
   return `[MEDGEMMA_OUTPUT] Based on the presentation of progressive dyspnea and bilateral leg edema, the top differential is Congestive Heart Failure. Recommendation: BNP levels and Echocardiogram. Patient responds: "I feel like I'm drowning when I lie flat."`;
 }
);

/**
 * The Clinical Case Simulator agent. 
 * Uses Gemini to orchestrate the conversation but delegates 
 * complex medical scenario generation to the specialized MedGemma tool.
 */
export const caseSimulatorAgentFlow = ai.defineFlow(
 {
   name: 'caseSimulatorAgent',
   inputSchema: z.object({
     topic: z.string(),
     studentInput: z.string(),
   }),
   outputSchema: z.string(),
 },
 async ({ topic, studentInput }) => {
   const systemInstruction = `
     You are the Gamified Case Challenge Administrator. 
     You MUST use the 'invokeMedGemma' tool to generate medically accurate patient responses 
     or lab results based on the student's input regarding the topic: ${topic}.
     Maintain a challenging, clinical environment.
   `;

   const response = await ai.generate({
     system: systemInstruction,
     prompt: studentInput,
     tools: [invokeMedGemmaTool],
   });

   return response.text;
 }
);
