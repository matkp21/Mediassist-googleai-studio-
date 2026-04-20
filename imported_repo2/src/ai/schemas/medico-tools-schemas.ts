// src/ai/schemas/medico-tools-schemas.ts

/**
 * @fileOverview Defines Zod schemas for Medico Mode specific tools,
 * including Study Notes Generator and MCQ Generator.
 */
import { z } from 'zod';

const subjects = ["Anatomy", "Physiology", "Biochemistry", "Pathology", "Pharmacology", "Microbiology", "Forensic Medicine", "Community Medicine", "Ophthalmology", "ENT", "General Medicine", "General Surgery", "Obstetrics & Gynaecology", "Pediatrics", "Other"] as const;
const systems = ["Cardiovascular", "Respiratory", "Gastrointestinal", "Neurological", "Musculoskeletal", "Endocrine", "Genitourinary", "Integumentary", "Hematological", "Immunological", "Other"] as const;

// Common schema for recommended next steps
const NextStepSchema = z.object({
  title: z.string().describe("The title of the suggested next step."),
  description: z.string().describe("A brief description of what this step entails."),
  toolId: z.string().describe("The unique ID of the tool to be used for this step (e.g., 'mcq', 'flashcards')."),
  prefilledTopic: z.string().describe("The topic to pre-fill in the suggested tool."),
  cta: z.string().describe("The call-to-action text for the button (e.g., 'Generate MCQs')."),
});

// Schema for StudyNotesGenerator
export const StudyNotesGeneratorInputSchema = z.object({
  topic: z.string().min(3, { message: "Topic must be at least 3 characters long." }).describe('The medical topic for which to generate study notes (e.g., "Diabetes Mellitus", "Thalassemia Major").'),
  answerLength: z.enum(['10-mark', '5-mark']).optional().describe('Desired length of the answer based on university exam marks.'),
  subject: z.enum(subjects).optional().describe('The main subject this topic falls under (e.g., "Surgery", "Medicine").'),
  system: z.enum(systems).optional().describe('The physiological system this topic relates to (e.g., "Cardiovascular", "Neurological").'),
});
export type StudyNotesGeneratorInput = z.infer<typeof StudyNotesGeneratorInputSchema>;

export const StudyNotesGeneratorOutputSchema = z.object({
  notes: z.string().describe('Concise, AI-generated study notes on the topic, formatted for clarity with headings and bullet points where appropriate.'),
  summaryPoints: z.array(z.string()).describe('A separate array of 3-5 key, high-yield summary points for quick revision of the topic.'),
  diagram: z.string().nullable().describe('A Mermaid.js syntax for a flowchart or diagram relevant to the topic. Can be null.'),
  nextSteps: z.array(NextStepSchema).describe('A list of suggested next steps for the user to continue their study session.'),
});
export type StudyNotesGeneratorOutput = z.infer<typeof StudyNotesGeneratorOutputSchema>;


// Schema for MCQ Generator
export const MedicoMCQGeneratorInputSchema = z.object({
  topic: z.string().min(3, { message: "Topic must be at least 3 characters long." }).describe('The medical topic for which to generate MCQs (e.g., "Cardiology", "Hypertension").'),
  count: z.number().int().min(1).max(10).default(5).describe('The number of MCQs to generate (1-10). Default is 5.'),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium').describe('The difficulty level of the questions.'),
  examType: z.enum(['university', 'neet-pg', 'usmle']).default('university').describe('The style of exam to pattern the questions after.'),
  subject: z.enum(subjects).optional().describe('The main subject this topic falls under (e.g., "Surgery", "Medicine").'),
  system: z.enum(systems).optional().describe('The physiological system this topic relates to (e.g., "Cardiovascular", "Neurological").'),
});
export type MedicoMCQGeneratorInput = z.infer<typeof MedicoMCQGeneratorInputSchema>;

