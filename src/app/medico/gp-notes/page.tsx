"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
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
    id: "fever-adult",
    category: "General Practice",
    title: "Fever / Pyrexia (Adult)",
    lastUpdated: "2026-05-08",
    tags: ["fever", "infection", "OPD"],
    redFlags: ["Persistent high-grade fever > 103°F", "Altered sensorium", "Severe headache/neck stiffness", "Petechial rash"],
    guidelines: [
      "Fever Criteria: Morning > 98.9°F, Evening > 99.9°F.",
      "Tepid sponging with lukewarm water for high-grade fever.",
      "Maintain high fluid intake (IV fluids if high grade or dehydrated).",
      "Steam inhalation for nasal congestion if present."
    ],
    investigations: ["CBP (Complete Blood Picture)", "ESR", "CRP", "Urine RE"],
    medications: [
      { name: "Tab. DOLO (Paracetamol)", dose: "650mg", maxDose: "TID", notes: "Primary antipyretic. Duration: 3-5 days." },
      { name: "Tab. RANTAC (Ranitidine)", dose: "150mg", maxDose: "BD", notes: "Take 30 mins before food. Gastric cover." },
      { name: "Inj. Paracetamol", dose: "2cc (150mg/ml)", maxDose: "IM STAT", notes: "Use if fever > 99.9°F and oral route not preferred." }
    ]
  },
  {
    id: "casualty-pain",
    category: "Casualty",
    title: "Acute Pain / Colic",
    lastUpdated: "2026-05-08",
    tags: ["casualty", "pain", "acute"],
    redFlags: ["Signs of shock (tachycardia, hypotension)", "Rigid abdomen", "Uncontrolled severe pain despite meds"],
    guidelines: [
      "Immediate assessment of pain intensity and location.",
      "Establish IV access if severe pain or vomiting.",
      "Monitor vitals post IM/IV analgesic administration."
    ],
    medications: [
      { name: "Inj. Diclofenac (Dynapar)", dose: "1 amp", maxDose: "IM STAT", notes: "For general/musculoskeletal pain." },
      { name: "Inj. Tramadol", dose: "1 amp", maxDose: "IM STAT", notes: "For severe pain." },
      { name: "Inj. Buscopan", dose: "1 amp", maxDose: "IM/IV STAT", notes: "For spasmodic/abdominal pain." },
      { name: "Inj. Pantop", dose: "40mg", maxDose: "IV STAT", notes: "Gastric cover for NSAIDs/stress." }
    ]
  },
  {
    id: "cough-productive",
    category: "Respiratory",
    title: "Cough (Productive)",
    lastUpdated: "2026-05-08",
    tags: ["cough", "infection", "OPD"],
    redFlags: ["Hemoptysis", "Stridor", "Respiratory distress", "Crackles on auscultation"],
    guidelines: [
      "Differentiate from dry cough (require Ascoril-D).",
      "Ensure adequate hydration to thin secretions.",
      "Complete the full antibiotic course if prescribed."
    ],
    medications: [
      { name: "Syp. ASCORIL", dose: "2 tsp", maxDose: "TID", notes: "Expectorant for productive cough. Duration: 3 days." },
      { name: "Cap. MOX (Amoxycillin)", dose: "500mg", maxDose: "TID", notes: "Standard antibiotic. Duration: 5 days." },
      { name: "Tab. AZEE (Azithromycin)", dose: "500mg", maxDose: "OD", notes: "Alternative: 1 tab daily x 3 days." },
      { name: "Tab. RANTAC", dose: "150mg", maxDose: "BD", notes: "Duration: 5 days." }
    ],
    peds: { available: true, drug: "Amoxycillin", baseDose: 15, unit: "mg/kg", freq: "TID", concentration: "125mg/5ml" }
  },
  {
    id: "cough-dry",
    category: "Respiratory",
    title: "Cough (Dry / Non-Productive)",
    lastUpdated: "2026-05-08",
    tags: ["cough", "allergy", "OPD"],
    redFlags: ["Stridor", "Wheezing", "Foreign body suspicion", "Night cough affecting sleep"],
    guidelines: [
      "No antibiotics needed unless secondary infection suspected.",
      "Identify potential allergens or triggers.",
      "Consider antihistamines if allergic component is suspected."
    ],
    medications: [
      { name: "Syp. ASCORIL-D", dose: "2 tsp", maxDose: "TID", notes: "Antitussive for dry cough. Contains Dextromethorphan." },
      { name: "Tab. MONTINA-L (Montelukast + Levocetirizine)", dose: "1 tab", maxDose: "HS", notes: "If allergic cough or post-viral hyperreactivity." }
    ]
  },
  {
    id: "rodenticide",
    category: "Casualty",
    title: "Rodenticide Poisoning",
    lastUpdated: "2026-05-08",
    tags: ["poisoning", "emergency", "toxicology"],
    redFlags: ["Altered consciousness", "Coagulopathy signs (bleeding)", "Hepatic failure signs"],
    guidelines: [
      "Immediate Gastric Lavage (if within 1-2 hours of ingestion).",
      "Monitor LFT and PT/INR.",
      "Ensure airway protection."
    ],
    medications: [
      { name: "Inj. Pantop", dose: "40mg", maxDose: "IV", notes: "Gastric protection." },
      { name: "Inj. Emeset (Ondansetron)", dose: "4mg", maxDose: "IV", notes: "Anti-emetic." },
      { name: "Inj. NAC (N-Acetylcysteine)", dose: "Protocol based", maxDose: "IV", notes: "Antioxidant / liver protection." }
    ]
  },
  {
    id: "epistaxis",
    category: "Casualty",
    title: "Epistaxis (Nosebleed)",
    lastUpdated: "2026-05-08",
    tags: ["emergency", "ENT", "bleeding"],
    redFlags: ["Inability to control bleeding with pressure", "Posterior bleed signs", "Signs of hypovolemia", "Anticoagulant use"],
    guidelines: [
      "Sit patient upright, head tilted forward.",
      "Pinch soft part of nose for 10-15 mins without letting go.",
      "Ice packs to the bridge of the nose or forehead.",
      "If bleeding persists: topical vasoconstrictors (e.g., oxymetazoline) or anterior packing."
    ],
    medications: [
      { name: "Oxymetazoline Spray", dose: "2-3 sprays", maxDose: "PRN", notes: "Topical vasoconstriction." },
      { name: "Tranexamic Acid (TXA)", dose: "500-1000mg", maxDose: "TID", notes: "Antifibrinolytic if indicated." }
    ]
  },
  {
    id: "peds-common",
    category: "Paediatrics",
    title: "Common Pediatric Dosing",
    lastUpdated: "2026-05-08",
    tags: ["peds", "dosing", "reference"],
    redFlags: ["Weight < 5th percentile", "Dehydration", "High-grade fever non-responsive to antipyretics"],
    guidelines: [
      "Always calculate dose based on current weight in kg.",
      "Check concentration of the syrup/suspension available.",
      "Educate parents on using measuring syringes, not household spoons."
    ],
    medications: [
      { name: "Paracetamol", dose: "15 mg/kg/dose", maxDose: "QDS", notes: "Standard antipyretic/analgesic." },
      { name: "Ibuprofen", dose: "10 mg/kg/dose", maxDose: "TDS", notes: "Anti-inflammatory/antipyretic." },
      { name: "Cefixime", dose: "8 mg/kg/day", maxDose: "BD", notes: "Third-gen cephalosporin." },
      { name: "Azithromycin", dose: "10 mg/kg/day", maxDose: "OD", notes: "Macrolide antibiotic. Often 3-day course." }
    ],
    peds: { available: true, drug: "Reference", baseDose: 15, unit: "mg/kg", freq: "variable" }
  }
];

