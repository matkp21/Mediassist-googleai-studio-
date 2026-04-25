import { NextRequest, NextResponse } from "next/server";
import { ai } from "@/ai/genkit";
import { gemini20Pro } from "@genkit-ai/googleai";

export async function POST(req: NextRequest) {
  try {
    const { medicalText, aspectRatio } = await req.json();
    
    const resp = await ai.generate({
      model: gemini20Pro,
      prompt: `Act as a medical video producer. Convert the following text into a video script. 
      Aspect Ratio: ${aspectRatio}
      
      Text: ${medicalText}
      
      Return JSON:
      {
        "title": "...",
        "script": "...",
        "visualPrompts": ["...", "...", "..."],
        "estimatedDuration": "..."
      }`,
    });

    const data = JSON.parse(resp.text.replace(/```json|```/g, "").trim());
    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Video synthesis failed" }, { status: 500 });
  }
}
