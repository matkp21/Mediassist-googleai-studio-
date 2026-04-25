import { z } from "genkit";
import { ai } from "@/ai/genkit";
import { gemini20Flash } from "@genkit-ai/googleai";

export const webSearchTool = ai.defineTool(
  {
    name: "webSearch",
    description: "Medical web search.",
    inputSchema: z.object({ query: z.string() }),
    outputSchema: z.object({ summary: z.string() }),
  },
  async ({ query }) => {
    const resp = await ai.generate({ model: gemini20Flash, prompt: `Search: ${query}` });
    return { summary: resp.text };
  }
);
