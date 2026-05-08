// src/config/medico-tools-config.ts
import type { MedicoTool } from '@/types/medico-tools';
import {
  NotebookText, FileQuestion, CalendarClock, Layers, CaseUpper, Lightbulb, BookCopy,
  Users, Eye, Brain, TrendingUp, Calculator, Workflow, Award, Star, Settings, CheckSquare, GripVertical, FileText, Youtube, Mic, FlaskConical, Microscope, TestTubeDiagonal, Swords, Library, Trophy, BookMarked, FileCheck, DatabaseZap, Search, MapPin, BotMessageSquare, BrainCircuit, Bot, FileUp, Activity, PenLine, Navigation, Heart, Wand2, Globe, FileCode, MonitorSmartphone, ShieldAlert, ScanEye, Zap, LayoutDashboard, Stethoscope, HeartPulse, BookOpen, Sparkles
} from 'lucide-react';
import dynamic from 'next/dynamic';

// Use next/dynamic to only load the components strictly on the client when requested
const AutonomousSupervisor = dynamic(() => import('@/components/medico/autonomous-supervisor'), { ssr: false });
const VirtualMedicalBoard = dynamic(() => import('@/components/medico/virtual-medical-board'), { ssr: false });
const SupportAgent = dynamic(() => import('@/components/medico/support-agent'), { ssr: false });
const MarkItDownIngest = dynamic(() => import('@/components/medico/markitdown-ingest'), { ssr: false });
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
const ConceptVideoCreator = dynamic(() => import('@/components/medico/concept-video-creator'), { ssr: false });
const VibeVoiceLectureRecorder = dynamic(() => import('@/components/medico/vibevoice-lecture-recorder').then(mod => mod.VibeVoiceLectureRecorder), { ssr: false });
const FocusMusicGenerator = dynamic(() => import('@/components/medico/focus-music-generator'), { ssr: false });
const GuidelinesCompass = dynamic(() => import('@/components/medico/guidelines-compass').then(mod => mod.GuidelinesCompass), { ssr: false });
const KnowledgeAugmenter = dynamic(() => import('@/components/medico/knowledge-augmenter').then(mod => mod.KnowledgeAugmenter), { ssr: false });
const TriageReferralStreamliner = dynamic(() => import('@/components/medico/triage-referral-streamliner').then(m => m.TriageReferralStreamliner), { ssr: false });
const ProWorkflowChatbot = dynamic(() => import('@/components/medico/pro-workflow-chatbot').then(m => m.ProWorkflowChatbot), { ssr: false });

const ClinicalCalculators = dynamic(() => import('@/components/medico/clinical-calculators'), { ssr: false });
const StudyPlannerActiveCoach = dynamic(() => import('@/components/medico/study-planner-active-coach').then(m => m.StudyPlannerActiveCoach), { ssr: false });

const DeepSolveDiagnostic = dynamic(() => import('@/components/medico/deep-solve-diagnostic').then(m => m.DeepSolveDiagnostic), { ssr: false });
const ClinicalTelemetryVisualizer = dynamic(() => import('@/components/medico/clinical-telemetry-visualizer').then(m => m.ClinicalTelemetryVisualizer), { ssr: false });
const GuidedRehabJourney = dynamic(() => import('@/components/medico/guided-rehab-journey').then(m => m.GuidedRehabJourney), { ssr: false });
const ClinicalCoWriter = dynamic(() => import('@/components/medico/clinical-co-writer').then(m => m.ClinicalCoWriter), { ssr: false });
const PatientMonitoringDashboard = dynamic(() => import('@/components/medico/patient-monitoring-dashboard').then(m => m.PatientMonitoringDashboard), { ssr: false });

const ClinicalSkillGenerator = dynamic(() => import('@/components/medico/clinical-skill-generator').then(m => m.ClinicalSkillGenerator), { ssr: false });
const SequentialDiagnosticWorkspace = dynamic(() => import('@/components/medico/sequential-diagnostic-workspace').then(m => m.SequentialDiagnosticWorkspace), { ssr: false });
const AdvancedResearchScraper = dynamic(() => import('@/components/medico/advanced-research-scraper').then(m => m.AdvancedResearchScraper), { ssr: false });

