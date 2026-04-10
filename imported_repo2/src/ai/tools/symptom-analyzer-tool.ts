
'use server';
/**
 * @fileOverview Tool for analyzing symptoms using the symptomAnalyzerFlow.
 * This tool is intended to be used by other Genkit flows, such as a chat flow,
 * to allow an LLM to decide when to trigger symptom analysis.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { analyzeSymptoms as analyzeSymptomsFlow } from '@/ai/agents/SymptomAnalyzerAgent';
import { SymptomAnalyzerInputSchema, SymptomAnalyzerOutputSchema } from '@/ai/schemas/symptom-analyzer-schemas';

export const symptomAnalyzerTool = ai.defineTool(
  {
    name: 'symptomAnalyzer',
    description: 'Analyzes a list of symptoms to provide potential medical considerations. Use this tool when a user explicitly describes medical symptoms they are experiencing or asks for an analysis of symptoms.',
    inputSchema: SymptomAnalyzerInputSchema,
    outputSchema: SymptomAnalyzerOutputSchema,
  },
  async (input: z.infer<typeof SymptomAnalyzerInputSchema>) => {
    // This directly calls the exported async function which internally calls the flow
    return analyzeSymptomsFlow(input);
  }
);
