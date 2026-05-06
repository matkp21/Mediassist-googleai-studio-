"use client";

import React, { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams, useRouter } from "next/navigation";
import { 
  BookMarked, BrainCircuit, FileText, Stethoscope, 
  Activity, Star, Search, Pill, Layers, Eye, 
  FlaskConical, HeartPulse, ChevronRight, Crown, Lock, X
} from "lucide-react";
import { useProMode } from "@/contexts/pro-mode-context";
import { MiniOrgan } from "@/components/medico/MiniOrgan";

const AGENTS = {
  studybot: { label: "StudyBot", color: "#4B8FF7", shape: "brain", desc: "Your personal intelligent assistant for planning schedules and optimizing your study habits with cognitive spacing techniques." },
  clinical: { label: "ClinicalAI", color: "#F56080", shape: "heart", desc: "Master cardiovascular systems and general clinical diagnostics. Uses real-time physiological models to simulate conditions." },
  knowledge: { label: "KnowledgeHub", color: "#A07DF0", shape: "dna", desc: "Centralized repository for genetics, bio-chemistry pathways, and the latest medical guidelines, constantly updated." },
  labcraft: { label: "LabCraft", color: "#32C97E", shape: "skeleton", desc: "Analyze lab results and structural anomalies. Perfect for orthopedics and pathology diagnostics training." },
  tutor: { label: "DeepTutor", color: "#F7BC26", shape: "brain", desc: "Socratic tutoring model that challenges your thought process. It won't give you the answer, but it will lead you to it." },
  pro: { label: "Pro Mode", color: "#6366f1", isProMode: true, shape: "heart", desc: "Unlock all advanced medical models, remove usage limits, and get priority access to 3D AR diagnostic simulations." },
};

const iconMap: Record<string, any> = {
  Activity, BrainCircuit, Layers, Star, FileText, Search,
  BookMarked, Stethoscope, HeartPulse, Eye, Pill, FlaskConical
};

