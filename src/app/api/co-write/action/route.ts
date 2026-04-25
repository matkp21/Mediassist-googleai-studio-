import { NextRequest, NextResponse } from "next/server";
import { coWriteFlow } from "@/ai/flows/coWriteFlow";

export async function POST(req: NextRequest) {
  try {
    const { text, action } = await req.json();
    const result = await coWriteFlow({ text, action });
    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to process AI action" }, { status: 500 });
  }
}
