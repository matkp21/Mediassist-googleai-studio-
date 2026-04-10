'use server';
/**
 * @fileOverview A Genkit flow for generating mnemonics for medical topics for medico users.
 *
 * - generateMnemonic - A function that handles mnemonic generation.
 * - MedicoMnemonicsGeneratorInput - The input type.
 * - MedicoMnemonicsGeneratorOutput - The output type.
 */

import { ai } from '@/ai/genkit';
import { MedicoMnemonicsGeneratorInputSchema, MedicoMnemonicsGeneratorOutputSchema } from '@/ai/schemas/medico-tools-schemas';
import type { z } from 'zod';

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

The JSON object you generate MUST have a 'mnemonic' field, an 'explanation' field, a 'topicGenerated' field, and a 'nextSteps' field.

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
The 'imageUrl' field can be omitted or set to null as image generation is currently disabled.

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
        console.error('MedicoMnemonicsGeneratorPrompt did not return a valid mnemonic for topic:', input.topic);
        throw new Error('Failed to generate mnemonic. The AI model did not return the expected output.');
      }
      
      // Step 2: Image generation is disabled. Ensure the field is not present.
      output.imageUrl = undefined;
      
      return output;
    } catch (err) {
      console.error(`[MnemonicsGeneratorAgent] Error: ${err instanceof Error ? err.message : String(err)}`);
      throw new Error('An unexpected error occurred while generating the mnemonic. Please try again.');
    }
  }
);
