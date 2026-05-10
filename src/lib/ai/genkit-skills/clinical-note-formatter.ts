import { genkit, z } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import fs from 'fs/promises';
import path from 'path';

const ai = genkit({ plugins: [googleAI()] });

/**
 * PROGRESSIVE DISCLOSURE IMPLEMENTATION
 * This tool acts as the Tier-3 sub-agent. The Master Orchestrator delegates to this tool
 * only when clinical formatting is requested. This prevents the heavy medical rubric 
 * from clogging the main context window during casual conversation.
 */
export const clinicalNoteFormatterSkill = ai.defineTool(
  {
    name: 'clinicalNoteFormatter',
    // The description acts as the YAML frontmatter trigger. 
    // The AI reads this to decide when to activate the skill.
    description: 'Triggers when a medical student asks to write, format, or review a clinical SOAP note or patient history.',
    inputSchema: z.object({
      rawStudentDictation: z.string().describe("The unformatted text provided by the student"),
    }),
    outputSchema: z.string(),
  },
  async ({ rawStudentDictation }) => {
    // PROGRESSIVE DISCLOSURE: 
    // We only read this heavy markdown reference file into memory AFTER the skill is triggered.
    // This saves massive amounts of context window tokens during normal chatting.
    const rubricPath = path.join(process.cwd(), 'skills/medico/clinical-note-formatter/references/medical-rubric.md');
    let gradingRubricAsset = 'Default SOAP format: Subjective, Objective, Assessment, Plan.';
    try {
        gradingRubricAsset = await fs.readFile(rubricPath, 'utf-8');
    } catch (e) {
        console.warn('Could not load rubric, using default.', e);
    }

    // Launch a focused sub-agent that uses the newly loaded reference material
    const { text } = await ai.generate({
      // We leverage the backend model to parse and format the data perfectly
      model: 'gemini-2.5-pro',
      system: `You are a strict Clinical Documentation Expert.
               Format the student's raw dictation into a professional SOAP note.
               You must evaluate and format it strictly against this rubric:
               
               ${gradingRubricAsset}`,
      prompt: rawStudentDictation,
    });

    return text;
  }
);
