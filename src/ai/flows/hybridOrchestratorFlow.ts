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
               You interact with medical students. Determine if their request requires deep clinical analysis. 
               If it does, you MUST use the medical_analysis_tool. 
               If it is a general question, answer it directly.`,
      tools: [medicalAnalysisTool],
    });
    return text;
  }
);
