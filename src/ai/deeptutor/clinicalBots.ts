import { genkit, z } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { getFirestore } from 'firebase-admin/firestore';

const ai = genkit({ plugins: [googleAI()] });
const db = getFirestore();

/**
* Architectural Mapping: DeepTutor Level 1 Tools architecture.
* A specialized Genkit tool allowing the LLM to autonomously fetch historical lab results
* from the Firestore database when evaluating a patient's current symptoms.
*/
export const fetchPatientLabsTool = ai.defineTool(
 {
   name: 'fetchPatientLabs',
   description: 'Fetch the most recent laboratory results for a given patient from the EHR.',
   inputSchema: z.object({
     patientId: z.string().describe('The unique identifier of the patient.'),
     labType: z.string().describe('The specific lab category abbreviation (e.g., "CMP", "CBC", "Lipid").'),
   }),
   outputSchema: z.object({
     results: z.any(),
     date: z.string(),
     status: z.string(),
   }),
 },
 async ({ patientId, labType }) => {
   // Simulating a secure Firestore fetch for specific clinical laboratory panels
   const snapshot = await db.collection('patients')
                           .doc(patientId)
                           .collection('labs')
                           .where('type', '==', labType)
                           .orderBy('date', 'desc')
                           .limit(1)
                           .get();

   if (snapshot.empty) {
     return { results: "No records found", date: "", status: "not_found" };
   }
   const data = snapshot.docs[0].data();
   return { results: data.values, date: data.date, status: "success" };
 }
);

/**
* Architectural Mapping: DeepTutor Autonomous TutorBot.
* A Genkit Flow acting as an autonomous ClinicalBot. It possesses tool access 
* and its behavior is dictated by a strict system instruction (analogous to Soul Templates).
*/
export const triageAgentFlow = ai.defineFlow(
 {
   name: 'triageAgent',
   inputSchema: z.object({
     patientId: z.string(),
     userQuery: z.string(),
   }),
   outputSchema: z.string(),
 },
 async ({ patientId, userQuery }) => {
   // The Soul Template equivalent : Defining the agent's persona and operating rules
   const systemInstruction = `
     You are an autonomous Clinical Triage Agent. 
     Your persona is highly professional, empathetic, and strictly evidence-based.
     You have access to specialized tools to retrieve patient data. 
     If the user asks about or presents symptoms related to lab results, 
     you MUST use the fetchPatientLabs tool autonomously before answering.
     Patient ID context: ${patientId}
   `;

   // Genkit handles the complex orchestration of tool-calling, suspending generation,
   // executing the tool, and resuming generation with the newly acquired context.
   const response = await ai.generate({
     model: ai.model('googleai/gemini-1.5-pro'),
     system: systemInstruction,
     prompt: userQuery,
     tools: [fetchPatientLabsTool], // Binding the tool directly into the execution loop
   });

   return response.text;
 }
);
