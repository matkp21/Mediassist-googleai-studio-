
/**
 * @fileOverview Defines Zod schemas for symptom analysis input and output.
 * These schemas are used by both the symptom analyzer flow and its corresponding tool.
 */
import { z } from 'zod';

const NextStepSchema = z.object({
  title: z.string().describe("The title of the suggested next step."),
  description: z.string().describe("A brief description of what this step entails."),
  toolId: z.string().describe("The unique ID of the tool to be used for this step (e.g., 'mcq', 'flashcards')."),
  prefilledTopic: z.string().describe("The topic to pre-fill in the suggested tool."),
  cta: z.string().describe("The call-to-action text for the button (e.g., 'Generate MCQs')."),
});

export const PatientContextSchema = z.object({
  age: z.number().int().positive().optional().describe('Patient age in years.'),
  sex: z.enum(['male', 'female', 'other']).optional().describe('Patient biological sex.'),
  history: z.string().optional().describe('Brief relevant medical history or context.'),
}).optional();

export const SymptomAnalyzerInputSchema = z.object({
  symptoms: z.string().min(10, { message: "Symptoms description must be at least 10 characters." }).describe('The symptoms the user is experiencing.'),
  patientContext: PatientContextSchema,
});

export const InvestigationSchema = z.object({
  name: z.string().describe('Name of the suggested investigation (e.g., "Chest X-ray", "CBC").'),
  rationale: z.string().optional().describe('Brief reason why this investigation is suggested.'),
});
export type InvestigationItem = z.infer<typeof InvestigationSchema>;


export const DiagnosisItemSchema = z.object({
  name: z.string().describe('The name of the potential diagnosis.'),
  confidence: z.enum(['High', 'Medium', 'Low', 'Possible']).optional().describe('The AI s confidence level for this diagnosis.'),
  rationale: z.string().optional().describe('A brief rationale for considering this diagnosis, including any red flags if applicable.'),
});
export type DiagnosisItem = z.infer<typeof DiagnosisItemSchema>;

export const SymptomAnalyzerOutputSchema = z.object({
  diagnoses: z.array(DiagnosisItemSchema).describe('A list of potential differential diagnoses, each with a name, optional confidence, and optional rationale.'),
  suggestedInvestigations: z.array(InvestigationSchema).optional().describe('A list of suggested investigations for the top likely diagnoses, each with a name and optional rationale.'),
  suggestedManagement: z.array(z.string()).optional().describe('A list of suggested initial management steps or considerations.'),
  nextSteps: z.array(NextStepSchema).optional().describe('A list of suggested next steps for the user, such as using a study tool.'),
  disclaimer: z.string().optional().describe('A standard disclaimer advising consultation with a medical professional.'),
});
