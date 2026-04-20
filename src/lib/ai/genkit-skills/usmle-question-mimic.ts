import { genkit, z } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import fs from 'fs/promises';
import path from 'path';

const ai = genkit({ plugins: [googleAI()] });

/**
 * PROGRESSIVE DISCLOSURE IMPLEMENTATION for USMLE Question Mimic
 * Triggers only when a student requires strict USMLE/NBME style board questions.
 */
export const usmleQuestionMimicSkill = ai.defineTool(
  {
    name: 'usmleQuestionMimic',
    description: 'Triggers when a student requests practice questions or board-style exam questions for a specific pathology.',
    inputSchema: z.object({
      pathologyOrTopic: z.string().describe("The specific disease, organ system, or medical topic the student wants to be tested on."),
      difficulty: z.enum(['Step 1', 'Step 2 CK', 'Step 3']).describe("The USMLE Step level of difficulty requested."),
    }),
    outputSchema: z.string(),
  },
  async ({ pathologyOrTopic, difficulty }) => {
    // PROGRESSIVE DISCLOSURE: 
    // Dynamically read the demanding NBME formatting rules only when a question is being generated.
    const rubricPath = path.join(process.cwd(), 'skills/medico/usmle-question-mimic/references/nbme-style-guide.md');
    let nbmeStyleGuide = 'Generate a multiple choice question.';
    try {
        nbmeStyleGuide = await fs.readFile(rubricPath, 'utf-8');
    } catch (e) {
        console.warn('Could not load NBME style guide.', e);
    }

    const { text } = await ai.generate({
      model: ai.model('gemini-2.5-pro'),
      system: `You are an expert item writer for the National Board of Medical Examiners (NBME).
               Your task is to write a high-fidelity clinical vignette to test the student on the requested topic.
               You must adhere strictly to the following NBME formatting and explanation rules:
               
               ${nbmeStyleGuide}`,
      prompt: `Please generate a ${difficulty}-level USMLE question testing the topic: ${pathologyOrTopic}. Include the question, 5 homogeneous options (A-E), the correct answer, and a detailed explanation for both the correct answer and why every single distractor is incorrect.`,
    });

    return text;
  }
);
