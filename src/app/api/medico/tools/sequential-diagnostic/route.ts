import { NextResponse } from 'next/server';
import { sequentialDiagnosticTool } from '@/ai/tools/diagnosticTools';

export async function POST(req: Request) {
  try {
    const { symptoms, step } = await req.json();
    const result = await sequentialDiagnosticTool.execute({ symptoms, step });
    return NextResponse.json({ result: result.output });
  } catch (error: any) {
    console.error("[API:SequentialDiag] Tool failed:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
