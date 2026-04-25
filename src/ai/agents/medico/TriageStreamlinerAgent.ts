'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { GoogleGenAI } from '@google/genai';

const TriageStreamlinerInputSchema = z.object({
  patientSymptoms: z.string().min(10, 'Please provide patient symptoms.'),
  location: z.string().min(2, 'Please provide the patient/clinic location (e.g., "San Francisco", "123 Main St, NY").'),
  specialtyNeeded: z.string().optional()
});

const NextStepSchema = z.object({
  title: z.string(),
  description: z.string(),
  toolId: z.string(),
  prefilledTopic: z.string(),
  cta: z.string()
});

const TriageStreamlinerOutputSchema = z.object({
  triageAssessment: z.string(),
  recommendedSpecialty: z.string(),
  facilityRecommendations: z.array(z.object({
    name: z.string(),
    address: z.string(),
    estimatedDistanceOrTime: z.string().optional(),
    reason: z.string()
  })),
  referralLetterDraft: z.string(),
  nextSteps: z.array(NextStepSchema)
});

export type TriageStreamlinerInput = z.infer<typeof TriageStreamlinerInputSchema>;
export type TriageStreamlinerOutput = z.infer<typeof TriageStreamlinerOutputSchema>;

const googleGenAi = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });

const triagePrompt = ai.definePrompt({
  name: 'triageStreamlinerPrompt',
  input: { schema: TriageStreamlinerInputSchema },
  output: { schema: TriageStreamlinerOutputSchema },
  prompt: `You are an AI Triage and Referral Assistant. Your task is to triage a patient based on their symptoms, recommend the necessary medical specialty, use Google Maps to find nearby suitable facilities based on the user's location, and draft a referral letter.

Input:
Patient Symptoms: "{{patientSymptoms}}"
Location: "{{location}}"
Specialty Requested (if any): "{{specialtyNeeded}}"

Steps to follow:
1. Assess the urgency and suggest the appropriate specialty (e.g., Cardiology, Emergency Room, Orthopedics).
2. USE THE GOOGLE MAPS TOOL to search for "nearby {{specialtyNeeded}} or [Recommended Specialty] near {{location}}". If the requested specialty is an emergency, search for "nearest Emergency Room to {{location}}".
3. Extract 2-3 suitable facilities from the Maps results, including their actual name and address.
4. Draft a concise, professional patient referral letter addressed to "To the Duty Officer" or "Dear Colleague", incorporating the symptoms.
5. Generate 2 next steps for the user.

Output JSON format strictly conforming to TriageStreamlinerOutputSchema.
`
});

export const runTriageStreamliner = ai.defineFlow(
  {
    name: 'runTriageStreamliner',
    inputSchema: TriageStreamlinerInputSchema,
    outputSchema: TriageStreamlinerOutputSchema,
  },
  async (input) => {
    try {
      const renderedPrompt = await triagePrompt.render({ ...input });
      const promptString = renderedPrompt.messages[0].content[0].text || '';

      const response = await googleGenAi.models.generateContent({
        model: 'gemini-3.1-flash-preview',
        contents: promptString,
        config: {
          responseMimeType: 'application/json',
          tools: [{ googleMaps: {} }],
          toolConfig: { includeServerSideToolInvocations: true }
        }
      });

      const output = JSON.parse(response.text || '{}');
      return output as TriageStreamlinerOutput;
    } catch (err) {
      console.error('[TriageStreamlinerAgent] Error:', err);
      throw new Error('Failed to process triage and referral. Please try again.');
    }
  }
);
