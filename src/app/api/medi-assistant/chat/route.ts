import { NextRequest, NextResponse } from "next/server";
import { chatFlow } from "@/ai/flows/chatFlow";
import { deepSolveFlow } from "@/ai/flows/deepSolveFlow";
import { deepResearchFlow } from "@/ai/flows/deepResearchFlow";

export async function POST(req: NextRequest) {
  try {
    const { message, mode, sessionId = 'default-session', uid = 'guest-user' } = await req.json();

    let result;
    if (mode === 'deepSolve') {
      result = await deepSolveFlow({ question: message, sessionId, uid });
      return NextResponse.json({ response: result.answer.content });
    } else if (mode === 'research') {
      result = await deepResearchFlow({ topic: message, uid });
      return NextResponse.json({ response: result.report });
    } else {
      result = await chatFlow({ message, sessionId, mode, uid });
      return NextResponse.json(result);
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to process chat" }, { status: 500 });
  }
}
