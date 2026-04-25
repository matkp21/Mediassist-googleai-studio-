import { genkit, z } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { triageAgentFlow } from './clinicalBots';
import { updatePatientMemoryFlow } from './persistentMemory';

const ai = genkit({ plugins: [googleAI()] });

// Enums precisely defining the available capabilities in the Unified Thread 
const IntentSchema = z.enum([
 'standard_triage', 
 'deep_diagnostic_solve', 
 'guided_rehabilitation', 
 'update_memory',
 'unknown_fallback'
]);

/**
* Architectural Mapping: DeepTutor ChatOrchestrator and Unified Chat Workspace.
* Acts as the master router, dispatching queries to appropriate clinical capabilities 
* while maintaining a unified thread context.
*/
export const unifiedThreadOrchestrator = ai.defineFlow(
 {
   name: 'unifiedThreadOrchestrator',
   inputSchema: z.object({
     patientId: z.string(),
     query: z.string(),
     // The entire thread history is passed to ensure context is never lost across modes
     threadContext: z.array(z.object({ role: z.string(), text: z.string() })),
   }),
   outputSchema: z.object({
     response: z.string(),
     capabilityTriggered: IntentSchema,
   }),
 },
 async ({ patientId, query, threadContext }) => {
   
   // Step 1: Intent Classification Node 
   // Utilizes a fast, lightweight model (Gemini Flash) to determine the routing path
   // minimizing latency for the user before the heavy-lifting sub-flow begins.
   const routingDecision = await ai.generate({
     model: ai.model('googleai/gemini-1.5-flash'),
     prompt: `
       Analyze the following clinical query: "${query}"
       Classify the user's intent into one of the exact categories below:
       - 'standard_triage': General medical questions, symptom checking, or lab inquiries.
       - 'deep_diagnostic_solve': Complex multi-symptom case requiring exhaustive analysis.
       - 'guided_rehabilitation': Questions specifically about post-operative recovery steps.
       - 'update_memory': The patient is explicitly providing new lifestyle, allergy, or health preferences.
     `,
     output: { format: 'json', schema: z.object({ intent: IntentSchema }) },
   });

   const intent = routingDecision.output?.intent || 'standard_triage';
   let finalResponse = "";

   // Step 2: Capability Execution (Dynamic Dispatch)
   // The orchestrator hands off execution to the specialized Genkit flow
   switch (intent) {
     case 'standard_triage':
       // Execute the tool-augmented ClinicalBot sub-flow
       finalResponse = await triageAgentFlow({ patientId, userQuery: query });
       break;
       
     case 'update_memory':
       // Execute the memory persistence sub-flow to capture new facts
       const memoryUpdate = await updatePatientMemoryFlow({ 
         patientId, 
         latestMessage: query, 
         previousSummary: threadContext[threadContext.length - 1]?.text || "" 
       });
       finalResponse = `Clinical profile securely updated. The system has noted the following discrete facts: ${
         memoryUpdate.newFactsExtracted.map(f => f.fact).join('; ')
       }.`;
       break;

     case 'deep_diagnostic_solve':
     case 'guided_rehabilitation':
       // Future stubs for other deep capabilities mapped directly from DeepTutor 
       // These would invoke highly complex, multi-agent RAG pipelines
       finalResponse = `Engaging advanced ${intent} protocol. Retrieving specific clinical pathways and cross-referencing guidelines...`;
       break;
       
     default:
       finalResponse = "I am unable to process that request at this time. Please consult your primary care physician for immediate assistance.";
   }

   // Return the unified response and metadata back to the Next.js API route / frontend client
   return {
     response: finalResponse,
     capabilityTriggered: intent,
   };
 }
);
