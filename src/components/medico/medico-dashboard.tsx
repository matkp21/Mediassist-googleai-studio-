"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { allMedicoToolsList } from '@/config/medico-tools-config';
import type { MedicoTool, ActiveToolId } from '@/types/medico-tools';
import { 
  Search, 
  ChevronRight, 
  LayoutGrid, 
  Sparkles, 
  ArrowRight, 
  Bot, 
  Stethoscope, 
  BrainCircuit,
  MessageSquare,
  Activity,
  Microscope,
  FileText,
  Clock,
  TrendingUp,
  Users,
  Star,
  Brain,
  BookOpen,
  FlaskConical,
  Pill,
  Zap,
  Eye,
  Heart,
  BarChart2,
  Dna,
  BookMarked,
  Cpu,
  Layers,
  GraduationCap,
  X,
  Loader2,
  Wand2,
  MapPin,
  Globe,
  Youtube,
  Mic,
  Calculator,
  Workflow,
  ShieldAlert,
  MonitorSmartphone,
  FileCode,
  Trophy,
  DatabaseZap
} from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useRouter } from 'next/navigation';
import { MediAssistantErrorBoundary } from './error-boundary';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { AutonomousSessionNavigator } from './autonomous-session-navigator';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { routeMedicalRequestClient } from '@/lib/medico-agent';

// ─── Constants & Meta ────────────────────────────────────────────────────────

const AGENTS = [
  { id: "all",       label: "All Tools",   color: "rgba(255,255,255,0.7)",  accent: "rgba(255,255,255,0.12)", border: "rgba(255,255,255,0.1)" },
  { id: "studybot",  label: "StudyBot",    color: "#60A5FA",  accent: "rgba(96,165,250,0.15)", border: "rgba(96,165,250,0.3)"  },
  { id: "clinical",  label: "ClinicalAI",  color: "#F87171",  accent: "rgba(248,113,113,0.15)", border: "rgba(248,113,113,0.3)" },
  { id: "knowledge", label: "KnowledgeHub",color: "#A78BFA",  accent: "rgba(167,139,250,0.15)", border: "rgba(167,139,250,0.3)" },
  { id: "labcraft",  label: "LabCraft",    color: "#34D399",  accent: "rgba(52,211,153,0.15)", border: "rgba(52,211,153,0.3)"  },
  { id: "tutor",     label: "DeepTutor",   color: "#FBBF24",  accent: "rgba(251,191,36,0.15)", border: "rgba(251,191,36,0.3)"  },
];

// Re-map existing tools to the new agents categories
const getAgentForTool = (toolId: string) => {
   const map: Record<string, string> = {
     // StudyBot (Exam/Study focused)
     'theorycoach-generator': 'studybot', 'mcq': 'studybot', 'flashcards': 'studybot', 
     'mnemonics': 'studybot', 'mock-pyqs': 'studybot', 'solved-papers': 'studybot',
     'timetable': 'studybot', 'topics': 'studybot', 'focus-music': 'studybot',
     'exams': 'studybot', 'progress': 'studybot', 'summarizer': 'studybot',

     // ClinicalAI (Practice/Patient focused)
     'cases': 'clinical', 'ddx': 'clinical', 'diagnobot': 'clinical', 'dosage': 'clinical',
     'deep-solve': 'clinical', 'visualize': 'clinical', 'heartbeat': 'clinical',
     'ai-cowriter': 'clinical', 'dictation': 'clinical', 'triage-streamliner': 'clinical',
     'rounds': 'clinical', 'guided-learning': 'clinical', 'workflow-chatbot': 'clinical', 'spatial-ai': 'clinical',

     // KnowledgeHub (Research/Theory focused)
     'ebm-assistant': 'knowledge', 'rag-tutor': 'knowledge', 'library': 'knowledge',
     'cbme': 'knowledge', 'research-scraper': 'knowledge', 'markitdown': 'knowledge',
     'ingestion': 'knowledge', 'videos': 'knowledge', 'vibevoice-lecture': 'knowledge',

     // LabCraft (Diagnostics/Tools focused)
     'anatomy': 'labcraft', 'calculators': 'labcraft', 'flowcharts': 'labcraft',
     'micromate': 'labcraft', 'pharmagenie': 'labcraft', 'pathomind': 'labcraft',
     'skill-generator': 'labcraft', 'geospatial-routing': 'labcraft',

     // DeepTutor (Higher education/Specific concepts)
     'challenges': 'tutor', 'concept-video': 'tutor', 'virtual-board': 'tutor',
     'supervisor': 'tutor', 'sequential-thinking': 'tutor', 'clinical-recipes': 'tutor',
     'omnichannel-sessions': 'tutor', 'interactive-prompts': 'tutor', 'high-thinking': 'tutor'
   };
   return map[toolId] || 'studybot';
};

