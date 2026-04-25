import { NextResponse } from 'next/server';
import { documentToSkillFlow } from '@/ai/flows/skillFlows';

export async function POST(req: Request) {
  try {
    const { documentText } = await req.json();
    const result = await documentToSkillFlow({ documentText });
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("[API:DocumentToSkill] Flow failed:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
