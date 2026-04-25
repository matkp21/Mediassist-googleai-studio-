import { NextRequest, NextResponse } from "next/server";
import { generateTitleFlow } from "@/ai/flows/coWriteFlow";

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();
    const result = await generateTitleFlow({ text });
    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to generate title" }, { status: 500 });
  }
}