const getGradientForTool = (toolId: string) => {
    const gradients = [
        "linear-gradient(135deg,#1e3a8a,#1d4ed8,#3b82f6)",
        "linear-gradient(135deg,#164e63,#0891b2,#22d3ee)",
        "linear-gradient(135deg,#1e1b4b,#4338ca,#818cf8)",
        "linear-gradient(135deg,#7f1d1d,#b91c1c,#ef4444)",
        "linear-gradient(135deg,#064e3b,#047857,#10b981)",
        "linear-gradient(135deg,#78350f,#b45309,#f59e0b)",
        "linear-gradient(135deg,#2e1065,#6d28d9,#8b5cf6)",
        "linear-gradient(135deg,#3b0764,#7e22ce,#a855f7)"
    ];
    const index = Array.from(toolId).reduce((acc, char) => acc + char.charCodeAt(0), 0) % gradients.length;
    return gradients[index];
};

// ─── Components ──────────────────────────────────────────────────────────────

function ToolCard({ tool, delay, onLaunch, isRecommended }: { tool: MedicoTool, delay: number, onLaunch: (t: MedicoTool) => void, isRecommended?: boolean }) {
  const Icon = tool.icon || LayoutGrid;
  const agentId = getAgentForTool(tool.id);
  const agent = AGENTS.find(a => a.id === agentId) || AGENTS[0];
  const gradient = getGradientForTool(tool.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: delay * 0.05 }}
      whileHover={{ y: -5 }}
      onClick={() => onLaunch(tool)}
      className={cn(
        "group relative flex flex-col bg-zinc-900/40 backdrop-blur-3xl border border-white/5 rounded-[24px] overflow-hidden cursor-pointer transition-all hover:border-white/10 hover:shadow-2xl hover:shadow-black/40",
        isRecommended && "ring-2 ring-teal-500/50 shadow-[0_0_30px_rgba(20,184,166,0.3)]"
      )}
    >
      {isRecommended && (
        <div className="absolute -inset-1 bg-gradient-to-r from-teal-500 to-emerald-500 blur-lg opacity-40 animate-pulse -z-10" />
      )}
      <div className="h-32 relative overflow-hidden flex items-center justify-center" style={{ background: gradient }}>
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
        <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-xl flex items-center justify-center relative z-10 shadow-lg border border-white/10 group-hover:scale-110 transition-transform duration-500">
          <Icon size={24} className="text-white" strokeWidth={1.8} />
        </div>
      </div>
      
      <div className="p-5 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-base font-semibold text-white tracking-tight leading-snug group-hover:text-teal-400 transition-colors">
            {tool.title}
          </h3>
          {tool.isFrequentlyUsed && (
             <div className="w-1.5 h-1.5 rounded-full bg-teal-400 shadow-[0_0_8px_rgba(45,212,191,0.6)] shrink-0 mt-1.5 ml-2" />
          )}
          {['ddx', 'diagnobot', 'cases', 'dosage', 'spatial-ai'].includes(tool.id) && (
            <Badge variant="outline" className="ml-2 text-[8px] border-amber-500/50 text-amber-500 bg-amber-500/5 px-1 py-0 h-4 uppercase tracking-tighter">
              Safety Verified
            </Badge>
          )}
        </div>
        
        <p className="text-[13px] text-zinc-400 leading-relaxed line-clamp-2 mb-4 italic">
          {tool.description}
        </p>

        <div className="mt-auto flex items-center justify-between">
          <span 
            className="text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full"
            style={{ backgroundColor: agent.accent, color: agent.color }}
          >
            {agent.label}
          </span>
          <button className="flex items-center gap-1.5 text-xs font-medium text-white/50 group-hover:text-white transition-colors bg-white/5 px-3 py-1.5 rounded-full border border-white/5 group-hover:border-white/10">
            Open <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ... existing static code ...

