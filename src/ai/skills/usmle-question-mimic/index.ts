import { genkit, z } from 'genkit';
import { vertexAI } from '@genkit-ai/vertexai';
import fs from 'fs/promises';
import path from 'path';

// Using the same scoped RAG AI instance to centralize Vertex pricing
const ai = genkit({ plugins: [vertexAI({ location: 'us-central1' })] });

export const usmleQuestionMimicSkill = ai.defineTool(
  {
    name: 'usmleQuestionMimic',
    // The description matches the YAML frontmatter concept triggering the skill
    description: 'Triggers when a student explicitly requests practice questions, MCQs, or simulated clinical vignettes for exam prep. NEGATIVE TRIGGER: Do NOT use if the student only asks for a simple definition, treatment guideline, or factual explanation of a disease.',
    inputSchema: z.object({
      topic: z.string().describe("The specific pathology, system, or disease requested by the student (e.g., 'Heart Failure', 'Renal Physiology', 'Macrolides')"),
      difficulty: z.enum(['Step 1', 'Step 2 CK', 'Step 3']).optional().describe("The requested board level difficulty, if specified"),
    }),
    outputSchema: z.object({
      vignette: z.string().describe("The complete clinical vignette stem and question lead-in"),
      options: z.array(z.string()).describe("Exactly 5 homogenous answer options (A, B, C, D, E)"),
      correctAnswer: z.string().describe("The exact text of the correct option"),
      explanation: z.string().describe("Detailed explanation justifying the correct answer and debunking each distractor"),
    }),
  },
  async ({ topic, difficulty = 'Step 2 CK' }) => {
    // PROGRESSIVE DISCLOSURE: 
    // We only read this heavy NBME formatting markdown file into memory AFTER the skill is triggered.
    const rubricPath = path.resolve(process.cwd(), 'src/ai/skills/usmle-question-mimic/references/nbme-style-guide.md');
    let nbmeStyleGuide = '';
    
    try {
      nbmeStyleGuide = await fs.readFile(rubricPath, 'utf-8');
    } catch (e) {
      console.warn("Failed to load NBME rubric asset. Falling back to default generation.", e);
      nbmeStyleGuide = "Standard USMLE Vignette guidelines: Provide patient demographics, Vitals, Physical Exam, Labs. No buzzwords.";
    }

    // Launch a focused sub-agent that uses the newly loaded reference material
    const response = await ai.generate({
      // Preferring vertexai/gemini-2.5-pro for deep clinical reasoning and distractor generation
      model: 'vertexai/gemini-2.5-pro',
      system: `You are an expert Question Writer for the National Board of Medical Examiners (NBME).
               You are writing a ${difficulty} level multiple-choice question on the topic: ${topic}.
               
               You MUST evaluate and format your output strictly against this style guide:
               
               ${nbmeStyleGuide}`,
      prompt: `Generate a highly realistic, challenging clinical vignette and question for the topic: ${topic}. Do not use buzzwords. Force the student into a 2-step clinical reasoning process.`,
      output: {
        schema: z.object({
           vignette: z.string(),
           options: z.array(z.string()).length(5),
           correctAnswer: z.string(),
           explanation: z.string()
        })
      }
    });

    return response.output()!;
  }
);
