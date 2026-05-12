"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Search, Pill, Syringe, AlertTriangle, Calculator, 
  FileText, ChevronRight, X 
} from "lucide-react";

// Clinical Shorthand Data based directly on the GP notes provided
const PROTOCOLS = [
  {
    id: "p1",
    title: "Casualty: Acute Pain / Colic",
    category: "Casualty",
    color: "bg-red-500",
    tags: ["emergency", "pain", "colic"],
    rx: [
      { name: "Inj. Diclofenac (Dynapar)", dose: "1 amp", route: "IM", freq: "STAT", notes: "For general/musculoskeletal pain" },
      { name: "Inj. Tramadol", dose: "1 amp", route: "IM", freq: "STAT", notes: "For severe pain" },
      { name: "Inj. Buscopan", dose: "1 amp", route: "IM/IV", freq: "STAT", notes: "For spasmodic/abdominal pain" },
      { name: "Inj. Pantop", dose: "40mg", route: "IV", freq: "STAT", notes: "Gastric cover" }
    ]
  },
  {
    id: "p2",
    title: "Cough (Productive)",
    category: "OPD",
    color: "bg-blue-500",
    tags: ["respiratory", "cough", "infection"],
    rx: [
      { name: "Syp. ASCORIL", dose: "2 tsp", route: "PO", freq: "TID", duration: "3 days" },
      { name: "Cap. MOX", dose: "500mg", route: "PO", freq: "TID", duration: "5 days", notes: "Alternative: Tab. AZEE 500mg OD x 3 days" },
      { name: "Tab. RANTAC", dose: "150mg", route: "PO", freq: "BD", duration: "5 days" }
    ],
    peds: { available: true, drug: "Amoxycillin", baseDose: 15, unit: "mg/kg/dose", freq: "TID" }
  },
  {
    id: "p3",
    title: "Fever / Pyrexia",
    category: "OPD",
    color: "bg-yellow-500",
    tags: ["fever", "infection", "general"],
    rx: [
      { name: "Tab. DOLO (Paracetamol)", dose: "650mg", route: "PO", freq: "TID", duration: "3-5 days" },
      { name: "Tab. RANTAC (Ranitidine)", dose: "150mg", route: "PO", freq: "BD", notes: "30 mins before food" },
      { name: "Inj. Paracetamol", dose: "2cc (150mg/ml)", route: "IM", freq: "STAT", notes: "If Temp > 99.9°F" }
    ],
    peds: { available: true, drug: "Paracetamol", baseDose: 15, unit: "mg/kg/dose", freq: "QDS" }
  },
  {
    id: "p4",
    title: "Rodenticide Poisoning",
    category: "Casualty",
    color: "bg-orange-600",
    tags: ["poisoning", "toxicology", "emergency"],
    rx: [
      { name: "Gastric Lavage", dose: "Protocol", route: "NGT", freq: "STAT", notes: "Warm saline / water" },
      { name: "Inj. Pantop", dose: "40mg", route: "IV", freq: "STAT", notes: "Gastric protection" },
      { name: "Inj. Emeset", dose: "4mg", route: "IV", freq: "STAT", notes: "Anti-emetic" },
      { name: "Inj. NAC", dose: "Protocol", route: "IV", freq: "Cycle", notes: "Liver protection" }
    ]
  },
  {
    id: "p5",
    title: "Epistaxis Protocol",
    category: "Casualty",
    color: "bg-red-600",
    tags: ["ENT", "bleeding", "emergency"],
    rx: [
      { name: "Anterior Packing", dose: "Local", route: "Nasal", freq: "STAT", notes: "Ribbon gauze with liquid paraffin" },
      { name: "Inj. Tranexa", dose: "500mg", route: "IV", freq: "TID", notes: "Anti-fibrinolytic" },
      { name: "Tab. Vitamin K", dose: "10mg", route: "PO", freq: "OD", notes: "If coagulopathy suspected" }
    ]
  },
  {
    id: "p6",
    title: "Cough (Dry / Allergic)",
    category: "OPD",
    color: "bg-indigo-500",
    tags: ["respiratory", "cough", "allergy"],
    rx: [
      { name: "Syp. ASCORIL-D", dose: "2 tsp", route: "PO", freq: "TID", duration: "3-5 days", notes: "For non-productive dry cough" },
      { name: "Tab. MONTINA-L", dose: "10mg/5mg", route: "PO", freq: "HS", duration: "5 days", notes: "Montelukast + Levocetirizine" }
    ]
  },
  {
    id: "p7",
    title: "Pediatric Antibiotics",
    category: "Paediatrics",
    color: "bg-emerald-500",
    tags: ["peds", "infection", "antibiotics"],
    rx: [
      { name: "Syp. Cefixime", dose: "8mg/kg/day", route: "PO", freq: "BD", notes: "Common for URTI/UTI" },
      { name: "Syp. Azithromycin", dose: "10mg/kg/day", route: "PO", freq: "OD", notes: "3-day course for atypical pneumonia" },
      { name: "Syp. Amoxyclav", dose: "30mg/kg/day", route: "PO", freq: "BD", notes: "Augmentin duo equivalent" }
    ],
    peds: { available: true, drug: "Cefixime", baseDose: 4, unit: "mg/kg/dose", freq: "BD" }
  }
];

