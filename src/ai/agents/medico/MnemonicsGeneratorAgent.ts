'use server';

import { ai } from '@/ai/genkit';
import { MedicoMnemonicsGeneratorInputSchema, MedicoMnemonicsGeneratorOutputSchema } from '@/ai/schemas/medico-tools-schemas';
import type { z } from 'zod';
import { GoogleGenAI } from '@google/genai';

export type MedicoMnemonicsGeneratorInput = z.infer<typeof MedicoMnemonicsGeneratorInputSchema>;
export type MedicoMnemonicsGeneratorOutput = z.infer<typeof MedicoMnemonicsGeneratorOutputSchema>;

export async function generateMnemonic(input: MedicoMnemonicsGeneratorInput): Promise<MedicoMnemonicsGeneratorOutput> {
  return mnemonicsGeneratorFlow(input);
}

const mnemonicsGeneratorPrompt = ai.definePrompt({
  name: 'medicoMnemonicsGeneratorPrompt',
  input: { schema: MedicoMnemonicsGeneratorInputSchema },
  output: { schema: MedicoMnemonicsGeneratorOutputSchema },
  prompt: `You are an AI expert in creating mnemonics for medical students. Your primary task is to generate a JSON object containing a mnemonic, its explanation, AND a list of relevant next study steps for the topic: {{{topic}}}.

The JSON object you generate MUST have a 'mnemonic' field, an 'explanation' field, a 'topicGenerated' field, an 'audioPrompt' field, and a 'nextSteps' field.

**JINGLE MNEMONIC GENERATOR:**
In the 'audioPrompt' field, generate a creative text prompt that could be used by an AI music model (like Lyria) to create a catchy, high-energy medical jingle for this mnemonic. The prompt should describe the rhythm, genre (e.g., lo-fi, upbeat pop, educational jingle), and how the mnemonic should be sung.

**CRITICAL: The 'nextSteps' field is mandatory and must not be omitted.** Generate at least two relevant suggestions.

Example for 'nextSteps':
[
  {
    "title": "Create Flashcards",
    "description": "Create flashcards for the items covered by this mnemonic to reinforce learning.",
    "toolId": "flashcards",
    "prefilledTopic": "{{{topic}}}",
    "cta": "Create Flashcards"
  },
  {
    "title": "Generate Study Notes",
    "description": "Generate detailed notes to understand the clinical context behind the topic.",
    "toolId": "theorycoach-generator",
    "prefilledTopic": "{{{topic}}}",
    "cta": "Generate Notes"
  }
]
---

**Instructions for mnemonic generation:**
The mnemonic should be creative and easy-to-remember for the topic: {{{topic}}}.
The explanation should detail what each part of the mnemonic stands for.
The 'topicGenerated' field must be set to "{{{topic}}}".

Example for topic "Cranial Nerves (Order)":
Mnemonic: "Oh Oh Oh To Touch And Feel Very Good Velvet, Ah Heaven"
Explanation:
  Oh: Olfactory (I)
  Oh: Optic (II)
  ...

Format the entire output as a valid JSON object.
`,
  config: {
    temperature: 0.7, // Creative for mnemonics
  }
});

const mnemonicsGeneratorFlow = ai.defineFlow(
  {
    name: 'medicoMnemonicsGeneratorFlow',
    inputSchema: MedicoMnemonicsGeneratorInputSchema,
    outputSchema: MedicoMnemonicsGeneratorOutputSchema,
  },
  async (input) => {
    try {
      // Step 1: Generate the mnemonic text and explanation
      const { output } = await mnemonicsGeneratorPrompt(input);

      if (!output || !output.mnemonic) {
        throw new Error('Failed to generate mnemonic. The AI model did not return the expected output.');
      }
      
      // Step 2: Generate a visual aid using gemini-3.1-flash-image-preview
      try {
         const genAI = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });
         const imagePrompt = `A helpful, clean, educational medical illustration serving as a visual memory aid for the mnemonic "${output.mnemonic}". Topic: ${input.topic}. Visually represent the letters or words in a creative, memorable way suitable for a medical student's flashcard. No text.`;
         
         const imageResponse = await genAI.models.generateContent({
            model: 'gemini-3.1-flash-image-preview',
            contents: { parts: [{ text: imagePrompt }] },
            config: {
               imageConfig: {
                  aspectRatio: "9:16", // Perfect to fit as a phone wallpaper for revision!
                  imageSize: "1K"
               }
            }
         });
         
         if (imageResponse.candidates && imageResponse.candidates[0].content.parts) {
            for (const part of imageResponse.candidates[0].content.parts) {
               if (part.inlineData) {
                  const base64ImageData = part.inlineData.data;
                  output.imageUrl = `data:${part.inlineData.mimeType || 'image/jpeg'};base64,${base64ImageData}`;
                  break;
               }
            }
         }
      } catch (imageErr) {
         console.warn("[Mnemonics Agent] Image generation failed, falling back to text-only mnemonic.", imageErr);
      }
      
      return output;
    } catch (err) {
      console.error(`[MnemonicsGeneratorAgent] Error: ${err instanceof Error ? err.message : String(err)}`);
      throw new Error('An unexpected error occurred while generating the mnemonic. Please try again.');
    }
  }
);
