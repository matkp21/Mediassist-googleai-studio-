// src/ai/agents/pro/PatientCommunicationDrafterAgent.ts
'use server';
/**
 * @fileOverview An AI agent to draft patient-facing communications.
 *
 * - draftPatientCommunication - A function that takes clinical points and drafts a patient-friendly message.
 * - PatientCommunicationInput - The input type for the flow.
 * - PatientCommunicationOutput - The return type for the flow.
 */

import { ai } from '@/ai/genkit';
import { PatientCommunicationInputSchema, PatientCommunicationOutputSchema } from '@/ai/schemas/pro-schemas';
import type { z } from 'zod';

export type PatientCommunicationInput = z.infer<typeof PatientCommunicationInputSchema>;
export type PatientCommunicationOutput = z.infer<typeof PatientCommunicationOutputSchema>;

export async function draftPatientCommunication(input: PatientCommunicationInput): Promise<PatientCommunicationOutput> {
  return patientCommunicationDrafterFlow(input);
}

const patientCommunicationPrompt = ai.definePrompt({
  name: 'patientCommunicationPrompt',
  input: { schema: PatientCommunicationInputSchema },
  output: { schema: PatientCommunicationOutputSchema },
  prompt: `You are a compassionate medical communications AI. Your task is to draft a message for a patient based on the provided clinical information. The message should be clear, easy to understand, and use the specified tone.

**Patient Name:** {{{patientName}}}
**Communication Type:** {{{communicationType}}}
**Desired Tone:** {{{tone}}}
**Key Points to Convey:**
{{{keyPoints}}}

---
Instructions:
1.  Address the patient by name.
2.  Clearly state the purpose of the communication (e.g., explaining a diagnosis, outlining a treatment plan).
3.  Incorporate the "Key Points" into the message, translating any clinical jargon into simple, patient-friendly language.
4.  Adopt the specified tone throughout the message:
    - **Empathetic & Clear:** Use warm, understanding language while being direct and unambiguous.
    - **Formal & Concise:** Be professional, direct, and to the point.
    - **Reassuring & Simple:** Use simple words and a calm, positive tone to reduce anxiety.
5.  End with a closing statement, such as inviting them to ask questions.
6.  Sign off from "Your Healthcare Team".

Generate the complete patient message as a single string.
`,
  config: {
    temperature: 0.7, // More creative for nuanced communication
  },
});

const patientCommunicationDrafterFlow = ai.defineFlow(
  {
    name: 'patientCommunicationDrafterFlow',
    inputSchema: PatientCommunicationInputSchema,
    outputSchema: PatientCommunicationOutputSchema,
  },
  async (input: PatientCommunicationInput) => {
    try {
      const { output } = await patientCommunicationPrompt(input);
      if (!output || !output.draftedCommunication) {
        throw new Error('AI failed to generate a patient communication draft.');
      }
      return output;
    } catch (err) {
      console.error(`[PatientCommunicationDrafterAgent] Error: ${err instanceof Error ? err.message : String(err)}`);
      throw new Error('An unexpected error occurred while drafting the communication.');
    }
  }
);
