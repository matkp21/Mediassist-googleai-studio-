import { spacedRepetitionFlow } from '@/ai/flows/spacedRepetitionFlows';

export async function POST(req: Request) {
  try {
    const input = await req.json();
    const result = await spacedRepetitionFlow(input);
    return Response.json(result);
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
