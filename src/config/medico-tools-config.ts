// src/config/medico-tools-config.ts
import type { MedicoTool } from '@/types/medico-tools';
import {
  NotebookText, FileQuestion, CalendarClock, Layers, CaseUpper, Lightbulb, BookCopy,
  Users, Eye, Brain, TrendingUp, Calculator, Workflow, Award, Star, Settings, CheckSquare, GripVertical, FileText, Youtube, Mic, FlaskConical, Microscope, TestTubeDiagonal, Swords, Library, Trophy, BookMarked, FileCheck, DatabaseZap, Search
} from 'lucide-react';
import dynamic from 'next/dynamic';

// Use next/dynamic to only load the components strictly on the client when requested
const StudyNotesGenerator = dynamic(() => import('@/components/medico/study-notes-generator').then(mod => mod.StudyNotesGenerator), { ssr: false });
const EbmResearchAssistant = dynamic(() => import('@/components/medico/ebm-research-assistant').then(mod => mod.EbmResearchAssistant), { ssr: false });
const McqGenerator = dynamic(() => import('@/components/medico/mcq-generator').then(mod => mod.McqGenerator), { ssr: false });
const StudyTimetableCreator = dynamic(() => import('@/components/medico/study-timetable-creator').then(mod => mod.StudyTimetableCreator), { ssr: false });
const FlashcardGenerator = dynamic(() => import('@/components/medico/flashcard-generator').then(mod => mod.FlashcardGenerator), { ssr: false });
const MnemonicsGenerator = dynamic(() => import('@/components/medico/mnemonics-generator').then(mod => mod.MnemonicsGenerator), { ssr: false });
const FlowchartCreator = dynamic(() => import('@/components/medico/flowchart-creator'), { ssr: false });
const ClinicalCaseSimulator = dynamic(() => import('@/components/medico/clinical-case-simulator'), { ssr: false });
const DifferentialDiagnosisTrainer = dynamic(() => import('@/components/medico/differential-diagnosis-trainer'), { ssr: false });
const PathoMindExplainer = dynamic(() => import('@/components/medico/pathomind-explainer').then(mod => mod.PathoMindExplainer), { ssr: false });
const PharmaGenie = dynamic(() => import('@/components/medico/pharma-genie').then(mod => mod.PharmaGenie), { ssr: false });
const MicroMate = dynamic(() => import('@/components/medico/micro-mate'), { ssr: false });
const DiagnoBot = dynamic(() => import('@/components/medico/diagno-bot').then(mod => mod.DiagnoBot), { ssr: false });
const HighYieldTopicPredictor = dynamic(() => import('@/components/medico/high-yield-topic-predictor').then(mod => mod.HighYieldTopicPredictor), { ssr: false });
const AnatomyVisualizer = dynamic(() => import('@/components/medico/anatomy-visualizer'), { ssr: false });
const DrugDosageCalculator = dynamic(() => import('@/components/medico/drug-dosage-calculator'), { ssr: false });
const NoteSummarizer = dynamic(() => import('@/components/medico/note-summarizer'), { ssr: false });
const VirtualPatientRounds = dynamic(() => import('@/components/medico/virtual-patient-rounds'), { ssr: false });
const ProgressTracker = dynamic(() => import('@/components/medico/progress-tracker'), { ssr: false });
const SmartDictation = dynamic(() => import('@/components/medico/smart-dictation'), { ssr: false });
const GamifiedCaseChallenges = dynamic(() => import('@/components/medico/gamified-case-challenges'), { ssr: false });
const MockExamSuite = dynamic(() => import('@/components/medico/mock-exam-suite'), { ssr: false });
const SolvedPapersViewer = dynamic(() => import('@/components/medico/solved-papers-viewer').then(mod => mod.SolvedPapersViewer), { ssr: false });
const RagTutor = dynamic(() => import('@/components/medico/rag-tutor'), { ssr: false });

