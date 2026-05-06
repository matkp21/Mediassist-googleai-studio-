import { z } from "genkit";
import { ai } from "@/ai/genkit";


export const coWriteFlow = ai.defineFlow(
  { name: "coWriteAction",
    inputSchema: z.object({ text: z.string(), action: z.enum(["rewrite","expand","shorten"]) }),
    outputSchema: z.object({ result: z.string() }) },
  async ({ text, action }) => {
    const prompts = {
      rewrite: `Rewrite this medical text to be clearer and more precise for a student:\n"${text}"`,
      expand:  `Expand this into a detailed medical explanation with definitions and clinical context:\n"${text}"`,
      shorten: `Condense this to the essential high-yield points only:\n"${text}"`,
    };
    const resp = await ai.generate({
      model: 'googleai/gemini-3.0-flash',
      prompt: prompts[action],
      config: { temperature: 0.4 },
    });
    return { result: resp.text };
  }
);

export const generateTitleFlow = ai.defineFlow(
  { name: "generateTitle",
    inputSchema: z.object({ text: z.string() }),
    outputSchema: z.object({ title: z.string() }) },
  async ({ text }) => {
    const resp = await ai.generate({
      model: 'googleai/gemini-3.0-flash',
      prompt: `Generate a concise 5-7 word medical document title for:\n"${text}"\nReturn ONLY the title.`,
      config: { temperature: 0.3 },
    });
    return { title: resp.text.trim() };
  }
);
