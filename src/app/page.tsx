"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  HeartPulse, LayoutDashboard, BookOpen, MessageCircle,
  Settings, Sun, Moon, ChevronRight, ChevronLeft, ArrowLeft,
  Search, Bell, Activity, Target, BrainCircuit, TrendingUp,
  Clock, Pill, Stethoscope, Eye, FileText, Zap, X,
  BookMarked, Layers, FlaskConical, Star, SendHorizonal,
  Mic, RotateCcw, Bot, Copy, ThumbsUp, ThumbsDown, Cpu,
  Sparkles, User, Shield, Globe, Palette, Volume2,
  Info, Check, Plus, Play, Crown, Network, Loader2, CheckCircle,
  Calendar as CalendarIcon
} from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { TimeScheduleWidget } from "@/components/homepage/time-schedule-widget";

import { GamificationBar } from "@/components/homepage/gamification-bar";
import { TodaysProgress } from "@/components/homepage/todays-progress";

// --- Physics & Choreography Constants ---
const customBezier = [0.34, 1.36, 0.64, 1];

const slideUpVariant = {
  hidden: { y: 22, scale: 0.95, opacity: 0 },
  visible: (i: number) => ({
    y: 0, scale: 1, opacity: 1,
    transition: { ease: customBezier, duration: 0.6, delay: i * 0.07 }
  })
};

const GREETINGS = ["നമസ്കാരം", "Hello", "Bonjour", "Hola", "Namaste", "مرحبا"];

