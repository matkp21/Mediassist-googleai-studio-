import { z } from "genkit";
import { ai } from "@/ai/genkit";
import { gemini20Pro } from "@genkit-ai/googleai";

export const deepReasoningTool = ai.defineTool(
  {
    name: "deepReasoning",
    description: "Apply extended medical reasoning for complex differential diagnoses and clinical decisions.",
    inputSchema: z.object({
      problem: z.string(),
      context: z.string().optional(),
      reasoningType: z.enum(["diagnosis","treatment","prognosis","mechanism"]).default("diagnosis"),
    }),
    outputSchema: z.object({
      reasoning: z.string(),
      conclusion: z.string(),
      confidenceLevel: z.enum(["high","medium","low"]),
      redFlags: z.array(z.string()),
    }),
  },
  async ({ problem, context, reasoningType }) => {
    const resp = await ai.generate({
      model: gemini20Pro,
      config: {
        temperature: 0.1,
      },
      system: `You are a senior physician performing deep clinical reasoning.
Think step-by-step through: Presentation → Pathophysiology → Differentials → Evidence → Conclusion.
Always flag red flags and time-sensitive conditions.`,
      prompt: `Reasoning type: ${reasoningType}
Problem: ${problem}
${context ? `Additional context: ${context}` : ""}

Provide your complete reasoning chain, then a clear conclusion.`,
    });

    const text = resp.text;
    const redFlags = text.match(/red flags?:([^\\n]+)/gi)?.flatMap((m) =>
      m.replace(/red flags?:/i, "").split(",").map((s) => s.trim()).filter(Boolean)
    ) || [];

    const confidence = text.includes("uncertain") || text.includes("unclear") ? "low"
      : text.includes("strongly") || text.includes("classic") ? "high" : "medium";

    return {
      reasoning: text,
      conclusion: text.split("\n").filter((l) => l.toLowerCase().includes("conclusion:") || l.toLowerCase().includes("diagnosis:"))[0] ?? text.slice(-200),
      confidenceLevel: confidence as any,
      redFlags,
    };
  }
);
