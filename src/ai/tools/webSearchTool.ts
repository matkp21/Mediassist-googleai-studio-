import { z } from "genkit";
import { ai } from "@/ai/genkit";


export const webSearchTool = ai.defineTool(
  {
    name: "webSearch",
    description: "Medical web search.",
    inputSchema: z.object({ query: z.string() }),
    outputSchema: z.object({ summary: z.string() }),
  },
  async ({ query }) => {
    const resp = await ai.generate({ model: 'googleai/gemini-3.0-flash', prompt: `Search: ${query}` });
    return { summary: resp.text };
  }
);
