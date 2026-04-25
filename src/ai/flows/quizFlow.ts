import { z } from "genkit";
import { ai } from "@/ai/genkit";
import { QuizInputSchema, QuestionSchema } from "@/lib/schemas/medi-schemas";
import { gemini20Flash } from "@genkit-ai/googleai";
import { db } from "@/lib/firebase-admin";

// ─── Retrieve Agent ───────────────────────────────────────────
const retrieveAgent = ai.defineFlow(
  { name: "quizRetrieveAgent",
    inputSchema: z.object({ topic: z.string(), kbId: z.string().optional() }),
    outputSchema: z.string() },
  async ({ topic }) => {
    const resp = await ai.generate({
      model: gemini20Flash,
      prompt: `Provide key medical facts, definitions, and clinical pearls about: ${topic}
Focus on exam-relevant, high-yield points.`,
    });
    return resp.text;
  }
);

// ─── Generate Agent ───────────────────────────────────────────
const generateAgent = ai.defineFlow(
  { name: "quizGenerateAgent",
    inputSchema: z.object({ context: z.string(), input: QuizInputSchema }),
    outputSchema: z.array(QuestionSchema) },
  async ({ context, input }) => {
    const resp = await ai.generate({
      model: gemini20Flash,
      prompt: `Generate ${input.count} ${input.type} questions about "${input.topic}".
Difficulty: ${input.difficulty}. Use this context:
${context}

Return ONLY a JSON array matching this schema:
[{ "id": "q1", "type": "mcq", "question": "...", "options": ["A","B","C","D"],
   "answer": "A", "explanation": "...", "highYield": true, "difficulty": "medium" }]`,
      config: { temperature: 0.5 },
    });
    const clean = resp.text.replace(/```json|```/g, "").trim();
    return JSON.parse(clean);
  }
);

// ─── Master Quiz Flow ─────────────────────────────────────────
export const quizFlow = ai.defineFlow(
  { name: "quizFlow", inputSchema: QuizInputSchema,
    outputSchema: z.object({ questions: z.array(QuestionSchema), topic: z.string() }) },
  async (input) => {
    const context   = await retrieveAgent({ topic: input.topic, kbId: input.kbId });
    const questions = await generateAgent({ context, input });

    // Persist to Firestore for Neural Progress Tracker
    await db.collection("users").doc(input.uid)
      .collection("quizHistory").add({
        topic: input.topic, 
        questions: questions,
        createdAt: Date.now(), 
        score: null,
      });

    return { questions, topic: input.topic };
  }
);