export const MCQOptionSchema = z.object({
  text: z.string().describe('The text of the multiple-choice option.'),
  isCorrect: z.boolean().describe('Indicates if this option is the correct answer.'),
});

export const MCQSchema = z.object({
  question: z.string().describe('The MCQ question text.'),
  options: z.array(MCQOptionSchema).length(4, { message: "Each MCQ must have exactly 4 options."}).describe('Exactly four options for the MCQ, one of which must be correct.'),
  explanation: z.string().optional().describe('A brief explanation for why the correct answer is correct. This helps in learning.'),
  competencyIds: z.array(z.string()).optional().describe("Associated NMC competency codes (e.g., 'AN 5.1')."),
});
export type SingleMCQ = z.infer<typeof MCQSchema>;


export const MedicoMCQGeneratorOutputSchema = z.object({
  mcqs: z.array(MCQSchema).describe('An array of generated MCQs, each with a question, options, and an explanation.'),
  topicGenerated: z.string().describe('The topic for which these MCQs were generated.'),
  nextSteps: z.array(NextStepSchema).describe('A list of suggested next steps for the user to continue their study session.'),
});
export type MedicoMCQGeneratorOutput = z.infer<typeof MedicoMCQGeneratorOutputSchema>;

// Schema for Exam Paper Generator
export const MedicoExamPaperInputSchema = z.object({
  examType: z.string().min(3, { message: "Exam type must be at least 3 characters." }).describe('The name of the examination (e.g., "Final MBBS Prof").'),
  year: z.string().optional().describe('Optional focus year for pattern analysis (e.g., "2023").'),
  count: z.number().int().min(1).max(20).default(10).describe('The number of MCQs to generate (1-20). Default is 10.'),
});
export type MedicoExamPaperInput = z.infer<typeof MedicoExamPaperInputSchema>;

// New structured answer schema for essay questions
export const StructuredAnswerSchema = z.object({
  definition: z.string().describe("A clear, concise definition of the topic."),
  anatomyPhysiology: z.string().optional().describe("Brief overview of relevant anatomy or physiology."),
  etiology: z.string().describe("List of causes and risk factors."),
  pathophysiology: z.string().describe("Explanation of the disease mechanism."),
  clinicalFeatures: z.string().describe("Details on signs and symptoms."),
  investigations: z.string().describe("List of relevant investigations (e.g., Blood tests, Imaging)."),
  management: z.string().describe("Details on management (e.g., Medical, Surgical)."),
  complications: z.string().optional().describe("Potential complications."),
  prognosis: z.string().optional().describe("Likely outcome of the condition."),
  diagrams: z.array(z.string().url()).optional().describe("Array of URLs to diagrams. Omit this field for now as image generation is disabled."),
  references: z.string().optional().describe("Standard textbook references (e.g., 'Bailey & Love 27th Ed')."),
});
export type StructuredAnswer = z.infer<typeof StructuredAnswerSchema>;


export const EssayQuestionSchema = z.object({
  question: z.string().describe('The essay question.'),
  answer10M: StructuredAnswerSchema.describe('A detailed, structured answer suitable for a 10-mark question.'),
  answer5M: z.string().describe('A condensed summary answer suitable for a 5-mark question.'),
  competencyIds: z.array(z.string()).optional().describe("Associated NMC competency codes (e.g., 'IM 1.2')."),
});
export type EssayQuestion = z.infer<typeof EssayQuestionSchema>;


export const MedicoExamPaperOutputSchema = z.object({
  mcqs: z.array(MCQSchema).optional().describe('An array of generated MCQs for the exam.'),
  essays: z.array(EssayQuestionSchema).optional().describe('An array of generated essay questions with structured 10-mark answers and concise 5-mark answers.'),
  topicGenerated: z.string().describe('The exam type for which this paper was generated.'),
  nextSteps: z.array(NextStepSchema).describe('Suggested next actions after reviewing the exam.'),
});
export type MedicoExamPaperOutput = z.infer<typeof MedicoExamPaperOutputSchema>;


