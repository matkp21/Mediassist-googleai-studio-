import { genkit, z } from 'genkit';
import { vertexAI } from '@genkit-ai/vertexai';

const ai = genkit({ plugins: [vertexAI({ location: 'us-central1' })] });

export const mnemonicGeneratorSkill = ai.defineTool(
  {
    name: 'mnemonicGenerator',
    description: 'Generates a highly memorable medical mnemonic for a specific concept to help a student memorize a list of items (e.g. causes of pancreatitis, cranial nerves).',
    inputSchema: z.object({
      topic: z.string().describe("The medical topic or list needing a mnemonic."),
      currentContext: z.string().optional().describe("Background clinical context to ensure relevance.")
    }),
    outputSchema: z.string()
  },
  async ({ topic, currentContext }) => {
    const prompt = `You are a creative Medical Memory Agent. Generate a highly memorable mnemonic for the topic: "${topic}".
    If relevant, tie the mnemonic into the structural context provided here: ${currentContext || 'None provided'}.
    Format:
    **Mnemonic:** [The word(s)]
    - **Letter**: What it stands for (Brief explanation)`;

    const response = await ai.generate({
      model: 'vertexai/gemini-2.5-flash',
      prompt: prompt
    });

    return `*Mnemonic Pre-Computed by Sub-Agent:*\n${response.text}`;
  }
);
