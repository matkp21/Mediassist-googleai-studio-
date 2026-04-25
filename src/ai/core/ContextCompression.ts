'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

/**
 * Selective Context Compression Engine (Brain-4 Component)
 * Inspired by REFRAG framework for token efficiency.
 */
export async function compressMedicalContext(messages: any[]) {
    if (messages.length < 5) return messages; // No compression needed for short runs

    const contextToCompress = messages.slice(0, -3);
    const recentMessages = messages.slice(-3);

    const result = await ai.generate({
        model: 'vertexai/gemini-2.0-flash',
        prompt: `You are a Medical Context Compactor. Aggressively compress the following clinical conversation history while preserving:
        1. Patient demographics.
        2. Key clinical symptoms/findings.
        3. Tentative diagnoses.
        4. Management steps already taken.
        
        Skip Irrelevant social chatter or redundant clarifications.
        
        History: ${JSON.stringify(contextToCompress)}`,
    });

    const compressedSummary = result.text();

    return [
        { role: 'system', content: `[CONTEXT COMPRESSED]: ${compressedSummary}` },
        ...recentMessages
    ];
}
