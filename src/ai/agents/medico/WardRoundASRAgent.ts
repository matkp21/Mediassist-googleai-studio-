'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

/**
 * WARD ROUND ASR TRANSCRIBER
 * Incorporating VibeVoice-ASR framework.
 * Processes long audio (up to 60 mins) with speaker separation and timestamps.
 */
export const runWardRoundASR = ai.defineFlow(
  {
    name: 'runWardRoundASR',
    inputSchema: z.object({ 
        audioUrl: z.string().url(),
        durationMinutes: z.number().max(60),
        physicianId: z.string()
    }),
    outputSchema: z.object({ 
        transcript: z.array(z.object({
            speaker: z.string(),
            timestamp: z.string(),
            text: z.string(),
            clinicalKeywords: z.array(z.string())
        })),
        summary: z.string(),
        detectedActions: z.array(z.string())
    }),
  },
  async (input) => {
    // In production, this would call VibeVoice-ASR or Whisper-large-v3
    console.log(`Processing ${input.durationMinutes}m ward round audio for ${input.physicianId}`);

    const segments = [
      { speaker: "Physician", timestamp: "00:05", text: "Morning team. Let's look at Patient in Bed 4. Status post-appendectomy.", clinicalKeywords: ["appendectomy"] },
      { speaker: "Resident", timestamp: "00:12", text: "Vitals are stable. Patient reports moderate pain, localized to the incision site.", clinicalKeywords: ["vitals", "pain"] },
      { speaker: "Physician", timestamp: "00:25", text: "Increase analgesic dosage. Monitor for signs of infection. Start mobilizing this afternoon.", clinicalKeywords: ["analgesic", "infection", "mobilizing"] }
    ];

    const synthesis = await ai.generate({
       model: 'vertexai/gemini-1.5-pro',
       prompt: `Synthesize a structured ward round note from this transcript overview: ${JSON.stringify(segments)}`,
    });

    return { 
        transcript: segments,
        summary: synthesis.text(),
        detectedActions: ["Increase analgesia", "Mobilize patient", "Monitor for sepsis"]
    };
  }
);
