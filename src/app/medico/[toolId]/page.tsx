// src/app/medico/[toolId]/page.tsx
'use client';

import { useParams, useSearchParams, notFound } from 'next/navigation';
import { allMedicoToolsList } from '@/config/medico-tools-config';
import React, { Suspense, useMemo } from 'react';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { Loader2, Sparkles, BookOpen, Clock, Activity, Brain, Target, Network, Layers, CheckSquare, Lightbulb, TrendingUp, Palette, FileText, Workflow, DatabaseZap, CheckCircle2, Swords, Trophy, BrainCircuit, Mic, Calculator, Navigation, TestTubeDiagonal, ScanEye, Microscope, FlaskConical, Github, BookMarked, Search, MapPin, BotMessageSquare, Bot, FileUp, PenLine, Heart, Wand2, Globe, FileCode, MonitorSmartphone, ShieldAlert, HeartPulse, Pill, Zap, LayoutDashboard, Stethoscope, Sparkle, Award, Users, Youtube } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Custom functionality insights for each StudyBot tool
const TOOL_INSIGHTS: Record<string, {
    subtitle: string;
    descriptionExt: string;
    architectures: { icon: any, label: string, value: string }[]
}> = {
    'timetable': {
        subtitle: 'Brain-3 Active Study Coach',
        descriptionExt: 'Automatically decomposes your exam syllabus into a persistent granular task tree. Generates daily coaching packets backed by PubMed to actively guide your learning.',
        architectures: [
             { icon: Brain, label: 'Orchestration', value: 'Brain-3 Subagent' },
             { icon: Activity, label: 'Execution', value: 'Task Decomposition' },
             { icon: Sparkles, label: 'Generation', value: 'Daily Study Packets' }
        ]
    },
    'timetable-creator': {
        subtitle: 'Predictive Timetable Creator',
        descriptionExt: 'Input your exam date and weaknesses. The AI schedules optimal study hours using spaced repetition curves, ensuring you hit peak memory retention right on exam day.',
        architectures: [
             { icon: Clock, label: 'Scheduling', value: 'Spaced Optimization' },
             { icon: Target, label: 'Targeting', value: 'Weakness Prioritized' },
             { icon: Sparkles, label: 'Engine', value: 'Generative Algorithm' }
        ]
    },
    'mcq': {
        subtitle: 'Dynamic MCQ Generator',
        descriptionExt: 'Stop relying on static question banks. Generate on-the-fly, clinical-scenario MCQs tailored to your exact prompt, complete with comprehensive explanations and distractors.',
        architectures: [
             { icon: Brain, label: 'AI Model', value: 'Clinical Reasoning Refined' },
             { icon: CheckSquare, label: 'Validation', value: 'Distractor Analysis' },
             { icon: Sparkles, label: 'Capability', value: 'Infinite Generation' }
        ]
    },
    'flashcards': {
         subtitle: 'Spaced Repetition Engine',
         descriptionExt: 'Paste your notes or provide a topic. The agent instantly breaks it down into Anki-style flashcards using proven memory techniques like active recall formatting.',
         architectures: [
             { icon: Layers, label: 'Algorithm', value: 'SuperMemo-2 Pattern' },
             { icon: Activity, label: 'Format', value: 'Active Recall' },
             { icon: Network, label: 'Structure', value: 'Granular Chunking' }
        ]
    },
    'mnemonics': {
         subtitle: 'Custom Mnemonic Creator',
         descriptionExt: 'Struggling to remember drug classes or cranial nerves? Generates creative, vivid mnemonics tailored to your exact syllabus requirements.',
         architectures: [
             { icon: Lightbulb, label: 'Pattern', value: 'Cognitive Association' },
             { icon: Brain, label: 'Model', value: 'Semantic Engine' },
             { icon: Sparkles, label: 'Output', value: 'Memory Triggers' }
        ]
    },
    'exams': {
         subtitle: 'Interactive Mock Exam Suite',
         descriptionExt: 'Simulate high-stakes exam environments with timed, multi-disciplinary question sets. Features built-in predictive scoring models to track readiness.',
         architectures: [
             { icon: Activity, label: 'Simulation', value: 'Real-time Environment' },
             { icon: Target, label: 'Scoring', value: 'Predictive Analytics' },
             { icon: Network, label: 'Dataset', value: 'Multidisciplinary' }
        ]
    },
    'topics': {
         subtitle: 'High-Yield Topic Predictor',
         descriptionExt: 'Analyzes historical exam patterns and your previous quiz scores to mathematically predict the optimal topics you should revise next.',
         architectures: [
             { icon: TrendingUp, label: 'Analysis', value: 'Historical Patterns' },
             { icon: Brain, label: 'AI Engine', value: 'Predictive Scoring' },
             { icon: Target, label: 'Focus', value: 'High-Yield Targeting' }
        ]
    },
    'theorycoach-generator': {
         subtitle: 'TheoryCoach: Notes & Art',
         descriptionExt: 'Instantly convert dense textbooks into easily digestible bullet-points accompanied by custom 3D concept art and high-fidelity diagrams via Imagen 3.',
         architectures: [
             { icon: Palette, label: 'Visuals', value: 'Imagen 3 Generation' },
             { icon: FileText, label: 'Processing', value: 'Semantic Summarization' },
             { icon: Sparkles, label: 'Output', value: 'Beautiful Markdown' }
        ]
    },
    'flowcharts': {
         subtitle: 'Visual Workflow Engine',
         descriptionExt: 'Transform complex biochemical pathways or treatment guidelines into interactive node-based flowcharts that you can visually navigate.',
         architectures: [
             { icon: Workflow, label: 'Mapping', value: 'Node-Graph Mapping' },
             { icon: Brain, label: 'Parsing', value: 'Sequence Extraction' },
             { icon: Network, label: 'Format', value: 'React Flow Interactive' }
        ]
    },
    'mock-pyqs': {
         subtitle: 'Previous Year Question Simulator',
         descriptionExt: 'Interact directly with past papers for USMLE, PLAB, and university exams. The AI breaks down the logic behind every single historically correct answer.',
         architectures: [
             { icon: DatabaseZap, label: 'Data', value: 'Historical Archives' },
             { icon: Brain, label: 'Reasoning', value: 'Step-by-Step Logic' },
             { icon: CheckCircle2, label: 'Validation', value: 'Official Key Alignment' }
        ]
    },
    'challenges': {
         subtitle: 'Gamified Clinical Challenges',
         descriptionExt: 'Step into the ER. Rapid-fire gamified cases that force you to make decisions under pressure. Earn experience points and track leaderboards.',
         architectures: [
             { icon: Swords, label: 'Mechanic', value: 'Time-Pressure Loop' },
             { icon: Activity, label: 'Scoring', value: 'Decision Weighting' },
             { icon: Trophy, label: 'System', value: 'XP & Leaderboards' }
        ]
    },
    'progress': {
         subtitle: 'Neural Progress Tracker',
         descriptionExt: 'A unified diagnostic view of your entire cognitive footprint. Recommends interventions precisely where your knowledge graph shows weaknesses.',
         architectures: [
             { icon: BrainCircuit, label: 'Mapping', value: 'Cognitive Footprint' },
             { icon: Target, label: 'Intervention', value: 'Automated Routing' },
             { icon: Network, label: 'Visualization', value: 'Knowledge Graph' }
        ]
    },
    'deep-solve': {
         subtitle: 'Deep Solve Diagnostic Pipeline',
         descriptionExt: 'A recursive, multi-agent reasoning pipeline that cross-examines clinical symptoms, lab findings, and imaging data to synthesize a high-confidence step-by-step diagnostic verification.',
         architectures: [
             { icon: BrainCircuit, label: 'Pipeline', value: 'Multi-Agent Tree' },
             { icon: Activity, label: 'Validation', value: 'Cross-Examination' },
             { icon: Sparkles, label: 'Output', value: 'Differential Proof' }
        ]
    },
    'rounds': {
         subtitle: 'Virtual Patient Rounds',
         descriptionExt: 'Immerse yourself in photorealistic, voice-enabled, open-ended clinical interactions. Practice delivering difficult news, taking histories, and formulating management plans as if you are on the wards.',
         architectures: [
             { icon: Network, label: 'Interaction', value: 'Voice & Semantic RAG' },
             { icon: Brain, label: 'Simulation', value: 'Dynamic State' },
             { icon: CheckSquare, label: 'Feedback', value: 'Examiner Grading' }
        ]
    },
    'ddx': {
         subtitle: 'DDX Trainer',
         descriptionExt: 'Given a complex constellation of symptoms, synthesize an accurate differential diagnosis. AI actively interprets labs and imaging while prodding you to refine your diagnostic anchors.',
         architectures: [
             { icon: Layers, label: 'Reasoning', value: 'Diagnostic Anchors' },
             { icon: Target, label: 'Mechanism', value: 'Iterative Refinement' },
             { icon: Sparkles, label: 'Guidance', value: 'Socratic Prompting' }
        ]
    },
    'visualize': {
         subtitle: 'Clinical Telemetry Visualizer',
         descriptionExt: 'Generates mock, real-time-like ICU telemetry visuals from raw diagnostic data. Formulate critical interventions by practicing reading dynamically changing patient trends.',
         architectures: [
             { icon: Activity, label: 'Engine', value: 'Time-Series Gen' },
             { icon: Workflow, label: 'Visualization', value: 'D3/Recharts' },
             { icon: Brain, label: 'Context', value: 'Physiologic Rules' }
        ]
    },
    'diagnobot': {
         subtitle: 'DiagnoBot AI Assistant',
         descriptionExt: 'Your bedside companion. Ask DiagnoBot any symptom inquiry or ask it to interpret a raw ABG output, and get instant, clinically contextualized, evidence-based direction.',
         architectures: [
             { icon: Brain, label: 'Function', value: 'Instant Interpretation' },
             { icon: DatabaseZap, label: 'Context', value: 'Guidelines Synced' },
             { icon: Sparkles, label: 'Output', value: 'Actionable Advice' }
         ]
    },
    'dictation': {
         subtitle: 'Smart Dictation Transcriber',
         descriptionExt: 'A voice-to-text integration optimized purely for complex medical taxonomy. Talk through your clinical note naturally and watch it perfectly structure itself into a SOAP format.',
         architectures: [
             { icon: Mic, label: 'Input', value: 'Speech-to-Text' },
             { icon: Brain, label: 'Parsing', value: 'Taxonomy Dictionary' },
             { icon: FileText, label: 'Output', value: 'Structured SOAP' }
         ]
    },
    'guided-learning': {
         subtitle: 'Guided Rehab Journeys',
         descriptionExt: 'Standardized post-operative discharge instructions are transformed effortlessly into clear, actionable daily milestones for improved patient compliance and engagement.',
         architectures: [
             { icon: Layers, label: 'Parsing', value: 'Instruction Mapping' },
             { icon: Network, label: 'Structure', value: 'Milestone Journey' },
             { icon: Activity, label: 'Goal', value: 'Recovery Tracking' }
         ]
    },
    'calculators': {
         subtitle: 'Dynamic Clinical Calculators',
         descriptionExt: 'A unified suite of specialized medical scores (HEART, Wells, CHA2DS2-VASc, etc.) loaded dynamically via specific agentic skills to guide crucial clinical pathways.',
         architectures: [
             { icon: Calculator, label: 'Computation', value: 'Formula Logic' },
             { icon: Target, label: 'Integration', value: 'Agentic Tools' },
             { icon: CheckCircle2, label: 'Precision', value: 'Deterministic' }
         ]
    },
    'triage-streamliner': {
         subtitle: 'Intelligent Triage & Referral',
         descriptionExt: 'Triage patient symptoms efficiently through an active red-flag analysis. Automate predictive specialty referrals and connect via Google Maps for surrounding facility routing.',
         architectures: [
             { icon: Network, label: 'Analysis', value: 'Red-Flag Parsing' },
             { icon: Navigation, label: 'Routing', value: 'Google Maps API' },
             { icon: Workflow, label: 'Output', value: 'Triage Protocol' }
         ]
    },
    'pharmagenie': {
         subtitle: 'PharmaGenie: Interaction Engine',
         descriptionExt: 'Analyzes multi-drug interactions and provides safe dosage adjustments based on genetic metabolism profiles and comorbid conditions.',
         architectures: [
             { icon: Pill, label: 'System', value: 'Ontology Mapping' },
             { icon: BrainCircuit, label: 'Logic', value: 'Interaction Tree' },
             { icon: CheckCircle2, label: 'Safety', value: 'Error Guarding' }
         ]
    },
    'micromate': {
         subtitle: 'MicroMate: Lab Assistant',
         descriptionExt: 'Automates pathogen identification from lab reports and suggests targeted antimicrobial therapy while monitoring for resistance patterns.',
         architectures: [
             { icon: Microscope, label: 'Vision', value: 'Smear Analysis' },
             { icon: FlaskConical, label: 'Testing', value: 'Sensitivity Matrix' },
             { icon: ShieldAlert, label: 'Global', value: 'Resistance Tracking' }
         ]
    },
    'pathomind': {
         subtitle: 'PathoMind: Disease Explainer',
         descriptionExt: 'Explain any disease pathophysiology using animated causal chains. Bridges the gap between basic science and clinical presentation.',
         architectures: [
             { icon: BrainCircuit, label: 'Reasoning', value: 'Causal Chain' },
             { icon: Activity, label: 'Dynamic', value: 'Live Simulation' },
             { icon: Sparkles, label: 'Visual', value: 'Animated Path' }
         ]
    },
    'ebm-assistant': {
        subtitle: 'EBM Research Scraper',
        descriptionExt: 'Autonomously searches current medical literature to answer clinical queries with the highest level of evidence. Grades papers using Oxford CEBM criteria.',
        architectures: [
            { icon: Globe, label: 'Scope', value: 'Global Literature' },
            { icon: DatabaseZap, label: 'Search', value: 'Semantic RAG' },
            { icon: Award, label: 'Grading', value: 'CEBM Standards' }
        ]
    },
    'summarizer': {
        subtitle: 'Smart Note Summarizer',
        descriptionExt: 'Upload lecture slides, textbooks, or patient history files. Agentic summarization preserves high-yield facts while trimming academic fluff for rapid review.',
        architectures: [
            { icon: FileText, label: 'Input', value: 'Multimodal Parsing' },
            { icon: Brain, label: 'Logic', value: 'High-Yield Filter' },
            { icon: CheckSquare, label: 'Verification', value: 'Fact-Check Loop' }
        ]
    },
    'ingestion': {
        subtitle: 'Enterprise Document Ingest',
        descriptionExt: 'Convert any clinical report (PDF, Image, Scan) into clean, high-reasoning Markdown. Preserves critical table structures and medical notation integrity.',
        architectures: [
            { icon: FileUp, label: 'Ingest', value: 'Omni-Parsing' },
            { icon: ScanEye, label: 'Vision', value: 'OCR Refinement' },
            { icon: Workflow, label: 'Format', value: 'Markdown Struct' }
        ]
    },
    'virtual-board': {
        subtitle: 'Virtual Medical Board',
        descriptionExt: 'Simulate a high-level case conference. Distinct AI personas representing different specialties (Surgeon, Internist, Pathologist) debate clinical cases for optimal outcomes.',
        architectures: [
            { icon: Users, label: 'Simulation', value: 'Multi-Persona' },
            { icon: BrainCircuit, label: 'Logic', value: 'Contradictory Logic' },
            { icon: Target, label: 'Outcome', value: 'Consensus Report' }
        ]
    },
    'vibevoice-lecture': {
        subtitle: 'VibeVoice: Lecture Sync',
        descriptionExt: 'Real-time lecture recording that auto-segments audio into concept-nodes. Generates a master knowledge graph of the lecture by cross-referencing textbook data.',
        architectures: [
            { icon: Mic, label: 'Capture', value: 'Segmented Audio' },
            { icon: Network, label: 'Linkage', value: 'Knowledge Graph' },
            { icon: Clock, label: 'Latency', value: 'Zero-Lag Sync' }
        ]
    },
    'concept-video': {
        subtitle: 'Veo-Med: Video Synthesis',
        descriptionExt: 'Generate 4K medical animations and surgical procedures. Describe the procedure, and Veo-Med synthesizes a photorealistic visualization for educational use.',
        architectures: [
            { icon: Youtube, label: 'Engine', value: 'Veo-Med Video Gen' },
            { icon: Palette, label: 'Visuals', value: 'Imagen 3 Context' },
            { icon: Brain, label: 'Accuracy', value: 'Anatomical Reality' }
        ]
    },
    'ai-cowriter': {
        subtitle: 'Clinical Documentation Partner',
        descriptionExt: 'Collaborative AI that writes *with* you. Start a patient note, and it suggests relevant examination findings or ICD-10 codes based on the clinical context.',
        architectures: [
            { icon: PenLine, label: 'Co-Writing', value: 'Contextual Suggest' },
            { icon: Brain, label: 'Code', value: 'ICD-10 Auto-map' },
            { icon: FileText, label: 'Output', value: 'Full SOAP Note' }
        ]
    },
    'rag-tutor': {
        subtitle: 'Ask Medi: Generative RAG',
        descriptionExt: 'A resident genius mentor that uses semantic Retrieval Augmented Generation (RAG) to ground every answer in current clinical evidence, PYQs, and high-yield flashcards.',
        architectures: [
            { icon: DatabaseZap, label: 'Knowledge', value: 'Semantic Vector DB' },
            { icon: BrainCircuit, label: 'Logic', value: 'Hybrid search' },
            { icon: Sparkles, label: 'Response', value: 'Grounded Output' }
        ]
    },
    'knowledge-augmenter': {
        subtitle: 'Context Extrapolator',
        descriptionExt: 'Paste a brief clinical finding or a single sentence from a textbook. The Knowledge Augmenter expands it into a comprehensive deep-dive note with related mechanisms and literature links.',
        architectures: [
            { icon: Sparkles, label: 'Expansion', value: 'Knowledge Synthesis' },
            { icon: Layers, label: 'Depth', value: 'Mechanism-focused' },
            { icon: BookOpen, label: 'Linkage', value: 'PubMed References' }
        ]
    },
    'guidelines-compass': {
        subtitle: 'Global Guidelines Engine',
        descriptionExt: 'Real-time access to NICE, WHO, AHA, and local hospital protocols. The compass maps patient scenarios directly to the current standard of care with level-of-evidence grading.',
        architectures: [
            { icon: Navigation, label: 'Guidance', value: 'Clinical Pathways' },
            { icon: Globe, label: 'Scope', value: 'WHO/NICE Standard' },
            { icon: Award, label: 'Grading', value: 'Evidence Grade A-D' }
        ]
    },
    'supervisor': {
        subtitle: 'Brain-3 Hierarchical Orchestrator',
        descriptionExt: 'The brain of MediAssistant. Routes any complex medical query to a specialized fleet of subagents, recursively refining the output until it meets clinical-grade accuracy.',
        architectures: [
            { icon: BrainCircuit, label: 'Hierarchy', value: 'Supervisor Pattern' },
            { icon: Workflow, label: 'Execution', value: 'Agentic Routing' },
            { icon: HeartPulse, label: 'Self-Healing', value: 'Feedback Loop' }
        ]
    },
    'heartbeat': {
        subtitle: 'Proactive Monitoring Engine',
        descriptionExt: 'A background service that continuously evaluates patient telemetry and medication adherence. Triggers proactive alerts when it detects deviations from the care plan.',
        architectures: [
            { icon: Heart, label: 'Telemetry', value: 'Asynchronous Scan' },
            { icon: Activity, label: 'Alerting', value: 'Threshold Analysis' },
            { icon: ShieldAlert, label: 'Safety', value: 'Deviance Guard' }
        ]
    }
};