// Schema for Study Timetable Creator
export const MedicoStudyTimetableInputSchema = z.object({
  examName: z.string().min(3, { message: "Exam name must be at least 3 characters." }).describe('Name of the examination (e.g., "Final MBBS Prof").'),
  examDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Exam date must be in YYYY-MM-DD format." }).describe('Date of the examination in YYYY-MM-DD format.'),
  subjects: z.array(z.string().min(1)).min(1, { message: "At least one subject is required." }).describe('List of subjects to study.'),
  studyHoursPerWeek: z.number().min(1).max(100).describe('Total number of study hours available per week.'),
  performanceContext: z.string().optional().describe('Brief description of the student\'s weak areas or performance to help prioritize.'),
});
export type MedicoStudyTimetableInput = z.infer<typeof MedicoStudyTimetableInputSchema>;

export const MedicoStudyTimetableOutputSchema = z.object({
  timetable: z.string().describe('A structured study timetable in Markdown format for display.'),
  performanceAnalysis: z.string().optional().describe('A brief analysis of how the schedule addresses the user\'s weak points.'),
  nextSteps: z.array(NextStepSchema).describe('A list of suggested next steps for the user to begin their study plan.'),
});
export type MedicoStudyTimetableOutput = z.infer<typeof MedicoStudyTimetableOutputSchema>;

// Schema for Flashcard Generator
export const MedicoFlashcardGeneratorInputSchema = z.object({
  topic: z.string().min(3, { message: "Topic must be at least 3 characters." }).describe('The medical topic for flashcards.'),
  count: z.number().int().min(1).max(20).default(10).describe('Number of flashcards to generate (1-20).'),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium').describe('The difficulty level of the flashcards.'),
  examType: z.enum(['university', 'neet-pg', 'usmle']).default('university').describe('The style of exam to pattern the flashcards after.'),
});
export type MedicoFlashcardGeneratorInput = z.infer<typeof MedicoFlashcardGeneratorInputSchema>;

export const MedicoFlashcardSchema = z.object({
  front: z.string().describe('The front side of the flashcard (question/term).'),
  back: z.string().describe('The back side of the flashcard (answer/definition).'),
});
export type MedicoFlashcard = z.infer<typeof MedicoFlashcardSchema>;

export const MedicoFlashcardGeneratorOutputSchema = z.object({
  flashcards: z.array(MedicoFlashcardSchema).describe('An array of generated flashcards.'),
  topicGenerated: z.string().describe('The topic for which these flashcards were generated.'),
  nextSteps: z.array(NextStepSchema).describe('A list of suggested next steps for the user to continue their study session.'),
});
export type MedicoFlashcardGeneratorOutput = z.infer<typeof MedicoFlashcardGeneratorOutputSchema>;

// Schema for Mnemonics Generator
export const MedicoMnemonicsGeneratorInputSchema = z.object({
  topic: z.string().min(3).describe('The medical topic for which to generate a mnemonic.'),
});
export type MedicoMnemonicsGeneratorInput = z.infer<typeof MedicoMnemonicsGeneratorInputSchema>;

export const MedicoMnemonicsGeneratorOutputSchema = z.object({
  mnemonic: z.string().describe('The generated mnemonic phrase or acronym.'),
  explanation: z.string().describe('An explanation of what each letter/part of the mnemonic stands for.'),
  topicGenerated: z.string().describe('The topic for which this mnemonic was generated.'),
  imageUrl: z.string().url().optional().describe('URL to a generated visual aid for the mnemonic.'),
  nextSteps: z.array(NextStepSchema).describe('Suggested next study actions.'),
});
export type MedicoMnemonicsGeneratorOutput = z.infer<typeof MedicoMnemonicsGeneratorOutputSchema>;

