import { NextRequest, NextResponse } from "next/server";
import { ai } from "@/ai/genkit";
import { gemini20Pro } from "@genkit-ai/googleai";

export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json();

    const resp = await ai.generate({
      model: gemini20Pro,
      system: "You are a strict but caring medical professor. You use the Socratic method to teach. You have a deep soul and persistent memory of previous sessions.",
      messages: [
        ...history.map((m: any) => ({ role: m.role === 'user' ? 'user' : 'model', content: [{ text: m.content }] })),
        { role: 'user', content: [{ text: message }] }
      ]
    });

    return NextResponse.json({ response: resp.text });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "TutorBot failed to respond" }, { status: 500 });
  }
}
