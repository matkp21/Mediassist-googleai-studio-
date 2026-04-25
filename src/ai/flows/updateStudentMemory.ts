import { genkit, z } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { StudyProgressFactSchema } from '../schemas/deeptutor-schemas';

const ai = genkit({ 
  plugins: [googleAI()],
  model: 'googleai/gemini-2.0-flash' 
});
const db = getFirestore();

/**
 * Architectural Mapping: Feature 5 (Proactive Heartbeat / Memory).
 * Intercepts study sessions to update the student's persistent progress profile.
 * Extracts mastery levels and specific blind spots to guide future "next steps".
 */
export const updateStudentMemoryFlow = ai.defineFlow(
 {
   name: 'updateStudentMemory',
   inputSchema: z.object({
     studentId: z.string(),
     latestInteraction: z.string(),
   }),
   outputSchema: z.object({
     newFactsExtracted: z.array(StudyProgressFactSchema),
   }),
 },
 async ({ studentId, latestInteraction }) => {
   const extractionResult = await ai.generate({
     prompt: `
       You are a clinical memory supervisor (inspired by HKUDS DeepTutor).
       Analyze the medical student's latest study interaction:
       "${latestInteraction}"
       
       Task: Extract any indicators of their mastery over specific medical concepts.
       Focus on:
       - Weaknesses: Concepts they struggle to recall or misapply.
       - Mastered: Concepts they correctly identified or explained.
       - Needs Review: Concepts mentioned but with low confidence.
     `,
     output: {
       format: 'json',
       schema: z.object({ facts: z.array(StudyProgressFactSchema) }),
     },
   });

   const parsedOutput = extractionResult.output();
   if (!parsedOutput) throw new Error("Failed to parse memory extraction.");

   const memoryCollection = db.collection('users').doc(studentId).collection('study_memory');

   // Persist memory facts using a batch write for atomicity
   const batch = db.batch();
   for (const fact of parsedOutput.facts) {
     const factRef = memoryCollection.doc();
     batch.set(factRef, {
       ...fact,
       timestamp: FieldValue.serverTimestamp(),
     });
   }
   await batch.commit();

   return { newFactsExtracted: parsedOutput.facts };
 }
);
