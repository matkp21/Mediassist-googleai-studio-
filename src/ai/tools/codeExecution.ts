import { z } from 'genkit';
import { ai } from '@/ai/genkit';

export const codeExecutionTool = ai.defineTool({
  name: 'codeExecution',
  description: 'Executes bioinformatics scripts (e.g., Python) in an isolated Cloud Run container.',
  inputSchema: z.object({ script: z.string(), language: z.enum(['python', 'r']) }),
  outputSchema: z.object({ result: z.string(), error: z.string().optional() })
}, async (input) => {
  // Mocking Cloud Run execution
  console.log(`Executing ${input.language} script in sandbox:\n${input.script}`);
  return { result: "Calculated renal clearance: 120 mL/min" };
});