// Schema for Flowchart Creator
export const MedicoFlowchartCreatorInputSchema = z.object({
  topic: z.string().min(3).describe('The medical topic or process for which to generate a flowchart.'),
});
export type MedicoFlowchartCreatorInput = z.infer<typeof MedicoFlowchartCreatorInputSchema>;

const ReactFlowNodeSchema = z.object({
    id: z.string(),
    type: z.string().optional(),
    position: z.object({ x: z.number(), y: z.number() }),
    data: z.object({ label: z.string() }),
});
const ReactFlowEdgeSchema = z.object({
    id: z.string(),
    source: z.string(),
    target: z.string(),
    label: z.string().optional(),
    animated: z.boolean().optional(),
});
export const MedicoFlowchartCreatorOutputSchema = z.object({
    nodes: z.array(ReactFlowNodeSchema),
    edges: z.array(ReactFlowEdgeSchema),
    topicGenerated: z.string(),
    nextSteps: z.array(NextStepSchema).describe('A list of suggested next steps for the user.'),
});
export type MedicoFlowchartCreatorOutput = z.infer<typeof MedicoFlowchartCreatorOutputSchema>;

// Schema for Clinical Case Simulator
export const MedicoClinicalCaseInputSchema = z.object({
  topic: z.string().describe("The medical topic for the case simulation."),
  caseId: z.string().optional().describe("The ID of an ongoing case, if any."),
  userResponse: z.string().optional().describe("The user's response to the current prompt in the case."),
});
export type MedicoClinicalCaseInput = z.infer<typeof MedicoClinicalCaseInputSchema>;

export const MedicoClinicalCaseOutputSchema = z.object({
  caseId: z.string(),
  topic: z.string(),
  prompt: z.string().describe("The new prompt or question for the user."),
  feedback: z.string().optional().describe("Feedback on the user's previous response."),
  isCompleted: z.boolean().describe("Whether the case has reached a conclusion."),
  summary: z.string().optional().describe("A summary of the case if completed."),
  nextSteps: z.array(NextStepSchema).optional(), // Optional: only present on completion
});
export type MedicoClinicalCaseOutput = z.infer<typeof MedicoClinicalCaseOutputSchema>;

// Schema for Anatomy Visualizer
export const MedicoAnatomyVisualizerInputSchema = z.object({
  anatomicalStructure: z.string().min(3),
});
export type MedicoAnatomyVisualizerInput = z.infer<typeof MedicoAnatomyVisualizerInputSchema>;

export const MedicoAnatomyVisualizerOutputSchema = z.object({
  description: z.string(),
  imageUrl: z.string().url().optional(),
  relatedStructures: z.array(z.string()).optional(),
  nextSteps: z.array(NextStepSchema).describe('A list of suggested next steps for the user.'),
});
export type MedicoAnatomyVisualizerOutput = z.infer<typeof MedicoAnatomyVisualizerOutputSchema>;


// Schema for DDx Trainer
export const MedicoDDTrainerInputSchema = z.object({
    isNewCase: z.boolean(),
    symptoms: z.string().optional(),
    currentCaseSummary: z.string().optional(),
    userResponse: z.string().optional(),
});
export type MedicoDDTrainerInput = z.infer<typeof MedicoDDTrainerInputSchema>;

export const MedicoDDTrainerOutputSchema = z.object({
    prompt: z.string(),
    feedback: z.string().optional(),
    updatedCaseSummary: z.string(),
    isCompleted: z.boolean(),
    nextSteps: z.array(NextStepSchema).optional(), // Optional: only present on completion
});
export type MedicoDDTrainerOutput = z.infer<typeof MedicoDDTrainerOutputSchema>;

// Schema for High-Yield Topic Predictor
export const MedicoTopicPredictorInputSchema = z.object({
  examType: z.string().min(3),
  subject: z.string().optional(),
});
export type MedicoTopicPredictorInput = z.infer<typeof MedicoTopicPredictorInputSchema>;

