import { z } from 'genkit';
import { ai } from '@/ai/genkit';

// 2. Define a Specialized Medical Flow using MedGemma 1.5
// This model handles the actual clinical text and image comprehension.
export const medGemmaAnalyzer = ai.defineFlow(
  {
    name: 'medGemmaAnalyzer',
    inputSchema: z.string().describe("Raw clinical text or patient transcript"),
    outputSchema: z.string(),
  },
  async (clinicalText) => {
    const { text } = await ai.generate({
      // We use the model string as provided in the architecture
      model: 'googleai/gemini-2.0-flash', // Fallback to available model if medgemma isn't configured in the provider yet
      prompt: `You are an expert clinical analyst. Extract symptoms and summarize the following patient record strictly based on medical facts: ${clinicalText}`,
    });
    return text;
  }
);

// 3. Wrap the MedGemma flow as a Tool
// This bridges the gap, allowing native tool-calling models to trigger MedGemma.
export const medicalAnalysisTool = ai.defineTool(
  {
    name: 'medical_analysis_tool',
    description: 'Use this tool to analyze complex medical transcripts, extract symptoms, or perform clinical reasoning.',
    inputSchema: z.object({ transcript: z.string() }),
    outputSchema: z.string(),
  },
  async ({ transcript }) => {
    return await medGemmaAnalyzer(transcript);
  }
);

import { theoryCoachTool } from './theoryCoachFlow';
import { clinicalAnalysisTool as drMatTool } from './drMatClinicalAnalyzer';
import { symptomAnalyzerTool } from '@/ai/tools/symptom-analyzer-tool';

// 4. Main Orchestrator Flow using Gemma 4 31B or Gemini 2.5 Pro
// This agent handles the conversation, routing, and tool execution.
export const hybridOrchestratorFlow = ai.defineFlow(
  {
    name: 'hybridOrchestrator',
    inputSchema: z.string(),
    outputSchema: z.string(),
  },
  async (userInput) => {
    const { text } = await ai.generate({
      // Using gemini-2.5-pro as the orchestrator as suggested
      model: 'googleai/gemini-2.5-pro', 
      prompt: `You are the MediAssist Orchestrator. 
               You interact with medical students and general users. Determine their needs.
               - If they ask a diagnostic or clinical reasoning question for learning, you MUST use the drmat_clinical_analysis tool.
               - If they request notes, study guides, or exam prep material on a specific topic, you MUST use the theory_coach_study_guide tool.
               - If they describe specific medical symptoms they are currently experiencing as a patient, you MUST use the symptomAnalyzer tool.
               - If it does not fit those, but needs general medical abstraction, use the medical_analysis_tool. 
               - If it is a general question without needing tools, answer it directly.`,
      tools: [medicalAnalysisTool, drMatTool, theoryCoachTool, symptomAnalyzerTool],
    });
    return text;
  }
);