// Goose Adaptations
const ClinicalRecipesManager = dynamic(() => import('@/components/medico/clinical-recipes-manager').then(m => m.ClinicalRecipesManager), { ssr: false });
const OmnichannelSessionManager = dynamic(() => import('@/components/medico/omnichannel-session-manager').then(m => m.OmnichannelSessionManager), { ssr: false });
const InteractiveToolPrompts = dynamic(() => import('@/components/medico/interactive-tool-prompts').then(m => m.InteractiveToolPrompts), { ssr: false });

// Define the full list of tools
export const allMedicoToolsList: MedicoTool[] = [
  // Master Orchestrators
  { id: 'supervisor', title: 'Autonomous Supervisor', description: 'Brain-3 hierarchical orchestrator. Ask anything, and the supervisor will route your request to the best specialized subagent with self-healing feedback loops.', icon: BrainCircuit, component: AutonomousSupervisor, isFrequentlyUsed: true, agent: 'studybot' },
  { id: 'deep-solve', title: 'Deep Solve: Diagnostic Solver', description: 'Multi-agent reasoning pipeline for solving complex patient cases with step-by-step verification.', icon: Brain, component: DeepSolveDiagnostic, isFrequentlyUsed: true, agent: 'clinical' },
  { id: 'rag-tutor', title: 'Ask Medi (RAG)', description: 'Resident Genius mentor using semantic RAG for grounded PYQs and flashcards.', icon: DatabaseZap, component: RagTutor, isFrequentlyUsed: true, agent: 'knowledge' },

  // Phase 1: Study & Exam Prep (StudyBot)
  { id: 'timetable', title: 'Active Study Coach', description: 'Task trees, automated study triggers, and proactive planning powered by Brain-3 scheduling tools.', icon: CalendarClock, component: StudyPlannerActiveCoach, isFrequentlyUsed: true, agent: 'studybot' },
  { id: 'mcq', title: 'MCQ Generator', description: 'Create multiple-choice questions for exam practice.', icon: FileQuestion, component: McqGenerator, isFrequentlyUsed: true, agent: 'studybot' },
  { id: 'flashcards', title: 'Flashcard Generator', description: 'Create digital flashcards for quick revision.', icon: Layers, component: FlashcardGenerator, isFrequentlyUsed: true, agent: 'studybot' },
  { id: 'mnemonics', title: 'Mnemonic Generator', description: 'Create memory aids with AI-generated visuals.', icon: Lightbulb, component: MnemonicsGenerator, isFrequentlyUsed: true, agent: 'studybot' },
  { id: 'exams', title: 'Mock Exam Suite', description: 'Take full-length mock exams with MCQs and essays.', icon: Trophy, component: MockExamSuite, agent: 'studybot' },
  { id: 'timetable-creator', title: 'Timetable Creator', description: 'AI-generated timetables based on remaining exam days.', icon: CalendarClock, component: StudyTimetableCreator, isFrequentlyUsed: true, agent: 'studybot' },
  { id: 'topics', title: 'High-Yield Topic Predictor', description: 'Suggest priority topics for study based on exam trends or user performance.', icon: TrendingUp, component: HighYieldTopicPredictor, agent: 'studybot' },
  { id: 'theorycoach-generator', title: 'TheoryCoach: Notes+', description: 'Generates medical summaries with custom aspect-ratio concept art and diagrams using high-fidelity Imagen 3.', component: StudyNotesGenerator, isFrequentlyUsed: true, agent: 'studybot', icon: FileText },
  { id: 'flowcharts', title: 'Flowchart Creator', description: 'Generate flowcharts for medical topics to aid revision.', icon: Workflow, component: FlowchartCreator, agent: 'studybot' },
  { id: 'mock-pyqs', title: 'Mock Exam Paper', description: "Generate mock exam papers simulating previous years, with MCQs and essay questions.", icon: BookCopy, href: '/medico/mock-pyqs', isFrequentlyUsed: true, agent: 'studybot' },
  { id: 'challenges', title: 'Gamified Case Challenges', description: 'Solve timed diagnostic challenges and compete on leaderboards.', icon: Swords, component: GamifiedCaseChallenges, agent: 'studybot' },
  { id: 'progress', title: 'Neural Progress Tracker', description: 'Adaptive self-learning profile that tracks cognitive strengths and weaknesses.', icon: Award, component: ProgressTracker, agent: 'studybot' },
  { id: 'study-sprint', title: 'Study Sprint Planner', description: 'Plan ultra-focused 2-hour study sprints with automated milestone tracking.', icon: Zap, agent: 'studybot' },
  { id: 'anki-export', title: 'Anki Deck Generator', description: 'Export your flashcards directly to .apkg format for Anki synchronization.', icon: DatabaseZap, agent: 'studybot' },
  { id: 'usmle-mimic', title: 'USMLE Question Mimic', description: 'Master NBME style questions with complex multi-step reasoning requirements.', icon: FileQuestion, agent: 'studybot' },

  // Phase 2: Clinical Practice (ClinicalAI)
  { id: 'rounds', title: 'Virtual Patient Rounds', description: 'Simulate ward rounds with patient cases.', icon: Users, component: VirtualPatientRounds, agent: 'clinical' },
  { id: 'ddx', title: 'Differential Diagnosis Trainer', description: 'List diagnoses based on symptoms with feedback.', icon: Brain, component: DifferentialDiagnosisTrainer, agent: 'clinical' },
  { id: 'visualize', title: 'Clinical Telemetry Visualizer', description: 'Transform raw patient vitals and lab data into interactive graphical trends for rapid comprehension.', icon: Activity, component: ClinicalTelemetryVisualizer, agent: 'clinical' },
  { id: 'diagnobot', title: 'DiagnoBot', description: 'Interpret labs, ECGs, X-rays, ABG, etc.', icon: TestTubeDiagonal, component: DiagnoBot, agent: 'clinical' },
  { id: 'dictation', title: 'Smart Dictation', description: 'Use your voice to dictate notes, which AI can help structure.', icon: Mic, component: SmartDictation, agent: 'clinical' },
  { id: 'guided-learning', title: 'Guided Rehab Journeys', description: 'Structured post-operative recovery pathways converted from discharge instructions into interactive milestones.', icon: Navigation, component: GuidedRehabJourney, agent: 'clinical' },
  { id: 'calculators', title: 'Clinical Calculators', description: 'Specialized medical scores (HEART, Wells, CHA2DS2-VASc) powered by dynamic Agent-Skills loading.', icon: Calculator, component: ClinicalCalculators, agent: 'clinical' },
  { id: 'triage-streamliner', title: 'Triage & Referral Streamliner', description: 'Triage patients, recommend specialties, and find nearby facilities with Google Maps.', icon: MapPin, component: TriageReferralStreamliner, agent: 'clinical' },
  { id: 'ecg-analyzer', title: 'ECG Rhythm Analyzer', description: 'Practice interpreting 12-lead ECGs with interactive step-by-step guidance.', icon: Activity, agent: 'clinical' },
  { id: 'osce-simulator', title: 'OSCE Scenario Simulator', description: 'Interactive OSCE station practice with a virtual examiner and grading rubric.', icon: Users, agent: 'clinical' },
  { id: 'case-builder', title: 'Case Scenario Builder', description: 'Create custom clinical cases to test fellow students or for personal study.', icon: CaseUpper, agent: 'clinical' },
  { id: 'physical-exam', title: 'Physical Exam Pro', description: 'Step-by-step guidance on clinical examination techniques with visual cues.', icon: Stethoscope, agent: 'clinical' },

  // Phase 3: Research & Content (KnowledgeHub)
  { id: 'ebm-assistant', title: 'EBM Research Assistant', description: 'Search PubMed for Evidence-Based Medicine (EBM) papers and synthesize clinical answers.', icon: Search, component: EbmResearchAssistant, isFrequentlyUsed: true, agent: 'knowledge' },
  { id: 'gp-notes', title: 'GP Notes Quick-Ref', description: 'Commonly prescribed medications, dosages, and condition-based guidelines at a glance.', icon: BookMarked, href: '/medico/gp-notes', agent: 'knowledge' },
  { id: 'summarizer', title: 'Smart Note Summarizer', description: 'Upload notes (PDF/TXT) and get AI-powered summaries.', icon: FileText, component: NoteSummarizer, agent: 'knowledge' },
  { id: 'knowledge-augmenter', title: 'Knowledge Augmenter', description: 'Expands brief notes with additional comprehensive medical context.', icon: Sparkles, component: KnowledgeAugmenter, agent: 'knowledge' },
  { id: 'ingestion', title: 'MarkItDown: Advanced Ingest', description: 'Enterprise-grade multimodal document structuralization. Preserves tables and Math formulas.', icon: FileUp, component: MarkItDownIngest, isFrequentlyUsed: true, agent: 'knowledge' },
  { id: 'videos', title: 'Video Lecture Library', description: 'Search and find relevant medical video lectures.', icon: Youtube, href: '/medico/videos', agent: 'knowledge' },
  { id: 'cbme', title: 'CBME Competency Browser', description: 'Search and browse through NMC-aligned competencies.', icon: BookMarked, href: '/medico/cbme', agent: 'knowledge' },
  { id: 'library', title: 'Knowledge Hub', description: 'Your personal library of notes, MCQs, and community content.', icon: Library, href: '/medico/library', agent: 'knowledge' },
  { id: 'guidelines-compass', title: 'Guidelines Compass', description: 'NICE, WHO, AHA, IDSA — latest clinical guidelines always at hand.', icon: BookOpen, component: GuidelinesCompass, agent: 'knowledge' },
  { id: 'literature-miner', title: 'Literature Review Miner', description: 'Extract key findings and statistics from a batch of medical journals.', icon: DatabaseZap, agent: 'knowledge' },
  { id: 'texbook-synth', title: 'Textbook Synthesizer', description: 'Merge multiple textbook perspectives on a single topic into a master note.', icon: Layers, agent: 'knowledge' },

  // Phase 4: Specialist Diagnostics (LabCraft)
  { id: 'pharmagenie', title: 'PharmaGenie', description: 'Drug classification, mechanisms, side effects.', icon: FlaskConical, component: PharmaGenie, agent: 'labcraft' },
  { id: 'micromate', title: 'MicroMate', description: 'Bugs, virulence factors, lab diagnosis.', icon: Microscope, component: MicroMate, agent: 'labcraft' },
  { id: 'pathomind', title: 'PathoMind', description: 'Explain any disease pathophysiology with diagrams.', icon: Brain, component: PathoMindExplainer, isFrequentlyUsed: true, agent: 'labcraft' },
  { id: 'anatomy', title: 'Interactive Anatomy Visualizer', description: 'Explore anatomical structures.', icon: Eye, component: AnatomyVisualizer, agent: 'labcraft' },
  { id: 'dosage', title: 'Drug Dosage Calculator', description: 'Practice calculating drug doses.', icon: Calculator, component: DrugDosageCalculator, agent: 'labcraft' },
  { id: 'lab-mapper', title: 'Lab Value Pathology Mapper', description: 'Maps abnormal lab values to potential under-lying pathophysiological states.', icon: TestTubeDiagonal, agent: 'labcraft' },
  { id: 'radiology-reader', title: 'Radiology Reader (Vision)', description: 'AI-assisted interpretation of X-rays and imaging with MedGemma reasoning.', icon: Eye, agent: 'labcraft' },
  { id: 'abg-analyser', title: 'ABG Analyser', description: 'Complex acid-base balance interpretation with clinical correlations.', icon: FlaskConical, agent: 'labcraft' },
  { id: 'pathology-slides', title: 'Pathology Slide Viewer', description: 'Virtual microscopy for identifying histological features of diseases.', icon: Microscope, agent: 'labcraft' },

  // Phase 5: Advanced Simulation (DeepTutor)
  { id: 'virtual-board', title: 'Virtual Medical Board', description: 'Simulate a multi-specialist round table discussion (Cardio, Nephro, ID) for complex patient cases.', icon: Users, component: VirtualMedicalBoard, agent: 'tutor' },
  { id: 'vibevoice-lecture', title: 'VibeVoice: Lecture Recorder', description: 'Zero-latency lecture capture with 6-minute agentic chunking and 1-hour master synthesis via Gemini 2.5 Pro.', icon: Mic, component: VibeVoiceLectureRecorder, isFrequentlyUsed: true, agent: 'tutor' },
  { id: 'concept-video', title: 'Veo-Med: Video Synthesis', description: 'Agentic video synthesis for photorealistic medical animations and surgical procedures using Veo 3 architecture.', icon: Youtube, component: ConceptVideoCreator, isFrequentlyUsed: true, agent: 'tutor' },
  { id: 'physiology-sim', title: 'Physiology Lab Simulator', description: 'Interactive models of cardiac output, renal filtration, and respiratory mechanics.', icon: HeartPulse, agent: 'tutor' },
  { id: 'focus-music', title: 'Focus Music Generator', description: 'Generate optimal Lyria prompts for lo-fi deep focus music.', icon: Mic, component: FocusMusicGenerator, agent: 'tutor' },
  { id: 'socratic-tutor', title: 'Socratic Preceptor', description: 'A teaching bot that guides you through a case without giving direct answers.', icon: BrainCircuit, agent: 'tutor' },

  // Phase 6: Professional Workflow (Pro Mode)
  { id: 'discharge-summary', title: 'Discharge Summary Tool', description: 'Automated generation of finalized patient discharge documentation from daily notes.', icon: FileText, isPro: true, agent: 'pro' },
  { id: 'handover-assistant', title: 'On-Call Handover Assistant', description: 'Streamline shift transitions with AI-summarized patient status and outstanding tasks.', icon: Activity, isPro: true, agent: 'pro' },
  { id: 'ai-cowriter', title: 'Clinical Co-Writer', description: 'Collaborative AI documentation assistant for drafting SOAP notes, referral letters and summaries.', icon: PenLine, component: ClinicalCoWriter, isFrequentlyUsed: true, agent: 'pro' },
  { id: 'pharmacopeia-checker', title: 'Pharmacopeia Pro', description: 'Verify interactions across entire patient medication lists with real-time safety alerts.', icon: Pill, isPro: true, agent: 'pro' },
  { id: 'heartbeat', title: 'Proactive Heartbeat: Monitoring', description: 'Continuous patient monitoring engine that evaluates telemetry & medication adherence asynchronously.', icon: Heart, component: PatientMonitoringDashboard, isFrequentlyUsed: true, agent: 'pro' },
  { id: 'ward-manager', title: 'Patient Ward Manager', description: 'Centralized dashboard for tracking 30+ patients with automated priority triaging.', icon: LayoutDashboard, isPro: true, agent: 'pro' },
  { id: 'admission-flow', title: 'Admission to Discharge', description: 'End-to-end clinical workflow management tool for the entire hospital stay.', icon: Workflow, isPro: true, agent: 'pro' },
  { id: 'presentation-synth', title: 'Ward Round Formatter', description: 'Instantly format patient data into a concise presentation for consultant rounds.', icon: FileText, isPro: true, agent: 'pro' },

  // Metadata & System
  { id: 'support-chatbot', title: 'IT Support Bot', description: 'Context-aware IT agent fueled by the app history to help you troubleshoot MediAssistant features.', icon: Bot, component: SupportAgent, agent: 'studybot' },
  { id: 'clinical-recipes', title: 'Clinical & Study Recipes', description: 'Portable YAML workflows to standardize complex, multi-agent AI processes.', icon: FileCode, component: ClinicalRecipesManager, isFrequentlyUsed: true, agent: 'pro' },
  { id: 'omnichannel-sessions', title: 'Omnichannel Sessions', description: 'Seamlessly transition across devices, export AI reasoning chains, and review adversary decisions.', icon: MonitorSmartphone, component: OmnichannelSessionManager, isFrequentlyUsed: true, agent: 'pro' },
  { id: 'interactive-prompts', title: 'Interactive Safety Control', description: 'Manage Human-In-The-Loop approvals and toggle local-first model resilience.', icon: ShieldAlert, component: InteractiveToolPrompts, isFrequentlyUsed: true, agent: 'pro' },
];


export const frequentlyUsedMedicoToolIds: ActiveToolId[] = ['supervisor', 'rag-tutor', 'ebm-assistant', 'mcq', 'theorycoach-generator', 'vibevoice-lecture', 'concept-video', 'flashcards', 'mnemonics', 'pathomind', 'mock-pyqs'];