function MedicoToolPageContent() {
    const params = useParams();
    const searchParams = useSearchParams();
    const toolId = params.toolId as string;
    const topic = searchParams.get('topic');

    const tool = useMemo(() => {
      if (!toolId) return null;
      return allMedicoToolsList.find(t => t.id === toolId);
    }, [toolId]);

    if (!tool) {
        notFound();
    }

    // Since component is now required for this route, we don't need to check for its existence
    // Exception: mock-pyqs and cbme use href not component according to config, but wait, those don't route here if they have their own folder!
    // mock-pyqs uses `/medico/mock-pyqs` folder. Wait, the route says `href: '/medico/mock-pyqs'`, so the page in `src/app/medico/[toolId]` will throw if no component. Allow component to be optional or redirect.
    const ToolComponent = tool.component;

    if (!ToolComponent) {
        // Fallback for tools that have href instead of components
        if (typeof window !== "undefined" && (tool as any).href) {
             window.location.href = (tool as any).href;
        }
        return <div className="p-8 text-center">Redirecting...</div>;
    }

    const customInsight = TOOL_INSIGHTS[toolId] || {
        subtitle: 'Brain-3 Agent',
        descriptionExt: 'A dedicated Medico agent designed to provide cognitive acceleration and optimize your workflow entirely autonomously.',
        architectures: [
            { icon: Brain, label: 'Model', value: 'Brain-3 Subagent' },
            { icon: Activity, label: 'Workflow', value: 'High-Yield Mapping' },
            { icon: Sparkles, label: 'Capability', value: 'Predictive & Generative' }
        ]
    };

    return (
        <PageWrapper title={tool.title}>
            <div className="flex flex-col gap-8 w-full max-w-6xl mx-auto px-2 md:px-0 pb-16 pt-2">
                
                {/* Hero Section */}
                <div className="relative overflow-hidden rounded-[2.5rem] bg-[var(--s0)] border border-[var(--sep)] shadow-[var(--shm)] p-8 md:p-12 z-10">
                    <div className="absolute inset-0 bg-gradient-to-r from-[var(--blue)]/10 via-[var(--pur)]/5 to-transparent pointer-events-none" />
                    
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 relative z-10">
                        <div className="max-w-2xl">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 rounded-[1rem] bg-[var(--fill)] border border-[var(--sep)] flex items-center justify-center text-[var(--blue)] shadow-[var(--sh)]">
                                    <tool.icon className="h-6 w-6" />
                                </div>
                                <span className="px-3 py-1 text-[10px] uppercase tracking-widest font-bold bg-[var(--blue)]/10 text-[var(--blue)] rounded-full border border-[var(--blue)]/20">
                                    {customInsight.subtitle}
                                </span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-[Fraunces] tracking-tight font-light text-[var(--lb)] mb-4">
                                {tool.title}
                            </h1>
                            <p className="text-[16px] text-[var(--sec)] leading-relaxed font-medium">
                                {tool.description}
                                {" "}{customInsight.descriptionExt}
                            </p>
                        </div>

                        {/* Functionality Insights Mini-Bento */}
                        <div className="grid grid-cols-2 gap-3 w-full md:w-auto shrink-0 md:min-w-[320px]">
                            <div className="p-4 rounded-3xl bg-[var(--fill)] border border-[var(--sep)]">
                                {React.createElement(customInsight.architectures[0].icon, { className: "w-4 h-4 text-[var(--pur)] mb-2" })}
                                <div className="text-[11px] uppercase tracking-widest font-bold text-[var(--ter)] mb-1">{customInsight.architectures[0].label}</div>
                                <div className="text-[13px] font-semibold text-[var(--lb)]">{customInsight.architectures[0].value}</div>
                            </div>
                            <div className="p-4 rounded-3xl bg-[var(--fill)] border border-[var(--sep)]">
                                {React.createElement(customInsight.architectures[1].icon, { className: "w-4 h-4 text-[var(--blue)] mb-2" })}
                                <div className="text-[11px] uppercase tracking-widest font-bold text-[var(--ter)] mb-1">{customInsight.architectures[1].label}</div>
                                <div className="text-[13px] font-semibold text-[var(--lb)]">{customInsight.architectures[1].value}</div>
                            </div>
                            <div className="p-4 rounded-3xl bg-[var(--fill)] border border-[var(--sep)] col-span-2">
                                {React.createElement(customInsight.architectures[2].icon, { className: "w-4 h-4 text-emerald-500 mb-2" })}
                                <div className="text-[11px] uppercase tracking-widest font-bold text-[var(--ter)] mb-1">{customInsight.architectures[2].label}</div>
                                <div className="text-[13px] font-semibold text-[var(--lb)]">{customInsight.architectures[2].value}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* The Tool Itself */}
                <div className="relative z-20">
                    <Suspense fallback={
                        <div className="flex justify-center items-center min-h-[400px]">
                            <div className="flex flex-col items-center gap-4">
                                <Loader2 className="h-10 w-10 animate-spin text-[var(--blue)]" />
                                <span className="text-sm font-medium text-[var(--sec)] tracking-wider uppercase animate-pulse">Initializing Agent Environment...</span>
                            </div>
                        </div>
                    }>
                        <ToolComponent initialTopic={topic} />
                    </Suspense>
                </div>
            </div>
        </PageWrapper>
    );
}

export default function MedicoToolPage() {
    return (
        // The outer Suspense is for loading the page content itself (including params hooks)
        <Suspense fallback={
            <PageWrapper title="Loading Tool...">
                <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
            </PageWrapper>
        }>
            <MedicoToolPageContent />
        </Suspense>
    );
}