export function OpdGlancePalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [pedsWeight, setPedsWeight] = useState<number | "">("");

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

    const handleOpenPalette = () => setIsOpen(true);

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('open-opd-palette', handleOpenPalette);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('open-opd-palette', handleOpenPalette);
    };
  }, []);

  const filteredProtocols = useMemo(() => {
    if (!searchTerm.trim()) return PROTOCOLS;
    const lower = searchTerm.toLowerCase();
    return PROTOCOLS.filter(p => 
      p.title.toLowerCase().includes(lower) || 
      p.category.toLowerCase().includes(lower) ||
      p.tags.some(t => t.toLowerCase().includes(lower))
    );
  }, [searchTerm]);

  const spring = { type: "spring", damping: 25, stiffness: 300 };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[999] flex items-start justify-center pt-[10vh] px-4">
          {/* Blurred Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 bg-zinc-950/60 backdrop-blur-md"
          />

          {/* Palette Container */}
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }} 
            animate={{ opacity: 1, y: 0, scale: 1 }} 
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={spring}
            className="relative w-full max-w-3xl bg-zinc-900 border border-white/10 shadow-2xl rounded-3xl overflow-hidden flex flex-col max-h-[80vh]"
          >
            {/* Search Header */}
            <div className="flex items-center gap-3 px-6 py-4 border-b border-white/5 bg-zinc-900/80 backdrop-blur-xl sticky top-0 z-10">
              <Search size={22} className="text-zinc-500" />
              <input 
                autoFocus
                type="text" 
                placeholder="Search GP Notes (e.g., Fever, Epistaxis, Casualty...)" 
                className="flex-1 bg-transparent text-lg text-white placeholder-zinc-600 outline-none font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button 
                onClick={() => setIsOpen(false)} 
                className="p-1.5 rounded-full hover:bg-white/5 text-zinc-500 transition"
              >
                <X size={20}/>
              </button>
            </div>

            {/* Results Body */}
            <div className="overflow-y-auto p-4 custom-scrollbar flex flex-col gap-4">
              {filteredProtocols.map((protocol) => (
                <div key={protocol.id} className="bg-zinc-800/50 border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-colors">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-8 rounded-full ${protocol.color}`} />
                      <div>
                        <h3 className="text-lg font-bold text-white">{protocol.title}</h3>
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">{protocol.category}</span>
                      </div>
                    </div>
                  </div>

                  {/* Prescription Lines */}
                  <div className="space-y-2 mb-4">
                    {protocol.rx.map((drug, i) => (
                      <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-zinc-900/50 border border-white/5">
                        <div className="flex items-center gap-3">
                          {drug.route === "IM" || drug.route === "IV" ? 
                            <Syringe size={16} className="text-red-400" /> : 
                            <Pill size={16} className="text-blue-400" />
                          }
                          <div>
                            <span className="font-bold text-white text-sm">{drug.name}</span>
                            {drug.notes && <p className="text-xs text-zinc-400 mt-0.5">{drug.notes}</p>}
                          </div>
                        </div>
                        <div className="flex items-center gap-4 mt-2 sm:mt-0 text-sm font-semibold">
                          <span className="text-zinc-300">{drug.dose}</span>
                          <span className="text-purple-400 bg-purple-400/10 px-2 py-0.5 rounded-md">{drug.freq}</span>
                          {drug.duration && <span className="text-zinc-500 w-16 text-right">{drug.duration}</span>}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Dynamic Pediatric Calculator */}
                  {protocol.peds?.available && (
                    <div className="mt-4 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                      <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
                        <Calculator size={18} /> Peds Dosing: {protocol.peds.drug} ({protocol.peds.baseDose} {protocol.peds.unit})
                      </div>
                      <div className="flex items-center gap-3">
                        <input 
                          type="number" 
                          placeholder="Wt (kg)" 
                          className="w-20 bg-zinc-950 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white outline-none focus:border-emerald-500"
                          value={pedsWeight}
                          onChange={(e) => setPedsWeight(Number(e.target.value) || "")}
                        />
                        <div className="font-mono font-bold text-lg text-white min-w-[80px]">
                          {pedsWeight ? `${(pedsWeight * protocol.peds.baseDose).toFixed(0)} mg` : "— mg"}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              
              {filteredProtocols.length === 0 && (
                <div className="py-20 text-center">
                  <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mx-auto mb-4">
                    <Search size={24} className="text-zinc-600" />
                  </div>
                  <p className="text-zinc-400 font-medium">No GP protocols found for "{searchTerm}"</p>
                </div>
              )}
            </div>
            
            {/* Footer actions */}
            <div className="bg-zinc-950/50 border-t border-white/5 px-6 py-3 flex items-center justify-between text-xs font-medium text-zinc-500">
              <span>Press <kbd className="font-mono bg-zinc-800 px-1.5 py-0.5 rounded border border-white/10 text-zinc-400">Esc</kbd> to close</span>
              <button 
                onClick={() => {
                  setIsOpen(false);
                }}
                className="flex items-center gap-1 hover:text-white transition"
              >
                <FileText size={14} /> Analyze with DeepTutor <ChevronRight size={14} />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
