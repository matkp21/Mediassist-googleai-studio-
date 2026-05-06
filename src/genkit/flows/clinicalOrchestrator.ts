import { genkit } from 'genkit';
import { googleAI, gemini25Pro, gemini15Flash } from '@genkit-ai/googleai';
import { getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { pubMedSearchSkill } from '../skills/literature/pubmedSkill';
import { drugInteractionSkill } from '../skills/pharmacology/drugInteractionSkill';
import { webScraperTool } from '../skills/utility/webScraper';
import { z } from 'zod';

const ai = genkit({ plugins: [googleAI()] });

// Initialize Firebase Admin for Firestore (Pod storage)
if (!getApps().length) {
  initializeApp();
}
const db = getFirestore();

// Pattern 1: Routing (Dynamic Path Selection)
const routerSchema = z.object({
  intent: z.enum(['clinical_guideline', 'pharmacology', 'general_medical_query', 'literature_review']),
  extractedKeywords: z.array(z.string()),
});

export const clinicalAgentFlow = ai.defineFlow(
  {
    name: 'clinicalAgent',
    inputSchema: z.object({ 
      prompt: z.string(), 
      userContext: z.object({ uid: z.string(), role: z.string() }).optional() 
    }),
    outputSchema: z.string(),
  },
  async (input) => {
    // Pattern 1: The Fast Router Agent (Uses Flash for speed)
    const routerDecision = await ai.generate({
      model: gemini15Flash,
      output: { schema: routerSchema },
      prompt: `Analyze the following medical query and determine the primary intent. 
      Extract key medical terms as keywords. 
      Query: ${input.prompt}`,
    });

    const route = routerDecision.output;
    if (!route) return "Failed to route query.";
    console.log(`[Router] Routed query to: ${route.intent}`, route.extractedKeywords);

    // Pattern 2 & 3: Parallelization & Prompt Chaining
    let finalSynthesizedOutput = "";

    if (route.intent === 'pharmacology') {
      // Pattern 3: Prompt Chaining for Pharmacology (Sequential Decomposition)
      // Step A: Plan the core ingredients (using lightweight model)
      const plan = await ai.generate({
        model: gemini15Flash,
        prompt: `List the specific drugs to cross-reference based on: ${input.prompt}. Return only a comma-separated list of generic drug names.`
      });
      const drugsToVerify = plan.text.split(',').map(d => d.trim());
      
      console.log(`[Prompt Chaining] Executing skill for:`, drugsToVerify);
      
      // Step B: Execute the heavy skill with the parsed inputs (using Pro model)
      const interactionResult = await ai.generate({
         model: gemini25Pro,
         tools: [drugInteractionSkill],
         context: { auth: input.userContext },
         prompt: `Use the drugInteractionSkill to check interactions for: ${drugsToVerify.join(', ')}`
      });
      finalSynthesizedOutput = interactionResult.text;

    } else if (route.intent === 'clinical_guideline' || route.intent === 'literature_review') {
      // Pattern 2: Parallelization (Concurrent Processing)
      // Run PubMed RAG search and general clinical knowledge retrieval simultaneously
      console.log(`[Parallelization] Triggering parallel searches for:`, route.extractedKeywords);
      
      const pubMedPromise = ai.generate({
         model: gemini25Pro,
         tools: [pubMedSearchSkill],
         prompt: `Search PubMed for recent guidelines regarding: ${route.extractedKeywords.join(' ')}`
      });

      const backgroundKnowledgePromise = ai.generate({
         model: gemini15Flash,
         prompt: `Summarize the standard of care for: ${route.extractedKeywords.join(' ')} based on established medical knowledge.`
      });

      const [pubMedResult, standardCareResult] = await Promise.all([pubMedPromise, backgroundKnowledgePromise]);

      // Pattern 3: Prompt Chaining - Synthesize the parallel results
      const synthesis = await ai.generate({
         model: gemini25Pro,
         prompt: `You are a Chief Medical Officer synthesizing clinical data.
         
         [PubMed Latest Evidence]:
         ${pubMedResult.text}

         [Standard of Care Summary]:
         ${standardCareResult.text}

         Provide a unified clinical recommendation based strictly on the above. Use strict DrMat clinical format.
         `
      });
      finalSynthesizedOutput = synthesis.text;
    } else {
       // General fallback orchestrator pattern
       const response = await ai.generate({
          model: gemini25Pro,
          tools: [pubMedSearchSkill, drugInteractionSkill, webScraperTool],
          context: { auth: input.userContext }, 
          prompt: `
            You are the MediAssistant Pro Clinical Orchestrator. 
            User Query: ${input.prompt}
            Answer using standard DrMat formatting. You may use your tools if needed.
          `,
        });
        finalSynthesizedOutput = response.text;
    }

    return finalSynthesizedOutput;
  }
);

// ---------------------------------------------------------
// WORKER 1: The Literature Intern (Sub-Flow)
// ---------------------------------------------------------
export const literatureWorker = ai.defineFlow(
  { name: 'literatureWorker', inputSchema: z.string() },
  async (topic) => {
    console.log(`[Worker] Scraping latest guidelines for: ${topic}`);
    const results = await ai.generate({
      model: gemini25Pro,
      tools: [pubMedSearchSkill],
      prompt: `Find the latest clinical guidelines for ${topic}. Return pure Markdown.`,
    });
    return results.text;
  }
);

// ---------------------------------------------------------
// PARENT AGENT: The Chief Resident (Octogent Orchestrator)
// ---------------------------------------------------------
export const chiefResidentOrchestrator = ai.defineFlow(
  {
    name: 'chiefResidentOrchestrator',
    inputSchema: z.object({ podId: z.string(), command: z.string() }),
  },
  async ({ podId, command }) => {
    // 1. Fetch the "Tentacle" context (Pod data) from Firestore
    const podRef = db.collection('clinical_pods').doc(podId);
    let podDoc;
    try {
      podDoc = await podRef.get();
    } catch (e: any) {
      console.warn("Firestore not reachable or auth failed, skipping pod sync: ", e.message);
    }
    
    // Fallback if no db or document doesn't exist
    const contextMd = podDoc && podDoc.exists ? podDoc.data()?.contextMd : "General medical context.";
    const todoMd = podDoc && podDoc.exists ? podDoc.data()?.todoMd : "Address user command.";

    // 2. AI decides which tasks to delegate based on the command and TODO.md
    const delegationPlan = await ai.generate({
      model: gemini25Pro,
      prompt: `
        You are the Chief Resident Orchestrator.
        Pod Context: ${contextMd}
        Current Tasks: ${todoMd}
        User Command: ${command}
        
        Analyze the command. If multiple tasks are required (e.g., check drugs AND search literature), return a JSON array of worker assignments.
      `,
      output: { schema: z.array(z.object({ taskType: z.string(), payload: z.string() })) }
    });

    const tasks = delegationPlan.output;
    const activeWorkers: Promise<string>[] = [];

    // 3. Spawn Worker Agents in PARALLEL (The Octogent Swarm)
    if (tasks) {
      for (const task of tasks) {
        if (task.taskType === 'literature' || task.taskType.includes('search')) {
          activeWorkers.push(literatureWorker(task.payload));
        }
        // Add other workers here (pharmaWorker, flashcardWorker, etc.)
        // Right now, if not matched, we just delegate to literature worker for safety
        else {
          activeWorkers.push(literatureWorker(task.payload));
        }
      }
    }

    // Wait for all tentacles to finish executing
    const workerResults = await Promise.all(activeWorkers);

    // 4. Synthesize and Update the Pod's NOTES.md
    const finalSynthesis = await ai.generate({
      model: gemini25Pro,
      prompt: `Synthesize these worker reports into a cohesive clinical note:\n\n${workerResults.join('\n\n')}`
    });

    if (podRef && podDoc && podDoc.exists) {
      await podRef.update({
        notesMd: finalSynthesis.text,
        lastUpdated: new Date()
      });
    }

    return { status: "Success", summary: finalSynthesis.text };
  }
);
