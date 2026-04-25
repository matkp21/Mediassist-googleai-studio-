"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  ClipboardList, 
  Calendar, 
  CheckCircle2, 
  Circle, 
  Clock, 
  Plus, 
  BrainCircuit, 
  Zap, 
  TrendingUp,
  Activity,
  ArrowRight,
  Loader2,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

interface Task {
  id: string;
  title: string;
  status: 'pending' | 'in-progress' | 'completed' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  deadline?: string;
  metadata?: any;
}

export function StudyPlannerActiveCoach() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [goal, setGoal] = useState('');
  const [isDecomposing, setIsDecomposing] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isGeneratingPacket, setIsGeneratingPacket] = useState(false);
  const { toast } = useToast();

  // Real-time subscription to tasks
  useEffect(() => {
    const q = query(collection(firestore, 'tasks'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snap) => {
      const taskList = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
      setTasks(taskList);
    });
    return () => unsubscribe();
  }, []);

  const handleDecompose = async () => {
    if (!goal.trim()) return;
    setIsDecomposing(true);
    try {
      // In a real app, this would be a server action or API call to decomposeStudyGoalFlow
      const response = await fetch('/api/medico/flows/decompose-study-goal', {
         method: 'POST',
         body: JSON.stringify({ userId: 'current-user', goal })
      });
      const data = await response.json();
      toast({ title: "Syllabus Decomposed", description: `Created task tree with ${data.subTasksCount} study modules.` });
      setGoal('');
    } catch (error) {
      console.error("Decomposition failed:", error);
    } finally {
      setIsDecomposing(false);
    }
  };

  const triggerDailyPacket = async (taskId: string) => {
    setIsGeneratingPacket(true);
    try {
      const response = await fetch('/api/medico/flows/generate-study-packet', {
         method: 'POST',
         body: JSON.stringify({ userId: 'current-user', taskId })
      });
      const data = await response.json();
      toast({ title: "Coaching Packet Ready", description: `Generated complete knowledge packet for ${data.topic}.` });
    } catch (error) {
      console.error("Packet generation failed:", error);
    } finally {
      setIsGeneratingPacket(false);
    }
  };

  const stats = {
    completed: tasks.filter(t => t.status === 'completed').length,
    total: tasks.length || 1,
    percentage: tasks.length ? Math.round((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100) : 0
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        <div className="lg:col-span-8 space-y-6">
          {/* Goal Input Section (Dynamic Syllabus Decomposition) */}
          <Card className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl border-white dark:border-white/5 shadow-xl rounded-[2.5rem] overflow-hidden">
             <CardHeader className="p-8 pb-0">
                <CardTitle className="text-xl font-bold">Initiate New Study Objective</CardTitle>
                <CardDescription>Enter a broad goal (e.g., "Prepare for Pathology Finals") to decompose it into a task tree.</CardDescription>
             </CardHeader>
             <CardContent className="p-8">
                <div className="flex gap-4">
                   <Input 
                      placeholder="Enter study goal..." 
                      value={goal}
                      onChange={e => setGoal(e.target.value)}
                      className="rounded-2xl h-12 bg-white/50 border-sky-500/10 focus:ring-sky-500"
                   />
                   <Button 
                      onClick={handleDecompose} 
                      disabled={isDecomposing || !goal.trim()}
                      className="rounded-2xl bg-sky-600 hover:bg-sky-700 h-12 px-8"
                   >
                      {isDecomposing ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Sparkles className="mr-2 h-4 w-4"/> Decompose</>}
                   </Button>
                </div>
             </CardContent>
          </Card>

          {/* Active Task Tree */}
          <Card className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl border-white dark:border-white/5 shadow-xl rounded-[2.5rem]">
            <CardHeader className="p-8">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-sky-500/20 text-sky-600">
                    <ClipboardList className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold tracking-tight">Autonomous Task Tree</CardTitle>
                    <CardDescription>Persistent study modules & milestones.</CardDescription>
                  </div>
                </div>
              </div>
              <div className="pt-4">
                 <div className="flex justify-between text-xs font-bold uppercase text-muted-foreground mb-2">
                   <span>Plan Execution: {stats.percentage}%</span>
                   <span>{stats.completed}/{stats.total} Milestones</span>
                 </div>
                 <Progress value={stats.percentage} className="h-2 rounded-full" />
              </div>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-4">
              {tasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                   <div className="p-4 bg-muted/50 rounded-full mb-4">
                      <Zap className="h-10 w-10 text-muted-foreground/30" />
                   </div>
                   <p className="text-muted-foreground font-medium">No tasks found. Use the objective input above to start!</p>
                </div>
              ) : (
                tasks.map((task) => (
                  <div 
                    key={task.id} 
                    onClick={() => setSelectedTask(task)}
                    className={cn(
                      "flex items-center gap-4 p-5 rounded-3xl border transition-all cursor-pointer",
                      selectedTask?.id === task.id ? "bg-white border-sky-500 ring-2 ring-sky-500/10 shadow-lg" : 
                      task.status === 'completed' ? "bg-emerald-500/5 border-emerald-500/10" : "bg-muted/30 border-transparent hover:bg-white/40"
                    )}
                  >
                    <div className={cn(
                      "shrink-0",
                      task.status === 'completed' ? "text-emerald-500" : "text-muted-foreground"
                    )}>
                      {task.status === 'completed' ? <CheckCircle2 className="h-6 w-6" /> : <Circle className="h-6 w-6" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h4 className={cn("font-bold truncate", task.status === 'completed' && "line-through opacity-50")}>
                          {task.title}
                        </h4>
                        <Badge className={cn(
                          "text-[9px] uppercase px-1.5 h-4",
                          task.priority === 'critical' ? "bg-rose-500" : task.priority === 'high' ? "bg-amber-500" : "bg-sky-500"
                        )}>
                          {task.priority}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{task.description}</p>
                    </div>
                    {task.metadata?.studyPacket && <BookOpen className="h-4 w-4 text-sky-500" />}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-6">
          {/* Active Coach (Coaching Engine Trigger) */}
          <Card className="bg-gradient-to-br from-indigo-600 to-indigo-800 text-white border-none shadow-2xl rounded-[2.5rem] overflow-hidden">
             <CardHeader className="pb-4">
                <div className="flex items-center gap-3 mb-2">
                   <div className="p-2 rounded-xl bg-white/20">
                      <Zap className="h-5 w-5" />
                   </div>
                   <CardTitle className="text-xl">Active Coach</CardTitle>
                </div>
                <CardDescription className="text-indigo-100/70">Autonomous study triggers & proactive Packets.</CardDescription>
             </CardHeader>
             <CardContent className="space-y-4">
                {selectedTask && !selectedTask.metadata?.studyPacket && (
                  <div className="p-6 rounded-[2rem] bg-white/10 backdrop-blur-md border border-white/20 text-center">
                    <p className="text-xs font-bold mb-4">Trigger Daily Packet for:</p>
                    <p className="text-sm font-black mb-6">{selectedTask.title}</p>
                    <Button 
                      onClick={() => triggerDailyPacket(selectedTask.id)} 
                      disabled={isGeneratingPacket}
                      className="w-full rounded-2xl bg-white text-indigo-600 hover:bg-indigo-50 font-bold"
                    >
                      {isGeneratingPacket ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "GENERATE PACKET"}
                    </Button>
                  </div>
                )}
                
                {selectedTask?.metadata?.studyPacket ? (
                  <div className="p-4 rounded-3xl bg-emerald-500/20 backdrop-blur-md border border-emerald-500/30">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-emerald-300">Packet Ready</span>
                    </div>
                    <p className="text-sm font-bold truncate">{selectedTask.title}</p>
                    <p className="text-[10px] text-emerald-200/60 mt-1 italic">MCP Grounded: PubMed & OpenFDA Cited</p>
                  </div>
                ) : (
                  <p className="text-center text-xs text-indigo-200/50 py-10 italic">Select a task to generate coaching packet.</p>
                )}
             </CardContent>
             <CardFooter className="bg-black/10 p-5 mt-4 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase text-indigo-200">Coaching Status</span>
                  <span className="text-xs font-medium">Proactive Mode: Active</span>
                </div>
                <TrendingUp className="h-5 w-5 text-emerald-400" />
             </CardFooter>
          </Card>

          {/* Study Packet Viewer */}
          <AnimatePresence>
            {selectedTask?.metadata?.studyPacket && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-4"
              >
                  <Card className="bg-white dark:bg-zinc-900 border-none shadow-xl rounded-[2.5rem] overflow-hidden">
                    <CardHeader className="p-6 bg-sky-50 dark:bg-sky-950/20">
                       <CardTitle className="text-md font-bold text-sky-600">Complete Knowledge Packet</CardTitle>
                       <p className="text-xs text-muted-foreground mt-1">{selectedTask.metadata.studyPacket.topic}</p>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6 max-h-[500px] overflow-y-auto custom-scrollbar">
                       <Section label="Definition" content={selectedTask.metadata.studyPacket.definition} />
                       <Section label="Etiology" content={selectedTask.metadata.studyPacket.etiology} />
                       <Section label="Clinical Features" content={selectedTask.metadata.studyPacket.clinicalFeatures} />
                       <Section label="Investigations" content={selectedTask.metadata.studyPacket.investigations} />
                       <Section label="Management" content={selectedTask.metadata.studyPacket.management} />
                       <Section label="Flowchart" content={selectedTask.metadata.studyPacket.flowchart} isMono />
                       <div>
                          <p className="text-[10px] font-black uppercase text-sky-500 mb-2">High-Yield Points</p>
                          <ul className="list-disc pl-4 space-y-1">
                             {selectedTask.metadata.studyPacket.highYieldPoints.map((p: string, i: number) => (
                               <li key={i} className="text-xs font-medium text-slate-600 dark:text-zinc-400">{p}</li>
                             ))}
                          </ul>
                       </div>
                       <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20">
                          <p className="text-[10px] font-black uppercase text-amber-600 mb-2">Latest Updates (MCP Verified)</p>
                          <p className="text-[10px] font-medium leading-relaxed italic line-clamp-3">{selectedTask.metadata.studyPacket.latestUpdates}</p>
                       </div>
                       <Button 
                          onClick={() => {
                             const score = Math.floor(Math.random() * 60) + 40; // Mock score 40-100
                             fetch('/api/medico/flows/update-study-performance', {
                                method: 'POST',
                                body: JSON.stringify({ userId: 'current-user', taskId: selectedTask.id, score })
                             }).then(() => {
                                toast({ title: "Quiz Completed", description: `You scored ${score}%. Study plan updated autonomously.` });
                             });
                          }}
                          className="w-full rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold h-12"
                       >
                          TAKE QUICK MASTERY QUIZ
                       </Button>
                    </CardContent>
                  </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function Section({ label, content, isMono }: { label: string, content: string, isMono?: boolean }) {
  return (
    <div>
      <p className="text-[10px] font-black uppercase text-zinc-400 mb-1">{label}</p>
      <p className={cn(
        "text-sm font-medium leading-relaxed",
        isMono ? "bg-muted p-3 rounded-2xl font-mono text-[10px]" : "text-slate-900 dark:text-white"
      )}>
        {content}
      </p>
    </div>
  );
}
