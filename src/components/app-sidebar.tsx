"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  ChevronLeft,
  ChevronRight,
  LayoutDashboard, 
  BookOpen, 
  MessageSquarePlus, 
  Moon,
  Sun,
  BrainCircuit,
  Stethoscope,
  Activity,
  Layers,
  HeartPulse,
  ArrowLeft,
  Settings,
  Bell
} from "lucide-react";
import { useTheme } from "next-themes";
import { AnimatedTagline } from "@/components/layout/animated-tagline";
import { Logo } from "@/components/logo";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Study Hub", href: "/medico", icon: BookOpen },
  { label: "Ask Medi", href: "/ask-medi", icon: MessageSquarePlus },
  { label: "Settings", href: "/settings", icon: Settings },
];

const SUB_AGENTS = [
  { label: "StudyBot", color: "#4B8FF7", icon: BookOpen, href: "/medico?filter=studybot" },
  { label: "ClinicalAI", color: "#F56080", icon: Stethoscope, href: "/medico?filter=clinical" },
  { label: "KnowledgeHub", color: "#A07DF0", icon: Layers, href: "/medico?filter=knowledge" },
  { label: "LabCraft", color: "#32C97E", icon: Activity, href: "/medico?filter=labcraft" },
  { label: "DeepTutor", color: "#F7BC26", icon: BrainCircuit, href: "/medico?filter=tutor" },
];

