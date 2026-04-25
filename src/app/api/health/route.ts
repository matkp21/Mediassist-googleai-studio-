import { NextRequest, NextResponse } from "next/server";
import { getSentinel } from "@/ai/sentinel/crashSentinel";

export async function GET(_req: NextRequest) {
  try {
    const sentinel = getSentinel();
    return NextResponse.json(sentinel.snapshot());
  } catch (err) {
    return NextResponse.json({ status: "error", message: String(err) }, { status: 500 });
  }
}
