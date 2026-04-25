import { socraticPreceptorFlow } from '@/ai/agents/medico/SocraticPreceptorAgent';

export async function POST(req: Request) {
  try {
    const input = await req.json();
    const result = await socraticPreceptorFlow(input);
    return Response.json(result);
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