export const MedicoTopicPredictorOutputSchema = z.object({
  predictedTopics: z.array(z.string()),
  rationale: z.string().optional(),
  nextSteps: z.array(NextStepSchema).describe('A list of suggested next steps for the user.'),
});
export type MedicoTopicPredictorOutput = z.infer<typeof MedicoTopicPredictorOutputSchema>;

// Schema for Drug Dosage Calculator
export const MedicoDrugDosageInputSchema = z.object({
  drugName: z.string(),
  patientWeightKg: z.number(),
  patientAgeYears: z.number().optional(),
  renalFunction: z.string().optional(),
  indication: z.string().optional(),
  concentrationAvailable: z.string().optional(),
});
export type MedicoDrugDosageInput = z.infer<typeof MedicoDrugDosageInputSchema>;

export const MedicoDrugDosageOutputSchema = z.object({
  calculatedDose: z.string(),
  calculationExplanation: z.string(),
  warnings: z.array(z.string()).optional(),
  nextSteps: z.array(NextStepSchema).describe('A list of suggested next steps for the user.'),
});
export type MedicoDrugDosageOutput = z.infer<typeof MedicoDrugDosageOutputSchema>;


// Schema for Note Summarizer
export const MedicoNoteSummarizerInputSchema = z.object({
  text: z.string().optional(),
  imageDataUri: z.string().optional(),
  format: z.enum(['bullet', 'flowchart', 'table', 'diagram']),
});
export type MedicoNoteSummarizerInput = z.infer<typeof MedicoNoteSummarizerInputSchema>;

export const MedicoNoteSummarizerOutputSchema = z.object({
  summary: z.string(),
  format: z.enum(['bullet', 'flowchart', 'table', 'diagram']),
  nextSteps: z.array(NextStepSchema).describe('A list of suggested next steps for the user.'),
});
export type MedicoNoteSummarizerOutput = z.infer<typeof MedicoNoteSummarizerOutputSchema>;


// Schema for Virtual Patient Rounds
export const MedicoVirtualRoundsInputSchema = z.object({
  patientFocus: z.string().optional(),
  caseId: z.string().optional(),
  userAction: z.string().optional(),
});
export type MedicoVirtualRoundsInput = z.infer<typeof MedicoVirtualRoundsInputSchema>;

export const MedicoVirtualRoundsOutputSchema = z.object({
  caseId: z.string(),
  topic: z.string(),
  patientSummary: z.string(),
  currentObservation: z.string(),
  nextPrompt: z.string(),
  isCompleted: z.boolean(),
  nextSteps: z.array(NextStepSchema).optional(), // Optional: only present on completion
});
export type MedicoVirtualRoundsOutput = z.infer<typeof MedicoVirtualRoundsOutputSchema>;

// Agents for PathoMind, PharmaGenie, MicroMate, DiagnoBot
export const PathoMindInputSchema = z.object({ topic: z.string() });
export const PathoMindOutputSchema = z.object({
  explanation: z.string(),
  diagram: z.string().optional(),
  nextSteps: z.array(NextStepSchema).describe('A list of suggested next steps for the user.'),
});
export type PathoMindInput = z.infer<typeof PathoMindInputSchema>;
export type PathoMindOutput = z.infer<typeof PathoMindOutputSchema>;

export const PharmaGenieInputSchema = z.object({ drugName: z.string() });
export const PharmaGenieOutputSchema = z.object({
  drugClass: z.string(),
  mechanismOfAction: z.string(),
  indications: z.array(z.string()),
  sideEffects: z.array(z.string()),
  nextSteps: z.array(NextStepSchema).describe('A list of suggested next steps for the user.'),
});
export type PharmaGenieInput = z.infer<typeof PharmaGenieInputSchema>;
export type PharmaGenieOutput = z.infer<typeof PharmaGenieOutputSchema>;