export function AppSidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isRail, setIsRail] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden text-[var(--lb)] bg-[var(--s0)]">
      {/* Ambient Canvas Backgrounds */}
      <div className="ambient">
        <div className="orb o1" />
        <div className="orb o2" />
        <div className="orb o3" />
        <div className="orb o4" />
        <div className="orb o5" />
        <div className="orb o6" />
        <div className="dotgrid" />
      </div>

      {/* Sidebar */}
      <aside 
        className={`relative z-10 flex flex-col flex-shrink-0 bg-[var(--gb)] border-r border-[var(--sep)] backdrop-blur-2xl transition-all duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] shadow-[var(--shm)] ${isRail ? 'w-[64px]' : 'w-[220px]'}`}
      >
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-[var(--gs)] to-transparent" />
        
        {/* Toggle Button */}
        <button 
          onClick={() => setIsRail(!isRail)}
          className="absolute right-[-20px] top-1/2 -translate-y-1/2 w-[36px] h-[36px] rounded-full glass-card flex items-center justify-center cursor-pointer text-[var(--sec)] hover:text-[var(--lb)] hover:scale-[1.12] active:scale-[0.94] z-30"
        >
          {isRail ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>

        {/* Sidebar Header */}
        <div className="relative z-1 flex flex-col justify-center p-4 border-b border-[var(--sep)] min-h-[58px] overflow-hidden gap-1.5">
          <div className="flex items-center">
            {isRail ? (
              <Logo simple={true} className="mx-auto" />
            ) : (
              <Logo simple={false} />
            )}
          </div>
          {!isRail && (
            <div className="w-full flex items-center justify-start opacity-100 transition-opacity duration-200 fade-in delay-150">
              <AnimatedTagline />
            </div>
          )}
        </div>

        {/* Navigation Areas */}
        <div className="relative z-1 flex-1 overflow-y-auto overflow-x-hidden p-2.5 flex flex-col gap-1">
          <div className={`text-[9.5px] font-medium tracking-widest uppercase text-[var(--ter)] px-2 pt-3 pb-1.5 whitespace-nowrap transition-opacity ${isRail ? 'opacity-0' : 'opacity-100'}`}>
            Navigation
          </div>
          
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={`relative flex items-center gap-[11px] p-[9px_10px] rounded-xl whitespace-nowrap transition-colors overflow-hidden ${isActive ? 'bg-[var(--fill2)] text-[var(--lb)]' : 'text-[var(--lb)] hover:bg-[var(--fill2)]'}`}
              >
                {isActive && (
                  <div className="absolute left-0 top-[20%] bottom-[20%] w-[3px] rounded-full bg-[var(--blue)]" />
                )}
                <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center transition-colors ${isActive ? 'bg-[var(--fill)]' : 'hover:bg-[var(--fill)]'}`}>
                  <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} className={isActive ? "text-[var(--blue)]" : "text-[var(--sec)]"} />
                </div>
                <span className={`text-[13px] font-medium transition-opacity duration-200 ${isRail ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                  {item.label}
                </span>
                
                {item.label === "Ask Medi" && !isRail && (
                  <div className="ml-auto min-w-[18px] h-[18px] rounded-full bg-[var(--blue)] text-white text-[9px] font-semibold flex items-center justify-center px-1.5">
                    AI
                  </div>
                )}
              </Link>
            )
          })}

          <div className={`mt-2 text-[9.5px] font-medium tracking-widest uppercase text-[var(--ter)] px-2 pt-3 pb-1.5 whitespace-nowrap transition-opacity ${isRail ? 'opacity-0' : 'opacity-100'}`}>
            Sub-Agents
          </div>

          {SUB_AGENTS.map((agent) => (
            <Link 
              key={agent.label} 
              href={agent.href}
              className="relative flex items-center gap-[11px] p-[9px_10px] rounded-xl whitespace-nowrap hover:bg-[var(--fill2)] transition-colors overflow-hidden text-[var(--lb)]"
            >
              <div className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center group">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: agent.color, boxShadow: `0 0 8px ${agent.color}80` }} />
              </div>
              <span className={`text-[13px] font-medium transition-opacity duration-200 ${isRail ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                {agent.label}
              </span>
            </Link>
          ))}
        </div>

        {/* Footer Area */}
        <div className="relative z-1 p-2 border-t border-[var(--sep)] overflow-hidden flex-shrink-0">
          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="w-full flex items-center gap-[11px] p-[9px_10px] rounded-xl whitespace-nowrap hover:bg-[var(--fill2)] transition-colors mb-2 text-[var(--lb)]"
          >
             <div className="w-8 h-8 rounded-lg flex-shrink-0 bg-[var(--fill)] border border-[var(--sep)] flex items-center justify-center text-[var(--sec)]">
               {mounted ? (theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />) : <Moon size={16} />}
             </div>
             <span className={`text-[13px] font-medium transition-opacity duration-200 ${isRail ? 'opacity-0' : 'opacity-100'}`}>
               {mounted ? (theme === 'dark' ? 'Light Mode' : 'Dark Mode') : 'Dark Mode'}
             </span>
          </button>
          
          <div className="flex items-center gap-[10px] p-[9px_10px] rounded-xl overflow-hidden whitespace-nowrap">
             {/* Apple Intelligence Rainbow Halo Avatar */}
             <div className="relative p-[1.5px] rounded-full flex-shrink-0 flex items-center justify-center" style={{ background: 'var(--s2)' }}>
               <div className="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,#4b8ff7,#a07df0,#32c97e,#f7bc26,#f56080,#4b8ff7)] animate-[spin_3.5s_linear_infinite]" />
               <div className="relative z-1 w-[30px] h-[30px] rounded-full bg-[var(--s2)] border-2 border-[var(--s0)] flex items-center justify-center text-[10px] font-medium font-mono text-[var(--lb)] overflow-hidden">
                 <img src="https://ui-avatars.com/api/?name=Mathew+K&background=0f172a&color=fff" alt="Profile" className="w-full h-full object-cover" />
               </div>
             </div>
             <div className={`flex flex-col transition-opacity duration-200 ${isRail ? 'opacity-0' : 'opacity-100'}`}>
                <span className="text-[13px] font-semibold text-[var(--lb)] max-w-[120px] truncate">Mathew K.</span>
                <span className="text-[10px] font-mono text-[var(--ter)] truncate">Medical Student</span>
             </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full relative z-10 overflow-hidden">
        {/* Topbar */}
        <header className="mx-3 mt-3 h-[48px] rounded-[22px] flex-shrink-0 relative overflow-hidden glass-card flex items-center px-4 gap-2 tb">
          {pathname !== "/" ? (
            <Link href="/" className="tb-back flex items-center gap-[5px] h-[32px] px-3.5 rounded-full bg-[var(--fill)] border border-[var(--sep)] shadow-[inset_0_0.5px_0_var(--gs)] cursor-pointer text-[var(--blue)] text-[13px] font-medium transition-transform hover:scale-[1.02] active:scale-[0.98]">
              <ArrowLeft size={16} /> 
              <span>Dashboard</span>
            </Link>
          ) : (
            <span className="text-[17px] font-semibold text-[var(--lb)] tracking-tight ml-2">Dashboard</span>
          )}
          <div className="ml-auto flex items-center gap-2">
             <div className="hidden sm:flex items-center gap-1.5 h-[28px] px-3 rounded-full bg-[var(--fill)] border border-[var(--sep)] mr-1">
               <span className="w-1.5 h-1.5 rounded-full bg-[#00D5C0]"></span>
               <span className="font-mono text-[9px] font-medium tracking-[0.1em] text-[var(--ter)] uppercase">Gemini 2.5 Pro</span>
             </div>
             <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="w-8 h-8 rounded-full flex items-center justify-center bg-[var(--fill)] border border-[var(--sep)] text-[var(--blue)] hover:bg-[var(--fill2)] hover:text-[var(--lb)] transition-all">
               {mounted ? (theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />) : <Moon size={14} />}
             </button>
             <button className="w-8 h-8 rounded-full flex items-center justify-center bg-[var(--fill)] border border-[var(--sep)] text-[var(--sec)] hover:bg-[var(--fill2)] hover:text-[var(--lb)] transition-all">
               <Bell size={14} />
             </button>
             <Link href="/settings" className="w-8 h-8 rounded-full flex items-center justify-center bg-[var(--fill)] border border-[var(--sep)] text-[var(--sec)] hover:bg-[var(--fill2)] hover:text-[var(--lb)] transition-all">
               <Settings size={14} />
             </Link>
          </div>
        </header>

        <div key={pathname} className="flex-1 overflow-y-auto overflow-x-hidden p-3 relative animate-[pgIn_0.6s_cubic-bezier(0.34,1.36,0.64,1)_both]">
          {children}
        </div>
      </main>
    </div>
  );
}
