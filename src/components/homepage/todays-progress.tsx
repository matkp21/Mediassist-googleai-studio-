"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Activity, Target, BrainCircuit, TrendingUp, X, Sparkles, ChevronRight, FileText, Clock
} from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const PROGRESS_DATA = [
  { 
    id: "studybot", 
    value: "4.5h", 
    label: "StudyBot Focus", 
    sub: "60%", 
    color: "#4b8ff7", 
    icon: BrainCircuit,
    detailTitle: "StudyBot: Cognitive Spacing",
    detailDesc: "You have engaged in 4.5 hours of intense focus today. Your cognitive load is optimal, but consider a 15-minute break before your next DeepTutor session.",
    agent: "StudyBot Engine",
    metric: "Focus Retention"
  },
  { 
    id: "deeptutor", 
    value: "47", 
    label: "DeepTutor Reps", 
    sub: "47%", 
    color: "#a07df0", 
    icon: Target,
    detailTitle: "DeepTutor: Neural Repetitions",
    detailDesc: "47 neural repetitions completed. Your retention on 'Ophthalmology' is climbing. We recommend focusing on 'Pharmacology' next to balance your knowledge graph.",
    agent: "DeepTutor Orchestrator",
    metric: "Active Recall"
  },
  { 
    id: "clinical", 
    value: "82%", 
    label: "Clinical Acc", 
    sub: "82%", 
    color: "#f7bc26", 
    icon: TrendingUp,
    detailTitle: "ClinicalAI: Diagnostic Accuracy",
    detailDesc: "Diagnostic accuracy is trending up! You successfully diagnosed 14 out of 17 simulated cases. Your differential diagnosis skills for ocular conditions are well above average.",
    agent: "ClinicalAI Analyzer",
    metric: "Diagnostic Precision"
  },
  { 
    id: "neural", 
    value: "9.2k", 
    label: "Neural Load", 
    sub: "92%", 
    color: "#e83050", 
    icon: Activity,
    detailTitle: "Progress Tracking: Overall Synthesis",
    detailDesc: "You are currently absorbing information at an extremely high rate. The Neural Engine suggests entering a 'consolidation phase'—reviewing flashcards or summarizing notes—to avoid burnout.",
    agent: "Neural Engine",
    metric: "Cognitive Load"
  },
];

