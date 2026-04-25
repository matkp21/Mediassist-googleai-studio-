import { genkit, z } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { getSessionState, updateSessionState } from '../memory/sessionMemory';

const ai = genkit({ plugins: [googleAI()] });

/**
 * TOOL CATALOG: Defines the "Skills" available in the system
 * and the specific medical contexts they are best suited for.
 */
const TOOL_CATALOG = [
  { id: 'vision_occlusion', label: 'Anatomy Lab', contextKeywords: ['anatomy', 'structure', 'organ', 'visual', 'identify', 'where is'], domain: 'Visual Anatomy' },
  { id: 'data_science', label: 'Bioinformatics Lab', contextKeywords: ['data', 'stats', 'math', 'calculate', 'bioinformatics', 'p-value', 'survival'], domain: 'Data Science' },
  { id: 'pharmacology', label: 'Drug Checker', contextKeywords: ['drug', 'medication', 'dose', 'pharmacology', 'pharma', 'interaction'], domain: 'Pharmacology' },
  { id: 'simulator', label: 'Case Simulator', contextKeywords: ['case', 'patient', 'presentation', 'vignette', 'practice', 'diagnosis'], domain: 'Clinical Reasoning' },
  { id: 'socratic_preceptor', label: 'Ward Round', contextKeywords: ['reasoning', 'why', 'how', 'explain', 'understand', 'difficult'], domain: 'Critical Thinking' },
  { id: 'generate_mcq', label: 'Quick Quiz', contextKeywords: ['test', 'practice questions', 'exam', 'boards', 'usmle'], domain: 'Active Recall' },
  { id: 'view_algorithm', label: 'Treatment Path', contextKeywords: ['protocol', 'management', 'guideline', 'algorithm', 'step-by-step', 'acls'], domain: 'Clinical Guidelines' }
];

/**
 * CONTEXT COMPACT: Shrinks session history into a high-yield summary of struggles.
 * (Nanobot-inspired feature)
 */
export async function generateCompactContext(userId: string) {
  const session = await getSessionState(userId);
  if (!session) return "No prior history.";

  const summary = await ai.generate({
    model: 'googleai/gemini-1.5-flash',
    prompt: `
      Summarize the student's current medical study context in 3 bullets.
      Current Topic: ${session.currentTopic}
      Learning Profile: ${JSON.stringify(session.learningProfile)}
      Precomputed Tools Active: ${Object.keys(session.precomputedTools || {}).join(', ')}
      
      Focus on WHAT they are struggling with right now.
      Respond in plain text.
    `
  });

  return summary.text;
}

/**
 * INTELLIGENT TOOL ROUTER: Dynamic Tool Discovery.
 * Analyzes the current turn's output and the compact context to recommend the MOST RELEVANT tools.
 * (Nanobot-inspired: Lifecycle Hook / Discovery)
 */
export const intelligentToolRouterFlow = ai.defineFlow(
  {
    name: 'intelligentToolRouter',
    inputSchema: z.object({
      userId: z.string(),
      lastResponse: z.string(),
      compactContext: z.string()
    }),
    outputSchema: z.object({
      recommendedTools: z.array(z.object({
        id: z.string(),
        label: z.string(),
        reason: z.string()
      }))
    })
  },
  async ({ userId, lastResponse, compactContext }) => {
    const analysis = await ai.generate({
      model: 'googleai/gemini-1.5-flash',
      prompt: `
        You are the "Nanobot" Discovery Router for a medical education platform.
        Tool Catalog: ${JSON.stringify(TOOL_CATALOG)}
        
        Current Context Summary: ${compactContext}
        Last AI Response: ${lastResponse}
        
        Task: Pick the TOP 2-3 most relevant tools the student should use NEXT.
        Explain WHY based on their current struggle or the topic's nature.
        - If the topic is visual (anatomy), prioritize 'vision_occlusion'.
        - If they are struggling with mechanisms, prioritize 'socratic_preceptor'.
        - If they are dealing with dosage or stats, prioritize 'data_science'.
      `,
      output: {
        format: 'json',
        schema: z.object({
          recommendations: z.array(z.object({
            id: z.string(),
            reason: z.string()
          }))
        })
      }
    });

    const parsed = analysis.output();
    const recommendations = (parsed?.recommendations || []).map(rec => {
      const tool = TOOL_CATALOG.find(t => t.id === rec.id);
      return {
        id: rec.id,
        label: tool?.label || 'Specialized Tool',
        reason: rec.reason
      };
    });

    // Lifecycle Hook: Instantly update the session with the new relevant discovery
    await updateSessionState(userId, {
      discoverySteps: recommendations
    } as any);

    return { recommendedTools: recommendations };
  }
);