const TOOLS = [
  // StudyBot (12)
  { id: 1, name: "Active Study Coach", desc: "Generates task trees and scheduling powered by Brain-3 learning agents.", agent: "studybot", Icon: "Activity", routeId: "timetable" },
  { id: 2, name: "MCQ Generator", desc: "Automatic, AI-generated study aids with visual associations.", agent: "studybot", Icon: "BrainCircuit", routeId: "mcq" },
  { id: 3, name: "Flashcard Generator", desc: "Spaced repetition flashcards generated from your notes.", agent: "studybot", Icon: "Layers", routeId: "flashcards" },
  { id: 4, name: "Mnemonic Generator", desc: "Custom memory aids for difficult drug lists.", agent: "studybot", Icon: "Star", routeId: "mnemonics" },
  { id: 5, name: "Mock Exam Suite", desc: "Interactive medical challenges to prep you for the real deal.", agent: "studybot", Icon: "FileText", routeId: "exams" },
  { id: 6, name: "Timetable Creator", desc: "AI-generated timetables based on remaining exam days.", agent: "studybot", Icon: "Activity", routeId: "timetable-creator" },
  { id: 7, name: "High-Yield Predictor", desc: "Predicts high-yield topics based on past year questions.", agent: "studybot", Icon: "Search", routeId: "topics" },
  { id: 8, name: "Notes Generator", desc: "Generates notes from uploaded textbooks and slides.", agent: "studybot", Icon: "BookMarked", routeId: "theorycoach-generator" },
  { id: 9, name: "Flowchart Creator", desc: "Interactive flowchart generation for complex cases.", agent: "studybot", Icon: "Layers", routeId: "flowcharts" },
  { id: 10, name: "PYQ Simulator", desc: "USMLE, PLAB & MBBS past-year questions with pattern analysis.", agent: "studybot", Icon: "Star", routeId: "mock-pyqs" },
  { id: 11, name: "Gamified Challenges", desc: "Gamified Case Challenges to test your knowledge.", agent: "studybot", Icon: "Star", routeId: "challenges" },
  { id: 12, name: "Neural Progress Tracker", desc: "Visual dashboard of memory retention over time.", agent: "studybot", Icon: "Activity", routeId: "progress" },

  // ClinicalAI (9)
  { id: 13, name: "Deep Solve Diagnostic", desc: "A multi-agent reasoning pipeline for step-by-step diagnostic verification.", agent: "clinical", Icon: "Stethoscope" },
  { id: 14, name: "Virtual Patient Rounds", desc: "Practice clinical skills with virtual patient encounters.", agent: "clinical", Icon: "Activity" },
  { id: 15, name: "DDX Trainer", desc: "Interprets labs/radiology and runs differential diagnosis challenges.", agent: "clinical", Icon: "BrainCircuit" },
  { id: 16, name: "Telemetry Viz", desc: "Maps raw patient vitals into interactive graphical trends.", agent: "clinical", Icon: "Activity" },
  { id: 17, name: "ECG Interpreter", desc: "Upload any ECG — AI reads rhythm, axis and pathology.", agent: "clinical", Icon: "HeartPulse" },
  { id: 18, name: "OSCE Examiner", desc: "Structured clinical exams with examiner-grade feedback.", agent: "clinical", Icon: "Star" },
  { id: 19, name: "DiagnoBot", desc: "Answers clinical queries based on patient symptoms.", agent: "clinical", Icon: "Stethoscope" },
  { id: 20, name: "Smart Dictation", desc: "Voice-to-text dictation optimized for medical terms.", agent: "clinical", Icon: "FileText" },
  { id: 21, name: "Guided Rehab Journeys", desc: "Converts standard discharge instructions into structured, interactive milestones.", agent: "clinical", Icon: "Layers" },

  // KnowledgeHub (9)
  { id: 22, name: "Ask Medi RAG-Tutor", desc: "A dedicated semantic RAG chat linked directly to student's uploaded materials and notes.", agent: "knowledge", Icon: "Search", routeId: "rag-tutor" },
  { id: 23, name: "EBM Research", desc: "Searches PubMed and academic databases for Evidence-Based answers.", agent: "knowledge", Icon: "BookMarked", routeId: "ebm-assistant" },
  { id: 24, name: "Note Summarizer", desc: "Convert long lecture notes into high-yield summaries.", agent: "knowledge", Icon: "FileText", routeId: "summarizer" },
  { id: 25, name: "Knowledge Augmenter", desc: "Enriches your study notes with latest guidelines.", agent: "knowledge", Icon: "BrainCircuit", routeId: "knowledge-augmenter" },
  { id: 26, name: "MarkItDown Ingest", desc: "An enterprise-grade multimodal document structuralization tool.", agent: "knowledge", Icon: "Layers", routeId: "ingestion" },
  { id: 27, name: "Video Lecture Library", desc: "Browse through a rich library of medical videos.", agent: "knowledge", Icon: "Eye", routeId: "videos" },
  { id: 28, name: "CBME Browser", desc: "CBME Competency Browser & Solved Papers Viewer for curriculum-focused study.", agent: "knowledge", Icon: "FileText", routeId: "cbme" },
  { id: 29, name: "Community Sharing & Library", desc: "Your personal library and community resources.", agent: "knowledge", Icon: "Activity", routeId: "library" },
  { id: 30, name: "Guidelines Compass", desc: "NICE, WHO, AHA, IDSA — latest guidelines always ready.", agent: "knowledge", Icon: "Layers", routeId: "guidelines-compass" },

  // LabCraft (9)
  { id: 31, name: "PharmaGenie", desc: "Specialized pharmacological interactions engine.", agent: "labcraft", Icon: "Pill" },
  { id: 32, name: "MicroMate", desc: "Microbiological profile engine identifying pathogens.", agent: "labcraft", Icon: "FlaskConical" },
  { id: 33, name: "PathoMind", desc: "Explains disease pathophysiology alongside AI-generated diagrams.", agent: "labcraft", Icon: "BrainCircuit" },
  { id: 34, name: "Radiology Reader", desc: "AI reads X-ray, CT, MRI, Ultrasound with confidence scores.", agent: "labcraft", Icon: "Eye" },
  { id: 35, name: "Anatomy Atlas", desc: "Interactive layered anatomy from surface to histology.", agent: "labcraft", Icon: "Layers" },
  { id: 36, name: "ABG Analyser", desc: "Arterial blood gas interpretation with compensation check.", agent: "labcraft", Icon: "FlaskConical" },
  { id: 37, name: "Pathology Slides", desc: "Virtual microscope simulator for 100+ tissue types.", agent: "labcraft", Icon: "Eye" },
  { id: 38, name: "Clinical Calculators", desc: "Dedicated models for medical scoring.", agent: "labcraft", Icon: "Activity" },
  { id: 39, name: "Drug Dosage", desc: "Weight-based precision dosing guidelines.", agent: "labcraft", Icon: "Pill" },

  // DeepTutor (8)
  { id: 40, name: "Virtual Medical Board", desc: "Simulates a round-table collaboration where distinct AI personas debate complex cases.", agent: "tutor", Icon: "BrainCircuit" },
  { id: 41, name: "VibeVoice", desc: "Synthesizes hours of lectures via Gemini 2.5 Pro into precise architectural notes.", agent: "tutor", Icon: "HeartPulse" },
  { id: 42, name: "Concept Video Creator", desc: "Leverages generative architectures for medical animations.", agent: "tutor", Icon: "Eye" },
  { id: 43, name: "Physiology Simulator", desc: "Interactive cardiac, renal, respiratory system models.", agent: "tutor", Icon: "HeartPulse" },
  { id: 44, name: "Pharmacology Tutor", desc: "MOA, side effects, mnemonics and high-yield pearls.", agent: "tutor", Icon: "Pill" },
  { id: 45, name: "Guided Study Flow", desc: "A guided curriculum-based study path.", agent: "tutor", Icon: "Activity" },
  { id: 46, name: "TheoryCoach", desc: "Generates conceptual medical summaries containing custom generated art/diagrams.", agent: "tutor", Icon: "FileText" },
  { id: 47, name: "Ophthalmology Cases", desc: "Slit-lamp, fundoscopy and visual field defect quizzes.", agent: "tutor", Icon: "Eye" },

  // Pro Mode (8)
  { id: 48, name: "Discharge Summary", desc: "Automated generation of patient discharge documents.", agent: "pro", Icon: "FileText", isPro: true },
  { id: 49, name: "Handover Assistant", desc: "Streamlines shift handovers with AI-summarized insights.", agent: "pro", Icon: "Activity", isPro: true },
  { id: 50, name: "Clinical Co-Writer", desc: "Assists in drafting complex clinical notes securely.", agent: "pro", Icon: "Stethoscope", isPro: true },
  { id: 51, name: "Pharmacopeia Checker", desc: "Enterprise-grade drug cross-checks and allergies.", agent: "pro", Icon: "Pill", isPro: true },
  { id: 52, name: "Referral Streamliner", desc: "Identifies right specialists and drafts referral letters.", agent: "pro", Icon: "Layers", isPro: true },
  { id: 53, name: "Treatment Protocol", desc: "Provides step-by-step consensus-based treatment guidelines.", agent: "pro", Icon: "FileText", isPro: true },
  { id: 54, name: "Heartbeat Monitor", desc: "Proactive continuous engine evaluating telemetry.", agent: "pro", Icon: "HeartPulse", isPro: true },
  { id: 55, name: "Triage Tool", desc: "Advanced triaging capabilities based on multi-parameter check.", agent: "pro", Icon: "Activity", isPro: true }
];

function StudyHubContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [isOrganExpanded, setIsOrganExpanded] = useState(false);
  const { isProMode } = useProMode();

  useEffect(() => {
    const qFilter = searchParams.get("filter");
    if (qFilter && AGENTS[qFilter as keyof typeof AGENTS]) {
      setFilter(qFilter);
    } else {
      setFilter("all");
    }
  }, [searchParams]);

  const filteredTools = TOOLS.filter(t => {
    if (filter !== "all" && t.agent !== filter) return false;
    if (search.trim() && !t.name.toLowerCase().includes(search.toLowerCase()) && !t.desc.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const currentAgent = filter !== "all" 
    ? AGENTS[filter as keyof typeof AGENTS] 
    : { label: "All Systems", color: "#3b82f6", shape: "brain", desc: "Interact with the complete suite of AI-driven medical tools and 3D organ visualizations to master the curriculum." };

  return (
    <div className="flex bg-transparent flex-col h-full overflow-y-auto px-7 pt-7 pb-16">
      
      {/* Topbar equivalent */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-[Fraunces] font-light text-[17px] text-[var(--lb)]">Study Hub</h1>
      </div>

      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 16 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.6, ease: [0.34, 1.36, 0.64, 1] }}
        className="relative z-10 glass-card rounded-[32px] p-8 md:p-12 mb-8 overflow-hidden shadow-[var(--shm)]"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--blue)]/10 to-[var(--pur)]/10 pointer-events-none" />
        <div className="dotgrid opacity-60 pointer-events-none absolute inset-0 mix-blend-overlay" />
        
        <div className="glass-card-content flex flex-col md:flex-row gap-8 items-start justify-between relative">
          
          <div className="max-w-xl flex-1 z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--blue)]/10 text-[var(--blue)] text-[11px] font-bold tracking-widest uppercase mb-4 shadow-sm border border-[var(--blue)]/20">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--blue)] animate-pulse" /> Live Now
            </div>
            <h2 className="font-[Fraunces] font-light text-4xl md:text-5xl tracking-tight leading-tight mb-4 text-[var(--lb)] relative z-10">
              Master the curriculum with <span className="italic text-[var(--blue)]" style={{ textShadow: '0 0 20px var(--blue)' }}>Agentic Tutors.</span>
            </h2>
            <p className="text-[15px] text-[var(--sec)] leading-relaxed font-medium mb-6">
              Access 55+ specialized sub-agents covering OSCEs, mock exams, visual diagnostics, pharmacology, and clinical decision making.
            </p>

            <div className="flex flex-wrap gap-2.5 relative z-10">
              {Object.entries(AGENTS).map(([key, config]) => {
                const count = TOOLS.filter(t => t.agent === key).length;
                return (
                  <div key={key} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--fill)] border border-[var(--sep)] text-[12px] font-medium text-[var(--sec)]">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: config.color, boxShadow: `0 0 6px ${config.color}80` }} />
                    <span className="text-[var(--lb)] font-bold">{count}</span> {config.label}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Search Input and Organ */}
          <div className="w-full md:w-80 shrink-0 flex flex-col gap-6 relative z-10">
            <div className="hidden md:block">
              <motion.div layoutId="organ-interactive-container" className="relative group cursor-pointer" onClick={() => setIsOrganExpanded(true)}>
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.div
                    key={filter}
                    initial={{ opacity: 0, scale: 0.8, rotate: -15 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    exit={{ opacity: 0, scale: 0.8, rotate: 15 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  >
                    <div className="group-hover:scale-105 transition-transform duration-300 ease-out">
                      <MiniOrgan shape={currentAgent.shape as any} height={200} color={currentAgent.color} />
                    </div>
                  </motion.div>
                </AnimatePresence>
                
                {/* Expand Hint Overlay */}
                <div className="absolute inset-x-0 bottom-4 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-white/90 text-[10px] font-bold tracking-widest uppercase border border-white/10 shadow-lg">
                    Expand View
                  </span>
                </div>
              </motion.div>
            </div>
            <div className="relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--sec)]" />
              <input 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search tools, topics, or agents..."
                className="w-full bg-[var(--s1)] border border-[var(--sep2)] rounded-[20px] pl-12 pr-4 py-4 text-[14px] text-[var(--lb)] placeholder:text-[var(--ter)] focus:outline-none focus:border-[var(--blue)]/50 focus:ring-4 focus:ring-[var(--blue)]/10 transition-all font-medium shadow-[var(--sh)]"
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Filter Pills */}
      <div className="flex items-center gap-3 overflow-x-auto pb-4 mb-6 scrollbar-hide">
        <button 
          onClick={() => { setFilter("all"); router.replace("/medico", { scroll: false }); }}
          className={`shrink-0 px-5 py-2.5 rounded-full text-[13px] font-semibold transition-all ${filter === "all" ? 'bg-[var(--lb)] text-[var(--s0)] shadow-md' : 'bg-[var(--s1)] border border-[var(--sep)] text-[var(--sec)] hover:bg-[var(--s2)] hover:text-[var(--lb)]'}`}
        >
          All Tools
        </button>
        {Object.entries(AGENTS).map(([key, config]) => {
          if (key === 'pro') {
            return (
              <button 
                key={key}
                onClick={() => { setFilter(key); router.replace(`/medico?filter=${key}`, { scroll: false }); }}
                className={`shrink-0 px-5 py-2.5 rounded-full text-[13px] font-semibold transition-all flex items-center gap-2 ${filter === key ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-md shadow-purple-500/20 border-transparent' : 'bg-[var(--s1)] border border-[var(--sep)] text-[var(--sec)] hover:bg-[var(--s2)] hover:text-[var(--lb)]'}`}
              >
                <div className="w-5 h-5 rounded-full flex items-center justify-center bg-gradient-to-tr from-yellow-400 to-amber-600 shadow-sm shadow-yellow-500/40">
                  <Crown size={10} className="text-white" />
                </div>
                {config.label}
              </button>
            )
          }
          return (
            <button 
              key={key}
              onClick={() => { setFilter(key); router.replace(`/medico?filter=${key}`, { scroll: false }); }}
              className={`shrink-0 px-5 py-2.5 rounded-full text-[13px] font-semibold transition-all flex items-center gap-2 ${filter === key ? 'bg-[var(--lb)] text-[var(--s0)] shadow-md' : 'bg-[var(--s1)] border border-[var(--sep)] text-[var(--sec)] hover:bg-[var(--s2)] hover:text-[var(--lb)]'}`}
            >
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: config.color, boxShadow: `0 0 6px ${config.color}80` }} />
              {config.label}
            </button>
          )
        })}
      </div>

      {/* Tools Grid */}
      <AnimatePresence mode="popLayout">
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredTools.map((tool, i) => {
            const agentConfig = AGENTS[tool.agent as keyof typeof AGENTS];
            const isLocked = tool.isPro && !isProMode;
            const IconComponent = iconMap[tool.Icon];
            
            return (
              <motion.div 
                layout
                key={tool.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, delay: Math.min(i * 0.05, 0.2) }}
                className={`glass-card rounded-[24px] p-5 cursor-pointer group transition-all relative overflow-hidden ${isLocked ? '' : 'hover:-translate-y-[2px]'}`}
                onClick={() => {
                  if (isLocked) {
                    router.push('/settings'); // Or wherever Pro Mode toggle is
                  } else if ((tool as any).routeId) {
                    router.push(`/medico/${(tool as any).routeId}`);
                  } else {
                    router.push(`/ask-medi?action=${encodeURIComponent(tool.name)}`);
                  }
                }}
              >
                {tool.isPro && (
                  <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-purple-500 to-indigo-500 z-10" />
                )}
                
                {/* Shimmer animation on card when Pro (optional extra flair) */}
                {tool.isPro && !isLocked && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shimmer pointer-events-none" />
                )}

                <div className={`glass-card-content flex flex-col h-full relative ${isLocked ? 'opacity-60' : ''}`}>
                  <div className="flex justify-between items-start mb-4">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-[14px] bg-[var(--fill)] border border-[var(--sep)] flex items-center justify-center group-hover:bg-[var(--s0)] transition-colors group-hover:shadow-[var(--sh)] text-white">
                        <IconComponent size={20} strokeWidth={2} style={{ color: tool.isPro ? '#a855f7' : agentConfig.color }} />
                      </div>
                      {isLocked && (
                        <div className="absolute inset-0 bg-[var(--gb)]/80 backdrop-blur-sm rounded-[14px] flex items-center justify-center">
                          <Lock size={16} className="text-[var(--lb)]" />
                        </div>
                      )}
                    </div>
                    <div className="px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wide border border-[var(--sep)] bg-[var(--fill)] flex items-center gap-1.5 text-[var(--sec)]">
                       {!tool.isProMode && <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: agentConfig.color }} />}
                       {agentConfig.label}
                    </div>
                  </div>
                  
                  <h3 className="text-[17px] font-bold text-[var(--lb)] mb-2 group-hover:text-[var(--blue)] transition-colors pr-2">
                    {tool.name}
                  </h3>
                  <p className="text-[13px] text-[var(--sec)] font-medium leading-relaxed mb-6 flex-1">
                    {tool.desc}
                  </p>
                  
                  <div className="flex items-center justify-between mt-auto">
                    {isLocked ? (
                      <div className="w-full flex items-center justify-center py-2.5 rounded-xl bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-500/20 text-[13px] font-bold text-purple-600 transition-all group-hover:bg-purple-500 group-hover:text-white">
                        <Crown size={14} className="mr-2" /> Unlock Pro
                      </div>
                    ) : (
                      <div className="w-full flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-[12px] font-semibold text-[var(--blue)]">Launch Agent</span>
                        <div className="w-8 h-8 rounded-full bg-[var(--blue)] flex items-center justify-center text-white shadow-md">
                          <ChevronRight size={14} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
        
        {filteredTools.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="col-span-full py-20 text-center flex flex-col items-center"
          >
            <div className="w-16 h-16 rounded-full bg-[var(--fill)] flex items-center justify-center text-[var(--ter)] mb-4 border border-[var(--sep)]">
              <Search size={24} />
            </div>
            <h3 className="text-lg font-bold text-[var(--lb)] mb-1">No tools found</h3>
            <p className="text-sm font-medium text-[var(--sec)]">Try adjusting your search or filters.</p>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Expanded Modal Overlay */}
      <AnimatePresence>
        {isOrganExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md"
            onClick={() => setIsOrganExpanded(false)}
          >
            <motion.div
              layoutId="organ-interactive-container"
              className="w-full max-w-5xl h-[80vh] bg-[var(--s0)] border border-[var(--sep)] rounded-[32px] overflow-hidden flex flex-col md:flex-row shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button 
                onClick={() => setIsOrganExpanded(false)}
                className="absolute top-6 right-6 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-[var(--fill)] hover:bg-[var(--s1)] border border-[var(--sep)] transition-colors text-[var(--lb)]"
              >
                <X size={20} />
              </button>

              {/* AR 3D View */}
              <div className="flex-1 bg-gradient-to-b from-[var(--fill)] to-[var(--s0)] border-r border-[var(--sep)] relative flex flex-col pt-12 md:pt-0">
                <div className="absolute top-6 left-6 z-10">
                  <div className="px-3 py-1.5 rounded-full bg-[var(--s1)] border border-[var(--sep)] text-[12px] font-bold text-[var(--lb)] flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: currentAgent.color }} />
                    AR Diagnostics Active
                  </div>
                </div>
                <div className="flex-1 w-full h-full min-h-[300px]">
                  <MiniOrgan shape={currentAgent.shape as any} height="100%" color={currentAgent.color} />
                </div>
              </div>

              {/* Info Sidebar */}
              <div className="w-full md:w-[400px] p-8 md:p-12 flex flex-col justify-center bg-[var(--s1)]/50">
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <h2 className="text-4xl font-[Fraunces] font-light tracking-tight text-[var(--lb)] mb-4">
                    {currentAgent.label}
                  </h2>
                  <p className="text-[15px] leading-relaxed text-[var(--sec)] font-medium mb-8">
                    {currentAgent.desc}
                  </p>
                  
                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-[var(--s0)] border border-[var(--sep)]">
                      <div className="text-[11px] font-bold tracking-widest uppercase text-[var(--ter)] mb-1">
                        System Status
                      </div>
                      <div className="flex items-center gap-2 text-[14px] font-semibold text-[var(--lb)]">
                        <Activity size={16} className="text-[var(--blue)]" /> Fully Operational
                      </div>
                    </div>
                    <div className="p-4 rounded-2xl bg-[var(--s0)] border border-[var(--sep)]">
                      <div className="text-[11px] font-bold tracking-widest uppercase text-[var(--ter)] mb-1">
                        Sub-Agents Linked
                      </div>
                      <div className="flex items-center gap-2 text-[14px] font-semibold text-[var(--lb)]">
                        <BrainCircuit size={16} className="text-[var(--pur)]" /> 
                        {filter === "all" ? TOOLS.length : TOOLS.filter(t => t.agent === filter).length} Tools Loaded
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => setIsOrganExpanded(false)}
                    className="mt-10 w-full py-4 rounded-xl bg-[var(--lb)] text-[var(--s0)] font-bold text-[14px] transition-transform hover:-translate-y-1 shadow-lg shadow-[var(--lb)]/10"
                  >
                    Close Diagnostics
                  </button>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

export default function MedicoPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <StudyHubContent />
    </Suspense>
  )
}
