import { z } from "genkit";
import { ai } from "@/ai/genkit";


export const brainstormTool = ai.defineTool(
  {
    name: "brainstorm",
    description: "Generate broad, creative medical differentials, mnemonics, or study approaches.",
    inputSchema: z.object({
      topic: z.string(),
      mode: z.enum(["differentials","mnemonics","studyApproach","caseScenarios","rareDiagnoses"]).default("differentials"),
      count: z.number().min(5).max(30).default(15),
    }),
    outputSchema: z.object({
      ideas: z.array(z.object({
        title: z.string(),
        description: z.string(),
        category: z.string(),
        rarity: z.enum(["common","uncommon","rare","very-rare"]).optional(),
      })),
      summary: z.string(),
    }),
  },
  async ({ topic, mode, count }) => {
    const modePrompts: Record<string, string> = {
      differentials: `List ${count} differential diagnoses for "${topic}", from common to zebras. Include rare causes.`,
      mnemonics: `Create ${count} different mnemonics for remembering "${topic}". Be creative and memorable.`,
      studyApproach: `Suggest ${count} different ways to study and remember "${topic}" — methods, tricks, associations.`,
      caseScenarios: `Generate ${count} diverse clinical case scenarios involving "${topic}" for practice.`,
      rareDiagnoses: `List ${count} rare and unusual diagnoses related to "${topic}" that are exam favorites.`,
    };

    const resp = await ai.generate({
      model: 'googleai/gemini-3.0-flash',
      config: { temperature: 0.9 },
      prompt: `${modePrompts[mode]}

Return as JSON: [{"title":"...","description":"...","category":"...","rarity":"common|uncommon|rare|very-rare"}]`,
    });

    const clean = resp.text.replace(/```json|```/g, "").trim();
    const ideas = JSON.parse(clean);

    const summaryResp = await ai.generate({
      model: 'googleai/gemini-3.0-flash',
      prompt: `Summarize in 1 sentence the key clinical teaching point from these ideas about "${topic}".`,
      config: { temperature: 0.3 },
    });

    return { ideas, summary: summaryResp.text };
  }
);
