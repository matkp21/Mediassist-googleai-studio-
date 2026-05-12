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

// Flow 2: Output from MedGemma 4B
export const TopicTreeSchema = z.object({
  mainTopic: z.string(),
  hierarchicalConcepts: z.array(z.object({
    concept: z.string(),
    subConcepts: z.array(z.string()),
    associatedAnatomy: z.array(z.string()).optional()
  })),
  keyMedicalTerms: z.array(z.string())
});

// Flow 4: Output from Enhancement Agent
export const EnhancedSessionSchema = z.object({
  learningObjectives: z.array(z.string()),
  keyConceptSummary: z.string(),
  mermaidDiagram: z.string().describe("Mermaid syntax for the TopicTree"),
  mcqFlashcards: z.array(z.object({
    frontQuestion: z.string(),
    backAnswer: z.string(),
    explanation: z.string()
  }))
});