export const MicroMateInputSchema = z.object({ microorganism: z.string() });
export const MicroMateOutputSchema = z.object({
  characteristics: z.string(),
  virulenceFactors: z.string(),
  diseasesCaused: z.string(),
  labDiagnosis: z.string(),
  nextSteps: z.array(NextStepSchema).describe('A list of suggested next steps for the user.'),
});
export type MicroMateInput = z.infer<typeof MicroMateInputSchema>;
export type MicroMateOutput = z.infer<typeof MicroMateOutputSchema>;

export const DiagnoBotInputSchema = z.object({ labResults: z.string() });
export const DiagnoBotOutputSchema = z.object({
  interpretation: z.string(),
  likelyDifferentials: z.array(z.string()),
  nextSteps: z.array(NextStepSchema).describe('A list of suggested next steps for the user.'),
});
export type DiagnoBotInput = z.infer<typeof DiagnoBotInputSchema>;
export type DiagnoBotOutput = z.infer<typeof DiagnoBotOutputSchema>;


// Schema for Progress Tracker Agent - THIS IS THE FIX
export const MedicoProgressTrackerInputSchema = z.object({
  activityType: z.enum(['notes_review', 'mcq_session', 'case_sim_completed']).describe("The type of study activity completed."),
  topic: z.string().describe("The topic of the completed activity."),
  score: z.number().optional().describe("The user's score, if applicable (e.g., for quizzes)."),
});
export type MedicoProgressTrackerInput = z.infer<typeof MedicoProgressTrackerInputSchema>;

export const MedicoProgressTrackerOutputSchema = z.object({
  progressUpdateMessage: z.string().describe("An encouraging message for the user."),
  newAchievements: z.array(z.string()).optional().describe("Any new achievements unlocked."),
  updatedTopicProgress: z.object({
    topic: z.string(),
    newProgressPercentage: z.number(),
  }).optional().describe("Updated progress for the specific topic."),
  nextSteps: z.array(NextStepSchema).describe('Suggested next actions to continue studying.'),
});
export type MedicoProgressTrackerOutput = z.infer<typeof MedicoProgressTrackerOutputSchema>;

// Schema for Case Challenge Generator
export const MedicoCaseChallengeGeneratorInputSchema = z.object({
  difficulty: z.enum(['Easy', 'Medium', 'Hard']).describe("The difficulty level for the case."),
  topic: z.string().optional().describe("An optional topic to focus the case challenge on."),
});
export type MedicoCaseChallengeGeneratorInput = z.infer<typeof MedicoCaseChallengeGeneratorInputSchema>;

export const MedicoCaseChallengeGeneratorOutputSchema = z.object({
  id: z.string().describe("A unique ID for the generated challenge."),
  title: z.string().describe("The title of the challenge."),
  difficulty: z.string().describe("The difficulty level of the case."),
  description: z.string().describe("A brief, one-sentence description of the case."),
  caseDetails: z.string().describe("The detailed clinical presentation for the user to solve."),
  correctAnswer: z.string().describe("The single correct primary diagnosis."),
  timeLimitSeconds: z.number().int().positive().describe("The time limit in seconds to solve the challenge."),
  nextSteps: z.array(NextStepSchema).describe('Suggested next actions after completing the challenge.'),
});
export type MedicoCaseChallengeGeneratorOutput = z.infer<typeof MedicoCaseChallengeGeneratorOutputSchema>;

// Schema for Note Structurer Agent
export const MedicoNoteStructurerInputSchema = z.object({
  rawText: z.string().describe("The raw, unstructured text from dictation."),
  template: z.enum(['soap', 'general']).describe("The desired note template (e.g., SOAP)."),
});
export type MedicoNoteStructurerInput = z.infer<typeof MedicoNoteStructurerInputSchema>;

export const MedicoNoteStructurerOutputSchema = z.object({
  structuredText: z.string().describe("The AI-formatted and structured note content."),
});
export type MedicoNoteStructurerOutput = z.infer<typeof MedicoNoteStructurerOutputSchema>;