// Define the full list of tools
export const allMedicoToolsList: MedicoTool[] = [
  { id: 'theorycoach-generator', title: 'Study Notes Generator', description: 'Generate and view concise notes for medical topics, with AI aiming for the summarization quality of models like MedLM.', icon: NotebookText, component: StudyNotesGenerator, isFrequentlyUsed: true },
  { id: 'ebm-assistant', title: 'EBM Research Assistant', description: 'Search PubMed for Evidence-Based Medicine (EBM) papers and synthesize clinical answers.', icon: Search, component: EbmResearchAssistant, isFrequentlyUsed: true },
  { id: 'mock-pyqs', title: 'Mock Exam Paper', description: "Generate mock exam papers simulating previous years, with MCQs and essay questions.", icon: BookCopy, href: '/medico/mock-pyqs', isFrequentlyUsed: true },
  { id: 'solved-papers', title: 'Solved Question Papers Viewer', description: 'Browse and view solved previous year question papers.', icon: FileCheck, component: SolvedPapersViewer, isFrequentlyUsed: true },
  { id: 'cbme', title: 'CBME Competency Browser', description: 'Search and browse through NMC-aligned competencies.', icon: BookMarked, href: '/medico/cbme' },
  { id: 'mcq', title: 'MCQ Generator', description: 'Create multiple-choice questions for exam practice.', icon: FileQuestion, component: McqGenerator, isFrequentlyUsed: true },
  { id: 'flashcards', title: 'Flashcard Generator', description: 'Create digital flashcards for quick revision.', icon: Layers, component: FlashcardGenerator, isFrequentlyUsed: true },
  { id: 'mnemonics', title: 'Mnemonic Generator', description: 'Create memory aids with AI-generated visuals.', icon: Lightbulb, component: MnemonicsGenerator, isFrequentlyUsed: true },
  { id: 'pathomind', title: 'PathoMind', description: 'Explain any disease pathophysiology with diagrams.', icon: Brain, component: PathoMindExplainer, isFrequentlyUsed: true },
  { id: 'pharmagenie', title: 'PharmaGenie', description: 'Drug classification, mechanisms, side effects.', icon: FlaskConical, component: PharmaGenie },
  { id: 'micromate', title: 'MicroMate', description: 'Bugs, virulence factors, lab diagnosis.', icon: Microscope, component: MicroMate },
  { id: 'diagnobot', title: 'DiagnoBot', description: 'Interpret labs, ECGs, X-rays, ABG, etc.', icon: TestTubeDiagonal, component: DiagnoBot },
  { id: 'challenges', title: 'Gamified Case Challenges', description: 'Solve timed diagnostic challenges and compete on leaderboards.', icon: Swords, component: GamifiedCaseChallenges },
  { id: 'exams', title: 'Mock Exam Suite', description: 'Take full-length mock exams with MCQs and essays.', icon: Trophy, component: MockExamSuite },
  { id: 'cases', title: 'Clinical Case Simulations', description: 'Practice with interactive patient scenarios.', icon: CaseUpper, component: ClinicalCaseSimulator },
  { id: 'ddx', title: 'Differential Diagnosis Trainer', description: 'List diagnoses based on symptoms with feedback.', icon: Brain, component: DifferentialDiagnosisTrainer },
  { id: 'anatomy', title: 'Interactive Anatomy Visualizer', description: 'Explore anatomical structures.', icon: Eye, component: AnatomyVisualizer },
  { id: 'dosage', title: 'Drug Dosage Calculator', description: 'Practice calculating drug doses.', icon: Calculator, component: DrugDosageCalculator },
  { id: 'flowcharts', title: 'Flowchart Creator', description: 'Generate flowcharts for medical topics to aid revision.', icon: Workflow, component: FlowchartCreator },
  { id: 'dictation', title: 'Smart Dictation', description: 'Use your voice to dictate notes, which AI can help structure.', icon: Mic, component: SmartDictation },
  { id: 'summarizer', title: 'Smart Note Summarizer', description: 'Upload notes (PDF/TXT) and get AI-powered summaries.', icon: FileText, component: NoteSummarizer },
  { id: 'timetable', title: 'Study Timetable Creator', description: 'Plan personalized study schedules.', icon: CalendarClock, component: StudyTimetableCreator },
  { id: 'topics', title: 'High-Yield Topic Predictor', description: 'Suggest priority topics for study based on exam trends or user performance.', icon: TrendingUp, component: HighYieldTopicPredictor },
  { id: 'rounds', title: 'Virtual Patient Rounds', description: 'Simulate ward rounds with patient cases.', icon: Users, component: VirtualPatientRounds },
  { id: 'progress', title: 'Neural Progress Tracker', description: 'Adaptive self-learning profile that tracks cognitive strengths and weaknesses.', icon: Award, component: ProgressTracker },
  { id: 'videos', title: 'Video Lecture Library', description: 'Search and find relevant medical video lectures.', icon: Youtube, href: '/medico/videos' },
  { id: 'library', title: 'Knowledge Hub', description: 'Your personal library of notes, MCQs, and community content.', icon: Library, href: '/medico/library' },
  { id: 'rag-tutor', title: 'Ask Medi (RAG)', description: 'Resident Genius mentor using semantic RAG for grounded PYQs and flashcards.', icon: DatabaseZap, component: RagTutor, isFrequentlyUsed: true },
];

export const frequentlyUsedMedicoToolIds: ActiveToolId[] = ['rag-tutor', 'ebm-assistant', 'mcq', 'theorycoach-generator', 'flashcards', 'mnemonics', 'pathomind', 'mock-pyqs'];