export function TodaysProgress() {
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  // Real-time animation simulator
  const [animatedValues, setAnimatedValues] = useState<Record<string, number>>({});
  
  useEffect(() => {
    // Initial animation for the rings
    const timeout = setTimeout(() => {
      const initial: Record<string, number> = {};
      PROGRESS_DATA.forEach(d => {
        initial[d.id] = parseInt(d.sub);
      });
      setAnimatedValues(initial);
    }, 500);
    
    // Simulate real-time progress update every 10s
    const interval = setInterval(() => {
      setAnimatedValues(prev => {
        const next = { ...prev };
        const keys = Object.keys(next);
        const randomKey = keys[Math.floor(Math.random() * keys.length)];
        const currentVal = next[randomKey] || 0;
        if (currentVal < 100) {
           next[randomKey] = Math.min(100, currentVal + Math.floor(Math.random() * 3));
        }
        return next;
      });
    }, 10000);
    
    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, []);

  const expandedData = PROGRESS_DATA.find(d => d.id === expandedId);

  return (
    <>
      <div className="flex items-center gap-3 mb-4 px-2">
        <span className="text-[10px] font-mono tracking-widest text-[var(--ter)] uppercase font-semibold">Today&apos;s Progress</span>
        <div className="h-px flex-1 bg-[var(--sep)]"></div>
      </div>
      
      {/* Dynamic Rings */}
      <div className="glass-card rounded-[24px] p-5 pb-6 mb-3 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-gradient-to-br from-[#4b8ff7]/5 to-[#a07df0]/5 blur-3xl pointer-events-none" />
        <div className="grid grid-cols-4 gap-2 relative z-10">
          {PROGRESS_DATA.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div 
                key={stat.id} 
                className="flex flex-col items-center cursor-pointer group"
                onClick={() => setExpandedId(stat.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="relative w-[50px] md:w-[60px] h-[50px] md:h-[60px] mb-4">
                   <svg className="w-full h-full -rotate-90 drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)] group-hover:drop-shadow-[0_4px_8px_rgba(0,0,0,0.15)] transition-all" viewBox="0 0 36 36">
                     <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--fill2)" strokeWidth="3.5" />
                     <motion.path 
                       d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                       fill="none" 
                       stroke={stat.color} 
                       strokeWidth="3.5" 
                       strokeLinecap="round" 
                       initial={{ strokeDasharray: "0, 100" }}
                       animate={{ strokeDasharray: `${animatedValues[stat.id] || 0}, 100` }}
                       transition={{ duration: 1.5, ease: "easeOut" }}
                     />
                   </svg>
                   <div className="absolute inset-0 flex items-center justify-center">
                     <Icon size={18} className="md:w-[20px] md:h-[20px]" style={{ color: stat.color }} />
                   </div>
                </div>
                <div className="text-[14px] md:text-[16px] font-bold text-[var(--lb)] leading-none mb-1.5">{stat.value}</div>
                <div className="text-[8px] md:text-[9px] font-mono tracking-widest text-center uppercase mb-0.5" style={{ color: stat.color }}>{stat.label}</div>
                <motion.div className="text-[9px] md:text-[10px] font-mono text-[var(--sec)]">
                  {animatedValues[stat.id] || 0}%
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Orchestration Agents Generative Summary / AI REC */}
      <div onClick={() => router.push('/medico/mcq?topic=Glaucoma%20MCQ')} className="relative rounded-[24px] p-[1.5px] mb-3 overflow-hidden shadow-[var(--shm)] cursor-pointer group hover:scale-[1.01] transition-transform">
          <div className="absolute top-1/2 left-1/2 w-[250%] h-[250%] -translate-x-1/2 -translate-y-1/2 pointer-events-none">
             <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent_60%,#4b8ff7_75%,#a07df0_85%,transparent_100%)] animate-spin opacity-50 group-hover:opacity-100 transition-opacity duration-300" style={{ animationDuration: '4s' }} />
             <div className="absolute inset-0 bg-[conic-gradient(from_180deg,transparent_60%,#a07df0_75%,#4b8ff7_85%,transparent_100%)] animate-spin opacity-50 group-hover:opacity-100 transition-opacity duration-300" style={{ animationDuration: '4s' }} />
          </div>
          <div className="relative bg-[var(--gb)] backdrop-blur-[40px] rounded-[22.5px] p-4 md:p-5 flex gap-4 items-center group-hover:bg-[var(--gb)]/90 transition-colors duration-500 h-full w-full">
             <div className="w-[46px] h-[46px] rounded-2xl bg-gradient-to-br from-[#4b8ff7]/10 to-[#a07df0]/10 flex items-center justify-center border border-[#a07df0]/20 flex-shrink-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] relative overflow-hidden group-hover:scale-105 transition-transform duration-300">
               <div className="absolute inset-0 bg-[#4b8ff7]/20 blur-xl rounded-full scale-150 animate-pulse mix-blend-screen" />
               <Sparkles size={20} className="text-[#a07df0] relative z-10 drop-shadow-[0_0_8px_rgba(160,125,240,0.5)]" />
             </div>
             <div className="flex-1">
               <div className="flex items-center gap-2 mb-1.5">
                 <span className="text-[10px] font-mono tracking-[0.1em] text-[#a07df0] font-bold uppercase drop-shadow-[0_0_8px_rgba(160,125,240,0.3)]">DeepTutor Synthesis</span>
                 <div className="h-px flex-1 bg-gradient-to-r from-[#a07df0]/20 to-transparent max-w-[40px]"></div>
               </div>
               <div className="text-[14px] md:text-[15px] text-[var(--lb)] font-medium leading-snug">
                 You&apos;re demonstrating strong recall. <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#4b8ff7] to-[#a07df0]">Try the Glaucoma MCQ pack</span> next for optimal spaced repetition.
               </div>
             </div>
             <div className="w-8 h-8 rounded-full bg-[var(--fill)] border border-[var(--sep)] flex items-center justify-center text-[var(--sec)] group-hover:bg-gradient-to-r group-hover:from-[#4b8ff7] group-hover:to-[#a07df0] group-hover:text-white group-hover:border-transparent group-hover:shadow-[0_4px_12px_rgba(75,143,247,0.3)] transition-all duration-300 ml-2 hidden md:flex">
               <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
             </div>
          </div>
      </div>

      {/* Expanded Modal Overlay */}
      <AnimatePresence>
        {expandedData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md"
            onClick={() => setExpandedId(null)}
          >
            <motion.div
              layoutId={`progress-${expandedData.id}`}
              className="w-full max-w-sm bg-[var(--s0)] border border-[var(--sep)] rounded-[32px] overflow-hidden flex flex-col shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button 
                onClick={() => setExpandedId(null)}
                className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-[var(--fill)] hover:bg-[var(--s1)] border border-[var(--sep)] transition-colors text-[var(--lb)]"
              >
                <X size={16} />
              </button>

              <div className="p-6">
                <div className="w-12 h-12 rounded-full mb-4 flex items-center justify-center bg-opacity-10 border" style={{ backgroundColor: `${expandedData.color}15`, borderColor: `${expandedData.color}30`, color: expandedData.color }}>
                  {(() => {
                    const ModalIcon = expandedData.icon;
                    return <ModalIcon size={24} />;
                  })()}
                </div>
                
                <h2 className="text-xl font-[Fraunces] font-light tracking-tight text-[var(--lb)] mb-2">
                  {expandedData.detailTitle}
                </h2>
                
                <div className="flex items-center gap-2 mb-4">
                  <div className="px-2 py-0.5 rounded-full bg-[var(--s1)] border border-[var(--sep)] text-[10px] font-bold text-[var(--sec)] flex flex-wrap items-center gap-1.5 shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: expandedData.color }} />
                    {expandedData.agent}
                  </div>
                </div>

                <p className="text-[14px] leading-relaxed text-[var(--sec)] font-medium mb-6">
                  {expandedData.detailDesc}
                </p>

                <div className="p-4 rounded-2xl bg-[var(--s1)] border border-[var(--sep)] flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-mono tracking-widest uppercase text-[var(--ter)] mb-1">
                      {expandedData.metric}
                    </div>
                    <div className="text-[18px] font-bold text-[var(--lb)]">
                      {animatedValues[expandedData.id] || parseInt(expandedData.sub)}%
                    </div>
                  </div>
                  <div className="w-10 h-10">
                     <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                       <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--sep2)" strokeWidth="4" />
                       <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={expandedData.color} strokeWidth="4" strokeDasharray={`${animatedValues[expandedData.id] || parseInt(expandedData.sub)}, 100`} strokeLinecap="round" />
                     </svg>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
