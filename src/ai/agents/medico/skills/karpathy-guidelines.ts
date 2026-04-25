import { z } from 'zod';
import { ai } from '@/ai/genkit';
import { gemini25Flash } from '@genkit-ai/googleai';

// 1-5: Prompt & Reasoning Upgrades (Karpathy Guidelines)

export const KarpathyGuidelines = `
CRITICAL KARPATHY GUIDELINES (Always strictly follow these when generating medical content or code):
1. Think Before (Chain of Thought): Always surface your hidden assumptions briefly before jumping to a diagnosis or explanation. For example: "Assuming the patient's chest pain radiates, I will consider..."
2. Simplicity First: Minimize verbose fluff. Always prefer a minimal viable output, such as a 5-bullet pathophysiology list over a 500-word essay.
3. Surgical Changes: If you are editing existing notes or text, ONLY modify the requested section. Do not regenerate the entire document unless asked.
4. Goal-Driven Execution: Convert generic tasks into goal states (e.g., "Hit these 3 CBME competencies").
`;

export function injectKarpathyGuidelines(promptTemplate: string): string {
    return `${promptTemplate}\n\n${KarpathyGuidelines}`;
}
