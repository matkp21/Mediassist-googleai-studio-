// src/ai/agents/pro/OnCallHandoverAssistantAgent.ts
'use server';
/**
 * @fileOverview An AI agent to generate a structured handover summary from a list of patients.
 *
 * - generateHandoverSummary - A function that takes a list of patient data and returns a structured markdown summary.
 * - OnCallHandoverInput - The input type for the flow.
 * - OnCallHandoverOutput - The return type for the flow.
 */

import { ai } from '@/ai/genkit';
import { OnCallHandoverInputSchema, OnCallHandoverOutputSchema } from '@/ai/schemas/pro-schemas';
import type { z } from 'zod';

export type OnCallHandoverInput = z.infer<typeof OnCallHandoverInputSchema>;
export type OnCallHandoverOutput = z.infer<typeof OnCallHandoverOutputSchema>;

export async function generateHandoverSummary(input: OnCallHandoverInput): Promise<OnCallHandoverOutput> {
  return onCallHandoverFlow(input);
}

const onCallHandoverPrompt = ai.definePrompt({
  name: 'onCallHandoverPrompt',
  input: { schema: OnCallHandoverInputSchema },
  output: { schema: OnCallHandoverOutputSchema },
  prompt: `You are an expert medical AI assistant helping a doctor draft a clear and concise on-call handover document based on a provided list of patients.

The handover document should be in Markdown format. For each patient, create a distinct section.

Follow this structure for each patient:

- **Patient:** [Patient Name] ([Ward/Bed])
- **Diagnosis:** [Diagnosis]
- **Current Issues/Watchpoints:**
  - [List of key issues]
- **Pending Tasks:**
  - [List of pending tasks]
- **If/Then Scenarios:** (Explicit instructions for the on-call doctor)
  - [List of if/then scenarios]
- **Escalation Contact:** [Contact Person/Protocol]

Here is the patient data:
{{#each patients}}
---
Patient Name: {{{this.name}}}
Ward/Bed: {{{this.wardBed}}}
Diagnosis: {{{this.diagnosis}}}
Current Issues: {{{this.currentIssues}}}
Pending Tasks: {{#each this.tasksPending}} - {{{this}}}{{/each}}
If/Then Scenarios: {{#each this.ifThenScenarios}} - {{{this}}}{{/each}}
Escalation Contact: {{{this.escalationContact}}}
{{/each}}
---

Generate a single Markdown string containing the full, structured handover for all patients. Ensure it is clear, well-organized, and ready for a clinical setting.
`,
  config: {
    temperature: 0.2, // Factual and structured
  },
});

const onCallHandoverFlow = ai.defineFlow(
  {
    name: 'onCallHandoverFlow',
    inputSchema: OnCallHandoverInputSchema,
    outputSchema: OnCallHandoverOutputSchema,
  },
  async (input: OnCallHandoverInput) => {
    try {
      const { output } = await onCallHandoverPrompt(input);
      if (!output || !output.summaryText) {
        throw new Error('AI failed to generate a handover summary.');
      }
      return output;
    } catch (err) {
      console.error(`[OnCallHandoverAgent] Error: ${err instanceof Error ? err.message : String(err)}`);
      throw new Error('An unexpected error occurred while generating the handover summary.');
    }
  }
);
