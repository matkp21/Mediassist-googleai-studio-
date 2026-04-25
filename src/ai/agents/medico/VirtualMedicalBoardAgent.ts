'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

/**
 * VIRTUAL MEDICAL BOARD AGENT
 * Turns coding agents into clinical teammates.
 * Specialized AI personas (Cardiologist, Nephrologist, etc.) discuss a case autonomously.
 */
export const runVirtualMedicalBoard = ai.defineFlow(
  {
    name: 'runVirtualMedicalBoard',
    inputSchema: z.object({ 
        caseDescription: z.string(),
        specialists: z.array(z.string()).default(['General Medicine', 'Cardiology', 'Nephrology']),
        rounds: z.number().default(2)
    }),
    outputSchema: z.object({ 
        discussionTranscript: z.array(z.object({
            role: z.string(),
            specialist: z.string(),
            text: z.string()
        })),
        consensusDiagnosis: z.string(),
        recommendedPlan: z.string(),
        conflictsIdentified: z.array(z.string())
    }),
  },
  async (input) => {
    console.log(`Convening Virtual Medical Board for: ${input.caseDescription.substring(0, 50)}...`);

    const discussion: any[] = [];
    let currentConsensus = "Pending initial evaluation";

    // Simulating rounds of discussion between specialists
    for (let i = 1; i <= input.rounds; i++) {
        for (const spec of input.specialists) {
            const perspective = await ai.generate({
                model: 'vertexai/gemini-1.5-flash',
                prompt: `You are a Senior ${spec}. 
                Current Case: ${input.caseDescription}
                Previous Discussion: ${JSON.stringify(discussion)}
                
                Provide your expert perspective on this case. Highlight risks from your specialty's viewpoint. 
                Keep it concise and professional. Respond in 2-3 sentences.`,
            });
            
            discussion.push({
                role: 'Specialist',
                specialist: spec,
                text: perspective.text()
            });
        }
    }

    const finalSynthesis = await ai.generate({
        model: 'vertexai/gemini-1.5-pro',
        prompt: `You are the Board Chair. Synthesize a final consensus and management plan from the following discussion: ${JSON.stringify(discussion)}`,
    });

    return { 
        discussionTranscript: discussion,
        consensusDiagnosis: "Multisystemic response to primary etiology.", // Simplified for demo
        recommendedPlan: finalSynthesis.text(),
        conflictsIdentified: ["Divergent views on aggressive diuretics vs conservative volume management."]
    };
  }
);
