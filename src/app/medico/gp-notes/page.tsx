"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, ChevronLeft, BookOpen, Pill, Stethoscope, 
  Activity, AlertTriangle, Info, Clock, CheckCircle2,
  Bookmark, MoreVertical, FileText
} from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

// --- Mock Data: GP Notes ---
const CONDITIONS_DB = [
  {
    id: "htn",
    category: "Cardiovascular",
    title: "Hypertension (Adult)",
    lastUpdated: "2026-01-15",
    tags: ["chronic", "routine"],
    redFlags: ["BP >180/120 (Hypertensive Crisis)", "Papilledema", "New onset confusion or chest pain"],
    guidelines: [
      "Target BP < 140/90 mmHg for most (< 130/80 if diabetic or CKD).",
      "Step 1: Patient < 55 yrs = ACE inhibitor (or ARB). Patient > 55 yrs or black African = CCB.",
      "Step 2: A + C or A + D or C + D.",
      "Check renal function (U&Es) 1-2 weeks after starting ACE/ARB."
    ],
    medications: [
      { name: "Amlodipine", dose: "5mg OD", maxDose: "10mg OD", notes: "First line for > 55 yrs. Watch for ankle swelling." },
      { name: "Ramipril", dose: "1.25-2.5mg OD", maxDose: "10mg OD", notes: "Check U&E. Cough is a common side effect." },
      { name: "Losartan", dose: "50mg OD", maxDose: "100mg OD", notes: "Use if ACEi not tolerated (e.g. cough)." }
    ]
  },
  {
    id: "t2dm",
    category: "Endocrinology",
    title: "Type 2 Diabetes Mellitus",
    lastUpdated: "2025-11-20",
    tags: ["chronic", "screening"],
    redFlags: ["BM > 30 with ketones (HHS/DKA risk)", "Sudden visual loss", "Foot ulcers with systemic infection"],
    guidelines: [
      "HbA1c target: 48 mmol/mol (6.5%) at diagnosis. General target 53 mmol/mol (7.0%).",
      "Screen for complications annually: Retinopathy, Nephropathy (ACR/eGFR), Neuropathy (foot exam).",
      "First line: Metformin (if tolerated and eGFR > 30).",
      "Consider SGLT2i early if cardiovascular disease, heart failure, or CKD are present."
    ],
    medications: [
      { name: "Metformin", dose: "500mg OD, titrate to 1g BD", maxDose: "2g daily", notes: "Take with food to minimize GI upset. Caution if eGFR < 45." },
      { name: "Empagliflozin", dose: "10mg OD", maxDose: "25mg OD", notes: "SGLT2 inhibitor. Warn about thrush / UTI risk. Sick day rules (withhold if unwell/dehydrated)." },
      { name: "Gliclazide", dose: "40-80mg OD/BD", maxDose: "320mg daily", notes: "Risk of hypoglycemia. Educate patient on signs and management." }
    ]
  },
  {
    id: "asthma",
    category: "Respiratory",
    title: "Asthma Exacerbation",
    lastUpdated: "2026-03-02",
    tags: ["acute", "emergency"],
    redFlags: ["SpO2 < 92%", "Silent chest", "Cyanosis", "PEFR < 33% best/predicted", "Unable to complete sentences"],
    guidelines: [
      "Assess severity: Mild/Moderate vs Severe vs Life-threatening.",
      "Mild/Moderate: PEFR >50%. HR <110. Talk in full sentences.",
      "Treatment for Moderate: SABA via spacer (e.g., 4-10 puffs, 1 puff every 30-60 secs).",
      "Prescribe oral corticosteroids if poor response to initial bronchodilators.",
      "Arrange follow-up within 48 hours for acute exacerbations."
    ],
    medications: [
      { name: "Salbutamol MDI", dose: "100mcg/puff: 4-10 puffs via spacer", maxDose: "PRN", notes: "Given during acute attack. Repeat every 10-20 min if necessary." },
      { name: "Prednisolone", dose: "40-50mg OD for 5 days", maxDose: "50mg daily", notes: "Take in the morning to prevent insomnia. No need to taper if course < 3 weeks." },
      { name: "Salbutamol Nebuliser", dose: "2.5-5mg", maxDose: "PRN in severe attack", notes: "Driven by oxygen if hypoxaemic (target SpO2 94-98%)." }
    ]
  },
  {
    id: "uti",
    category: "Genitourinary",
    title: "Uncomplicated UTI (Female)",
    lastUpdated: "2026-04-10",
    tags: ["acute", "infection"],
    redFlags: ["Fever > 38°C", "Loin pain (Pyelonephritis)", "Visible haematuria post-infection", "Pregnancy (requires different management)"],
    guidelines: [
      "Diagnose typical UTI if ≥2 key symptoms (dysuria, new nocturia, cloudy urine) and no vaginal discharge.",
      "Urine dipstick: +ve nitrites is highly predictive. +ve leukocytes only is less specific.",
      "Urine culture if: >65 yrs, pregnant, recurrent UTI, or treatment failure.",
      "Course length: 3 days for uncomplicated females. 7 days for males/pregnant."
    ],
    medications: [
      { name: "Nitrofurantoin", dose: "100mg BD (m/r) or 50mg QDS", maxDose: "3 days (female)", notes: "First line. Avoid if eGFR < 45. Take with food." },
      { name: "Trimethoprim", dose: "200mg BD", maxDose: "3 days (female)", notes: "Alternative first line IF local resistance < 20% and not previously used in past 3 months." },
      { name: "Pivmecillinam", dose: "400mg initially then 200mg TDS", maxDose: "3 days (female)", notes: "Second line. Good for ESBL risk." }
    ]
  },
  {
    id: "otitis-media",
    category: "ENT",
    title: "Acute Otitis Media (AOM)",
    lastUpdated: "2025-10-05",
    tags: ["acute", "infection", "paediatrics"],
    redFlags: ["Mastoiditis (swelling behind ear)", "Systemically very unwell", "Symptoms > 4 days without improvement"],
    guidelines: [
      "Most cases self-resolve in 3 days. Recommend analgesia (Paracetamol/Ibuprofen).",
      "Consider delayed antibiotic prescription (to use if no improvement after 3 days).",
      "Immediate antibiotics ONLY IF: systemically unwell, high risk of complications, <2 yrs with bilateral AOM, or perforation with discharge."
    ],
    medications: [
      { name: "Amoxicillin", dose: "500mg TDS (Adult) or age-weight based (Paeds)", maxDose: "5 day course", notes: "First line if antibiotics indicated." },
      { name: "Clarithromycin", dose: "250-500mg BD (Adult)", maxDose: "5 day course", notes: "If penicillin allergic." },
      { name: "Co-amoxiclav", dose: "500/125mg TDS", maxDose: "5 day course", notes: "Second line if worsening on Amoxicillin after 2-3 days." }
    ]
  }
];

