import { genkit, z } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import * as fs from 'fs/promises';
import * as path from 'path';

const ai = genkit({ plugins: [googleAI()] });

export const ankiDeckGeneratorSkill = ai.defineTool(
  {
    name: 'ankiDeckGenerator',
    description: 'Triggers when a student uploads a textbook chapter or lecture notes and asks for flashcards.',
    inputSchema: z.object({
      sourceText: z.string().describe("The raw text from the textbook or notes"),
    }),
    outputSchema: z.string(),
  },
  async ({ sourceText }) => {
    let skillInstructions = "";
    try {
      skillInstructions = await fs.readFile(
        path.join(process.cwd(), 'skills/medico/anki-deck-generator/SKILL.md'), 'utf-8'
      );
    } catch (e) {
      console.warn("Could not load Anki SKILL.md");
    }

    const { text } = await ai.generate({
      model: ai.model('gemini-2.5-pro'),
      system: `
        You are an expert Anki Flashcard Creator.
        Extract high-yield medical facts from the provided text and format them strictly as a CSV.
        Do not include any conversational filler. Only output exact Question,Answer pairs separated by commas.
        \nSkill Instructions:\n${skillInstructions}
      `,
      prompt: sourceText,
    });

    return text;
  }
);
