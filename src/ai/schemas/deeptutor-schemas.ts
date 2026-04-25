import { z } from 'zod';

export const NextStepActionSchema = z.enum([
 'create_soap_note',
 'generate_mcq',
 'generate_flashcards',
 'clinical_simulation',
 'generate_study_notes',
 'view_algorithm',
 'socratic_viva',
 'data_science_practice'
]);

export type NextStepAction = z.infer<typeof NextStepActionSchema>;

export const MedicoDashboardOutputSchema = z.object({
  answer: z.string().describe("The direct educational answer to the student's query."),
  suggestedNextSteps: z.array(NextStepActionSchema).describe("1 to 3 logical follow-up actions to drive the study session forward.")
});

export const StudyProgressFactSchema = z.object({
  subject: z.string(),
  concept: z.string(),
  masteryLevel: z.enum(['weak', 'needs_review', 'mastered']),
  fact: z.string().describe('A concise note on what the student struggled with or understood.'),
});

export type StudyProgressFact = z.infer<typeof StudyProgressFactSchema>;
