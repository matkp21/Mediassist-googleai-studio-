import { NextRequest, NextResponse } from "next/server";
import { ai } from "@/ai/genkit";
export async function POST(req: NextRequest) {
  try {
    const { medicalText, aspectRatio } = await req.json();
    
    const resp = await ai.generate({
      model: 'gemini-2.0-flash',
      config: {
        responseMimeType: 'application/json'
      },
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

    let data;
    try {
      data = JSON.parse(resp.text.replace(/```json|```/g, "").trim());
    } catch(e) {
      data = { title: "Error parsing script", script: resp.text, visualPrompts: [], estimatedDuration: "Unknown" };
    }
    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Video synthesis failed" }, { status: 500 });
  }
}
