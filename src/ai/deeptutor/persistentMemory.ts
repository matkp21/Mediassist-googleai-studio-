import { genkit, z } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { getFirestore } from 'firebase-admin/firestore';

const ai = genkit({ plugins: [googleAI()] });
const db = getFirestore();

// Zod schemas ensure absolute strict type safety for clinical data extraction, 
// preventing malformed JSON from corrupting the patient record 
const PatientFactSchema = z.object({
 category: z.enum(['symptom', 'medication_adherence', 'lifestyle', 'preference', 'allergy']),
 fact: z.string().describe('A concise, medically relevant fact extracted from the dialogue.'),
 clinicalRelevance: z.enum(['critical', 'high', 'medium', 'low']),
});

/**
* Architectural Mapping: DeepTutor Persistent Memory profile extraction.
* Analyzes the latest chat turn to extract actionable, discrete patient facts 
* and atomically updates the continuous Firestore memory profile.
*/
export const updatePatientMemoryFlow = ai.defineFlow(
 {
   name: 'updatePatientMemory',
   inputSchema: z.object({
     patientId: z.string(),
     latestMessage: z.string(),
     previousSummary: z.string(),
   }),
   outputSchema: z.object({
     updatedSummary: z.string(),
     newFactsExtracted: z.array(PatientFactSchema),
   }),
 },
 async ({ patientId, latestMessage, previousSummary }) => {
   // Orchestrate the LLM call to extract structured facts and generate a new running summary
   const extractionResult = await ai.generate({
     model: 'googleai/gemini-1.5-pro',
     prompt: `
       Analyze the patient's latest message in the context of their history:
       Latest Message: "${latestMessage}"
       Previous Clinical Summary: "${previousSummary}"
       
       Task 1: Extract any new clinical, behavioral, or lifestyle facts.
       Task 2: Write an updated, concise clinical summary incorporating this new information.
       Maintain a highly professional, objective medical tone.
     `,
     output: {
       format: 'json',
       // Enforce strict schema compliance on the LLM output
       schema: z.object({
         newSummary: z.string(),
         facts: z.array(PatientFactSchema),
       }),
     },
   });

   const parsedOutput = extractionResult.output;

   if (!parsedOutput) {
       throw new Error("Failed to parse structured LLM output during memory extraction");
   }

   // Execute an atomic Firestore transaction to persist the updated memory safely 
   // Transactions prevent race conditions if multiple agents update the profile simultaneously
   const patientRef = db.collection('patients').doc(patientId);
   const memoryCollection = patientRef.collection('memory_facts');

   await db.runTransaction(async (transaction) => {
     // 1. Update the running digest (The Summary Dimension)
     transaction.update(patientRef, {
       clinicalSummary: parsedOutput.newSummary,
       lastInteraction: new Date().toISOString(),
     });

     // 2. Insert discrete memory entities (The Profile Dimension)
     for (const fact of parsedOutput.facts) {
       const factRef = memoryCollection.doc();
       transaction.set(factRef, {
        ...fact,
         timestamp: new Date().toISOString(),
       });
     }
   });

   return {
     updatedSummary: parsedOutput.newSummary,
     newFactsExtracted: parsedOutput.facts,
   };
 }
);
