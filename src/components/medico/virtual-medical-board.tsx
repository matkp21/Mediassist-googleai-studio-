"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Users, 
  Stethoscope, 
  Dna, 
  Microscope, 
  MessageSquare,
  ArrowRight,
  ShieldCheck,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { runVirtualMedicalBoard } from '@/ai/orchestrator/VirtualMedicalBoard';
import { motion, AnimatePresence } from 'framer-motion';
import { MarkdownRenderer } from '../markdown/markdown-renderer';

export default function VirtualMedicalBoard() {
  const [caseDesc, setCaseDesc] = useState('');
  const [boardResult, setBoardResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleConsult = async () => {
    if (!caseDesc.trim()) return;
    setIsLoading(true);
    try {
      const result = await runVirtualMedicalBoard({ caseDescription: caseDesc });
      setBoardResult(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-zinc-950">
      <div className="container mx-auto p-4 md:p-8 max-w-6xl">
        <header className="mb-10">
          <Badge className="bg-indigo-500/10 text-indigo-500 border-none mb-4">Multi-Agent Orchestration</Badge>
          <h1 className="text-4xl font-bold tracking-tight mb-2">Virtual Medical Board</h1>
          <p className="text-muted-foreground text-lg">Assign complex multi-system cases and watch specialized AI personas discuss treatment plans.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Input Side */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="border-border/50 shadow-xl rounded-2xl overflow-hidden bg-white/50 backdrop-blur-md">
              <CardHeader className="bg-indigo-500/5 border-b border-indigo-500/10">
                <CardTitle className="text-lg flex items-center gap-2 text-indigo-700">
                  <Stethoscope className="h-5 w-5" /> Case Presentation
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <textarea
                  value={caseDesc}
                  onChange={e => setCaseDesc(e.target.value)}
                  placeholder="e.g. 55-year-old male with HfpEF, Chronic Kidney Disease Stage 3, and a new onset productive cough with fever..."
                  className="w-full h-48 bg-slate-100/50 dark:bg-zinc-900/50 rounded-xl p-4 text-sm focus:ring-2 ring-indigo-500 outline-none border-none resize-none"
                />
                <Button 
                   onClick={handleConsult} 
                   disabled={isLoading || !caseDesc.trim()}
                   className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 h-14 rounded-xl text-lg font-bold group shadow-lg shadow-indigo-500/20"
                >
                  {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : (
                    <>Assign to Board <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" /></>
                  )}
                </Button>
              </CardContent>
            </Card>

            <div className="bg-zinc-100 dark:bg-zinc-900 rounded-3xl p-6 border border-border/50">
              <h4 className="text-sm font-bold uppercase tracking-widest text-zinc-500 mb-4 flex items-center gap-2">
                <Users className="h-4 w-4" /> Board Members Active
              </h4>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-600 font-bold border border-rose-500/20">A</div>
                    <div>
                        <p className="text-sm font-bold">Dr. Aris</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Cardiology</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 font-bold border border-emerald-500/20">E</div>
                    <div>
                        <p className="text-sm font-bold">Dr. Elena</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Nephrology</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600 font-bold border border-amber-500/20">M</div>
                    <div>
                        <p className="text-sm font-bold">Dr. Marcus</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Infectious Disease</p>
                    </div>
                </div>
              </div>
            </div>
          </div>

          {/* Results Side */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center h-full min-h-[400px] text-muted-foreground space-y-6"
                >
                  <div className="relative">
                    <Loader2 className="h-16 w-16 animate-spin text-indigo-500" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Users className="h-6 w-6 text-indigo-400" />
                    </div>
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Simulating Board Discussion</h3>
                    <p className="text-sm">Specialists are debating conflicting priorities...</p>
                  </div>
                </motion.div>
              ) : boardResult ? (
                <motion.div 
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                >
                  <ScrollArea className="h-[75vh] pr-4">
                    <div className="space-y-8 pb-20">
                        {/* Discussion Section */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">The Round Table Discussion</h3>
                            {boardResult.discussion.map((member: any, i: number) => (
                                <motion.div 
                                    key={i} 
                                    initial={{ opacity: 0, x: -20 }} 
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.2 }}
                                    className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md rounded-2xl p-6 border border-border/50 shadow-sm"
                                >
                                    <div className="flex items-center gap-2 mb-3">
                                        <Badge variant="outline" className="bg-indigo-500/5 text-indigo-600 border-indigo-500/20">{member.specialty}</Badge>
                                        <span className="font-bold">{member.personaName}</span>
                                    </div>
                                    <div className="prose dark:prose-invert text-sm text-zinc-600 dark:text-zinc-400">
                                        <p>{member.analysis}</p>
                                        <div className="mt-3 pt-3 border-t border-border/40 font-medium text-zinc-900 dark:text-white">
                                            <span className="text-indigo-500">Proposed Action:</span> {member.recommendation}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Final Decision */}
                        <Card className="bg-zinc-900 text-white rounded-3xl border-none shadow-2xl overflow-hidden relative">
                           <div className="absolute top-0 right-0 p-8 opacity-10">
                                <CheckCircle2 className="h-32 w-32" />
                           </div>
                           <CardHeader className="border-b border-white/5 pb-6">
                                <div className="flex items-center gap-2 text-emerald-400 mb-2">
                                    <ShieldCheck className="h-5 w-5" /> Consensus Decision
                                </div>
                                <CardTitle className="text-3xl font-bold">{boardResult.consensusDiagnosis}</CardTitle>
                           </CardHeader>
                           <CardContent className="pt-6">
                                <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4">Multidisciplinary Management Plan</h4>
                                <div className="prose prose-invert text-zinc-300">
                                    <MarkdownRenderer content={boardResult.finalManagementPlan} />
                                </div>

                                {boardResult.disagreements && boardResult.disagreements.length > 0 && (
                                    <div className="mt-8 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                                        <p className="text-xs font-bold text-rose-500 uppercase tracking-widest mb-2">Contested Elements</p>
                                        <ul className="list-disc list-inside text-xs text-rose-200/70 space-y-1">
                                            {boardResult.disagreements.map((d: string, i: number) => <li key={i}>{d}</li>)}
                                        </ul>
                                    </div>
                                )}
                           </CardContent>
                        </Card>
                    </div>
                  </ScrollArea>
                </motion.div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-muted-foreground bg-zinc-100/50 dark:bg-zinc-900/50 rounded-[3rem] border-2 border-dashed border-border/50">
                    <Users className="h-12 w-12 mb-4 opacity-30" />
                    <p className="text-center px-10">Submit a case to start the virtual multi-specialist discussion.</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
