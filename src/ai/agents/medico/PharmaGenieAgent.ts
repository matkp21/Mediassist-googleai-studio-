'use server';
/**
 * @fileOverview The PharmaGenie agent, for providing drug information.
 *
 * - getDrugInfo - A function that handles the drug information process.
 * - PharmaGenieInput - The input type for the agent.
 * - PharmaGenieOutput - The return type from the agent.
 */

import { ai } from '@/ai/genkit';
import { PharmaGenieInputSchema, PharmaGenieOutputSchema } from '@/ai/schemas/medico-tools-schemas';
import type { z } from 'zod';

export type PharmaGenieInput = z.infer<typeof PharmaGenieInputSchema>;
export type PharmaGenieOutput = z.infer<typeof PharmaGenieOutputSchema>;

export async function getDrugInfo(input: PharmaGenieInput): Promise<PharmaGenieOutput> {
  return pharmaGenieFlow(input);
}

import { fdaInteractTool, fdaAdverseEventsTool } from '@/ai/tools/mcpTools';

const pharmaGeniePrompt = ai.definePrompt({
  name: 'medicoPharmaGeniePrompt',
  input: { schema: PharmaGenieInputSchema },
  output: { schema: PharmaGenieOutputSchema },
  tools: [fdaInteractTool, fdaAdverseEventsTool],
  prompt: `You are PharmaGenie, an AI expert in pharmacology utilizing MCP-standardized OpenFDA servers.
  Task: Provide detailed drug information for "{{{drugName}}}".
  
  Instructions:
  1. Use 'fda_search_drug_interactions' to check for conflicts if user mentions multiple drugs.
  2. Use 'fda_get_adverse_events' to retrieve real-world reporter data.
  3. Synthesize the JSON-RPC tool responses into a structured pharmacological review.`
});

const pharmaGenieFlow = ai.defineFlow(
  {
    name: 'medicoPharmaGenieFlow',
    inputSchema: PharmaGenieInputSchema,
    outputSchema: PharmaGenieOutputSchema,
  },
  async (input) => {
    try {
        const { output } = await pharmaGeniePrompt(input);

        if (!output || !output.drugClass) {
        console.error('PharmaGeniePrompt did not return valid information for:', input.drugName);
        throw new Error('Failed to get drug information. The AI model did not return the expected output.');
        }
        
        return output;
    } catch (err) {
        console.error(`[PharmaGenieAgent] Error: ${err instanceof Error ? err.message : String(err)}`);
        throw new Error('An unexpected error occurred while fetching drug information. Please try again.');
    }
  }
);