export default function GPNotesPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedConditionId, setSelectedConditionId] = useState<string | null>(CONDITIONS_DB[0].id);
  const [isMobileListOpen, setIsMobileListOpen] = useState(true);

  // Group conditions by category
  const categories = useMemo(() => {
    const counts = CONDITIONS_DB.reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.keys(counts).sort();
  }, []);

  const filteredConditions = useMemo(() => {
    if (!searchQuery.trim()) return CONDITIONS_DB;
    const lowerQ = searchQuery.toLowerCase();
    return CONDITIONS_DB.filter(
      c => c.title.toLowerCase().includes(lowerQ) || 
           c.category.toLowerCase().includes(lowerQ) ||
           c.tags.some(t => t.toLowerCase().includes(lowerQ))
    );
  }, [searchQuery]);

  const selectedCondition = CONDITIONS_DB.find(c => c.id === selectedConditionId);

  // Handle selection on mobile
  const handleSelect = (id: string) => {
    setSelectedConditionId(id);
    if (window.innerWidth < 768) {
      setIsMobileListOpen(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[var(--s0)] text-[var(--lb)] overflow-hidden font-[Inter]">
      {/* Header */}
      <header className="flex-shrink-0 border-b border-[var(--sep)] bg-[var(--s1)]/80 backdrop-blur-md px-4 md:px-8 py-4 flex items-center justify-between z-20">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push('/medico')}
            className="w-10 h-10 flex flex-shrink-0 items-center justify-center rounded-full bg-[var(--fill)] hover:bg-[var(--fill2)] border border-[var(--sep)] transition-colors"
          >
            <ChevronLeft size={20} className="text-[var(--sec)]" />
          </button>
          <div>
            <h1 className="text-xl font-[Fraunces] font-medium flex items-center gap-2">
              <BookOpen size={20} className="text-[var(--blue)]" />
              GP Quick Notes
            </h1>
            <p className="text-xs text-[var(--sec)] font-medium mt-0.5 hidden md:block">
              Condition-based guidelines and dosage references
            </p>
          </div>
        </div>

        <div className="flex-1 max-w-sm ml-4 lg:ml-12 relative hidden md:block">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ter)]" />
          <input 
            type="text" 
            placeholder="Search conditions, tags..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-[var(--s2)] border border-[var(--sep)] rounded-full pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--blue)]/20 focus:border-[var(--blue)]/50 transition-all text-[var(--lb)] placeholder:text-[var(--ter)] font-medium"
          />
        </div>
        
        {/* Mobile Search Input Row */}
        <div className="md:hidden ml-auto">
           <button 
            onClick={() => setIsMobileListOpen(!isMobileListOpen)}
            className="px-4 py-2 rounded-full bg-[var(--blue)] text-white text-sm font-semibold shadow-md active:scale-95 transition-transform"
           >
             {isMobileListOpen ? 'View Note' : 'Topics'}
           </button>
        </div>
      </header>

      {/* Main Content Split */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Mobile Search Bar inside list container */}
        <div className={cn(
          "absolute md:static inset-0 z-10 md:w-[320px] lg:w-[360px] bg-[var(--s1)] border-r border-[var(--sep)] flex flex-col transition-transform duration-300",
          !isMobileListOpen ? "-translate-x-full md:translate-x-0" : "translate-x-0"
        )}>
          <div className="p-4 border-b border-[var(--sep)] md:hidden">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ter)]" />
              <input 
                type="text" 
                placeholder="Search..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-[var(--s2)] border border-[var(--sep)] rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--blue)]/20 focus:border-[var(--blue)]/50 transition-all font-medium"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-2 py-3 scrollbar-hide">
            {categories.map(category => {
              const categoryConditions = filteredConditions.filter(c => c.category === category);
              if (categoryConditions.length === 0) return null;
              
              return (
                <div key={category} className="mb-6">
                  <div className="px-3 mb-2 flex items-center gap-2">
                    <span className="text-[10px] font-bold tracking-widest uppercase text-[var(--ter)]">{category}</span>
                    <div className="h-px flex-1 bg-[var(--sep)]" />
                  </div>
                  <div className="flex flex-col gap-1">
                    {categoryConditions.map((condition) => (
                      <button
                        key={condition.id}
                        onClick={() => handleSelect(condition.id)}
                        className={cn(
                          "text-left px-3 py-3 rounded-xl transition-all border border-transparent",
                          selectedConditionId === condition.id 
                            ? "bg-[var(--blue)]/10 border-[var(--blue)]/20 shadow-sm" 
                            : "hover:bg-[var(--fill)]"
                        )}
                      >
                        <h3 className={cn(
                          "text-[14px] font-bold leading-tight mb-1",
                          selectedConditionId === condition.id ? "text-[var(--blue)]" : "text-[var(--lb)]"
                        )}>
                          {condition.title}
                        </h3>
                        <div className="flex flex-wrap gap-1">
                          {condition.tags.map(tag => (
                            <span key={tag} className="text-[10px] font-mono text-[var(--sec)] bg-[var(--fill)] px-1.5 py-0.5 rounded border border-[var(--sep)]">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
            
            {filteredConditions.length === 0 && (
               <div className="px-4 py-10 text-center text-[var(--sec)]">
                 <Search size={24} className="mx-auto mb-2 opacity-50" />
                 <p className="text-sm font-medium">No guidelines found matching "{searchQuery}"</p>
               </div>
            )}
          </div>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 bg-[var(--s0)] overflow-y-auto relative">
          <AnimatePresence mode="wait">
            {selectedCondition ? (
              <motion.div
                key={selectedCondition.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="max-w-4xl mx-auto p-4 md:p-8 pb-32"
              >
                {/* Header Block */}
                <div className="mb-8">
                   <div className="flex items-center gap-2 mb-3">
                     <span className="px-2.5 py-1 rounded-md bg-[var(--fill)] border border-[var(--sep)] text-[11px] font-bold text-[var(--sec)] uppercase tracking-wide">
                       {selectedCondition.category}
                     </span>
                     <span className="text-[12px] text-[var(--ter)] font-medium flex items-center gap-1">
                       <Clock size={12} />
                       Updated: {selectedCondition.lastUpdated}
                     </span>
                   </div>
                   <h2 className="text-3xl md:text-4xl font-[Fraunces] font-medium tracking-tight text-[var(--lb)] mb-4">
                     {selectedCondition.title}
                   </h2>
                   
                   {/* Red Flags Alert */}
                   {selectedCondition.redFlags.length > 0 && (
                     <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 md:p-5 flex items-start gap-3">
                        <AlertTriangle className="text-rose-500 flex-shrink-0 mt-0.5" size={20} />
                        <div>
                          <h4 className="font-bold text-rose-500 text-sm mb-2">RED FLAGS - Urgent Referral/Action</h4>
                          <ul className="flex flex-col gap-1.5">
                            {selectedCondition.redFlags.map((flag, idx) => (
                              <li key={idx} className="text-[14px] text-rose-500/90 font-medium flex items-start gap-2">
                                <span className="mt-1 w-1 h-1 rounded-full bg-rose-500 flex-shrink-0" />
                                {flag}
                              </li>
                            ))}
                          </ul>
                        </div>
                     </div>
                   )}
                </div>

                {/* Grid Layout for Guidelines & Meds */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                  
                  {/* Left Column - Guidelines */}
                  <div className="flex flex-col gap-6">
                    <div className="glass-card rounded-[24px] p-5 md:p-6 bg-[var(--s1)] shadow-sm">
                       <div className="flex items-center gap-2 mb-5">
                         <div className="w-8 h-8 rounded-full bg-[#4b8ff7]/10 flex items-center justify-center text-[#4b8ff7]">
                           <FileText size={16} />
                         </div>
                         <h3 className="font-bold text-[16px] text-[var(--lb)]">Management Guidelines</h3>
                       </div>
                       
                       <ul className="flex flex-col gap-4">
                         {selectedCondition.guidelines.map((guide, idx) => (
                           <li key={idx} className="flex gap-3 text-[14px] leading-relaxed text-[var(--sec)] font-medium">
                             <div className="w-5 h-5 rounded-full bg-[var(--fill)] border border-[var(--sep)] flex items-center justify-center text-[var(--lb)] flex-shrink-0 text-[10px] mt-0.5 shadow-sm font-bold">
                               {idx + 1}
                             </div>
                             {guide}
                           </li>
                         ))}
                       </ul>
                    </div>
                  </div>

                  {/* Right Column - Medications */}
                  <div className="flex flex-col gap-6">
                    <div className="glass-card rounded-[24px] p-5 md:p-6 bg-[var(--s1)] shadow-sm">
                       <div className="flex items-center gap-2 mb-5">
                         <div className="w-8 h-8 rounded-full bg-[#32c97e]/10 flex items-center justify-center text-[#32c97e]">
                           <Pill size={16} />
                         </div>
                         <h3 className="font-bold text-[16px] text-[var(--lb)]">Common Prescriptions</h3>
                       </div>

                       <div className="flex flex-col gap-4">
                         {selectedCondition.medications.map((med, idx) => (
                           <div key={idx} className="p-4 rounded-xl bg-[var(--s2)] border border-[var(--sep)] shadow-sm group hover:border-[var(--sep2)] transition-colors">
                              <div className="flex items-end justify-between mb-2">
                                <h4 className="font-bold text-[15px] text-[var(--lb)] group-hover:text-[var(--blue)] transition-colors">{med.name}</h4>
                                <div className="text-[12px] font-mono font-bold text-[var(--pur)] bg-[var(--pur)]/10 px-2 py-0.5 rounded border border-[var(--pur)]/20 shadow-sm">
                                  {med.dose}
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5 mb-2 text-[12px] text-[var(--ter)] font-medium">
                                <Activity size={12} /> Max: <span className="text-[var(--sec)]">{med.maxDose}</span>
                              </div>
                              <p className="text-[13px] text-[var(--sec)] leading-snug bg-[var(--fill)] p-2 rounded-lg border border-[var(--sep)] italic">
                                {med.notes}
                              </p>
                           </div>
                         ))}
                       </div>
                    </div>
                  </div>

                </div>
              </motion.div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center h-full text-[var(--ter)]">
                <BookOpen size={48} className="mb-4 opacity-20" />
                <p className="font-medium">Select a condition to view guidelines</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
