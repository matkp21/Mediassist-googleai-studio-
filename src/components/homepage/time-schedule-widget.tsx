"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Calendar as CalendarIcon, Plus, Bell, Timer, CheckSquare, X, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function TimeScheduleWidget() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentDate(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = new Intl.DateTimeFormat('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  }).format(currentDate);

  const timeParts = formattedTime.split(' ');
  const timeNum = timeParts[0];
  const timeAmPm = timeParts[1];

  const formattedDate = new Intl.DateTimeFormat('en-GB', { 
    weekday: 'short', 
    day: 'numeric', 
    month: 'short' 
  }).format(currentDate);

  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-4 px-2">
        <span className="text-[10px] font-mono tracking-widest text-[var(--ter)] uppercase font-semibold">Time & Schedule</span>
        <div className="h-px flex-1 bg-[var(--sep)]"></div>
      </div>

      <motion.div 
        layout
        className="glass-card relative overflow-hidden rounded-[28px]"
        initial={{ borderRadius: 28 }}
        animate={{ borderRadius: isExpanded ? 28 : 28 }}
      >
        {/* Subtle Animated Background Gradients */}
        <motion.div
           className="absolute top-[-20%] left-[-10%] w-[60%] h-[120%] bg-[var(--blue)]/[0.12] rounded-full blur-[80px] pointer-events-none"
           animate={{
             x: ["0%", "5%", "-5%", "0%"],
             y: ["0%", "5%", "-5%", "0%"],
             scale: [1, 1.05, 0.95, 1],
           }}
           transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
           className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[120%] bg-[var(--grn)]/[0.12] rounded-full blur-[80px] pointer-events-none"
           animate={{
             x: ["0%", "-5%", "5%", "0%"],
             y: ["0%", "-5%", "5%", "0%"],
             scale: [1, 0.95, 1.05, 1],
           }}
           transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />

        <div className="glass-card-content relative z-10 p-6 md:p-8 flex flex-col justify-center">
          
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-[64px] md:text-[76px] leading-[1.1] tracking-tight text-[var(--lb)] font-serif">
                  {timeNum}
                </span>
                <span className="text-[24px] md:text-[28px] font-serif text-[var(--sec)]">
                  {timeAmPm}
                </span>
              </div>
              
              <div className="text-[18px] text-[var(--sec)] mb-6 font-medium">
                {formattedDate}
              </div>

              {!isExpanded && (
                <button 
                  onClick={() => setIsExpanded(true)}
                  className="flex items-center gap-2 text-[12px] font-mono tracking-widest uppercase font-bold text-[var(--blue)] hover:opacity-80 transition-opacity"
                >
                  <CalendarIcon size={14} />
                  <span>Tap to open calendar</span>
                  <ChevronRight size={14} />
                </button>
              )}
            </div>

            {/* Quick action FAB (if expanded, it turns into a close button) */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-10 h-10 rounded-full bg-[var(--fill)] backdrop-blur-md flex items-center justify-center text-[var(--sec)] border border-[var(--sep)] hover:bg-[var(--fill2)] transition-colors"
            >
              <AnimatePresence mode="wait">
                {isExpanded ? (
                  <motion.div key="close" initial={{ opacity: 0, rotate: -90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: 90 }}>
                    <X size={20} />
                  </motion.div>
                ) : (
                  <motion.div key="add" initial={{ opacity: 0, rotate: -90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: 90 }}>
                    <Plus size={20} />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>

          {/* Expanded Features Section */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0, marginTop: 0 }}
                animate={{ height: "auto", opacity: 1, marginTop: 24 }}
                exit={{ height: 0, opacity: 0, marginTop: 0 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {[
                    { icon: Bell, label: "Reminder", color: "bg-[var(--blue)]/10 text-[var(--blue)]" },
                    { icon: Timer, label: "Timer", color: "bg-[var(--amb)]/10 text-[var(--amb)]" },
                    { icon: CheckSquare, label: "Task", color: "bg-[var(--grn)]/10 text-[var(--grn)]" },
                    { icon: CalendarIcon, label: "Event", color: "bg-[var(--pur)]/10 text-[var(--pur)]" },
                  ].map((item, idx) => (
                    <button key={idx} className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-[var(--fill)] hover:bg-[var(--fill2)] border border-[var(--sep)] transition-colors">
                      <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", item.color)}>
                        <item.icon size={20} />
                      </div>
                      <span className="text-[13px] font-medium text-[var(--lb)]">{item.label}</span>
                    </button>
                  ))}
                </div>
                
                <div className="mt-4 pt-4 border-t border-[var(--sep)]">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-medium text-[var(--sec)]">Syncing with local calendar</span>
                    <button className="text-[12px] font-mono tracking-widest text-[var(--blue)] uppercase font-bold hover:underline">Settings</button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
