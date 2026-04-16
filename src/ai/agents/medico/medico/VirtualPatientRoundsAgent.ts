'use server';
/**
 * @fileOverview A Genkit flow for simulating virtual patient rounds for medico users.
 *
 * - conductVirtualRound - A function that handles the virtual round interaction.
 * - MedicoVirtualRoundsInput - The input type.
 * - MedicoVirtualRoundsOutput - The output type.
 */

import { ai } from '@/ai/genkit';
import { MedicoVirtualRoundsInputSchema, MedicoVirtualRoundsOutputSchema } from '@/ai/schemas/medico-tools-schemas';
import type { z } from 'zod';

export type MedicoVirtualRoundsInput = z.infer<typeof MedicoVirtualRoundsInputSchema>;
export type MedicoVirtualRoundsOutput = z.infer<typeof MedicoVirtualRoundsOutputSchema>;

export async function conductVirtualRound(input: MedicoVirtualRoundsInput): Promise<MedicoVirtualRoundsOutput> {
  // This would involve retrieving/updating patient case state from Firestore if input.caseId is present
  return virtualPatientRoundsFlow(input);
}

const virtualPatientRoundsPrompt = ai.definePrompt({
  name: 'medicoVirtualRoundsPrompt',
  input: { schema: MedicoVirtualRoundsInputSchema },
  output: { schema: MedicoVirtualRoundsOutputSchema },
  prompt: `You are an AI medical preceptor conducting a virtual patient round with a medical student. Your primary task is to generate a JSON object representing the next step in the round.

{{#if caseId}}
Current Patient Case ID: {{{caseId}}}
Current Topic: {{{patientFocus}}}
Student's last action/query: "{{{userAction}}}"
---
Your task is to generate a JSON object with the following fields: 'caseId', 'topic', 'patientSummary', 'currentObservation', 'nextPrompt', 'isCompleted', and potentially 'nextSteps'.

1. Update the 'patientSummary'.
2. Provide the 'currentObservation' resulting from the student's action.
3. Give the 'nextPrompt' to guide the student (e.g., "What investigations would you order next?", "How would you manage this finding?").
4. Retain the topic: The 'topic' field MUST be set to "{{{patientFocus}}}".
5. Update 'isCompleted' if this encounter is finished.
6. **Suggest Next Steps**: If 'isCompleted' is true, you MUST provide a 'nextSteps' field. Format it as a JSON array of objects, each with "title", "description", "toolId", "prefilledTopic", and "cta".

**CRITICAL: The 'nextSteps' field is mandatory if 'isCompleted' is true and must not be omitted.**

Example for 'nextSteps' on completion:
[
  {
    "title": "Review Topic",
    "description": "Generate study notes for the case topic to consolidate your learning.",
    "toolId": "theorycoach-generator",
    "prefilledTopic": "{{{patientFocus}}}",
    "cta": "Generate Notes"
  },
  {
    "title": "Practice Another Case",
    "description": "Start a new interactive case simulation on a related topic.",
    "toolId": "cases",
    "prefilledTopic": "{{{patientFocus}}}",
    "cta": "Start New Simulation"
  }
]

{{else}}
New Virtual Round / New Patient.
Focus for new patient (if any): "{{{patientFocus}}}"
---
Your task is to generate a JSON object with 'caseId', 'topic', 'patientSummary', 'currentObservation', 'nextPrompt', and 'isCompleted' fields.

1. Assign a new unique 'caseId' (e.g., "vround-pat-{{timestamp_id}}").
2. Create an initial 'patientSummary' (e.g., "65-year-old male admitted with chest pain...").
3. Set 'currentObservation' to an initial presentation point.
4. Provide the 'nextPrompt' for the student's first action (e.g., "What are your initial thoughts or questions for this patient?").
5. Set 'isCompleted' to false.
6. Set the output 'topic' to be the same as the input 'patientFocus'.
7. 'nextSteps' should be null on case initiation.

Example for a new patient (focus: "Pediatric Asthma Exacerbation"):
  Case ID: "vround-pat-123"
  Topic: "Pediatric Asthma Exacerbation"
  Patient Summary: "A 7-year-old known asthmatic presents to the ER with increasing shortness of breath, wheezing, and cough for 6 hours. No fever. Last nebulization 2 hours ago with minimal relief."
  Current Observation: "Patient is sitting upright, using accessory muscles of respiration. RR 30/min, SpO2 92% on room air. Audible expiratory wheezes bilaterally."
  Next Prompt: "What is your immediate management plan for this child?"
  Is Completed: false
{{/if}}

Format the output as JSON conforming to the MedicoVirtualRoundsOutputSchema.
`,
  config: {
    temperature: 0.6, // For varied patient scenarios and responses
  }
});

const virtualPatientRoundsFlow = ai.defineFlow(
  {
    name: 'medicoVirtualPatientRoundsFlow',
    inputSchema: MedicoVirtualRoundsInputSchema,
    outputSchema: MedicoVirtualRoundsOutputSchema,
  },
  async (input) => {
    try {
      // Complex logic for managing patient state, different scenarios, etc.
      // would go here. This is a simplified version.
      const effectiveInput = {
        ...input,
        caseId: input.caseId || `vround-pat-${Date.now()}`, // Generate a new caseId if not provided
      };

      const { output } = await virtualPatientRoundsPrompt(effectiveInput);

      if (!output || !output.caseId || !output.patientSummary || !output.currentObservation || !output.nextPrompt) {
        console.error('MedicoVirtualRoundsPrompt did not return a valid round step for input:', input);
        throw new Error('Failed to process virtual patient round. The AI model did not return the expected output.');
      }

      // In a real app, save/update patient case state in Firestore using output.caseId
      // await db.collection('virtual_rounds_cases').doc(output.caseId).set(output, { merge: true });

      return output;
    } catch (err) {
      console.error(`[VirtualPatientRoundsAgent] Error: ${err instanceof Error ? err.message : String(err)}`);
      throw new Error('An unexpected error occurred during the virtual round. Please try again.');
    }
  }
);
