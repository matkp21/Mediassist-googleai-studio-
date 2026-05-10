import { genkit, z } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import * as fs from 'fs/promises';
import * as path from 'path';

const ai = genkit({ plugins: [googleAI()] });

export const osceScenarioSimulatorSkill = ai.defineTool(
  {
    name: 'osceScenarioSimulator',
    description: 'Triggers when a student types /practice-osce or asks to practice a clinical patient interview.',
    inputSchema: z.object({
      studentInput: z.string().describe("The history-taking question asked by the student"),
      scenarioState: z.string().describe("The current state of the interview (e.g., 'intake', 'physical_exam', 'grading')"),
    }),
    outputSchema: z.string(),
  },
  async ({ studentInput, scenarioState }) => {
    let skillInstructions = "Act as a standardized patient. Don't give away the diagnosis easily.";
    try {
      skillInstructions = await fs.readFile(
        path.join(process.cwd(), 'skills/medico/osce-scenario-simulator/SKILL.md'), 'utf-8'
      );
    } catch (e) {
      console.warn("Could not load OSCE SKILL.md");
    }

    let rubricContext = "";
    // Only load the grading rubric if the student has finished the interview
    if (scenarioState === 'grading') {
      try {
        rubricContext = await fs.readFile(
          path.join(process.cwd(), 'skills/medico/osce-scenario-simulator/references/osce-grading-rubric.md'), 'utf-8'
        );
      } catch (e) {
        console.warn("Could not load OSCE rubric");
      }
    }

    const { text } = await ai.generate({
      model: 'gemini-2.5-flash', // Fast model for real-time conversation
      system: `
        You are a standardized patient. You must NOT give away your diagnosis. 
        Force the student to ask the right history-taking questions.
        Instructions: \n${skillInstructions}\n
        Grading Rubric (if applicable): \n${rubricContext}
      `,
      prompt: `Student says: "${studentInput}". Current phase: ${scenarioState}. Respond appropriately.`,
    });

    return text;
  }
);
