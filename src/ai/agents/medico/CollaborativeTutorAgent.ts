'use server';
/**
 * @fileOverview A collaborative multi-agent simulation where specialized bots (Patho, Pharma, Micro)
 * collaboratively solve a complex clinical case (inspired by Multica Kanban collaboration).
 */

import { z } from 'zod';
import { ai } from '@/ai/genkit';
import { GoogleGenAI } from '@google/genai';
import { injectKarpathyGuidelines } from './skills/karpathy-guidelines';

export const CollaborativeTutorInputSchema = z.object({
  caseDescription: z.string().describe("The complex clinical case to analyze.")
});

export const CollaborativeTutorOutputSchema = z.object({
  pathoBotAnalysis: z.string(),
  pharmaBotAnalysis: z.string(),
  microBotAnalysis: z.string(),
  consensusConclusion: z.string()
});

export type CollaborativeTutorInput = z.infer<typeof CollaborativeTutorInputSchema>;
export type CollaborativeTutorOutput = z.infer<typeof CollaborativeTutorOutputSchema>;

const googleGenAi = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });

export async function runCollaborativeTutor(input: CollaborativeTutorInput): Promise<CollaborativeTutorOutput> {
  try {
    // We run three distinct agent personas in parallel using Gemini API directly for speed
    const [pathoRes, pharmaRes, microRes] = await Promise.all([
      googleGenAi.models.generateContent({
        model: 'gemini-3.1-flash-preview',
        contents: `You are PathoBot. Analyze the following case strictly from a pathophysiological standpoint. Keep it under 100 words. Case: ${input.caseDescription}`
      }),
      googleGenAi.models.generateContent({
        model: 'gemini-3.1-flash-preview',
        contents: `You are PharmaBot. Analyze the following case strictly regarding pharmacology and treatment mechanisms. Keep it under 100 words. Case: ${input.caseDescription}`
      }),
      googleGenAi.models.generateContent({
        model: 'gemini-3.1-flash-preview',
        contents: `You are MicroBot. Analyze the following case strictly regarding microbiology, infectious agents, and lab cultures. Keep it under 100 words. Case: ${input.caseDescription}`
      })
    ]);

    const pathoBotAnalysis = pathoRes.text || 'Pathology analysis unavailable.';
    const pharmaBotAnalysis = pharmaRes.text || 'Pharmacology analysis unavailable.';
    const microBotAnalysis = microRes.text || 'Microbiology analysis unavailable.';

    // Consensus agent
    const consensusRes = await googleGenAi.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: injectKarpathyGuidelines(`You are the Chief Resident (Consensus Agent). Read the independent analyses from your sub-agents and write a 1-paragraph final consensus diagnosis and plan.
      
      Pathology: ${pathoBotAnalysis}
      Pharmacology: ${pharmaBotAnalysis}
      Microbiology: ${microBotAnalysis}`)
    });

    return {
      pathoBotAnalysis,
      pharmaBotAnalysis,
      microBotAnalysis,
      consensusConclusion: consensusRes.text || 'Consensus forming failed.'
    };
  } catch (e) {
    console.error("Collaborative Tutor Error:", e);
    throw new Error("Failed to run multi-agent collaboration.");
  }
}
