import { NextResponse } from 'next/server';
import { updateStudyPerformanceFlow } from '@/ai/flows/studyFlows';

export async function POST(req: Request) {
  try {
    const { userId, taskId, score } = await req.json();
    const result = await updateStudyPerformanceFlow({ userId, taskId, score });
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("[API:UpdatePerformance] Flow failed:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
