import { NextRequest, NextResponse } from "next/server";
import { ai } from "@/ai/genkit";
import { gemini20Pro } from "@genkit-ai/googleai";

export async function POST(req: NextRequest) {
  try {
    const { intent } = await req.json();

    const resp = await ai.generate({
      model: gemini20Pro,
      prompt: `Act as a medical publisher. Design a 5-chapter book outline for "${intent}".
      
      Return JSON:
      {
        "title": "...",
        "description": "...",
        "chapters": [
          { "title": "...", "pagesCount": 4 }
        ]
      }`,
    });

    const data = JSON.parse(resp.text.replace(/```json|```/g, "").trim());
    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Book generation failed" }, { status: 500 });
  }
}
