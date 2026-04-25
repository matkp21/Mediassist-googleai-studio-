import { z } from "genkit";
import { ai } from "@/ai/genkit";
import { VisualizeInputSchema } from "@/lib/schemas/medi-schemas";
import { gemini20Pro } from "@genkit-ai/googleai";

export const visualizeFlow = ai.defineFlow(
  { name: "visualizeFlow", inputSchema: VisualizeInputSchema,
    outputSchema: z.object({ mermaidCode: z.string(), explanation: z.string(), title: z.string() }) },
  async (input) => {
    const resp = await ai.generate({
      model: gemini20Pro,
      prompt: `Generate a Mermaid.js ${input.diagramType} diagram for the medical concept:
"${input.concept}"

Rules:
- Return ONLY valid Mermaid syntax (no backticks, no markdown)
- Use medical-appropriate node names
- For flowchart: use LR direction, color-code with classDef
- Max 20 nodes for readability
- Include clinically relevant connections/arrows

Return ONLY the raw Mermaid diagram code.`,
      config: { temperature: 0.3 },
    });

    const explanationResp = await ai.generate({
      model: gemini20Pro,
      prompt: `In 2-3 sentences, explain the key clinical takeaway from this diagram about "${input.concept}".`,
      config: { temperature: 0.4 },
    });

    return {
      mermaidCode: resp.text.trim(),
      explanation: explanationResp.text,
      title: `${input.concept} — ${input.diagramType}`,
    };
  }
);
