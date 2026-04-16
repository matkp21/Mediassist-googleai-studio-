import { z } from 'genkit';
import { ai } from '@/ai/genkit';

// Mocking Firebase Cloud Function trigger
const triggerBranchingFunction = async (sessionId: string, newBranchName: string) => {
  console.log(`Duplicating session ${sessionId} to new branch ${newBranchName}`);
  return `forked_${sessionId}_${Date.now()}`;
};

export const branchScenarioFlow = ai.defineFlow({
  name: 'branchScenario',
  inputSchema: z.object({ sessionId: z.string(), whatIfQuery: z.string() }),
  outputSchema: z.object({ newSessionId: z.string(), initialResponse: z.string() })
}, async (input) => {
  const newSessionId = await triggerBranchingFunction(input.sessionId, "what_if_branch");
  
  const response = await ai.generate({
    model: 'googleai/gemini-2.5-pro',
    prompt: `The student asked a 'What if?' question: "${input.whatIfQuery}". Start the simulation on this new branched path.`
  });
  
  return { newSessionId, initialResponse: response.text };
});
