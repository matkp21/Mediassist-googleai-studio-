import { genkit, z } from 'genkit';
import { vertexAI } from '@genkit-ai/vertexai'; // Using vertexAI plugin to stay within Vertex trial credits as per our recent setup
import fs from 'fs/promises';
import path from 'path';

// Using the same scoped RAG AI instance to centralize Vertex pricing
const ai = genkit({ plugins: [vertexAI({ location: 'us-central1' })] });

export const clinicalNoteFormatterSkill = ai.defineTool(
  {
    name: 'clinicalNoteFormatter',
    // The description acts as the YAML frontmatter trigger. 
    // The AI reads this to decide when to activate the skill.
    description: 'Triggers when a medical student explicitly asks to write, format, or review a clinical SOAP note, patient history, or dictation. NEGATIVE TRIGGER: Do NOT use if the user just asks for the definition of SOAP or general facts about taking a medical history.',
    inputSchema: z.object({
      rawStudentDictation: z.string().describe("The unformatted text provided by the student"),
    }),
    outputSchema: z.object({
      formattedNote: z.string().describe("The structured SOAP note formatted against the rubric"),
    }),
  },
  async ({ rawStudentDictation }) => {
    // PROGRESSIVE DISCLOSURE: 
    // We only read this heavy markdown reference file into memory AFTER the skill is triggered.
    // This saves massive amounts of context window tokens during normal chatting.
    
    // Resolve path properly so it works regardless of where the server is spun up
    const rubricPath = path.resolve(process.cwd(), 'skills/soap-formatting/references/medical-rubric.md');
    let gradingRubricAsset = '';
    
    try {
      gradingRubricAsset = await fs.readFile(rubricPath, 'utf-8');
    } catch (e) {
      console.error("Failed to load medical rubric asset. Tool must fallback.", e);
      gradingRubricAsset = "Standard SOAP Note guidelines: Subjective, Objective, Assessment, Plan.";
    }

    // Launch a focused sub-agent that uses the newly loaded reference material
    const response = await ai.generate({
      // Preferring vertexai/gemini-2.5-pro for complex diagnostic formatting & reasoning
      model: 'vertexai/gemini-2.5-pro',
      system: `You are a strict Clinical Documentation Expert.
               Format the student's raw dictation into a professional SOAP note.
               You must evaluate and format it strictly against this rubric:
               
               ${gradingRubricAsset}`,
      prompt: `Here is the raw dictation from the student:\n\n${rawStudentDictation}`,
      output: {
        schema: z.object({
           formattedNote: z.string()
        })
      }
    });

    return response.output()!;
  }
);
