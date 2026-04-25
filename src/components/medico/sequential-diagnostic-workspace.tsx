"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BrainCircuit, ChevronRight, CheckCircle, Search, RefreshCcw, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ThoughtStep {
  step: number;
  content: string;
  isComplete: boolean;
}

/**
 * Architectural Mapping: Inspired by Model Context Protocol (MCP) Servers.
 * Implementation of a "Sequential Thinking" environment for complex medical diagnostics.
 * Prevents AI shortcuts and forces reflective reasoning phases.
 */
export function SequentialDiagnosticWorkspace() {
  const [symptoms, setSymptoms] = useState('');
  const [activeStep, setActiveStep] = useState(0);
  const [thinkingSteps, setThinkingSteps] = useState<ThoughtStep[]>([
    { step: 1, content: '', isComplete: false },
    { step: 2, content: '', isComplete: false },
    { step: 3, content: '', isComplete: false },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const runStep = async (stepNumber: number) => {
    if (!symptoms.trim()) return;
    
    setIsLoading(true);
    try {
      // Simulation of sequential_diagnostic tool call
      const response = await fetch('/api/medico/tools/sequential-diagnostic', {
        method: 'POST',
        body: JSON.stringify({ symptoms, step: stepNumber }),
      });
      const data = await response.json();
      
      setThinkingSteps(prev => prev.map(s => 
        s.step === stepNumber ? { ...s, content: data.result, isComplete: true } : s
      ));
      setActiveStep(stepNumber);
    } catch (error) {
      console.error("Diagnostic step failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setSymptoms('');
    setActiveStep(0);
    setThinkingSteps([
      { step: 1, content: '', isComplete: false },
      { step: 2, content: '', isComplete: false },
      { step: 3, content: '', isComplete: false },
    ]);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-6">
      <header className="flex justify-between items-end mb-8">
         <div>
            <h1 className="text-3xl font-bold tracking-tight">Sequential Diagnostic Workspace</h1>
            <p className="text-muted-foreground italic">Inspired by MCP: Reflective Problem-Solving Engine.</p>
         </div>
         <Button variant="ghost" size="sm" onClick={reset} className="rounded-full text-xs text-muted-foreground">
            <RefreshCcw className="h-3 w-3 mr-2" /> Reset Sequence
         </Button>
      </header>

      <div className="relative group mb-12">
          <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-sky-500 to-indigo-600 rounded-full opacity-30 blur-sm group-focus-within:opacity-100 transition-opacity" />
          <div className="flex items-center gap-4 bg-white/50 backdrop-blur-xl border border-white/20 p-4 rounded-3xl shadow-xl">
             <Search className="h-6 w-6 text-slate-400 ml-4" />
             <Input 
                value={symptoms}
                onChange={e => setSymptoms(e.target.value)}
                placeholder="Enter complex symptoms here (e.g., 55yo M with night sweats, weight loss, and pruritus)..." 
                className="border-none bg-transparent shadow-none focus-visible:ring-0 text-xl font-medium placeholder:text-slate-300 h-14"
             />
             <Button 
                onClick={() => runStep(1)} 
                disabled={activeStep > 0 || !symptoms.trim() || isLoading}
                className="rounded-2xl bg-zinc-900 text-white px-8 h-14 shadow-lg"
             >
                {isLoading && activeStep === 0 ? <RefreshCcw className="h-5 w-5 animate-spin" /> : "Initiate Sequence"}
             </Button>
          </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
         {/* Connector Lines */}
         <div className="hidden md:block absolute top-[60px] left-[25%] right-[25%] h-0.5 bg-dashed border-t-2 border-dashed border-slate-200 -z-10" />
         
         {thinkingSteps.map((step, idx) => (
            <Card 
               key={step.step} 
               className={cn(
                 "rounded-[2.5rem] border-none shadow-xl transition-all duration-500 overflow-hidden",
                 step.isComplete ? "bg-white/80 dark:bg-zinc-900/80 scale-100 ring-2 ring-emerald-500/20" : 
                 activeStep === step.step - 1 && symptoms ? "bg-white dark:bg-zinc-900 scale-105 shadow-2xl ring-4 ring-sky-500/10" : "bg-white/30 dark:bg-zinc-900/30 grayscale-[50%] opacity-60"
               )}
            >
               <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                     <span className={cn(
                       "text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-full",
                       step.isComplete ? "bg-emerald-500/10 text-emerald-600" : "bg-sky-500/10 text-sky-600"
                     )}>
                        Phase 0{step.step}
                     </span>
                     {step.isComplete && <CheckCircle className="h-5 w-5 text-emerald-500" />}
                  </div>
                  <CardTitle className="text-xl mt-4">
                     {step.step === 1 ? 'Primary Analysis' : step.step === 2 ? 'Differential Expansion' : 'Clinical Synthesis'}
                  </CardTitle>
               </CardHeader>
               <CardContent className="min-h-[180px]">
                  <AnimatePresence mode="wait">
                    {step.isComplete ? (
                       <motion.p 
                          initial={{ opacity: 0 }} 
                          animate={{ opacity: 1 }} 
                          className="text-sm text-slate-500 leading-relaxed font-medium"
                       >
                          {step.content}
                       </motion.p>
                    ) : (
                       <div className="flex flex-col items-center justify-center h-40 text-center space-y-4">
                          <div className={cn(
                            "w-12 h-12 rounded-full flex items-center justify-center",
                            activeStep === step.step - 1 ? "bg-sky-100 dark:bg-sky-900/30 text-sky-600 animate-pulse" : "bg-slate-100 dark:bg-zinc-800 text-slate-300"
                          )}>
                             <Activity className="h-6 w-6" />
                          </div>
                          {activeStep === step.step - 1 && symptoms && (
                             <Button 
                                variant="outline" 
                                size="sm" 
                                className="rounded-full border-sky-500/20 text-sky-600 hover:bg-sky-50"
                                onClick={() => runStep(step.step)}
                                disabled={isLoading}
                             >
                                {isLoading ? "Thinking..." : "Activate Phase"}
                             </Button>
                          )}
                       </div>
                    )}
                  </AnimatePresence>
               </CardContent>
               <CardFooter className={cn(
                 "p-4 bg-slate-50/50 dark:bg-black/20 flex items-center gap-3",
                 !step.isComplete && "invisible"
               )}>
                  <BrainCircuit className="h-4 w-4 text-sky-500" />
                  <span className="text-[10px] font-bold text-muted-foreground tracking-tight">REFLECTION COMPLETE</span>
               </CardFooter>
            </Card>
         ))}
      </div>

      {activeStep === 3 && (
         <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }}
            className="p-8 rounded-[3rem] bg-zinc-900 text-white shadow-2xl relative overflow-hidden mt-12"
         >
            <div className="absolute top-0 right-0 p-12 opacity-5">
               <Activity className="h-64 w-64" />
            </div>
            <div className="relative z-10">
               <h3 className="text-2xl font-black italic tracking-tighter mb-4">SEQUENTIAL DIAGNOSTIC REPORT</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                     <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Final Clinical Synthesis</p>
                     <p className="text-sm font-medium leading-relaxed">
                        Based on the sequential reflection, the primary differential aligns with high-grade lymphoma or chronic infective process. Recommended immediate step: Contrast-enhanced chest/abdomen/pelvis CT followed by excisional lymph node biopsy.
                     </p>
                  </div>
                  <div className="flex flex-col justify-between">
                     <div className="space-y-2">
                        <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Verification Status</p>
                        <div className="flex items-center gap-2 text-emerald-400">
                           <CheckCircle className="h-4 w-4" />
                           <span className="text-xs font-bold">Anti-Rationalization Check Passed</span>
                        </div>
                     </div>
                     <Button className="w-full rounded-2xl bg-sky-600 hover:bg-sky-700 py-6 text-sm font-bold shadow-lg shadow-sky-500/20 mt-6">
                        EXPORT TO CLINICAL NOTES <ChevronRight className="ml-2 h-4 w-4" />
                     </Button>
                  </div>
               </div>
            </div>
         </motion.div>
      )}
    </div>
  );
}
