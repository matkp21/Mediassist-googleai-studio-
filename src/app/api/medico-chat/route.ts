import { genkit, z } from "genkit";
import { vertexAI } from "@genkit-ai/vertexai";
import { osceScenarioSimulatorSkill } from "../../../ai/skills/osce-scenario-simulator";
import { clinicalNoteFormatterSkill } from "../../../ai/skills/clinical-note-formatter";
import { usmleQuestionMimicSkill } from "../../../ai/skills/usmle-question-mimic";
import { wardRoundPresentationFormatterSkill } from "../../../ai/skills/ward-round-presentation-formatter";
import { studySprintOrchestratorSkill } from "../../../ai/skills/study-sprint-orchestrator";
import { syllabusDecompositionSkill } from "../../../ai/skills/syllabus-decomposition";
import { specializedMedicalGroundingSkill } from "../../../ai/skills/medical-grounding";
import { performanceEvaluationSkill } from "../../../ai/skills/performance-evaluation";
import { mnemonicGeneratorSkill } from "../../../ai/skills/mnemonic-generator";
import { diagnosticFlowchartTrackerSkill } from "../../../ai/skills/flowchart-generator";
import { deepTutorBridgeSkill } from "../../../ai/skills/deeptutor-bridge";

// Initialize AI core
const ai = genkit({ plugins: [vertexAI({ location: "us-central1" })] });

export async function POST(req: Request) {
  try {
    const { prompt, history, userId } = await req.json();

    const systemPrompt = `You are Medi, the Resident Genius Mentor of MediAssistant. You are a Senior Context-Aware Orchestrator using the MediAssistant Fan-Out Architecture. 
Your primary task is to generate strict medical responses, synthesize topics naturally, and act as a clinical tutor. Use the deepTutorBridgeSkill when deep clinical reasoning or persistent mentoring is required.
Adaptive Learning Goal: You are tracking the student's cognitive weaknesses (e.g. Pharmacology MoA) and clinical reasoning style (Top-Down). Whenever you explain a topic, adapt YOUR delivery to specifically remediate these knowledge gaps using a Socratic method.
Simultaneously, evaluate the current conversation state and PRE-COMPUTE the best 'next steps' for the student.
If the student asks to see one of the next steps (like "Generate a Flowchart", "Give me a Mnemonic", "Take MCQ", or any similar context continuation you suggest in nextSteps), you MUST fulfill that specific request dynamically using the previous conversational context instead of asking them to repeat themselves. Use the history as your Shared Session State memory constraint.
User ID for context: ${userId || "unknown"}\n\nUser Input: ${prompt}`;

    // We use generateStream to send chunks to the frontend instantly
    const { stream } = await ai.generateStream({
      model: ai.model('vertexai/gemini-2.5-pro'),
      messages: history || [],
      system: systemPrompt,
      prompt: prompt,
      tools: [
        osceScenarioSimulatorSkill, 
        clinicalNoteFormatterSkill, 
        usmleQuestionMimicSkill, 
        wardRoundPresentationFormatterSkill,
        studySprintOrchestratorSkill,
        syllabusDecompositionSkill,
        specializedMedicalGroundingSkill,
        performanceEvaluationSkill,
        mnemonicGeneratorSkill,
        diagnosticFlowchartTrackerSkill,
        deepTutorBridgeSkill
      ], 
      // The fully optimized tool suite
      output: {
        schema: z.object({
          reply: z.string(),
          nextSteps: z.array(z.string()).optional().describe("2-3 logical follow-up actions")
        })
      }
    });

    // Next.js handles the streaming response
    return new Response(stream(), {
      headers: { 'Content-Type': 'text/event-stream' }
    });
  } catch (error) {
    console.error("Error in medico chat API:", error);
    return new Response(JSON.stringify({ error: "Failed to generate response" }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
