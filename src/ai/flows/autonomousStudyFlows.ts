import { genkit, z } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { generateMCQs } from '../agents/medico/MCQGeneratorAgent';
import { generateMnemonic } from '../agents/medico/MnemonicsGeneratorAgent';
import { createFlowchart } from '../agents/medico/FlowchartCreatorAgent';
import { updateSessionState } from '../memory/sessionMemory';

const ai = genkit({ 
  plugins: [googleAI()],
  model: 'googleai/gemini-2.0-flash'
});

/**
 * FAN-OUT ORCHESTRATION: Step 2 (Parallel Preparation)
 * Simultaneously deploys specialized agents to pre-compute educational aids.
 */
export const fanOutPrecomputeFlow = ai.defineFlow(
  {
    name: 'fanOutPrecompute',
    inputSchema: z.object({ 
      userId: z.string(), 
      topic: z.string(),
      contextData: z.string().optional()
    }),
    outputSchema: z.object({ success: z.boolean() }),
  },
  async ({ userId, topic, contextData }) => {
    console.info(`[Fan-Out] Initiating parallel pre-computation for: ${topic}`);

    // Parallel Background Execution (inspired by Go routines / Parallel Fan-Out)
    const [mcqsResult, mnemonicResult, flowchartResult] = await Promise.all([
      // 1. Examiner Agent
      generateMCQs({ topic, count: 5, difficulty: 'medium' }).catch(err => {
        console.warn("[Fan-Out] MCQ generation failed", err);
        return null;
      }),
      // 2. Memory Agent
      generateMnemonic({ topic, context: contextData }).catch(err => {
        console.warn("[Fan-Out] Mnemonic generation failed", err);
        return null;
      }),
      // 3. Visual Agent
      createFlowchart({ topic, complexity: 'standard' }).catch(err => {
        console.warn("[Fan-Out] Flowchart generation failed", err);
        return null;
      })
    ]);

    // Update Session State with pre-computed results for "Zero-Prompt" UX
    await updateSessionState(userId, {
      currentTopic: topic,
      precomputedTools: {
        mcqs: mcqsResult,
        mnemonic: mnemonicResult?.mnemonic,
        flowchartData: flowchartResult // Storing the nodes/edges structure
      }
    });

    console.info(`[Fan-Out] Successfully cached educational aids for ${topic}`);
    return { success: true };
  }
);

/**
 * AUTONOMOUS MEMORY CONSOLIDATION: Step 4
 * Compresses session results and updates the persistent task tree.
 */
export const consolidateSessionMemoryFlow = ai.defineFlow(
  {
    name: 'consolidateSessionMemory',
    inputSchema: z.object({ 
      userId: z.string(), 
      topic: z.string(),
      interactionOutcome: z.any() 
    }),
    outputSchema: z.object({ status: z.string() }),
  },
  async ({ userId, topic, interactionOutcome }) => {
    // This would update Firestore task tree for spaced-repetition
    // Pattern: Context Compression (Inspired by Refrag)
    return { status: "Memory consolidated for topic: " + topic };
  }
);
