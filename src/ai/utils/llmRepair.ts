import { genkit, z } from "genkit";
import { googleAI, gemini25Flash } from "@genkit-ai/googleai";

const ai = genkit({ plugins: [googleAI()] });

/**
 * FEATURE 74: LLM Retry + JSON Repair Fallback
 * Automatically handles malformed JSON from LLM responses.
 */
export async function generateWithRepair<T>(
  prompt: string,
  schema: z.ZodType<T>,
  options: { retries?: number; model?: any } = {}
): Promise<T> {
  const { retries = 3, model = gemini25Flash } = options;
  let lastError: any;

  for (let i = 0; i < retries; i++) {
    try {
      const resp = await ai.generate({
        model,
        prompt: prompt + "\n\nReturn ONLY raw JSON matching the requested schema.",
        config: { temperature: 0.1 + i * 0.1 },
      });

      const text = resp.text.replace(/```json|```/g, "").trim();
      
      try {
        return schema.parse(JSON.parse(text));
      } catch (parseError) {
        // Attempt simple repair if it looks like a common truncation
        const repairedText = text.endsWith("}") ? text : text + "}";
        return schema.parse(JSON.parse(repairedText));
      }
    } catch (e) {
      lastError = e;
      console.warn(`LLM attempt ${i+1} failed:`, e);
    }
  }

  throw lastError || new Error("Failed to generate valid response after retries.");
}

/**
 * FEATURE 73: IdeaGen - 4-stage idea generation
 */
export const ideaGenFlow = ai.defineFlow(
  {
    name: "ideaGen",
    inputSchema: z.object({ topic: z.string(), count: z.number().default(5) }),
    outputSchema: z.array(z.string()),
  },
  async (input) => {
    // Stage 1: Loose Filter (Brainstorm)
    const brainstorm = await ai.generate({
      model: gemini25Flash,
      prompt: `Generate 20 loose ideas for: ${input.topic}`,
    });

    // Stage 2: Explore (Deepen)
    const explored = await ai.generate({
      model: gemini25Flash,
      prompt: `Select the 10 most promising ideas from this list and elaborate briefly on each:\n${brainstorm.text}`,
    });

    // Stage 3: Strict Filter (Validate)
    const filtered = await ai.generate({
      model: gemini25Flash,
      prompt: `From these 10 ideas, pick the top ${input.count} that are most clinically relevant and unique. Return ONLY a JSON list of strings.`,
    });

    const clean = filtered.text.replace(/```json|```/g, "").trim();
    return JSON.parse(clean);
  }
);
