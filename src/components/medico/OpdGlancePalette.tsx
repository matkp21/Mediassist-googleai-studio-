"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Command, X, BookOpen, Pill, 
  Activity, ArrowRight, ChevronRight, Calculator,
  Activity as StatsIcon
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

// Shared constant with the GP page (simulated)
const CONDITIONS_DB = [
  {
    id: "fever-adult",
    category: "General Practice",
    title: "Fever / Pyrexia (Adult)",
    lastUpdated: "2026-05-08",
    tags: ["fever", "infection", "OPD"],
    guidelines: ["Morning > 98.9°F, Evening > 99.9°F.", "Dolo 650mg + Rantac 150mg TID."],
    medications: [{ name: "Tab. DOLO (Paracetamol)", dose: "650mg", notes: "Primary antipyretic." }]
  },
  {
    id: "casualty-pain",
    category: "Casualty",
    title: "Acute Pain / Colic",
    tags: ["pain", "casualty"],
    medications: [{ name: "Inj. Dynapar (Diclofenac)", dose: "IM STAT", notes: "For acute pain." }]
  },
  {
    id: "cough-productive",
    category: "Respiratory",
    title: "Cough (Productive)",
    tags: ["cough", "infection"],
    medications: [{ name: "Syp. ASCORIL", dose: "TID", notes: "Productive cough." }]
  },
  {
    id: "rodenticide",
    category: "Casualty",
    title: "Rodenticide Poisoning",
    tags: ["toxicology", "emergency"],
    medications: [{ name: "Inj. Pantop", dose: "IV STAT", notes: "Gastric cover." }]
  },
  {
      id: "epistaxis",
      category: "Casualty",
      title: "Epistaxis (Nosebleed)",
      tags: ["emergency", "ENT"],
      guidelines: ["Sit upright, tilt forward, pinch soft part."]
  }
];

export function OpdGlancePalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const results = useMemo(() => {
    if (!query.trim()) return CONDITIONS_DB.slice(0, 5);
    const lower = query.toLowerCase();
    return CONDITIONS_DB.filter(c => 
      c.title.toLowerCase().includes(lower) || 
      c.category.toLowerCase().includes(lower) ||
      c.tags.some(t => t.toLowerCase().includes(lower))
    );
  }, [query]);

  const handleSelect = (id: string) => {
    setIsOpen(false);
    router.push(`/medico/gp-notes?id=${id}`);
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999]"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="fixed left-1/2 top-[15%] -translate-x-1/2 w-[90vw] max-w-2xl bg-[#09090b] border border-white/10 rounded-[28px] shadow-2xl z-[1000] overflow-hidden"
            >
              <div className="p-4 border-b border-white/5 flex items-center gap-3">
                <Search className="text-white/40" size={20} />
                <input
                  autoFocus
                  placeholder="Seach GP Notes, Protocols, Dosages... (⌘K)"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none text-white text-lg placeholder:text-white/20 font-medium"
                />
                <div className="flex items-center gap-1 px-2 py-1 bg-white/5 rounded-md border border-white/10">
                   <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">ESC</span>
                </div>
              </div>

              <div className="max-h-[60vh] overflow-y-auto p-2 scrollbar-hide">
                <div className="px-3 py-2">
                   <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-3">Clinical Protocols</p>
                   <div className="flex flex-col gap-1">
                      {results.map(condition => (
                        <button
                          key={condition.id}
                          onClick={() => handleSelect(condition.id)}
                          className="w-full text-left p-3 rounded-2xl hover:bg-white/5 group border border-transparent hover:border-white/10 transition-all flex items-center justify-between"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                               <BookOpen size={18} />
                            </div>
                            <div>
                              <h4 className="text-white font-bold text-sm tracking-tight">{condition.title}</h4>
                              <p className="text-white/40 text-xs font-medium">{condition.category}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                             <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">View protocol</span>
                             <ChevronRight size={14} className="text-blue-400" />
                          </div>
                        </button>
                      ))}
                      {results.length === 0 && (
                        <div className="py-12 text-center text-white/30">
                           <Calculator size={32} className="mx-auto mb-2 opacity-20" />
                           <p className="text-sm font-medium">No medical protocols found for "{query}"</p>
                        </div>
                      )}
                   </div>
                </div>
              </div>

              <div className="p-4 bg-white/[0.02] border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                   <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-md bg-white/5 border border-white/10 flex items-center justify-center">
                        <ArrowRight size={10} className="text-white/40" />
                      </div>
                      <span className="text-[10px] text-white/40 font-bold uppercase tracking-wider">Select</span>
                   </div>
                   <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-md bg-white/5 border border-white/10 flex items-center justify-center">
                        <Command size={10} className="text-white/40" />
                      </div>
                      <span className="text-[10px] text-white/40 font-bold uppercase tracking-wider">K</span>
                      <span className="text-[10px] text-white/40 font-medium">to toggle</span>
                   </div>
                </div>
                <div className="flex items-center gap-2 text-blue-400/60">
                   <StatsIcon size={12} />
                   <span className="text-[10px] font-bold uppercase tracking-[0.15em]">MediAssistant QuickRef</span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
