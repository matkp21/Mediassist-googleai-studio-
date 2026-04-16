import { z } from 'genkit';
import { ai } from '@/ai/genkit';

export const patientNarrativeAgent = ai.defineFlow({
  name: 'patientNarrativeAgent',
  inputSchema: z.object({ topic: z.string(), difficulty: z.number() }),
  outputSchema: z.string()
}, async (input) => {
  const { text } = await ai.generate({
    prompt: `Generate a detailed patient narrative for a clinical scenario about ${input.topic} at difficulty level ${input.difficulty}/10.`
  });
  return text;
});

export const labDataAgent = ai.defineFlow({
  name: 'labDataAgent',
  inputSchema: z.object({ topic: z.string(), difficulty: z.number() }),
  outputSchema: z.any()
}, async (input) => {
  const { text } = await ai.generate({
    prompt: `Generate a JSON object containing realistic lab results for a patient with ${input.topic}. Return ONLY valid JSON.`,
    output: { format: 'json' }
  });
  try {
    return JSON.parse(text);
  } catch (e) {
    return { error: "Failed to parse labs" };
  }
});

export const debriefingAgent = ai.defineFlow({
  name: 'debriefingAgent',
  inputSchema: z.object({ topic: z.string(), difficulty: z.number() }),
  outputSchema: z.string()
}, async (input) => {
  const { text } = await ai.generate({
    prompt: `Write a short debriefing and learning objectives for a clinical scenario about ${input.topic}.`
  });
  return text;
});

export const clinicalScenarioGenerator = ai.defineFlow({
  name: 'clinicalScenarioGenerator',
  inputSchema: z.object({ topic: z.string(), difficulty: z.number() }),
  outputSchema: z.object({ narrative: z.string(), labs: z.any(), debrief: z.string() })
}, async (input) => {
  // 1. Spawn sub-agent for Patient Narrative
  const narrative = await patientNarrativeAgent(input);
  
  // 2. Spawn parallel sub-agents for Lab Data and Debriefing (Teammate Pattern)
  const [labs, debrief] = await Promise.all([
    labDataAgent(input),
    debriefingAgent(input)
  ]);

  // Combine the ledger and return to the Next.js frontend
  return { narrative, labs, debrief };
});
