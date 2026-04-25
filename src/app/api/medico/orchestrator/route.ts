import { medicoDashboardOrchestrator } from '@/ai/flows/medicoThreadRouter';
import { updateStudentMemoryFlow } from '@/ai/flows/updateStudentMemory';

export async function POST(req: Request) {
  try {
    const { query, activeTopicContext, userId } = await req.json();
    
    // 1. Run the Pedagogical Orchestrator (Guided Learning)
    const result = await medicoDashboardOrchestrator({ query, activeTopicContext });

    // 2. Background Task: Update Student Memory (Persistent Memory Feature)
    if (userId) {
      updateStudentMemoryFlow({ 
        studentId: userId, 
        latestInteraction: `Query: ${query}\nAnswer: ${result.answer}`
      }).catch(err => console.error("[Memory:Update] Background task failed:", err));
    }

    return Response.json(result);
  } catch (error: any) {
    console.error("[API:MedicoOrchestrator] Failed:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
