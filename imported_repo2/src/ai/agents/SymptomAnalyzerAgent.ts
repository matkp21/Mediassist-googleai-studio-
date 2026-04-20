
'use server';
/**
 * @fileOverview An AI agent that analyzes symptoms and provides potential diagnoses,
 * along with suggestions for investigations and initial management.
 *
 * - analyzeSymptoms - A function that takes user-provided symptoms and returns a list of potential diagnoses and suggestions.
 * - SymptomAnalyzerInput - The input type for the analyzeSymptoms function.
 * - SymptomAnalyzerOutput - The return type for the analyzeSymptoms function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { SymptomAnalyzerInputSchema, SymptomAnalyzerOutputSchema } from '@/ai/schemas/symptom-analyzer-schemas';

export type SymptomAnalyzerInput = z.infer<typeof SymptomAnalyzerInputSchema>;
export type SymptomAnalyzerOutput = z.infer<typeof SymptomAnalyzerOutputSchema>;
export type { DiagnosisItem, InvestigationItem } from '@/ai/schemas/symptom-analyzer-schemas';

// Simple in-memory cache - DISABLED TO ENSURE FRESH PROMPTS
// const symptomAnalysisCache = new Map<string, SymptomAnalyzerOutput>();

export async function analyzeSymptoms(input: SymptomAnalyzerInput): Promise<SymptomAnalyzerOutput> {
  // Normalize input for better cache hits (e.g., lowercase, trim)
  // const normalizedInput = {
  //   ...input,
  //   symptoms: input.symptoms.trim().toLowerCase(),
  //   patientContext: input.patientContext ? {
  //     ...input.patientContext,
  //     history: input.patientContext.history?.trim().toLowerCase()
  //   } : undefined
  // };
  // const cacheKey = JSON.stringify(normalizedInput);

  // if (symptomAnalysisCache.has(cacheKey)) {
  //   console.log(`[Cache HIT] Serving cached symptom analysis.`);
  //   return symptomAnalysisCache.get(cacheKey)!;
  // }

  // console.log(`[Cache MISS] Performing new symptom analysis.`);
  const result = await symptomAnalyzerFlow(input); // Use original input for the flow

  // if (result) {
  //   symptomAnalysisCache.set(cacheKey, result);
  // }

  return result;
}

const prompt = ai.definePrompt({
  name: 'symptomAnalyzerPrompt',
  input: {schema: SymptomAnalyzerInputSchema},
  output: {schema: SymptomAnalyzerOutputSchema},
  prompt: `You are an AI medical expert. Based on the symptoms and patient context provided, generate:
1.  A list of potential differential diagnoses. For each diagnosis, include 'name', 'confidence', and 'rationale'.
2.  A prioritized list of suggested investigations for the top likely diagnoses.
3.  A list of suggested initial management steps.
4.  A list of suggested next steps. These should be actionable suggestions for the user, like using a specific study tool. For example, if a likely diagnosis is "Myocardial Infarction", a next step could be to generate study notes for it.

Symptoms: {{{symptoms}}}
{{#if patientContext}}
Patient Context:
  Age: {{{patientContext.age}}}
  Sex: {{{patientContext.sex}}}
  Relevant History: {{{patientContext.history}}}
{{/if}}

Output Format:
Ensure your output strictly adheres to the SymptomAnalyzerOutputSchema JSON structure.
The 'nextSteps' field is mandatory. Generate at least one relevant suggestion.
Example for 'nextSteps' on a diagnosis of Pneumonia:
[
  {
    "title": "Review Pneumonia",
    "description": "Generate comprehensive study notes on Community-Acquired Pneumonia to understand its pathophysiology and management.",
    "toolId": "theorycoach-generator",
    "prefilledTopic": "Community-Acquired Pneumonia",
    "cta": "Generate Study Notes"
  },
  {
    "title": "Practice Questions",
    "description": "Test your knowledge with MCQs on respiratory infections.",
    "toolId": "mcq",
    "prefilledTopic": "Respiratory Infections",
    "cta": "Generate MCQs"
  }
]

Always include a disclaimer that this information is for informational purposes only and not a substitute for professional medical advice.
`,
});

const symptomAnalyzerFlow = ai.defineFlow(
  {
    name: 'symptomAnalyzerFlow',
    inputSchema: SymptomAnalyzerInputSchema,
    outputSchema: SymptomAnalyzerOutputSchema,
  },
  async (input: SymptomAnalyzerInput) => {
    try {
        const {output} = await prompt(input);
        
        const defaultDisclaimer = "This information is for informational purposes only and not a substitute for professional medical advice. Always consult with a qualified healthcare provider for any health concerns or before making any decisions related to your health or treatment.";
        const consultProfessionalMessage = "It is crucial to consult a healthcare professional for an accurate diagnosis and appropriate treatment plan.";

        if (!output) {
        console.error("Symptom analyzer prompt did not return an output.");
        return { 
            diagnoses: [{ name: "Could not determine potential diagnoses at this time. Please consult a medical professional.", confidence: "Unknown", rationale: "AI model did not return expected output." }],
            suggestedInvestigations: [],
            suggestedManagement: [consultProfessionalMessage],
            disclaimer: defaultDisclaimer
        };
        }
        
        const finalOutput = { ...output };

        // Ensure disclaimer is always present
        if (!finalOutput.disclaimer) {
        finalOutput.disclaimer = defaultDisclaimer;
        }

        // Ensure "consult a professional" is in management suggestions
        if (!finalOutput.suggestedManagement) {
            finalOutput.suggestedManagement = [];
        }
        if (!finalOutput.suggestedManagement.some(m => m.toLowerCase().includes("consult a healthcare professional") || m.toLowerCase().includes("consult a medical professional"))) {
            finalOutput.suggestedManagement.push(consultProfessionalMessage);
        }

        return finalOutput;
    } catch (err) {
        console.error(`[SymptomAnalyzerAgent] Error: ${err instanceof Error ? err.message : String(err)}`);
        throw new Error('An unexpected error occurred during symptom analysis. Please try again.');
    }
  }
);
