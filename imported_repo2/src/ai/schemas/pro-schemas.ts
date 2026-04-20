// src/ai/schemas/pro-schemas.ts
/**
 * @fileOverview Defines Zod schemas for Professional Mode specific tools.
 */
import { z } from 'zod';
import { SymptomAnalyzerOutputSchema } from './symptom-analyzer-schemas';

// Schema for Discharge Summary Generator
export const DischargeSummaryInputSchema = z.object({
  patientName: z.string().optional().describe("Patient's full name."),
  patientAge: z.string().optional().describe("Patient's age (e.g., '45 years', '6 months')."),
  admissionNumber: z.string().min(1, {message: "Admission/OPD number is required."}).describe("Unique patient admission or OPD number for context."),
  primaryDiagnosis: z.string().min(3, {message: "Primary diagnosis is required."}).describe("The main confirmed diagnosis for this hospital episode, e.g., 'Acute Myocardial Infarction', 'Community-Acquired Pneumonia'."),
  keySymptomsOrProcedure: z.string().optional().describe("Key presenting symptoms OR the primary procedure performed, e.g., 'Severe abdominal pain, fever', 'Laparoscopic Cholecystectomy'."),
  additionalContext: z.string().optional().describe("Any other brief notes or context the doctor wants to provide to guide the summary generation, e.g., 'Complicated by post-op infection', 'Patient has multiple comorbidities'.")
});
export type DischargeSummaryInput = z.infer<typeof DischargeSummaryInputSchema>;

export const DischargeSummaryOutputSchema = z.object({
  hospitalCourse: z.string().describe("A narrative summary of the patient's hospital stay, including reason for admission, key findings, treatments, response, and condition at discharge. Should be based on the provided clinical anchors."),
  dischargeMedications: z.array(z.string()).describe("A list of medications prescribed at discharge, including drug name, dose, route, frequency, and duration. Predict standard medications based on diagnosis/procedure."),
  followUpPlans: z.array(z.string()).describe("Instructions for follow-up appointments (GP, specialist), further tests, or monitoring required post-discharge."),
  patientEducation: z.array(z.string()).describe("Key educational points provided to the patient regarding their condition, medications, lifestyle modifications, or self-care."),
  redFlags: z.array(z.string()).describe("Critical 'red flag' symptoms the patient should watch for that would warrant seeking urgent medical attention."),
  notesForDoctor: z.string().optional().describe("Any specific notes, suggestions, or reminders from the AI for the reviewing doctor. This is for the AI to provide meta-comments to the clinician, e.g., 'Consider checking renal function before starting Drug X if not already done.'")
});
export type DischargeSummaryOutput = z.infer<typeof DischargeSummaryOutputSchema>;


// Schema for the Triage and Referral Coordinator Agent
export const TriageAndReferralOutputSchema = z.object({
  analysis: SymptomAnalyzerOutputSchema.describe("The initial symptom analysis result."),
  referralDraft: DischargeSummaryOutputSchema.optional().describe("The drafted referral summary, generated only if a high-confidence diagnosis was found."),
});

// Schema for Patient Communication Drafter
export const PatientCommunicationInputSchema = z.object({
  patientName: z.string().optional().describe("Patient's name for personalization."),
  communicationType: z.string().describe("The type of communication, e.g., 'Diagnosis Explanation', 'Treatment Plan Overview'."),
  keyPoints: z.string().describe("The core clinical information to convey."),
  tone: z.enum(['empathetic_clear', 'formal_concise', 'reassuring_simple']).describe("The desired tone of the message."),
});
export type PatientCommunicationInput = z.infer<typeof PatientCommunicationInputSchema>;

export const PatientCommunicationOutputSchema = z.object({
  draftedCommunication: z.string().describe("The AI-generated, patient-friendly communication draft."),
});
export type PatientCommunicationOutput = z.infer<typeof PatientCommunicationOutputSchema>;


// Schema for On-Call Handover Assistant
const HandoverPatientSchema = z.object({
  name: z.string(),
  wardBed: z.string(),
  diagnosis: z.string(),
  currentIssues: z.string(),
  tasksPending: z.array(z.string()),
  ifThenScenarios: z.array(z.string()),
  escalationContact: z.string(),
});
export const OnCallHandoverInputSchema = z.object({
  patients: z.array(HandoverPatientSchema),
});
export type OnCallHandoverInput = z.infer<typeof OnCallHandoverInputSchema>;

export const OnCallHandoverOutputSchema = z.object({
  summaryText: z.string().describe("A structured handover summary in Markdown format."),
});
export type OnCallHandoverOutput = z.infer<typeof OnCallHandoverOutputSchema>;