export function MedicoDashboard() {
    const [searchQuery, setSearchQuery] = useState('');
    const [isRouting, setIsRouting] = useState(false);
    const [aiRecommendation, setAiRecommendation] = useState<{ recommendedToolId: string | null, aiSummary: string } | null>(null);
    const [activeAgent, setActiveAgent] = useState('all');
    const [activeDialog, setActiveDialog] = useState<ActiveToolId>(null);
    const router = useRouter();

    // debounce routing
    useEffect(() => {
        if (searchQuery.length < 5) {
            setAiRecommendation(null);
            return;
        }

        const timer = setTimeout(async () => {
            setIsRouting(true);
            try {
                const result = await routeMedicalRequestClient(searchQuery);
                if (result) {
                    setAiRecommendation(result);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setIsRouting(false);
            }
        }, 800);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const filteredTools = useMemo(() => {
        return allMedicoToolsList.filter(tool => {
            const matchesSearch = tool.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                  tool.description.toLowerCase().includes(searchQuery.toLowerCase());
            const agent = getAgentForTool(tool.id);
            const matchesAgent = activeAgent === 'all' || agent === activeAgent;
            return matchesSearch && matchesAgent;
        });
    }, [searchQuery, activeAgent]);

    const handleLaunch = (tool: MedicoTool) => {
        if (tool.href) {
            router.push(tool.href);
        } else {
            setActiveDialog(tool.id as ActiveToolId);
        }
    };

    const currentTool = allMedicoToolsList.find(tool => tool.id === activeDialog);
    const ToolComponent = currentTool?.component;

    return (
        <div className="relative min-h-screen bg-[#07090F] selection:bg-teal-500/30 overflow-x-hidden font-sans">
            {/* ─── Apple/Gemini Aurora Mesh ─── */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <motion.div 
                   animate={{ x: [0, 80, 0], y: [0, 40, 0], scale: [1, 1.1, 1] }} 
                   transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
                   className="absolute -top-[10%] -left-[10%] w-[80vw] h-[80vw] bg-blue-600/10 rounded-full blur-[120px]" 
                />
                <motion.div 
                   animate={{ x: [0, -60, 0], y: [0, -30, 0], scale: [1, 1.05, 1] }} 
                   transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                   className="absolute -bottom-[10%] -right-[10%] w-[60vw] h-[60vw] bg-teal-600/10 rounded-full blur-[100px]" 
                />
                <motion.div 
                   animate={{ x: [30, -30, 30], y: [-30, 30, -30] }} 
                   transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
                   className="absolute top-[20%] right-[10%] w-[40vw] h-[40vw] bg-purple-600/5 rounded-full blur-[90px]" 
                />
                {/* Dot Grid Overlay */}
                <div 
                  className="absolute inset-0 opacity-[0.15]" 
                  style={{ 
                    backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', 
                    backgroundSize: '48px 48px',
                    maskImage: 'radial-gradient(circle at center, black, transparent 80%)'
                  }} 
                />
            </div>

            {/* ─── Hero Header ─── */}
            <header className="relative z-10 px-6 pt-32 pb-16 max-w-7xl mx-auto text-center md:text-left">
              <div className="max-w-4xl">
                <motion.div 
                   initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                   className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-md"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse shadow-[0_0_8px_rgba(45,212,191,0.8)]" />
                  <span className="text-[10px] font-bold tracking-[0.1em] text-white/60 uppercase">
                    Powered by Gemini 2.5 Pro × MedGemma
                  </span>
                </motion.div>

                <motion.h1 
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  className="font-display italic text-6xl md:text-[5.5rem] lg:text-[7rem] text-white leading-[0.9] tracking-[-0.03em] mb-6"
                >
                  Medico <span className="text-teal-400">Study Hub</span>
                </motion.h1>

                <motion.p 
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                  className="text-lg md:text-xl text-zinc-400 font-light max-w-xl leading-relaxed mb-12 mx-auto md:mx-0"
                >
                  The neuro-intelligent command center for modern medical mastery. 36+ specialized agents, thousands of clinical signals, one interface.
                </motion.p>

                {/* Reclip-inspired Search Bar */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                  className="relative group max-w-2xl mx-auto md:mx-0"
                >
                  <div className="absolute inset-0 bg-teal-500/20 blur-2xl rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
                  <div className="relative flex items-center bg-white/5 border border-white/10 rounded-full h-16 px-6 focus-within:border-teal-500/50 focus-within:bg-white/10 transition-all backdrop-blur-xl">
                    <Search className="text-zinc-500 mr-4 shrink-0" size={22} />
                    <Input 
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Ask your agent anything..."
                      className="border-none bg-transparent shadow-none focus-visible:ring-0 text-base md:text-lg h-full text-white placeholder:text-zinc-600"
                    />
                    {isRouting && <Loader2 className="animate-spin text-teal-500 mr-2" size={18} />}
                    {searchQuery && (
                      <button onClick={() => setSearchQuery('')} className="p-1.5 hover:bg-white/10 rounded-full text-zinc-500 transition-colors">
                        <X size={18} />
                      </button>
                    )}
                  </div>
                  
                  {/* AI Insight Bubble */}
                  <AnimatePresence>
                    {aiRecommendation && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mt-4 px-6 py-3 rounded-2xl bg-teal-500/10 border border-teal-500/20 backdrop-blur-md"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-teal-500/20 flex items-center justify-center">
                            <Sparkles className="text-teal-400" size={14} />
                          </div>
                          <p className="text-sm text-teal-100 font-medium leading-tight">
                            {aiRecommendation.aiSummary}
                          </p>
                          {aiRecommendation.recommendedToolId && (
                            <Badge className="ml-auto bg-teal-500 text-black border-none text-[10px] uppercase tracking-tighter">
                              Agent Recommended
                            </Badge>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>
            </header>

            {/* ─── Main Content ─── */}
            <main className="relative z-10 max-w-7xl mx-auto px-6 pb-32">
              {/* Filter Pills */}
              <div className="flex flex-wrap items-center gap-3 mb-12">
                {AGENTS.map(agent => (
                  <button
                    key={agent.id}
                    onClick={() => setActiveAgent(agent.id)}
                    className={cn(
                      "px-5 py-2 rounded-full text-xs font-semibold transition-all duration-300 border flex items-center gap-2",
                      activeAgent === agent.id 
                        ? "bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.2)]" 
                        : "bg-white/5 border-white/5 text-zinc-400 hover:border-white/20 hover:text-white"
                    )}
                  >
                    {agent.id !== 'all' && (
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: agent.color }} />
                    )}
                    {agent.label}
                  </button>
                ))}
                <div className="ml-auto text-[10px] font-bold tracking-widest text-zinc-600 uppercase hidden md:block">
                  {filteredTools.length} Systems Identified
                </div>
              </div>

              {/* Tool Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <AnimatePresence mode="popLayout">
                  {filteredTools.map((tool, idx) => (
                    <ToolCard 
                      key={tool.id} 
                      tool={tool} 
                      delay={idx} 
                      onLaunch={handleLaunch}
                      isRecommended={aiRecommendation?.recommendedToolId === tool.id}
                    />
                  ))}
                </AnimatePresence>
              </div>

              {/* Empty State */}
              {filteredTools.length === 0 && (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="py-32 text-center"
                >
                  <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10">
                    <Sparkles className="text-zinc-600" size={32} />
                  </div>
                  <h3 className="text-xl font-medium text-white mb-2">No tools match your query</h3>
                  <p className="text-zinc-500 max-w-xs mx-auto">Try searching for a different specialty or reset the current filters.</p>
                  <Button variant="link" onClick={() => { setSearchQuery(''); setActiveAgent('all'); }} className="mt-4 text-teal-400 hover:text-teal-300">
                      Reset Search
                  </Button>
                </motion.div>
              )}
            </main>

            {/* ─── Overlays ─────────────────────────────────────────────────── */}
            
            {/* Autonomous Session Navigator (Zero-Prompt UI) */}
            <AutonomousSessionNavigator userId="current-user" />

            {/* tool implementation Dialog */}
            <Dialog open={!!activeDialog} onOpenChange={(open) => !open && setActiveDialog(null)}>
                <DialogContent className="max-w-[95vw] md:max-w-6xl h-[90vh] p-0 overflow-hidden bg-[#0D1120]/90 backdrop-blur-3xl border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.6)] rounded-[2rem]">
                   <ScrollArea className="h-full">
                        <div className="p-4">
                            {ToolComponent && (
                                <MediAssistantErrorBoundary brainModule={currentTool?.id || 'SubAgent'}>
                                    {currentTool?.id === 'rag-tutor' ? (
                                        <ToolComponent initialQuery={searchQuery} />
                                    ) : (
                                        <ToolComponent />
                                    )}
                                </MediAssistantErrorBoundary>
                            )}
                        </div>
                   </ScrollArea>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default MedicoDashboard;
