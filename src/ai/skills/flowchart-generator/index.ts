import { genkit, z } from 'genkit';
import { vertexAI } from '@genkit-ai/vertexai';

const ai = genkit({ plugins: [vertexAI({ location: 'us-central1' })] });

export const diagnosticFlowchartTrackerSkill = ai.defineTool(
  {
    name: 'diagnosticFlowchartGenerator',
    description: 'Generates a textual representation of a diagnostic flowchart or clinical pathway algorithm. Use when exploring complex workflows (e.g. Heart Failure management, AKI workup).',
    inputSchema: z.object({
      topic: z.string().describe("The specific clinical pathway or topic to map."),
      currentContext: z.string().optional().describe("Clinical context from the session state.")
    }),
    outputSchema: z.string()
  },
  async ({ topic, currentContext }) => {
    const prompt = `You are a Visual Clinical Agent. Create a step-by-step text-based flow diagram for the topic: "${topic}".
    Context: ${currentContext || 'None provided'}.
    Use arrows (->) and clear branching logic (If YES -> do X, If NO -> do Y) to represent the algorithm accurately according to the latest medical guidelines.`;

    const response = await ai.generate({
      model: 'vertexai/gemini-2.5-flash',
      prompt: prompt
    });

    return `*Flowchart Pathway Pre-Computed by Sub-Agent:*\n${response.text}`;
  }
);
