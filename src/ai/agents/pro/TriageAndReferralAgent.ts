
'use server';
/**
 * @fileOverview An orchestrator agent that chains multiple agents together.
 * This agent first performs a triage/symptom analysis and, if a high-confidence
 * diagnosis is found, proceeds to generate a referral summary.
 *
 * - triageAndReferral - The main orchestrator flow.
 * - TriageAndReferralOutput - The combined output from multiple agents.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import {
  SymptomAnalyzerInputSchema,
  SymptomAnalyzerOutputSchema,
} from '@/ai/schemas/symptom-analyzer-schemas';
import {
  DischargeSummaryOutputSchema,
} from '@/ai/schemas/pro-schemas';
import { analyzeSymptoms } from '@/ai/agents/SymptomAnalyzerAgent';
import { generateDischargeSummary } from '@/ai/agents/pro/DischargeSummaryGeneratorAgent';
import { TriageAndReferralOutputSchema } from '@/ai/schemas/pro-schemas';
import type { SymptomAnalyzerInput } from '@/ai/schemas/symptom-analyzer-schemas';

export type TriageAndReferralOutput = z.infer<
  typeof TriageAndReferralOutputSchema
>;

export async function triageAndReferral(
  input: SymptomAnalyzerInput
): Promise<TriageAndReferralOutput> {
  return triageAndReferralFlow(input);
}


const triageAndReferralFlow = ai.defineFlow(
  {
    name: 'triageAndReferralFlow',
    inputSchema: SymptomAnalyzerInputSchema,
    outputSchema: TriageAndReferralOutputSchema,
  },
  async (input) => {
    try {
      // Step 1: Call the Symptom Analyzer Agent
      console.log("Starting triage analysis for:", input.symptoms);
      const analysisResult = await analyzeSymptoms(input);

      // Step 2: Check the result for a high-confidence diagnosis
      const highConfidenceDiagnosis = analysisResult.diagnoses.find(
        (d) => d.confidence === 'High'
      );
      
      let referralDraftResult: z.infer<typeof DischargeSummaryOutputSchema> | undefined = undefined;

      // Step 3: If a high-confidence diagnosis exists, call the Discharge Summary Agent to draft a referral
      if (highConfidenceDiagnosis) {
          console.log(`High-confidence diagnosis found: ${highConfidenceDiagnosis.name}. Generating referral draft.`);
          // Construct a new input for the summary generator based on the analysis
          const summaryInput = {
              primaryDiagnosis: highConfidenceDiagnosis.name,
              keySymptomsOrProcedure: input.symptoms,
              additionalContext: `Patient Age: ${input.patientContext?.age || 'N/A'}, Sex: ${input.patientContext?.sex || 'N/A'}. Rationale for referral: ${highConfidenceDiagnosis.rationale || 'High confidence on initial analysis.'}`,
              // These fields are required by the schema but can be empty for a referral draft
              patientName: "Patient", 
              admissionNumber: "N/A"
          };
          
          // This simulates generating a referral letter by using the discharge summary agent's capabilities
          referralDraftResult = await generateDischargeSummary(summaryInput);
      } else {
          console.log("No high-confidence diagnosis found. Skipping referral draft.");
      }

      // Step 4: Return the combined output
      return {
        analysis: analysisResult,
        referralDraft: referralDraftResult,
      };
    } catch (err) {
      console.error(`[TriageAndReferralAgent] Error: ${err instanceof Error ? err.message : String(err)}`);
      throw new Error('An unexpected error occurred during the triage process. Please try again.');
    }
  }
);
