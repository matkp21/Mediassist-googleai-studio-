import { z } from "genkit";
import { ai } from "@/ai/genkit";
import { AnimatorInputSchema } from "@/lib/schemas/medi-schemas";
import { gemini20Pro } from "@genkit-ai/googleai";

// ─── SVG Medical Pathway Generator ──
const svgPathwayFlow = ai.defineFlow(
  { name: "svgPathwayFlow",
    inputSchema: z.object({ concept: z.string(), type: z.string() }),
    outputSchema: z.string() },
  async ({ concept, type }) => {
    const resp = await ai.generate({
      model: gemini20Pro,
      prompt: `Generate a complete, self-contained SVG animation for this medical concept:
Concept: "${concept}" | Type: ${type}

Requirements:
- SVG with CSS keyframe animations
- Medical flowchart/pathway style
- Color-coded nodes (red=pathological, green=normal, blue=treatment)
- Animated arrows showing flow/progression
- Labels for each step
- 800x600 viewBox
- Include <style> block with @keyframes

Return ONLY valid SVG XML starting with <svg ...`,
      config: { temperature: 0.3 },
    });
    return resp.text;
  }
);

// ─── HTML Interactive Visualizer ─────────────────────────────
const htmlVisualizerFlow = ai.defineFlow(
  { name: "htmlVisualizerFlow",
    inputSchema: z.object({ concept: z.string(), type: z.string() }),
    outputSchema: z.string() },
  async ({ concept, type }) => {
    const resp = await ai.generate({
      model: gemini20Pro,
      prompt: `Create a complete interactive HTML page visualizing this medical concept.
Concept: "${concept}" | Type: ${type}

Requirements:
- Self-contained HTML with inline CSS + JS
- D3.js or canvas-based animations
- Step-by-step progression with "Next Step" button
- Medical accuracy with labels
- Responsive design with medical color scheme
- Include clinical significance notes

Return ONLY complete HTML document starting with <!DOCTYPE html>`,
      config: { temperature: 0.3 },
    });
    return resp.text;
  }
);

// ─── Master Animator Flow ──────────────────────────────────────
export const animatorFlow = ai.defineFlow(
  { name: "animatorFlow", inputSchema: AnimatorInputSchema,
    outputSchema: z.object({ output: z.string(), format: z.string() }) },
  async (input) => {
    switch (input.outputFormat) {
      case "svg": {
        const svg = await svgPathwayFlow({ concept: input.concept, type: input.type });
        return { output: svg, format: "image/svg+xml" };
      }
      default: {
        const html = await htmlVisualizerFlow({ concept: input.concept, type: input.type });
        return { output: html, format: "text/html" };
      }
    }
  }
);
