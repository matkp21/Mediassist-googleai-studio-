import { z } from 'genkit';
import { ai } from '@/ai/genkit';

// ---------------------------------------------------------
// Sub-Agent 1: The Silent Proctor (AgentTool equivalent)
// ---------------------------------------------------------
export const proctorAgentFlow = ai.defineFlow(
  {
    name: 'proctorAgentFlow',
    inputSchema: z.object({ 
      transcript: z.array(z.string()).describe("Full chat history of the simulation"), 
      expectedProtocol: z.string().describe("The standard of care protocol, e.g., 'ACLS for Ventricular Fibrillation'") 
    }),
    outputSchema: z.object({
      protocolFollowed: z.boolean(),
      missedSteps: z.array(z.string()),
      criticalErrors: z.array(z.string())
    }),
  },
  async ({ transcript, expectedProtocol }) => {
    // Utilize the model for complex, high-stakes reasoning
    const analysis = await ai.generate({
      prompt: `
        You are an expert clinical proctor. Analyze this clinical transcript:
        ${transcript.join('\n')}
        
        Did the student adhere to the ${expectedProtocol}? 
        You MUST output strict JSON analyzing misses and critical patient safety errors.
        Format: {"protocolFollowed": boolean, "missedSteps": string[], "criticalErrors": string[]}
      `,
      output: { format: 'json' }
    });
    return analysis.output as any;
  }
);

// ---------------------------------------------------------
// Sub-Agent 2: The Patient Simulator (AgentTool equivalent)
// ---------------------------------------------------------
export const patientAgentFlow = ai.defineFlow(
  {
    name: 'patientAgentFlow',
    inputSchema: z.object({ 
      studentQuestion: z.string(), 
      patientState: z.any() 
    }),
    outputSchema: z.string(),
  },
  async ({ studentQuestion, patientState }) => {
    // Utilize the model for low-latency conversational responses
    const response = await ai.generate({
      prompt: `
        You are a patient presenting to the ER with ${patientState.chiefComplaint}. 
        Your current vitals are: HR ${patientState.vitals?.hr || 80}, BP ${patientState.vitals?.bp || '120/80'}.
        The medical student asks: "${studentQuestion}". 
        Respond realistically. If the student asks overly technical questions, act confused. Do not break character.
      `,
    });
    return response.text;
  }
);

// Claw-Code primitive adaptation: EnterPlanModeTool
export const enterPlanModeTool = ai.defineTool(
  {
    name: 'enter_plan_mode',
    description: 'Synthesizes proctor evaluations into a draft grading rubric without finalizing the student score or updating the database.',
    inputSchema: z.object({ 
      proctorData: z.any(),
      studentId: z.string() 
    }),
    outputSchema: z.string(),
  },
  async ({ proctorData, studentId }) => {
    const draftRubric = await ai.generate({
      prompt: `
        Draft a comprehensive, constructive clinical grading rubric based on these errors identified during the simulation: 
        Missed Steps: ${JSON.stringify(proctorData.missedSteps)}
        Critical Errors: ${JSON.stringify(proctorData.criticalErrors)}
        
        Provide actionable feedback for the medical student. DO NOT execute database updates. This is a planning draft.
      `,
    });
    return draftRubric.text;
  }
);
