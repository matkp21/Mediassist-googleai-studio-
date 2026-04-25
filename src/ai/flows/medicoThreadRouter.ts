import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { z } from 'zod';
import { NextStepActionSchema, MedicoDashboardOutputSchema } from '../schemas/deeptutor-schemas';

const ai = genkit({ 
  plugins: [googleAI()],
  model: 'googleai/gemini-2.0-flash' 
});

/**
 * Architectural Mapping: Feature 1 (Guided Learning).
 * Master router for the Medico Dashboard. 
 * Provides an educational answer AND acts as a pedagogical module to recommend
 * the optimal "next step" intervention.
 */
export const medicoDashboardOrchestrator = ai.defineFlow(
 {
   name: 'medicoDashboardOrchestrator',
   inputSchema: z.object({
     query: z.string(),
     activeTopicContext: z.string().optional(),
   }),
   outputSchema: MedicoDashboardOutputSchema,
 },
 async ({ query, activeTopicContext }) => {
   
   const response = await ai.generate({
     prompt: `
       You are a proactive medical study mentor (inspired by HKUDS DeepTutor). 
       Student Query: "${query}"
       Active Context: "${activeTopicContext || 'None'}"
       
       Task 1: Provide a detailed, evidence-based educational answer to the query.
       Task 2: Act as a pedagogical module. Recommend 1 to 3 optimal "next steps" to reinforce learning.
       - If they asked about a disease pathophysiology, suggest 'generate_mcq' or 'generate_flashcards'.
       - If they provided patient symptoms, suggest 'create_soap_note' or 'clinical_simulation'.
       - If they asked about a treatment protocol, suggest 'view_algorithm'.
       - If they need to test reasoning, suggest 'socratic_viva'.
       - If they are doing data analysis, suggest 'data_science_practice'.
     `,
     output: {
       format: 'json',
       schema: MedicoDashboardOutputSchema,
     }
   });

   const parsedOutput = response.output();
   if (!parsedOutput) throw new Error("Failed to parse pedagogical next steps.");

   return parsedOutput;
 }
);
