import { NextRequest, NextResponse } from "next/server";
import { getSentinel } from "@/ai/sentinel/crashSentinel";

export async function POST(req: NextRequest) {
  try {
    const errorData = await req.json();
    const sentinel = getSentinel();
    
    // Capture the error in our sentinel system
    sentinel.capture(errorData, {
      userId: req.headers.get("x-firebase-uid") || "anonymous",
      brainModule: errorData.brainModule || "Frontend:ErrorBoundary",
      flowId: errorData.path || "Global"
    });

    return NextResponse.json({ status: "captured", errorId: errorData.errorId });
  } catch (err) {
    console.error("Failed to capture error in sentinel:", err);
    return NextResponse.json({ status: "failed" }, { status: 500 });
  }
}
