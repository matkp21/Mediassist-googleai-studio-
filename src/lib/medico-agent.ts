import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY! });

export async function routeMedicalRequestClient(query: string) {
  if (!query || query.length < 5) return null;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `
        You are the Router Agent for MediAssistant (2026 Edition).
        Given the user's medical study or clinical query, determine the best tool to handle it.
        
        Query: "${query}"

        Available Tools/Modules:
        - theorycoach-generator: For quick study summaries or theory generation.
        - mcq: Multiple choice questions practice.
        - flashcards: High-yield recall cards.
        - ddx: Differential diagnosis assistant.
        - library: Accessing textbooks and papers.
        - cases: Clinical case studies.
        - anatomy: 3D anatomy visualization.
        - pharmacogenie: Drug interactions and pharmacology.
        
        Return a JSON object:
        {
          "intent": "study" | "clinical" | "research",
          "recommendedToolId": string | null,
          "aiSummary": "A very brief (1 sentence) initial AI insight based on the query",
          "confidence": number
        }
      `,
      config: {
        responseMimeType: "application/json",
      }
    });

    const text = response.text;
    if (!text) return null;
    return JSON.parse(text);
  } catch (error) {
    console.error("Agent Routing Error:", error);
    return {
      intent: "study",
      recommendedToolId: null,
      aiSummary: "The agentic router is recalibrating. Please select a tool manually.",
      confidence: 0,
    };
  }
}