export default function GPNotesPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedConditionId, setSelectedConditionId] = useState<string | null>(CONDITIONS_DB[0].id);
  const [isMobileListOpen, setIsMobileListOpen] = useState(true);
  const [pedsWeight, setPedsWeight] = useState<number | "">("");

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

  const selectedCondition = CONDITIONS_DB.find(c => c.id === selectedConditionId) as any;

  // Handle selection on mobile
  const handleSelect = (id: string) => {
    setSelectedConditionId(id);
    setPedsWeight(""); // Reset weight on change
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
                         {selectedCondition.guidelines.map((guide: any, idx: number) => (
                           <li key={idx} className="flex gap-3 text-[14px] leading-relaxed text-[var(--sec)] font-medium">
                             <div className="w-5 h-5 rounded-full bg-[var(--fill)] border border-[var(--sep)] flex items-center justify-center text-[var(--lb)] flex-shrink-0 text-[10px] mt-0.5 shadow-sm font-bold">
                               {idx + 1}
                             </div>
                             {guide}
                           </li>
                         ))}
                       </ul>
                    </div>

                    {/* Investigations Section */}
                    {selectedCondition.investigations && selectedCondition.investigations.length > 0 && (
                      <div className="glass-card rounded-[24px] p-5 md:p-6 bg-[var(--s1)] shadow-sm">
                         <div className="flex items-center gap-2 mb-5">
                           <div className="w-8 h-8 rounded-full bg-[var(--pur)]/10 flex items-center justify-center text-[var(--pur)]">
                             <Search size={16} />
                           </div>
                           <h3 className="font-bold text-[16px] text-[var(--lb)]">Recommended Investigations</h3>
                         </div>
                         
                         <div className="flex flex-wrap gap-2">
                           {selectedCondition.investigations.map((inv: string, idx: number) => (
                             <span key={idx} className="px-3 py-1.5 rounded-xl bg-[var(--s2)] border border-[var(--sep)] text-[13px] font-medium text-[var(--sec)]">
                               {inv}
                             </span>
                           ))}
                         </div>
                      </div>
                    )}
                  </div>

                  {/* Right Column - Medications */}
                  <div className="flex flex-col gap-6">
                    {/* Pediatric Calculator */}
                    {selectedCondition.peds?.available && (
                      <div className="glass-card rounded-[24px] p-5 md:p-6 bg-[var(--blue)]/5 border border-[var(--blue)]/20 shadow-sm overflow-hidden relative mb-6">
                        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                           <Activity size={120} />
                        </div>
                        <div className="flex items-center gap-2 mb-5">
                          <div className="w-8 h-8 rounded-full bg-[var(--blue)]/10 flex items-center justify-center text-[var(--blue)]">
                            <Activity size={16} />
                          </div>
                          <h3 className="font-bold text-[16px] text-[var(--lb)]">Pediatric Auto-Calculator</h3>
                        </div>

                        <div className="flex flex-col gap-4">
                          <div className="flex items-center justify-between bg-[var(--s1)] p-4 rounded-2xl border border-[var(--sep)]">
                             <div>
                               <p className="text-xs font-bold text-[var(--ter)] uppercase tracking-wider mb-1">Standard Dose</p>
                               <p className="text-[14px] font-bold text-[var(--lb)]">{selectedCondition.peds.drug} ({selectedCondition.peds.baseDose} {selectedCondition.peds.unit})</p>
                             </div>
                             <div className="flex flex-col items-end">
                               <p className="text-xs font-bold text-[var(--ter)] uppercase tracking-wider mb-1">Frequency</p>
                               <p className="text-sm font-bold text-[var(--blue)]">{selectedCondition.peds.freq}</p>
                             </div>
                          </div>

                          <div className="flex flex-wrap gap-4">
                            <div className="flex-1 min-w-[120px]">
                               <label className="text-xs font-bold text-[var(--sec)] ml-2 mb-1 block">Patient Weight (kg)</label>
                               <input 
                                 type="number" 
                                 placeholder="Wt (kg)" 
                                 value={pedsWeight}
                                 onChange={e => setPedsWeight(Number(e.target.value) || "")}
                                 className="w-full bg-[var(--s2)] border border-[var(--sep)] rounded-xl px-4 py-3 text-sm font-bold text-[var(--lb)] outline-none focus:ring-2 focus:ring-[var(--blue)]/20 transition-all font-mono"
                               />
                            </div>
                            <div className="flex-1 min-w-[120px]">
                               <label className="text-xs font-bold text-[var(--sec)] ml-2 mb-1 block">Dose (mg)</label>
                               <div className="w-full bg-[var(--fill)] border border-[var(--sep)] rounded-xl px-4 py-3 text-[18px] font-bold text-[var(--blue)] flex items-center justify-center font-mono">
                                 {pedsWeight ? `${(pedsWeight * selectedCondition.peds.baseDose).toFixed(1)} mg` : "—"}
                               </div>
                            </div>
                            {selectedCondition.peds.concentration && (
                               <div className="flex-1 min-w-[120px]">
                                 <label className="text-xs font-bold text-[var(--sec)] ml-2 mb-1 block">Volume (ml)</label>
                                 <div className="w-full bg-[var(--blue)]/10 border border-[var(--blue)]/20 rounded-xl px-4 py-3 text-[18px] font-bold text-[var(--blue)] flex items-center justify-center font-mono">
                                   {pedsWeight ? (() => {
                                      const [mg, ml] = selectedCondition.peds.concentration.split('/').map((s: string) => parseFloat(s));
                                      const totalMg = pedsWeight * selectedCondition.peds.baseDose;
                                      return `${(totalMg * ml / mg).toFixed(1)} ml`;
                                   })() : "—"}
                                 </div>
                               </div>
                            )}
                          </div>
                          
                          {selectedCondition.peds.concentration && (
                             <p className="text-[10px] text-[var(--ter)] font-bold uppercase text-center">
                               Based on concentration: {selectedCondition.peds.concentration}
                             </p>
                          )}
                        </div>
                      </div>
                    )}
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
