import { z } from 'zod';

export const MasterStudyGuideSchema = z.object({
  masterSummary: z.string().describe("Comprehensive, structured Markdown summary of the entire lecture."),
  clinicalPearls: z.array(z.string()).describe("High-yield, actionable medical takeaways and red flags."),
  mermaidMindMap: z.string().describe("Mermaid.js syntax mapping the core topics, pathways, and relationships discussed."),
  mcqFlashcards: z.array(z.object({
    front: z.string().describe("Clinical scenario or direct question."),
    back: z.string().describe("The correct answer."),
    explanation: z.string().describe("Why this is the correct answer based on the lecture.")
  }))
});
