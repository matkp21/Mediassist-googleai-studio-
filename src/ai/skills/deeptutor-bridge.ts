import { genkit, z } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

// Initialize the ai core instance for this tool
const ai = genkit({ plugins: [googleAI()] });

export const deepTutorBridgeSkill = ai.defineTool(
  {
    name: 'deepTutorBridge',
    description: 'Triggers when a student asks for general medical mentoring, clinical reasoning pathways, or Guided Learning. DeepTutor forces the DrMat structured response and retrieves personalized pathway data.',
    inputSchema: z.object({
      topic: z.string().describe("The medical topic the student wants to learn or be guided through"),
      userWeakness: z.string().optional().describe("A known weak area for the student to focus on"),
    }),
    outputSchema: z.string(),
  },
  async ({ topic, userWeakness }) => {
    try {
      // In a production environment, this calls the local DeepTutor Docker instance
      // e.g. const response = await fetch("http://localhost:8001/api/guide", { ... })
      
      // We mock the response here for the Genkit proxy since Docker might not be running locally
      const mockDeepTutorResponse = {
        pathway: `**Definition**\n${topic} is a key clinical concept requiring structured understanding.\n\n**Etiology**\nOften multifactorial, including genetic and environmental triggers.\n\n**Clinical Features** (Signs & Symptoms)\nPresentations vary based on acuity. Look for hallmark red-flag symptoms.\n\n**Investigations** (Lab Findings + Interpretation)\nStart with baseline labs and targeted imaging. Correlate with clinical findings.\n\n**Management** (Medical & Surgical + Latest Updates)\nBegin with conservative/medical management before escalating to surgical intervention per latest guidelines.`,
        next_step_nudge: `You previously struggled with ${userWeakness || 'differential diagnoses'}. Next step: Let's do a case simulation on ${topic}.`
      };

      return JSON.stringify(mockDeepTutorResponse, null, 2);
    } catch (e) {
      return JSON.stringify({ error: "Failed to connect to DeepTutor backend." });
    }
  }
);
