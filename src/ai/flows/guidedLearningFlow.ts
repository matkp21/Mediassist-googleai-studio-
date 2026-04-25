import { z } from "genkit";
import { ai } from "@/ai/genkit";
import { gemini20Pro } from "@genkit-ai/googleai";
import { db } from "@/lib/firebase-admin";

export const designLearningPlanFlow = ai.defineFlow(
  { name: "designLearningPlan",
    inputSchema: z.object({ topic: z.string(), uid: z.string() }),
    outputSchema: z.array(z.object({ stepNumber: z.number(), title: z.string(), objective: z.string() })) },
  async ({ topic, uid }) => {
    const profileSnap = await db.collection("users").doc(uid).collection("memory").doc("profile").get();
    const profile = profileSnap.data() ?? {};

    const resp = await ai.generate({
      model: gemini20Pro,
      prompt: `Design a 4-step progressive learning plan for a medical student studying:
Topic: "${topic}"
Student level: ${profile.knowledgeLevel ?? "MBBS Year 3"}

Return JSON: [{"stepNumber":1,"title":"...","objective":"..."}]`,
      config: { temperature: 0.3 },
    });
    const clean = resp.text.replace(/```json|```/g, "").trim();
    return JSON.parse(clean);
  }
);

export const generateStepHTMLFlow = ai.defineFlow(
  { name: "generateStepHTML",
    inputSchema: z.object({ topic: z.string(), step: z.object({ stepNumber: z.number(), title: z.string(), objective: z.string() }) }),
    outputSchema: z.object({
      stepNumber: z.number(),
      title: z.string(),
      objective: z.string(),
      htmlContent: z.string(),
      keyPoints: z.array(z.string()),
    }) },
  async ({ topic, step }) => {
    const resp = await ai.generate({
      model: gemini20Pro,
      prompt: `Create an interactive HTML learning page for Step ${step.stepNumber}: "${step.title}"
Topic: ${topic} | Objective: ${step.objective}

Requirements:
- Complete self-contained HTML with inline CSS
- Medical dark theme (#0f172a background, #38bdf8 accents)
- Collapsible sections for Definition, Pathophysiology, Clinical Features, Key Points
- Interactive hover effects
- Medical diagrams using SVG
- A 3-question inline mini-quiz at the bottom
- Include a mock "Mark Complete" button
Return ONLY complete HTML.`,
      config: { temperature: 0.3 },
    });

    const keyPointsResp = await ai.generate({
      model: gemini20Pro,
      prompt: `List 5 high-yield exam points for "${step.title}" as JSON: ["point1","point2",...]`,
    });
    const keyPoints = JSON.parse(keyPointsResp.text.replace(/```json|```/g, "").trim());

    return {
      stepNumber: step.stepNumber,
      title: step.title,
      objective: step.objective,
      htmlContent: resp.text,
      keyPoints,
    };
  }
);
