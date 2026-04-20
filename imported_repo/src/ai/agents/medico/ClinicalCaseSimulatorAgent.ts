'use server';
/**
 * @fileOverview A Genkit flow for running interactive clinical case simulations for medico users.
 *
 * - simulateClinicalCase - A function that handles the case simulation steps.
 * - MedicoClinicalCaseInput - The input type.
 * - MedicoClinicalCaseOutput - The output type.
 */

import { ai } from '@/ai/genkit';
import { MedicoClinicalCaseInputSchema, MedicoClinicalCaseOutputSchema } from '@/ai/schemas/medico-tools-schemas';
import type { z } from 'zod';

export type MedicoClinicalCaseInput = z.infer<typeof MedicoClinicalCaseInputSchema>;
export type MedicoClinicalCaseOutput = z.infer<typeof MedicoClinicalCaseOutputSchema>;

export async function simulateClinicalCase(input: MedicoClinicalCaseInput): Promise<MedicoClinicalCaseOutput> {
  // This would typically involve retrieving case state from Firestore if input.caseId is present
  return clinicalCaseFlow(input);
}

const clinicalCasePrompt = ai.definePrompt({
  name: 'medicoClinicalCasePrompt',
  input: { schema: MedicoClinicalCaseInputSchema },
  output: { schema: MedicoClinicalCaseOutputSchema },
  prompt: `You are an AI tutor managing a clinical case simulation for a medical student. Your primary task is to generate a JSON object representing the next step in the simulation.

{{#if caseId}}
You are continuing an existing case.
Current Case ID: {{{caseId}}}
Current Topic: {{{topic}}}
Student's last response/action: "{{{userResponse}}}"
---
Your task is to generate a JSON object with the following fields: 'caseId', 'topic', 'prompt', 'feedback', 'isCompleted', 'summary', and 'nextSteps'.

1.  **Analyze the student's response**: Was it appropriate? What are the implications of their action? For example, if they ordered a test, what would the result be? If they suggested a treatment, how would the patient respond?
2.  **Provide Feedback**: Give constructive feedback on the student's response in the 'feedback' field. Explain why it was a good or suboptimal choice. Reference standard guidelines (e.g., NICE, WHO) if relevant.
3.  **Present the Next Step**: Describe the outcome of the student's action (e.g., "The CT scan shows a large pulmonary embolism.") and present the next clinical question in the 'prompt' field (e.g., "Given this new information, what is your immediate management plan?").
4.  **Retain the Topic**: The 'topic' field in the output MUST be set to "{{{topic}}}".
5.  **Conclude if Necessary**: If the student has successfully managed the case or reached a logical conclusion, set 'isCompleted' to true, provide a final 'summary' of the case and key learning points.
6.  **Suggest Next Steps**: If 'isCompleted' is true, you MUST provide a 'nextSteps' field. Format it as a JSON array of objects, each with "title", "description", "toolId", "prefilledTopic", and "cta".

**CRITICAL: The 'nextSteps' field is mandatory if 'isCompleted' is true and must not be omitted.**

Example for 'nextSteps' on completion:
[
  {
    "title": "Review Pathophysiology",
    "description": "Understand the underlying pathophysiology of {{{topic}}}.",
    "toolId": "pathomind",
    "prefilledTopic": "{{{topic}}}",
    "cta": "Explain Pathophysiology"
  },
  {
    "title": "Practice MCQs",
    "description": "Test your knowledge on {{{topic}}} with practice questions.",
    "toolId": "mcq",
    "prefilledTopic": "{{{topic}}}",
    "cta": "Generate MCQs"
  }
]

{{else}}
You are starting a new case.
Topic: {{{topic}}}
---
Your task is to generate a JSON object with the following fields: 'caseId', 'topic', 'prompt', and 'isCompleted'.

1.  **Initiate a New Case**: Create a realistic opening scenario for a clinical case based on the topic: {{{topic}}}.
2.  **Provide Patient Presentation**: Give a clear initial patient presentation (e.g., age, gender, presenting complaint, brief history, vital signs).
3.  **Pose the First Question**: Ask the student for their initial thoughts, priorities, or actions in the 'prompt' field (e.g., "What are your initial assessment priorities?", "What further history would you like to elicit?").
4.  **Initialize State**: Set 'isCompleted' to false. Assign a new unique 'caseId' (e.g., "case-" followed by a random number). The 'topic' field in the output MUST be set to the input topic "{{{topic}}}". 'feedback', 'summary', and 'nextSteps' should be null.

Example for a new case on "Severe Acute Malnutrition":
  Case ID: "case-12345"
  Topic: "Severe Acute Malnutrition"
  Prompt: "A 2-year-old child is brought to the clinic by their mother with complaints of progressive weight loss, lethargy, and frequent loose stools for the past month. On examination, the child appears emaciated with visible rib outlines and loose skin folds. Vital signs are stable. What are your initial assessment priorities?"
  Feedback: null
  Is Completed: false
  Summary: null
{{/if}}

Format the output as JSON conforming to the MedicoClinicalCaseOutputSchema.
`,
  config: {
    temperature: 0.6, // For varied case progression
  }
});

const clinicalCaseFlow = ai.defineFlow(
  {
    name: 'medicoClinicalCaseFlow',
    inputSchema: MedicoClinicalCaseInputSchema,
    outputSchema: MedicoClinicalCaseOutputSchema,
  },
  async (input) => {
    try {
      // Complex logic for managing case state, retrieving case data, evaluating responses, etc.
      // would go here. For now, this is a simplified version.
      // If input.caseId is null/undefined, we need to generate a new caseId.
      const effectiveInput = {
        ...input,
        caseId: input.caseId || `case-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      };

      const { output } = await clinicalCasePrompt(effectiveInput);

      if (!output || !output.prompt || !output.caseId) {
        console.error('MedicoClinicalCasePrompt did not return a valid case step for input:', input);
        throw new Error('Failed to process clinical case simulation. The AI model did not return the expected output.');
      }

      // In a real app, save/update case state in Firestore using output.caseId
      // await db.collection('clinical_cases').doc(output.caseId).set(output, { merge: true });

      return output;
    } catch (err) {
      console.error(`[ClinicalCaseSimulatorAgent] Error: ${err instanceof Error ? err.message : String(err)}`);
      throw new Error('An unexpected error occurred during the case simulation. Please try again.');
    }
  }
);
