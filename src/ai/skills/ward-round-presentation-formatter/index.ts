import { genkit, z } from 'genkit';
import { vertexAI } from '@genkit-ai/vertexai';
import fs from 'fs/promises';
import path from 'path';

const ai = genkit({ plugins: [vertexAI({ location: 'us-central1' })] });

export const wardRoundPresentationFormatterSkill = ai.defineTool(
  {
    name: 'wardRoundPresentationFormatter',
    // Progressive Disclosure bounds + Negative constraints to reduce over-triggering
    description: 'Triggers when a student inputs messy, shorthand notes and requests them to be formatted for an oral ward round presentation, patient presentation, or handoff. NEGATIVE TRIGGER: Do NOT trigger if the student wants a written SOAP note (use clinicalNoteFormatter instead), or if they ask factual medical questions.',
    inputSchema: z.object({
      rawNotes: z.string().describe("The scattered, unformatted notes or data provided by the student."),
    }),
    outputSchema: z.object({
      presentationScript: z.string().describe("The formatted, logically ordered script designed to be spoken aloud during bedside rounds."),
      feedback: z.string().optional().describe("Brief, constructive feedback on any missing critical information (e.g., 'You forgot to include the patient's vitals').")
    }),
  },
  async ({ rawNotes }) => {
    // PROGRESSIVE DISCLOSURE: Load the heavy presentation framework rubric strictly upon execution
    const referencePath = path.resolve(process.cwd(), 'src/ai/skills/ward-round-presentation-formatter/references/presentation-framework.md');
    let frameworkRubric = '';
    
    try {
      frameworkRubric = await fs.readFile(referencePath, 'utf-8');
    } catch (e) {
      console.warn("Failed to load Ward Round framework asset.", e);
      frameworkRubric = "Structure: 1. ID/CC, 2. Overnights, 3. Vitals & Exam, 4. Assessment & Plan by problem.";
    }

    // Launch sub-agent dedicated to formatting
    const response = await ai.generate({
      model: 'vertexai/gemini-2.5-pro', // Pro is highly adept at transforming unstructured data into precise constraints
      system: `You are an expert Chief Resident training a medical student on how to verbally present patients on the wards.
               Restructure the student's messy notes into a flawless, concise oral presentation script.
               
               You MUST format the output strictly according to this verbal presentation framework:
               
               ${frameworkRubric}`,
      prompt: `Here are the student's raw, unformatted notes:\n\n${rawNotes}\n\nGenerate the actionable presentation script and provide brief, encouraging feedback if key clinical elements (like vitals or plan) are completely missing.`,
      output: {
        schema: z.object({
           presentationScript: z.string(),
           feedback: z.string().optional()
        })
      }
    });

    return response.output()!;
  }
);
