import { NextResponse } from 'next/server';
import { decomposeStudyGoalFlow } from '@/ai/flows/studyFlows';

export async function POST(req: Request) {
  try {
    const { userId, goal } = await req.json();
    const result = await decomposeStudyGoalFlow({ userId, goal });
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("[API:DecomposeGoal] Flow failed:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
