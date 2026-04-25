"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Brain, 
  ShieldCheck, 
  CheckCircle2, 
  Loader2, 
  FileText, 
  Activity,
  AlertTriangle,
  ArrowRight,
  Database
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DiagnosticStep {
  agent: string;
  action: string;
  status: 'pending' | 'active' | 'completed';
  findings?: string[];
}

/**
 * Architectural Mapping: DeepTutor "Deep Solve" capability.
 * Dual-loop multi-agent diagnostic solver (Analysis & Solve Loops).
 * Leverages Investigate, Plan, Solve, and Check agents for high-fidelity clinical reasoning.
 */
export function DeepSolveDiagnostic() {
  const [isSolving, setIsSolving] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<DiagnosticStep[]>([
    { agent: 'InvestigateAgent', action: 'Querying longitudinal EHR and recent labs...', status: 'pending' },
    { agent: 'InvestigateAgent', action: 'Scanning radiology reports (Chest X-Ray, CT)...', status: 'pending' },
    { agent: 'PlanAgent', action: 'Constructing prioritized differential diagnosis block...', status: 'pending' },
    { agent: 'SolveAgent', action: 'Synthesizing clinical findings into diagnostic hypothesis...', status: 'pending' },
    { agent: 'CheckAgent', action: 'Cross-referencing against WHO & UpToDate guidelines...', status: 'pending' },
  ]);

  const startAnalysis = async () => {
    setIsSolving(true);
    
    // Simulate the reasoning loops
    for (let i = 0; i < steps.length; i++) {
       setSteps(prev => prev.map((s, idx) => 
         idx === i ? { ...s, status: 'active' } : s
       ));
       await new Promise(r => setTimeout(r, 1500));
       setSteps(prev => prev.map((s, idx) => 
         idx === i ? { ...s, status: 'completed', findings: [`Confirmed ${i === 0 ? "elevated Troponin" : "normal CT"}`] } : s
       ));
       setCurrentStep(i + 1);
    }
    
    setIsSolving(false);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Card className="border-sky-500/30 bg-sky-500/[0.02] shadow-2xl rounded-[2.5rem] overflow-hidden">
        <CardHeader className="p-8 border-b border-sky-500/10 bg-sky-500/5">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-sky-600 text-white shadow-lg">
                <Brain className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold tracking-tight">Deep Solve: Multi-Agent Clinical Hub</CardTitle>
                <CardDescription>Dual-loop reasoning active • Multi-disciplinary specialist verification</CardDescription>
              </div>
            </div>
            {!isSolving && currentStep === 0 && (
              <Button onClick={startAnalysis} className="rounded-full bg-sky-600 hover:bg-sky-700 px-8">
                Initialize Deep Solve <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
            {isSolving && (
              <Badge className="bg-sky-500 animate-pulse py-1 px-3 rounded-full">
                <Loader2 className="h-3 w-3 animate-spin mr-2" /> SOLVING LOOP ACTIVE
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-8">
          <div className="space-y-4">
             {steps.map((step, index) => (
               <motion.div 
                 key={index}
                 initial={{ opacity: 0, x: -20 }}
                 animate={{ opacity: 1, x: 0 }}
                 transition={{ delay: index * 0.1 }}
                 className={cn(
                   "flex items-center gap-4 p-5 rounded-3xl border transition-all duration-500",
                   step.status === 'active' ? "border-sky-500 bg-sky-500/5 shadow-md" : 
                   step.status === 'completed' ? "border-emerald-500/20 bg-emerald-500/[0.02]" : "border-border/50 opacity-40"
                 )}
               >
                 <div className={cn(
                   "p-2 rounded-xl",
                   step.status === 'active' ? "bg-sky-500 text-white" :
                   step.status === 'completed' ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground"
                 )}>
                    {step.status === 'active' ? <Loader2 className="h-4 w-4 animate-spin" /> : 
                     step.status === 'completed' ? <CheckCircle2 className="h-4 w-4" /> : <Database className="h-4 w-4" />}
                 </div>
                 <div className="flex-1">
                   <div className="flex justify-between items-center mb-1">
                     <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{step.agent}</span>
                     {step.status === 'completed' && <Badge variant="secondary" className="text-[8px] h-4 bg-emerald-500/10 text-emerald-600 border-none">VERIFIED</Badge>}
                   </div>
                   <p className={cn("text-sm font-medium", step.status === 'active' && "text-sky-600")}>{step.action}</p>
                 </div>
               </motion.div>
             ))}
          </div>

          <AnimatePresence>
            {currentStep === steps.length && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 p-6 rounded-[2rem] bg-zinc-900 text-white shadow-2xl relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4 opacity-10">
                   <ShieldCheck className="h-24 w-24" />
                </div>
                <h4 className="text-xl font-bold flex items-center gap-3 mb-4">
                  <ShieldCheck className="h-6 w-6 text-emerald-500" />
                  Consensus Diagnostic Report
                </h4>
                <div className="prose prose-sm prose-invert max-w-none">
                  <p className="text-zinc-400">
                    Based on iterative Investigative and Solve loops, the most likely diagnosis is **Atypical Pneumonia with secondary Myocarditis**. 
                    UpToDate guidelines (2024) recommend early intervention with Macrolides while monitoring Troponin trends.
                  </p>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                      <p className="text-[9px] uppercase font-bold text-sky-400">Confidence Score</p>
                      <p className="text-lg font-black">94.8%</p>
                    </div>
                    <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                      <p className="text-[9px] uppercase font-bold text-amber-400">Citation Count</p>
                      <p className="text-lg font-black">12 Sources</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
        <CardFooter className="p-8 pt-0 border-t border-sky-500/10 bg-sky-500/5 items-center gap-3">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Clinical Safety Protocol: AI reasoning must be verified by a licensed professional.</span>
        </CardFooter>
      </Card>
    </div>
  );
}

import { cn } from '@/lib/utils';
