"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Zap, 
  Workflow, 
  BrainCircuit, 
  CheckSquare,
  Sparkles,
  ChevronRight,
  Loader2,
  Trophy,
  Stethoscope,
  Microscope,
  Code,
  Eye,
  Brain
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { doc, onSnapshot } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import ReactMarkdown from 'react-markdown';

interface SessionState {
  currentTopic: string;
  precomputedTools: {
    flowchartData?: any;
    mnemonic?: string;
    mcqs?: any;
    visionOcclusion?: any[];
  };
  discoverySteps?: { id: string, label: string, reason: string }[];
  learningProfile?: {
    preferredStyle?: 'Visual' | 'Textual' | 'Practical';
    frequentMistakes?: string[];
  };
}

export function AutonomousSessionNavigator({ userId }: { userId: string }) {
  const [session, setSession] = useState<SessionState | null>(null);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [socraticResponse, setSocraticResponse] = useState('');
  const [socraticResult, setSocraticResult] = useState<any>(null);
  const [isSocraticLoading, setIsSocraticLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!userId) return;
    const sessionRef = doc(firestore, `users/${userId}/activeSession`, 'current');
    const unsubscribe = onSnapshot(sessionRef, (snap) => {
      if (snap.exists()) {
        setSession(snap.data() as SessionState);
      }
    });
    return () => unsubscribe();
  }, [userId]);

  const handleSocraticTurn = async (answer?: string) => {
    setIsSocraticLoading(true);
    try {
      const res = await fetch('/api/medico/agents/socratic-preceptor', {
        method: 'POST',
        body: JSON.stringify({ topic: session?.currentTopic, studentAnswer: answer })
      });
      const data = await res.json();
      setSocraticResult(data);
    } catch (err) {
      toast({ title: "Preceptor Fault", description: "Failed to connect to the medical ward round." });
    } finally {
      setIsSocraticLoading(false);
    }
  };

  const handleSpacedRepetition = async (quality: number) => {
    try {
      await fetch('/api/medico/flows/spaced-repetition', {
        method: 'POST',
        body: JSON.stringify({ userId, topic: session?.currentTopic, quality })
      });
      toast({ title: "Recall Logged", description: `Review scheduled based on SM-2 algorithm.` });
    } catch (err) {
       console.error(err);
    }
  };

  if (!session || !session.currentTopic) return null;

  const getIcon = (id: string) => {
    switch (id) {
      case 'vision_occlusion': return Microscope;
      case 'data_science': return Code;
      case 'pharmacology': return Zap;
      case 'simulator': return Stethoscope;
      case 'socratic_preceptor': return Stethoscope;
      case 'generate_mcq': return CheckSquare;
      case 'view_algorithm': return Workflow;
      default: return Sparkles;
    }
  };

  const getColor = (id: string) => {
    switch (id) {
      case 'vision_occlusion': return 'text-violet-500';
      case 'data_science': return 'text-emerald-500';
      case 'pharmacology': return 'text-amber-500';
      case 'simulator': return 'text-rose-500';
      default: return 'text-sky-500';
    }
  };

  const getBg = (id: string) => {
    switch (id) {
      case 'vision_occlusion': return 'bg-violet-500/10';
      case 'data_science': return 'bg-emerald-500/10';
      case 'pharmacology': return 'bg-amber-500/10';
      case 'simulator': return 'bg-rose-500/10';
      default: return 'bg-sky-500/10';
    }
  };

  const tools = [
    { id: 'flowchart', label: 'Flowchart', icon: Workflow, color: 'text-indigo-500', bg: 'bg-indigo-500/10', data: session.precomputedTools?.flowchartData },
    { id: 'mnemonic', label: 'Mnemonic', icon: BrainCircuit, color: 'text-amber-500', bg: 'bg-amber-500/10', data: session.precomputedTools?.mnemonic },
    { id: 'mcqs', label: 'Take Quiz', icon: CheckSquare, color: 'text-emerald-500', bg: 'bg-emerald-500/10', data: session.precomputedTools?.mcqs },
    { id: 'vision_occlusion', label: 'Anatomy Lab', icon: Eye, color: 'text-violet-500', bg: 'bg-violet-500/10', data: session.precomputedTools?.visionOcclusion },
  ];

  return (
    <div className="fixed bottom-24 right-8 z-50 flex flex-col items-end gap-3 pointer-events-none">
      <AnimatePresence>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-2 pointer-events-auto"
        >
          <div className="px-4 py-2 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-sky-500/20 rounded-2xl shadow-2xl mb-2">
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-sky-600 dark:text-sky-400">Context Active: {session.currentTopic}</span>
             </div>
          </div>

          <div className="flex flex-col gap-2">
            {session.learningProfile && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-4 bg-zinc-900/90 backdrop-blur-xl border border-white/5 rounded-2xl mb-2 space-y-3"
              >
                <div className="flex items-center justify-between">
                   <span className="text-[9px] font-black uppercase text-zinc-500 tracking-tighter">Neuro Learning Profile</span>
                   {session.learningProfile.preferredStyle && (
                     <Badge variant="outline" className="text-[8px] bg-emerald-500/10 text-emerald-400 border-emerald-500/20 px-1 py-0 h-4 uppercase">
                       {session.learningProfile.preferredStyle} Mode
                     </Badge>
                   )}
                </div>
                {session.learningProfile.frequentMistakes && session.learningProfile.frequentMistakes.length > 0 && (
                   <div className="space-y-1">
                      <p className="text-[8px] font-bold text-rose-400 uppercase">Knowledge Gaps Detected</p>
                      <div className="flex flex-wrap gap-1">
                         {session.learningProfile.frequentMistakes.slice(-3).map((gap, i) => (
                           <span key={i} className="text-[9px] text-zinc-300 bg-white/5 px-1.5 py-0.5 rounded-md truncate max-w-[120px]">{gap}</span>
                         ))}
                      </div>
                   </div>
                )}
              </motion.div>
            )}

            {session.discoverySteps && session.discoverySteps.length > 0 && (
              <div className="flex flex-col gap-2 mb-4 animate-in slide-in-from-right duration-500">
                <span className="text-[9px] font-black uppercase text-sky-500 px-2 flex items-center gap-1">
                   <Zap className="h-2 w-2 fill-sky-500" /> Personalized Discovery
                </span>
                {session.discoverySteps.map((step) => {
                  const Icon = getIcon(step.id);
                  return (
                    <motion.div key={step.id} whileHover={{ x: -10 }}>
                      <Button
                        onClick={() => setActiveModal(step.id as any)}
                        className="h-16 px-6 rounded-2xl bg-sky-500 dark:bg-sky-600 border-none shadow-xl hover:shadow-sky-500/40 flex items-center gap-4 transition-all text-white w-full justify-start"
                      >
                        <div className="p-2 rounded-xl bg-white/20">
                          <Icon className="h-6 w-6" />
                        </div>
                        <div className="flex flex-col items-start">
                           <span className="text-xs font-black uppercase tracking-tight opacity-70">Suggested for you</span>
                           <span className="text-sm font-bold truncate max-w-[150px]">{step.label}</span>
                        </div>
                        <ChevronRight className="h-4 w-4 ml-auto opacity-50" />
                      </Button>
                    </motion.div>
                  );
                })}
              </div>
            )}

            <span className="text-[9px] font-black uppercase text-muted-foreground/40 px-2">Pre-computed Tools</span>
            {tools.map((tool) => (
              <motion.div
                key={tool.id}
                whileHover={{ x: -10 }}
                className="group relative"
              >
                <Button
                  onClick={() => {
                    if (tool.data) {
                        setActiveModal(tool.id as any);
                    } else {
                        toast({ title: "Pre-computing...", description: "Medi is still generating this educational aid in the background." });
                    }
                  }}
                  className={cn(
                    "h-14 px-6 rounded-2xl bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl border border-white dark:border-white/10 shadow-2xl hover:shadow-sky-500/20 flex items-center gap-3 transition-all",
                    !tool.data && "opacity-50 grayscale cursor-wait"
                  )}
                >
                  <div className={cn("p-2 rounded-xl", tool.bg, tool.color)}>
                    {tool.data ? <tool.icon className="h-5 w-5" /> : <Loader2 className="h-5 w-5 animate-spin" />}
                  </div>
                  <div className="flex flex-col items-start translate-y-[1px]">
                     <span className="text-[10px] font-black uppercase text-muted-foreground/60">{tool.data ? 'Pre-computed' : 'Processing'}</span>
                     <span className="text-sm font-bold text-slate-900 dark:text-white">{tool.label}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:translate-x-1 transition-transform" />
                </Button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      <Dialog open={!!activeModal} onOpenChange={() => setActiveModal(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden rounded-[2.5rem] bg-white/95 dark:bg-zinc-950/95 backdrop-blur-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl font-black">
               <Sparkles className="h-6 w-6 text-sky-500" />
               Autonomous {activeModal?.toUpperCase()}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4 overflow-y-auto pr-2 custom-scrollbar">
            {(activeModal === 'flowchart' || activeModal === 'view_algorithm') && session.precomputedTools?.flowchartData && (
              <div className="space-y-4">
                <div className="p-4 bg-indigo-500/10 rounded-2xl flex items-center gap-2">
                   <Workflow className="h-5 w-5 text-indigo-500" />
                   <p className="text-xs font-bold text-indigo-700 dark:text-indigo-400">Autonomous Clinical Pathway: {session.currentTopic}</p>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {session.precomputedTools.flowchartData.nodes?.map((node: any, i: number) => (
                    <div key={i} className="p-4 bg-muted/30 rounded-2xl border border-white/5 flex items-center gap-4">
                       <div className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                          {i+1}
                       </div>
                       <div>
                          <p className="text-xs font-black uppercase text-muted-foreground/60 leading-none mb-1">{node.type}</p>
                          <p className="text-sm font-bold">{node.data?.label}</p>
                       </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {activeModal === 'mnemonic' && (
              <div className="p-8 bg-amber-500/5 border border-amber-500/10 rounded-3xl text-xl font-bold italic text-center text-amber-700 dark:text-amber-400 leading-relaxed">
                "{session.precomputedTools?.mnemonic}"
              </div>
            )}
            {(activeModal === 'socratic' || activeModal === 'socratic_preceptor') && (
              <div className="space-y-6">
                <div className="p-4 bg-rose-500/10 rounded-2xl flex items-center gap-2">
                   <Stethoscope className="h-5 w-5 text-rose-500" />
                   <p className="text-xs font-bold text-rose-700 dark:text-rose-400">Socratic Ward Round: {session.currentTopic}</p>
                </div>
                {!socraticResult ? (
                   <Button onClick={() => handleSocraticTurn()} disabled={isSocraticLoading} className="w-full h-12 rounded-2xl bg-rose-600 hover:bg-rose-700">
                      {isSocraticLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "JOIN WARD ROUND"}
                   </Button>
                ) : (
                  <div className="space-y-4">
                     <div className="p-6 bg-muted/40 rounded-3xl border border-zinc-200 dark:border-zinc-800">
                        <p className="text-[10px] font-black uppercase text-rose-500 mb-2">Attending's Case Vignette</p>
                        <p className="text-sm italic mb-4">"{socraticResult.clinicalScenario}"</p>
                        <p className="font-bold text-lg leading-relaxed">{socraticResult.guidedQuestion}</p>
                     </div>
                     <div className="flex gap-4">
                        <Input 
                           placeholder="Type your reasoning..." 
                           value={socraticResponse} 
                           onChange={e => setSocraticResponse(e.target.value)}
                           className="rounded-2xl h-12"
                        />
                        <Button onClick={() => handleSocraticTurn(socraticResponse)} disabled={isSocraticLoading} className="rounded-2xl h-12 px-8 bg-rose-600">
                           {isSocraticLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "REPLY"}
                        </Button>
                     </div>
                  </div>
                )}
              </div>
            )}
            {(activeModal === 'datascience' || activeModal === 'data_science') && (
              <div className="space-y-6">
                <div className="p-4 bg-violet-500/10 rounded-2xl flex items-center gap-2">
                   <Microscope className="h-5 w-5 text-violet-500" />
                   <p className="text-xs font-bold text-violet-700 dark:text-violet-400">Bioinformatics Lab: {session.currentTopic}</p>
                </div>
                <div className="p-6 bg-zinc-900 rounded-3xl font-mono text-xs text-emerald-400">
                   <p className="mb-2"># Pre-computed Clinical Analysis</p>
                   <p className="mb-1">import pandas as pd</p>
                   <p className="mb-1">df = pd.read_csv('clinical_trials.csv')</p>
                   <p className="mb-1">results = df[df['topic'] == '{session.currentTopic}'].analyze()</p>
                   <p className="border-t border-zinc-800 mt-4 pt-4 text-zinc-500">Output: Execution successful. Survival analysis suggests 15% increase in efficacy...</p>
                </div>
                <Button variant="outline" className="w-full rounded-2xl h-12 border-violet-500/20 text-violet-600">
                   <Code className="h-4 w-4 mr-2" /> MODIFY & RE-RUN SCRIPT
                </Button>
              </div>
            )}
            {(activeModal === 'mcqs' || activeModal === 'generate_mcq') && session.precomputedTools?.mcqs && (
               <div className="space-y-6">
                  <div className="p-4 bg-sky-500/10 rounded-2xl flex items-center gap-3">
                     <Trophy className="h-5 w-5 text-sky-500" />
                     <p className="text-xs font-semibold text-sky-700 dark:text-sky-400">Zero-Prompt Quiz: {session.currentTopic}</p>
                  </div>
                  {session.precomputedTools.mcqs.mcqs?.map((q: any, i: number) => (
                    <div key={i} className="p-6 bg-muted/30 rounded-3xl border border-transparent hover:border-sky-500/20 transition-all">
                       <p className="font-bold mb-4">{i+1}. {q.question}</p>
                       <div className="grid grid-cols-1 gap-2">
                          {['A', 'B', 'C', 'D'].map(opt => (
                            <Button key={opt} variant="outline" className="justify-start rounded-xl h-12 hover:bg-sky-500 hover:text-white border-white dark:border-white/5 bg-white/50 dark:bg-black/50">
                               {opt}. {q.options[opt as keyof typeof q.options]}
                            </Button>
                          ))}
                       </div>
                    </div>
                  ))}

                  <div className="pt-8 border-t border-zinc-100 dark:border-zinc-800 text-center">
                     <p className="text-xs font-bold text-muted-foreground mb-4 tracking-widest uppercase">Rate Your Recall Quality (SM-2)</p>
                     <div className="flex justify-center gap-3">
                        {[0, 1, 2, 3, 4, 5].map(q => (
                          <Button 
                            key={q} 
                            onClick={() => handleSpacedRepetition(q)}
                            variant="outline" 
                            className="w-12 h-12 rounded-2xl hover:bg-sky-500 hover:text-white font-black"
                          >
                            {q}
                          </Button>
                        ))}
                     </div>
                     <p className="text-[10px] text-muted-foreground mt-3 italic">0: Blackout | 5: Perfect Recall</p>
                  </div>
               </div>
            )}
            {activeModal === 'vision_occlusion' && (
              <div className="space-y-6">
                <div className="p-4 bg-violet-500/10 rounded-2xl flex items-center gap-2">
                   <Microscope className="h-5 w-5 text-violet-500" />
                   <p className="text-xs font-bold text-violet-700 dark:text-violet-400">Autonomous Anatomy Lab: {session.currentTopic}</p>
                </div>
                <div className="aspect-[4/3] bg-zinc-900 rounded-3xl overflow-hidden relative border border-zinc-200 dark:border-white/10 group">
                   <img 
                     src={`https://picsum.photos/seed/${session.currentTopic}/800/600`} 
                     className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" 
                     alt="Anatomy Atlas"
                   />
                   <div className="absolute inset-0 pointer-events-none">
                      {session.precomputedTools?.visionOcclusion?.map((occ: any, idx: number) => (
                        <div 
                          key={idx}
                          className="absolute bg-sky-500 border-2 border-white rounded shadow-lg animate-pulse pointer-events-auto cursor-help transition-all hover:scale-110 hover:animate-none group/occ"
                          style={{ 
                            left: `${occ.boundingBox.x}%`, 
                            top: `${occ.boundingBox.y}%`, 
                            width: `${occ.boundingBox.width}%`, 
                            height: `${occ.boundingBox.height}%` 
                          }}
                          onClick={() => toast({ title: "Identification", description: `You identified: ${occ.label}. Hint: ${occ.hint}` })}
                        >
                           <div className="w-full h-full flex items-center justify-center text-[10px] font-black text-white group-hover/occ:hidden">?</div>
                           <div className="hidden group-hover/occ:flex w-full h-full items-center justify-center text-[8px] font-bold text-white bg-sky-600 px-1 text-center leading-tight">
                              REVEAL
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
                {!session.precomputedTools?.visionOcclusion && (
                   <div className="py-12 flex flex-col items-center justify-center gap-4 text-center">
                      <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
                      <p className="text-sm font-medium text-muted-foreground">Medi is identifying landmarks in the anatomical atlas...</p>
                   </div>
                )}
                <div className="p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                   <p className="text-[10px] font-black uppercase text-blue-500 mb-1 leading-none">AI Lab Tech Note</p>
                   <p className="text-xs text-blue-700 dark:text-blue-300">"Labels have been occluded based on the current context. Hover over boxes for hints, or click to reveal landmarks."</p>
                </div>
              </div>
            )}
            {activeModal === 'pharmacology' && (
              <div className="space-y-6">
                <div className="p-4 bg-amber-500/10 rounded-2xl flex items-center gap-2">
                   <Zap className="h-5 w-5 text-amber-500" />
                   <p className="text-xs font-bold text-amber-700 dark:text-amber-400">Pharma Interaction Checker</p>
                </div>
                <div className="p-6 bg-muted/40 rounded-3xl border border-zinc-200 dark:border-zinc-800">
                   <p className="text-sm font-bold mb-2">Analyzing: {session.currentTopic}</p>
                   <p className="text-xs text-muted-foreground leading-relaxed">Safety Alert: Potential QT prolongation when co-administered with CYP3A4 inhibitors. Monitor ECG.</p>
                </div>
              </div>
            )}
            {activeModal === 'simulator' && (
              <div className="space-y-6">
                <div className="p-4 bg-rose-500/10 rounded-2xl flex items-center gap-2">
                   <Stethoscope className="h-5 w-5 text-rose-500" />
                   <p className="text-xs font-bold text-rose-700 dark:text-rose-400">Emergency Room Simulator</p>
                </div>
                <div className="p-6 bg-muted/40 rounded-3xl border border-zinc-200 dark:border-zinc-800">
                   <p className="text-[10px] font-black uppercase text-rose-500 mb-2">Active Case</p>
                   <p className="text-base font-bold">Patient presents with hypotension and distant heart sounds. Next step?</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                   <Button variant="outline" className="rounded-xl h-12">Pericardiocentesis</Button>
                   <Button variant="outline" className="rounded-xl h-12">Fluid Bolus</Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
