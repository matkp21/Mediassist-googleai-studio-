import { genkit, z } from 'genkit';
import { vertexAI } from '@genkit-ai/vertexai';
import fs from 'fs/promises';
import path from 'path';
import { tokenRoiTrackerMiddleware } from '../../core/middleware';

const ai = genkit({ plugins: [vertexAI({ location: 'us-central1' })] });

export const osceScenarioSimulatorSkill = ai.defineTool(
  {
    name: 'osceScenarioSimulator',
    description: `Triggers when a medical student explicitly asks to practice a clinical scenario or OSCE.
      NEGATIVE TRIGGER: Do NOT use if the student only asks for a factual definition.
      NEGATIVE TRIGGER: Do NOT use if the student is asking to generate multiple choice questions.`,
    inputSchema: z.object({
      action: z.enum(['start_scenario', 'grade_scenario']).describe("Must be 'start_scenario' if beginning, or 'grade_scenario' if ending for feedback."),
      patientCaseId: z.string().optional().describe("If starting, the specific ID of the clinical case (e.g., 'cardio-01') if known, otherwise leave blank."),
      chatTranscript: z.string().optional().describe("If grading a scenario, the full chat history between the student and the AI."),
    }),
    outputSchema: z.object({
      patientOpeningStatement: z.string().optional(),
      hiddenScenarioDetails: z.string().optional(),
      gradingReport: z.string().optional(),
    }),
  },
  async ({ action, patientCaseId = 'cardio-01', chatTranscript }) => {
    
    // ACTION 1: START SCENARIO (Dynamic Reference Fetching)
    if (action === 'start_scenario') {
      let patientReference = '';
      try {
        const casePath = path.resolve(process.cwd(), `src/ai/skills/osce-scenario-simulator/references/${patientCaseId}.md`);
        patientReference = await fs.readFile(casePath, 'utf-8');
      } catch (e) {
        patientReference = "Generic Case: 50yo with undefined pain.";
      }

      // Applying our new Middleware here to track the token ROI!
      const modelWithMiddleware = ai.model('vertexai/gemini-2.5-flash').use(tokenRoiTrackerMiddleware());

      const response = await modelWithMiddleware.generate({
        system: `You are an expert Clinical Simulation Instructor. 
                 Base the simulation STRICTLY on this patient file: \n${patientReference}`,
        prompt: `Extract the requested patientOpeningStatement and hiddenScenarioDetails from the case file. DO NOT reveal the diagnosis to the user.`,
        output: {
          schema: z.object({
            patientOpeningStatement: z.string(),
            hiddenScenarioDetails: z.string()
          })
        }
      });
      return response.output()!;
    }

    // ACTION 2: GRADE SCENARIO (Progressive Disclosure of Heavy Rubric)
    if (action === 'grade_scenario') {
      if (!chatTranscript) {
         throw new Error("Chat transcript is required for grading.");
      }

      const rubricPath = path.resolve(process.cwd(), 'src/ai/skills/osce-scenario-simulator/references/osce-grading-rubric.md');
      let osceGradingRubric = '';
      
      try {
        osceGradingRubric = await fs.readFile(rubricPath, 'utf-8');
      } catch (e) {
        console.warn("Failed to load OSCE rubric. Using fallback.", e);
        osceGradingRubric = "Evaluate History, Communication, Physical Exam choices, and Diagnosis out of 100%.";
      }

      const response = await ai.generate({
        model: 'vertexai/gemini-2.5-pro', // Using Pro for deep contextual analysis of the student's conversation
        system: `You are the ultimate Clinical OSCE Examiner.
                 You will review the interaction transcript between a medical student and a simulated patient.
                 
                 You MUST evaluate their performance strictly using this exact rubric:
                 
                 ${osceGradingRubric}`,
        prompt: `Here is the transcript of the student's encounter:\n\n${chatTranscript}\n\nGenerate the final grading report.`,
        output: {
          schema: z.object({
             gradingReport: z.string()
          })
        }
      });

      return response.output()!;
    }

    return {};
  }
);
