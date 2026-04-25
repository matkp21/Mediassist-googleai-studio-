import { z } from "genkit";
import { ai } from "@/ai/genkit";
import { DeepSolveInputSchema, StepResultSchema } from "@/lib/schemas/medi-schemas";
import { gemini20Pro } from "@genkit-ai/googleai";

const planStep = ai.defineFlow(
  { name: "planStep", inputSchema: z.object({ question: z.string() }), outputSchema: z.array(z.string()) },
  async ({ question }) => {
    const resp = await ai.generate({
      model: gemini20Pro,
      prompt: `Break "${question}" into research sub-questions. Return JSON array of strings.`,
    });
    return JSON.parse(resp.text.replace(/```json|```/g, "").trim());
  }
);

const investigateStep = ai.defineFlow(
  { name: "investigateStep", inputSchema: z.object({ subQuestions: z.array(z.string()) }), outputSchema: z.array(StepResultSchema) },
  async ({ subQuestions }) => {
    return await Promise.all(subQuestions.map(async (q) => {
      const resp = await ai.generate({ model: gemini20Pro, prompt: `Research: ${q}` });
      return { step: q, content: resp.text, sources: ["Synthesized Knowledge"] };
    }));
  }
);

const solveStep = ai.defineFlow(
  { name: "solveStep", inputSchema: z.object({ question: z.string(), evidence: z.array(StepResultSchema) }), outputSchema: StepResultSchema },
  async ({ question, evidence }) => {
    const evidenceText = evidence.map((e) => `[${e.step}]: ${e.content}`).join("\n\n");
    const resp = await ai.generate({
      model: gemini20Pro,
      prompt: `Original: ${question}\nEvidence: ${evidenceText}\nProvide answer.`,
    });
    return { step: "synthesis", content: resp.text };
  }
);

export const deepSolveFlow = ai.defineFlow(
  { name: "deepSolveFlow", inputSchema: DeepSolveInputSchema, outputSchema: z.object({ answer: StepResultSchema }) },
  async (input) => {
    const plan = await planStep({ question: input.question });
    const evidence = await investigateStep({ subQuestions: plan });
    const answer = await solveStep({ question: input.question, evidence });
    return { answer };
  }
);