export default function MediAssistantDashboard() {
  const router = useRouter();
  const [greetingIdx, setGreetingIdx] = useState(2); // Start with Bonjour
  const [mounted, setMounted] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    setMounted(true);
    const gInterval = setInterval(() => setGreetingIdx((p) => (p + 1) % GREETINGS.length), 3500);
    const timer = setInterval(() => setCurrentDate(new Date()), 1000);
    return () => {
      clearInterval(gInterval);
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchExpanded(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (!mounted) return null;

  const formattedDate = new Intl.DateTimeFormat('en-GB', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long' 
  }).format(currentDate);

  const formattedTime = new Intl.DateTimeFormat('en-US', { 
    hour: '2-digit', 
    minute: '2-digit', 
    hour12: true 
  }).format(currentDate).toLowerCase();

  return (
    <div className="relative min-h-screen bg-transparent overflow-x-hidden pt-6 pb-32 px-4 md:px-10">
      
      <main className="relative z-10 w-full max-w-[1280px] mx-auto">

        {/* Top Header Row */}
        <div className="flex items-center justify-between mb-8 px-2 md:px-0">
           <div className="text-[1.1rem] font-medium text-[var(--lb)] tracking-tight">Dashboard</div>
           <div className="flex items-center gap-2">
             <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--gb)] border border-[var(--sep)] shadow-sm text-[0.6rem] font-mono tracking-[0.15em] text-[var(--sec)] uppercase">
               <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse shadow-[0_0_8px_rgba(45,212,191,0.5)]"></div>
               GEMINI 2.5 PRO
             </div>
             <button className="w-10 h-10 rounded-full border border-[var(--sep)] bg-[var(--gb)] hover:bg-[var(--fill)] flex items-center justify-center text-[var(--sec)] shadow-[var(--shs)] transition-colors min-w-[40px] min-h-[40px] md:min-w-[44px] md:min-h-[44px]">
               <Moon size={16} />
             </button>
             <button className="w-10 h-10 rounded-full border border-[var(--sep)] bg-[var(--gb)] hover:bg-[var(--fill)] flex items-center justify-center text-[var(--sec)] shadow-[var(--shs)] transition-colors min-w-[40px] min-h-[40px] md:min-w-[44px] md:min-h-[44px]">
               <Bell size={16} />
             </button>
             <button className="w-10 h-10 rounded-full border border-[var(--sep)] bg-[var(--gb)] hover:bg-[var(--fill)] flex items-center justify-center text-[var(--sec)] shadow-[var(--shs)] transition-colors min-w-[40px] min-h-[40px] md:min-w-[44px] md:min-h-[44px]">
               <Settings size={16} />
             </button>
           </div>
        </div>

        {/* --- Hero Header --- */}
        <motion.div custom={0} initial="hidden" animate="visible" variants={slideUpVariant} className="mb-6 px-2">
          <h1 className="text-[2.5rem] md:text-[3.2rem] lg:text-[4rem] leading-tight mb-1 tracking-tight flex flex-wrap items-baseline">
            <AnimatePresence mode="wait">
              <motion.span
                key={greetingIdx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
                className="text-transparent bg-clip-text bg-gradient-to-r from-[#4b8ff7] via-[#a07df0] to-[#e83050] italic font-[Fraunces] font-light"
              >
                {GREETINGS[greetingIdx]},
              </motion.span>
            </AnimatePresence>
            <span className="text-[var(--lb)] font-medium ml-3">Mathew.</span>
          </h1>
          <p className="text-[0.9rem] md:text-[1rem] text-[var(--sec)] font-medium">
            {formattedDate} · MBBS Finals Workspace
          </p>
        </motion.div>

        {/* --- Responsive 12-column Grid Layout --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: Core Study & Tools (8/12) */}
          <div className="lg:col-span-8 space-y-8">
            {/* GAMIFICATION BAR */}
        <motion.div custom={0.5} initial="hidden" animate="visible" variants={slideUpVariant} className="mb-6 px-2">
          <GamificationBar />
        </motion.div>

            {/* Action Pills */}
            <motion.div custom={0.8} initial="hidden" animate="visible" variants={slideUpVariant} className="flex flex-wrap items-center gap-3 mb-10 px-2 mt-2">
               <button onClick={() => router.push('/medico')} className="flex items-center justify-center gap-2 bg-[#4b8ff7] text-white px-5 py-2.5 rounded-full text-[15px] font-bold shadow-sm drop-shadow-[0_4px_12px_rgba(75,143,247,0.3)] hover:drop-shadow-[0_8px_20px_rgba(75,143,247,0.5)] active:scale-95 transition-all hover:opacity-95 min-h-[44px] flex-1 sm:flex-none whitespace-nowrap">
                 <BookOpen size={17} /> Study Hub
               </button>
               <button onClick={() => router.push('/ask-medi')} className="flex items-center justify-center gap-2 bg-[#a07df0] text-white px-5 py-2.5 rounded-full text-[15px] font-bold shadow-sm drop-shadow-[0_4px_12px_rgba(160,125,240,0.3)] hover:drop-shadow-[0_8px_20px_rgba(160,125,240,0.5)] active:scale-95 transition-all hover:opacity-95 min-h-[44px] flex-1 sm:flex-none whitespace-nowrap">
                 <MessageCircle size={17} /> Ask Medi
               </button>
               <button onClick={() => router.push('/medico/gp-notes')} className="flex items-center justify-center gap-2 bg-[#f7bc26] text-white px-5 py-2.5 rounded-full text-[15px] font-bold shadow-sm drop-shadow-[0_4px_12px_rgba(247,188,38,0.3)] hover:drop-shadow-[0_8px_20px_rgba(247,188,38,0.5)] active:scale-95 transition-all hover:opacity-95 min-h-[44px] flex-1 sm:flex-none whitespace-nowrap">
                 <Stethoscope size={17} /> GP note
               </button>
               <button onClick={() => router.push('/calendar')} className="flex items-center justify-center gap-2 bg-[var(--gb)] border border-[var(--sep)] text-[var(--lb)] px-5 py-2.5 rounded-full text-[15px] font-bold shadow-sm hover:drop-shadow-[0_4px_12px_rgba(255,255,255,0.05)] active:scale-95 transition-all hover:bg-[var(--fill)] min-h-[44px] flex-1 sm:flex-none whitespace-nowrap">
                 <CalendarIcon size={17} /> Calendar
               </button>
               <button onClick={() => router.push('/medico/session')} className="flex items-center justify-center gap-2 bg-[var(--gb)] border border-[var(--sep)] text-[var(--lb)] px-5 py-2.5 rounded-full text-[15px] font-bold shadow-sm hover:drop-shadow-[0_4px_12px_rgba(255,255,255,0.05)] active:scale-95 transition-all hover:bg-[var(--fill)] min-h-[44px] flex-1 sm:flex-none whitespace-nowrap">
                 <Play size={17} /> Start Session
               </button>
               <button onClick={() => router.push('/pro')} className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#a07df0] to-[#e83050] text-white px-5 py-2.5 rounded-full text-[15px] font-bold shadow-sm drop-shadow-[0_4px_12px_rgba(232,48,80,0.3)] hover:drop-shadow-[0_8px_20px_rgba(232,48,80,0.5)] active:scale-95 transition-all hover:opacity-95 min-h-[44px] flex-1 sm:flex-none whitespace-nowrap">
                 <Crown size={17} /> Pro Active
               </button>
            </motion.div>

            {/* RECENT TOOLS */}
            <motion.div custom={1} initial="hidden" animate="visible" variants={slideUpVariant} className="mb-0 relative z-10">
              <div className="flex items-center gap-3 mb-4 px-2">
                <span className="text-[10px] font-mono tracking-[0.15em] text-[var(--sec)] uppercase font-semibold">Recent Tools</span>
                <div className="h-px flex-1 bg-[var(--sep)]"></div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
             {/* Card 1 */}
             <div onClick={() => router.push('/medico/anatomy?topic=Lens%20Anatomy')} className="glass-card rounded-[22px] p-5 flex flex-col justify-between h-[120px] md:h-[130px] hover:scale-[1.02] transition-transform cursor-pointer">
                <div className="w-8 h-8 rounded-full bg-[#4b8ff7]/10 flex items-center justify-center text-[#4b8ff7]">
                  <Eye size={16} />
                </div>
                <div>
                  <div className="text-[15px] font-bold text-[var(--lb)] leading-snug">Lens Anatomy</div>
                  <div className="text-[11px] font-mono text-[var(--ter)] mt-0.5">3m ago</div>
                </div>
             </div>
             {/* Card 2 */}
             <div onClick={() => router.push('/medico/mcq?topic=Neuro')} className="glass-card rounded-[22px] p-5 flex flex-col justify-between h-[120px] md:h-[130px] hover:scale-[1.02] transition-transform cursor-pointer">
                <div className="w-8 h-8 rounded-full bg-[#a07df0]/10 flex items-center justify-center text-[#a07df0]">
                  <BrainCircuit size={16} />
                </div>
                <div>
                  <div className="text-[15px] font-bold text-[var(--lb)] leading-snug">Neuro Drill</div>
                  <div className="text-[11px] font-mono text-[var(--ter)] mt-0.5">1h ago</div>
                </div>
             </div>
             {/* Card 3 */}
             <div onClick={() => router.push('/medico/pharmagenie?topic=Pharma')} className="glass-card rounded-[22px] p-5 flex flex-col justify-between h-[120px] md:h-[130px] hover:scale-[1.02] transition-transform cursor-pointer">
                <div className="w-8 h-8 rounded-full bg-[#32c97e]/10 flex items-center justify-center text-[#32c97e]">
                  <Pill size={16} />
                </div>
                <div>
                  <div className="text-[15px] font-bold text-[var(--lb)] leading-snug">Pharma Notes</div>
                  <div className="text-[11px] font-mono text-[var(--ter)] mt-0.5">3h ago</div>
                </div>
             </div>
             {/* Card 4 */}
             <div onClick={() => router.push('/medico/cases?topic=Glaucoma')} className="glass-card rounded-[22px] p-5 flex flex-col justify-between h-[120px] md:h-[130px] hover:scale-[1.02] transition-transform cursor-pointer">
                <div className="w-8 h-8 rounded-full bg-[#f7bc26]/10 flex items-center justify-center text-[#f7bc26]">
                  <Stethoscope size={16} />
                </div>
                <div>
                  <div className="text-[15px] font-bold text-[var(--lb)] leading-snug">Glaucoma Sim</div>
                  <div className="text-[11px] font-mono text-[var(--ter)] mt-0.5">Yesterday</div>
                </div>
             </div>
          </div>
        </motion.div>

        {/* QUICK ACCESS */}
        <motion.div custom={2} initial="hidden" animate="visible" variants={slideUpVariant} className="mb-8">
          <div className="flex items-center gap-3 mb-4 px-2">
            <span className="text-[10px] font-mono tracking-widest text-[var(--ter)] uppercase font-semibold">Quick Access</span>
            <div className="h-px flex-1 bg-[var(--sep)]"></div>
          </div>
          <div className="glass-card rounded-[24px] flex flex-col relative overflow-hidden">
            <motion.div
               className="absolute top-[-20%] left-[-10%] w-[60%] h-[120%] bg-[var(--blue)]/[0.12] rounded-full blur-[80px] pointer-events-none z-0"
               animate={{
                 x: ["0%", "5%", "-5%", "0%"],
                 y: ["0%", "5%", "-5%", "0%"],
                 scale: [1, 1.05, 0.95, 1],
               }}
               transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
               className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[120%] bg-[var(--grn)]/[0.12] rounded-full blur-[80px] pointer-events-none z-0"
               animate={{
                 x: ["0%", "-5%", "5%", "0%"],
                 y: ["0%", "-5%", "5%", "0%"],
                 scale: [1, 0.95, 1.05, 1],
               }}
               transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            />
             <div className="glass-card-content relative z-10 flex flex-col gap-2 p-2">
               {[
                 { name: "Morning Tutor Brief", color: "#4b8ff7", route: "/medico/supervisor", hoverClass: "hover:bg-[#4b8ff7]/10" },
                 { name: "GP Notes Quick-Ref", color: "#f7bc26", route: "/medico/gp-notes", hoverClass: "hover:bg-[#f7bc26]/10" },
                 { name: "PYQ Simulator", color: "#a07df0", route: "/medico/mock-pyqs", hoverClass: "hover:bg-[#a07df0]/10", activeBg: "bg-[#a07df0]/10" },
                 { name: "Drug Interaction Check", color: "#32c97e", route: "/medico/pharmagenie?topic=Drug%20Interaction%20Check", hoverClass: "hover:bg-[#32c97e]/10" },
                 { name: "Radiology Reader", color: "#e83050", route: "/medico/diagnobot?topic=Radiology", hoverClass: "hover:bg-[#e83050]/10" }
               ].map((item, i) => (
                 <div key={i} onClick={() => router.push(item.route)} className={cn("flex items-center justify-between px-4 py-3.5 rounded-[18px] cursor-pointer transition-colors group border border-[var(--sep)] shadow-[var(--shs)]", item.activeBg || "bg-[var(--fill)]", item.hoverClass)}>
                    <div className="flex items-center gap-3">
                      <span className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: item.color }} />
                      <span className="text-[15px] font-semibold text-[var(--lb)] tracking-tight">{item.name}</span>
                    </div>
                    <ChevronRight size={16} className="text-[var(--ter)] group-hover:text-[var(--lb)] transition-colors" />
                 </div>
               ))}
             </div>
          </div>
        </motion.div>

          </div>

          {/* RIGHT COLUMN: Performance & Schedule (4/12) */}
          <div className="lg:col-span-4 space-y-8 lg:sticky lg:top-8">
            
            {/* TODAY'S PROGRESS */}
            <motion.div custom={3} initial="hidden" animate="visible" variants={slideUpVariant} className="mb-0">
          <TodaysProgress />

          {/* Stat Cards Row */}
          <div className="grid grid-cols-3 gap-3">
             <div className="glass-card rounded-[22px] p-4 flex flex-col justify-between h-[100px] md:h-[110px] bg-[#4b8ff7]/[0.03]">
                <div className="flex items-center justify-between">
                  <div className="w-7 h-7 rounded-[8px] bg-[#4b8ff7]/10 flex items-center justify-center text-[#4b8ff7]">
                    <FileText size={14} />
                  </div>
                  <div className="px-2 py-0.5 rounded-full bg-[#4b8ff7]/20 text-[#4b8ff7] text-[11px] font-bold">+12</div>
                </div>
                <div>
                  <div className="text-[22px] font-bold text-[var(--lb)] leading-none mb-1">47</div>
                  <div className="text-[11px] text-[var(--sec)] font-medium">MCQs Today</div>
                </div>
             </div>
             <div className="glass-card rounded-[22px] p-4 flex flex-col justify-between h-[100px] md:h-[110px] bg-[#a07df0]/[0.03]">
                <div className="flex items-center justify-between">
                  <div className="w-7 h-7 rounded-[8px] bg-[#a07df0]/10 flex items-center justify-center text-[#a07df0]">
                    <Clock size={14} />
                  </div>
                  <div className="px-2 py-0.5 rounded-full bg-[#a07df0]/20 text-[#a07df0] text-[11px] font-bold">+0.8h</div>
                </div>
                <div>
                  <div className="text-[22px] font-bold text-[var(--lb)] leading-none mb-1">4.5h</div>
                  <div className="text-[11px] text-[var(--sec)] font-medium">Focus Time</div>
                </div>
             </div>
             <div className="glass-card rounded-[22px] p-4 flex flex-col justify-between h-[100px] md:h-[110px] bg-[#32c97e]/[0.05]">
                <div className="flex items-center justify-between">
                  <div className="w-7 h-7 rounded-[8px] bg-[#32c97e]/10 flex items-center justify-center text-[#32c97e]">
                    <TrendingUp size={14} />
                  </div>
                  <div className="px-2 py-0.5 rounded-full bg-[#32c97e] text-white text-[11px] font-bold shadow-[0_2px_8px_rgba(50,201,126,0.4)]">+5%</div>
                </div>
                <div>
                  <div className="text-[22px] font-bold text-[var(--lb)] leading-none mb-1">82%</div>
                  <div className="text-[11px] text-[var(--sec)] font-medium">Accuracy</div>
                </div>
             </div>
          </div>
        </motion.div>

        {/* TIME & SCHEDULE WIDGET */}
        <motion.div custom={4} initial="hidden" animate="visible" variants={slideUpVariant}>
          <TimeScheduleWidget />
        </motion.div>

        {/* SCHEDULE (Timeline) */}
        <motion.div custom={5} initial="hidden" animate="visible" variants={slideUpVariant} className="mb-8">
          <div className="flex items-center gap-3 mb-4 px-2">
            <span className="text-[10px] font-mono tracking-widest text-[var(--ter)] uppercase font-semibold">Schedule List</span>
            <div className="h-px flex-1 bg-[var(--sep)]"></div>
          </div>
          
          <div className="glass-card rounded-[28px] p-5 md:p-6">
             <div className="flex items-center justify-between mb-5">
               <div className="text-[17px] font-bold text-[var(--lb)]">Today</div>
               <div className="text-[13px] font-mono text-[var(--blue)] font-medium">{formattedTime}</div>
             </div>
             <div className="flex flex-col gap-2.5 relative border-l-2 border-[var(--sep)] ml-4 pl-5 md:pl-6 pb-2">
               {[
                 { time: "09:00", title: "Lens Anatomy Lecture", tag: "LECTURE", color: "#4b8ff7", route: "/medico/vibevoice-lecture?topic=Lens%20Anatomy" },
                 { time: "11:00", title: "Ophthalmology MCQ Drill", tag: "QUIZ", color: "#a07df0", route: "/medico/mcq?topic=Ophthalmology" },
                 { time: "14:00", title: "Case Review: Glaucoma", tag: "CLINICAL", color: "#00d5c0", route: "/medico/cases?topic=Glaucoma" },
                 { time: "16:30", title: "Pharmacology Flashcards", tag: "STUDY", color: "#f7bc26", route: "/medico/flashcards?topic=Pharmacology" },
               ].map((item, i) => (
                 <div key={i} onClick={() => router.push(item.route)} className="glass-card flex-shrink-0 rounded-[20px] p-3.5 bg-[var(--fill)] border-[var(--sep)] relative hover:scale-[1.01] transition-transform cursor-pointer">
                   <div className="absolute left-[-26px] md:left-[-30px] top-[18px] w-3 h-3 rounded-full border-2 border-[var(--gb)]" style={{ backgroundColor: item.color }} />
                   <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[5px] h-1/2 rounded-r-md" style={{ backgroundColor: item.color }} />
                   <div className="flex items-center gap-4 ml-3">
                     <div className="text-[12px] font-mono text-[var(--ter)] uppercase">{item.time}</div>
                     <div>
                        <div className="text-[15px] font-bold text-[var(--lb)] leading-snug">{item.title}</div>
                        <div className="text-[10px] font-mono tracking-[0.05em] font-bold mt-1" style={{ color: item.color }}>{item.tag}</div>
                     </div>
                   </div>
                 </div>
               ))}
               
               {/* Highlighted next item */}
               <div onClick={() => router.push('/medico/supervisor')} className="glass-card flex-shrink-0 rounded-[20px] p-3.5 bg-[#4b8ff7]/10 border-[#4b8ff7]/20 relative mt-3 hover:scale-[1.01] transition-transform cursor-pointer shadow-[0_4px_16px_rgba(75,143,247,0.15)]">
                   <div className="absolute left-[-26px] md:left-[-30px] top-[18px] w-3 h-3 rounded-full border-2 border-[var(--gb)] animate-pulse shadow-[0_0_8px_#4b8ff7]" style={{ backgroundColor: "#4b8ff7" }} />
                   <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[5px] h-1/2 rounded-r-md" style={{ backgroundColor: "#4b8ff7" }} />
                   <div className="flex items-center gap-4 ml-3">
                     <div className="text-[12px] font-mono text-[var(--blue)] font-bold">{`19:00`}</div>
                     <div>
                        <div className="text-[15px] font-bold text-[var(--lb)] leading-snug">Morning Tutor Recap</div>
                        <div className="text-[10px] font-mono tracking-[0.05em] font-bold mt-1 text-[#4b8ff7] bg-[#4b8ff7]/10 inline-block px-1.5 py-[2px] rounded uppercase">AI</div>
                     </div>
                   </div>
               </div>
             </div>
          </div>
        </motion.div>

        {/* SWARM ORCHESTRATION WIDGET */}
        <motion.div custom={6} initial="hidden" animate="visible" variants={slideUpVariant} className="mb-8 px-2 md:px-0">
          <div className="glass-card rounded-[28px] bg-[var(--gb)] p-5 md:p-6 border border-[#a07df0]/30 shadow-[0_8px_32px_rgba(160,125,240,0.1)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[6px] bg-gradient-to-r from-[#4b8ff7] via-[#a07df0] to-[#e83050]" />
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-[17px] font-bold text-[var(--lb)] flex items-center gap-2">
                <Network size={18} className="text-[#a07df0]" /> Active Clinical Pods
              </h3>
              <button 
                onClick={() => {
                  showNotification({
                    title: 'Swarm Orchestration Complete',
                    message: 'The Chief Resident has compiled the notes for GI Surgery. Literature review and differential diagnosis are ready.',
                    type: 'success',
                    actionLabel: 'View Pod',
                    actionUrl: '/clinical-pods/gi-surgery',
                  });
                }}
                className="text-xs px-3 py-1.5 rounded-full bg-[#a07df0]/10 text-[#a07df0] hover:bg-[#a07df0]/20 font-bold transition-colors"
              >
                Simulate Completion
              </button>
            </div>

            <div className="flex flex-col gap-4">
              {/* Pod 1: Surgery Revision */}
              <div className="p-4 rounded-[20px] bg-[var(--fill)] border border-[var(--sep)]">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-[var(--lb)]">Pod: GI Surgery</h4>
                  <span className="animate-pulse w-2.5 h-2.5 rounded-full bg-[#32c97e] shadow-[0_0_8px_rgba(50,201,126,0.6)]" />
                </div>
                <p className="text-[12px] text-[var(--sec)] mb-4 font-mono">CONTEXT: Final Year MBBS</p>
                
                {/* Sub-Agent Swarm Status */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-[13px] text-[var(--sec)]">
                    <Loader2 size={14} className="text-[#4b8ff7] animate-spin" />
                    <span>Worker: Scraping PubMed Guidelines...</span>
                  </div>
                  <div className="flex items-center gap-2 text-[13px] text-[var(--sec)]">
                    <CheckCircle size={14} className="text-[#32c97e]" />
                    <span>Worker: Generated 15 MCQs.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* AI FEED / INSIGHTS */}
        <motion.div custom={7} initial="hidden" animate="visible" variants={slideUpVariant} className="mb-[40px]">
          <div className="flex items-center gap-3 mb-4 px-2">
            <span className="text-[10px] font-mono tracking-widest text-[var(--ter)] uppercase font-semibold">AI Feed</span>
            <div className="h-px flex-1 bg-[var(--sep)]"></div>
          </div>

          <div className="glass-card rounded-[28px] p-5 md:p-6 bg-[var(--gb)] border-[var(--gbr)] shadow-[var(--sh)]">
             <div className="flex items-center gap-3 mb-5 mt-1">
               <span className="text-[11px] font-mono tracking-widest text-[var(--ter)] uppercase font-semibold">Insights</span>
               <div className="h-px flex-1 bg-[var(--sep)]"></div>
             </div>
             <div className="flex flex-col gap-4">
               {/* Insight 1 */}
               <div onClick={() => router.push('/medico/mcq?topic=Glaucoma%20Pack')} className="flex items-start gap-4 cursor-pointer hover:bg-[var(--fill2)] p-2 -mx-2 rounded-xl transition-colors group">
                  <div className="w-9 h-9 rounded-full bg-[#a07df0]/10 border border-[#a07df0]/20 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm group-hover:bg-[#a07df0]/20 transition-colors">
                    <BrainCircuit size={16} className="text-[#a07df0]" />
                  </div>
                  <div className="flex-1 border-b border-[var(--sep)] pb-4 group-hover:border-transparent">
                    <div className="text-[15px] font-bold text-[var(--lb)] leading-snug group-hover:text-[#a07df0] transition-colors">Glaucoma Pack ready</div>
                    <div className="text-[14px] text-[var(--sec)] mt-1 leading-relaxed">24 spaced-rep MCQs from your Lens Anatomy session.</div>
                  </div>
               </div>
               {/* Insight 2 */}
               <div onClick={() => router.push('/medico/dashboard')} className="flex items-start gap-4 cursor-pointer hover:bg-[var(--fill2)] p-2 -mx-2 rounded-xl transition-colors group">
                  <div className="w-9 h-9 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm group-hover:bg-orange-500/20 transition-colors">
                    <Zap size={16} className="text-orange-500" />
                  </div>
                  <div className="flex-1 border-b border-[var(--sep)] pb-4 group-hover:border-transparent">
                    <div className="text-[15px] font-bold text-[var(--lb)] leading-snug group-hover:text-orange-500 transition-colors">🔥 14-day streak</div>
                    <div className="text-[14px] text-[var(--sec)] mt-1 leading-relaxed">You've studied every day for 2 weeks. Outstanding.</div>
                  </div>
               </div>
               {/* Insight 3 */}
               <div onClick={() => router.push('/medico/library')} className="flex items-start gap-4 cursor-pointer hover:bg-[var(--fill2)] p-2 -mx-2 rounded-xl transition-colors group">
                  <div className="w-9 h-9 rounded-full bg-[#00d5c0]/10 border border-[#00d5c0]/20 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm group-hover:bg-[#00d5c0]/20 transition-colors">
                    <BookOpen size={16} className="text-[#00d5c0]" />
                  </div>
                  <div className="flex-1 pb-1">
                    <div className="text-[15px] font-bold text-[var(--lb)] leading-snug group-hover:text-[#00d5c0] transition-colors">New AAO 2025 guideline</div>
                    <div className="text-[14px] text-[var(--sec)] mt-1 leading-relaxed">Glaucoma guidelines indexed in KnowledgeHub.</div>
                  </div>
               </div>
             </div>
          </div>
        </motion.div>
          </div>
        </div>
      </main>

      {/* FIXED BOTTOM SEARCH / ACTION BAR & SHORTCUTS */}
      <div 
        ref={searchContainerRef}
        className="fixed bottom-6 right-4 md:right-6 z-[100] drop-shadow-2xl flex flex-col items-end gap-3 pointer-events-none w-full max-w-[calc(100%-32px)] md:max-w-[600px] origin-bottom-right"
      >
        
        {/* Quick Shortcuts */}
        <div className={cn(
          "w-full overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] px-1 pointer-events-auto transition-all duration-500",
          isSearchExpanded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
        )}>
          <div className="flex items-center md:justify-end gap-2.5 w-max md:ml-auto">
            {[
              { label: "Generate Quiz", icon: BrainCircuit, color: "text-[#a07df0]", route: "/medico/mcq" },
              { label: "Search Notes", icon: Search, color: "text-[#4b8ff7]", route: "/medico/library" },
              { label: "Analyze Case", icon: Target, color: "text-[#e83050]", route: "/medico/diagnobot" },
              { label: "Summarize", icon: FileText, color: "text-[#f7bc26]", route: "/medico/summarizer" },
              { label: "GP Note Gen", icon: BookMarked, color: "text-[#00d5c0]", route: "/medico/gp-notes" }
            ].map((action, i) => (
              <button key={i} onClick={() => router.push(action.route)} className="glass-card flex items-center gap-2 px-3.5 py-2 rounded-full bg-[var(--gb)] backdrop-blur-xl border border-[var(--sep)] shadow-[var(--sh),inset_0_1px_0_var(--gs)] transition-transform hover:scale-[1.02] active:scale-[0.98]">
                <action.icon size={14} className={action.color} />
                <span className="text-[13px] font-medium text-[var(--lb)] whitespace-nowrap">{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div 
          onClick={() => { if (!isSearchExpanded) setIsSearchExpanded(true) }}
          className={cn(
            "relative p-[1.5px] overflow-hidden group transition-all duration-500 pointer-events-auto ml-auto",
            isSearchExpanded 
              ? "w-full md:w-[600px] rounded-[28px] focus-within:shadow-[0_24px_64px_rgba(75,143,247,0.15)] shadow-[var(--shl)] mt-1" 
              : "w-[180px] rounded-[32px] mt-1 shadow-[0_8px_24px_rgba(0,0,0,0.12)] cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          )}
        >
          {/* Animated Border gradient */}
          <div className={cn(
            "absolute top-1/2 left-1/2 w-[250%] h-[500%] -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-opacity duration-700",
            isSearchExpanded ? "opacity-0 group-focus-within:opacity-100" : "opacity-0 hover:opacity-100"
          )}>
             <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent_70%,#4b8ff7_80%,#a07df0_90%,transparent_100%)] animate-spin" style={{ animationDuration: '3s' }} />
             <div className="absolute inset-0 bg-[conic-gradient(from_180deg,transparent_70%,#a07df0_80%,#4b8ff7_90%,transparent_100%)] animate-spin" style={{ animationDuration: '3s' }} />
          </div>
          
          <div className={cn(
            "relative glass-card w-full h-full p-2 bg-[var(--gb)]/95 backdrop-blur-[40px] border border-[var(--gbr)] flex items-center transition-all duration-500 overflow-hidden",
            isSearchExpanded ? "rounded-[26.5px]" : "rounded-[30.5px]"
          )}>
            
            {/* Pill Content (Unexpanded) */}
            <div className={cn(
              "absolute inset-0 flex items-center justify-center gap-2 transition-all duration-300",
              isSearchExpanded ? "opacity-0 scale-95 pointer-events-none" : "opacity-100 scale-100"
            )}>
               <Sparkles size={16} className="text-[#a07df0]" />
               <span className="text-[15px] font-medium text-[var(--lb)] whitespace-nowrap">Ask anything...</span>
            </div>

            {/* Expanded Content */}
            <div className={cn(
              "w-full flex items-center transition-all duration-500",
              isSearchExpanded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
            )}>
              <div className="flex-1 flex items-center gap-3 pl-4 pr-2 relative z-10 text-left">
                 <Search size={18} className="text-[var(--ter)] transition-colors group-focus-within:text-[#4b8ff7]" />
                 <input 
                   type="text" 
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   onKeyDown={(e) => {
                     if (e.key === 'Enter') {
                       if (searchQuery.trim()) {
                         router.push('/ask-medi?q=' + encodeURIComponent(searchQuery));
                       } else {
                         router.push('/ask-medi');
                       }
                     }
                   }}
                   placeholder="Ask anything..." 
                   className="w-full bg-transparent border-none outline-none text-[15px] md:text-[16px] text-[var(--lb)] placeholder:text-[var(--ter)] py-3 font-medium text-left"
                   autoFocus={isSearchExpanded}
                 />
              </div>
              
              <div className="flex items-center gap-1.5 pr-1 relative z-10">
                 <kbd className="hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[var(--fill)] border border-[var(--sep)] text-[11px] font-mono font-bold text-[var(--sec)] shadow-sm uppercase tracking-widest transition-colors group-focus-within:text-[#a07df0] group-focus-within:border-[var(--sep2)]">
                    <span className="text-[14px]">⌘</span>K
                 </kbd>
                 <div className="w-px h-6 bg-[var(--sep)] mx-1 hidden md:block"></div>
                 {/* Replaced Mic with X to close it */}
                 <button 
                   onClick={(e) => { e.stopPropagation(); setIsSearchExpanded(false); }}
                   className="w-[42px] h-[42px] rounded-full flex items-center justify-center text-[var(--sec)] hover:bg-[var(--fill)] hover:text-[#a07df0] hover:shadow-[0_0_12px_rgba(160,125,240,0.1)] transition-all">
                   <X size={18} />
                 </button>
                 <button 
                   onClick={(e) => { 
                     e.stopPropagation(); 
                     if (searchQuery.trim()) {
                       router.push('/ask-medi?q=' + encodeURIComponent(searchQuery));
                     } else {
                       router.push('/ask-medi'); 
                     }
                   }} 
                   className="w-[42px] h-[42px] rounded-full flex items-center justify-center text-white bg-gradient-to-r from-[#4b8ff7] to-[#a07df0] shadow-[0_4px_16px_rgba(160,125,240,0.4)] hover:shadow-[0_8px_24px_rgba(160,125,240,0.6)] hover:scale-[1.04] active:scale-[0.96] transition-all overflow-hidden relative ml-0.5"
                 >
                   <div className="absolute inset-0 bg-white/20 blur-md opacity-0 hover:opacity-100 transition-opacity" />
                   <Sparkles size={18} className="relative z-10" />
                 </button>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
