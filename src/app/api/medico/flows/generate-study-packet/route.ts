import { NextResponse } from 'next/server';
import { generateDailyStudyPacketFlow } from '@/ai/flows/studyFlows';

export async function POST(req: Request) {
  try {
    const { userId, taskId } = await req.json();
    const result = await generateDailyStudyPacketFlow({ userId, taskId });
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("[API:GeneratePacket] Flow failed:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
