"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  ShieldCheck, 
  Send, 
  Bot, 
  User, 
  Loader2, 
  AlertTriangle, 
  Activity, 
  BrainCircuit,
  Terminal,
  RefreshCcw,
  History,
  CheckSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getMedicalOrchestrator } from '@/ai/orchestrator/MedicalOrchestrator';
import { useProMode } from '@/contexts/pro-mode-context';
import { cn } from '@/lib/utils';
import { MarkdownRenderer } from '../markdown/markdown-renderer';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  taskType?: string;
  isError?: boolean;
  metadata?: any;
}

import { useAiStreaming } from '@/hooks/use-ai-streaming';

export default function AutonomousSupervisor({ initialTopic }: { initialTopic?: string | null }) {
  const [query, setQuery] = useState(initialTopic || '');
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'system', 
      content: 'Brain-3 Active. Multi-agent Supervisor monitoring clinical flows. How can I assist you today?' 
    }
  ]);
  const { startStream, streamedText, isStreaming, fullResponse, resetStream } = useAiStreaming();
  const [activeTask, setActiveTask] = useState<string | null>(null);
  const isLoading = isStreaming || !!activeTask;
  const scrollRef = useRef<HTMLDivElement>(null);
  const { user } = useProMode();

  // Sync streamed text
  useEffect(() => {
    if (isStreaming && streamedText) {
      setMessages(prev => {
        const lastMsg = prev[prev.length - 1];
        if (lastMsg && lastMsg.metadata?.isStreaming) {
          return [...prev.slice(0, -1), { ...lastMsg, content: streamedText }];
        } else {
          return [...prev, { role: 'assistant', content: streamedText, metadata: { isStreaming: true } }];
        }
      });
    }
  }, [streamedText, isStreaming]);

  // Sync history and completion
  useEffect(() => {
    if (!isStreaming && fullResponse) {
       setMessages(prev => {
         const filtered = prev.filter(m => !m.metadata?.isStreaming);
         return [...filtered, { role: 'assistant', content: fullResponse }];
       });
       resetStream();
    }
  }, [fullResponse, isStreaming, resetStream]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streamedText]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim() || isStreaming) return;

    const userMessage = { role: 'user' as const, content: query };
    setMessages(prev => [...prev, userMessage]);
    setQuery('');
    setActiveTask('Routing via Brain-3...');

    try {
      const orchestrator = getMedicalOrchestrator();
      const taskType = await orchestrator.determineTaskType(userMessage.content);
      setActiveTask(`Agent: ${taskType}`);
      
      // If it's a study-related task, use streaming for the "Ask-Rezzy" feel
      if (taskType === 'tutor') {
        const systemPrompt = `You are "Medi", the resident genius supervisor. 
        Synthesize information from Patho, Pharma, and Micro specialists.
        Use Socratic questioning. Provide high-yield medical content.`;
        await startStream(userMessage.content, systemPrompt);
      } else {
        // Fallback to standard processing for structured JSON agents
        const response = await orchestrator.routeAndProcess(userMessage.content, user?.uid);
        
        if (response.status === 'interrupted' && response.reason === 'HUMAN_APPROVAL_REQUIRED') {
          setMessages(prev => [...prev, { 
            role: 'assistant', 
            content: `### 🛑 Physician Approval Required\n\nThis sensitive clinical action was blocked by governance rules and requires your explicit authorization.\n\n**Action:** \`${response.action}\`\n\nWould you like to proceed?`,
            metadata: { isHitl: true, action: response.action, originalQuery: userMessage.content }
          }]);
        } else if (response.status === 'success') {
          setMessages(prev => [...prev, { 
            role: 'assistant', 
            content: formatResult(response.data),
            taskType
          }]);
        }
      }
    } catch (err: any) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `Critical Orchestrator Error: ${err.message}`, 
        isError: true 
      }]);
    } finally {
      setActiveTask(null);
    }
  };

  const [hasAutoStarted, setHasAutoStarted] = useState(false);

  useEffect(() => {
    if (initialTopic && !hasAutoStarted) {
      setHasAutoStarted(true);
      const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
      handleSubmit(fakeEvent);
    }
  }, [initialTopic, hasAutoStarted]);

  const handleHitlApproval = async (metadata: any) => {
    setActiveTask('Executing Approved Action...');
    setMessages(prev => [...prev, { role: 'system', content: `Physician Approval Received. Process ID: ${Math.random().toString(36).substring(7)}` }]);

    try {
      const orchestrator = getMedicalOrchestrator();
      // Directly call the action agent bypassing the sentinel verification for the approved action
      const response = await orchestrator.processMedicalQuery({ action: metadata.action }, 'action', user?.uid);
      if (response.status === 'success') {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: `✅ **Action Executed Successfully**\n\nThe clinical record has been updated. Result: \`${JSON.stringify(response.data)}\``,
          taskType: 'action'
        }]);
      }
    } catch (err: any) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Execution Error: ${err.message}`, isError: true }]);
    } finally {
      setActiveTask(null);
    }
  };

  const formatResult = (data: any) => {
    // Basic formatting for the chat view
    if (data.triageAssessment) return `### Triage Assessment\n${data.triageAssessment}\n\n**Recommendation:** ${data.recommendedSpecialty}`;
    if (data.synthesizedAnswer) return data.synthesizedAnswer;
    if (data.prompt) return data.prompt; // Simulator
    if (data.drugClass) return `**${data.drugClass}**\n\n${data.mechanismOfAction}`;
    if (data.consensusConclusion) return data.consensusConclusion;
    return JSON.stringify(data, null, 2);
  };

  return (
    <div className="flex flex-col h-[85vh] max-w-5xl mx-auto p-4 gap-4">
      {/* Sentinel Monitor Header */}
      <Card className="bg-zinc-950 text-zinc-400 border-zinc-800 shadow-2xl">
        <CardContent className="p-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500/10 p-2 rounded-lg">
                <ShieldCheck className="h-5 w-5 text-emerald-500 animate-pulse" />
            </div>
            <div>
                <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Autonomous Supervisor</p>
                <p className="text-[10px] flex items-center gap-1">
                    <Activity className="h-3 w-3" /> System Nominal • Hierarchical Mode
                </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="bg-zinc-900 border-zinc-800 text-[9px]">
                SELF-HEALING: ACTIVE
            </Badge>
            <Badge variant="outline" className="bg-zinc-900 border-zinc-800 text-[9px]">
                STATE-SYNC: READY
            </Badge>
          </div>
        </CardContent>
      </Card>

      <div className="flex-1 flex gap-4 overflow-hidden">
        {/* Main Chat Interface */}
        <Card className="flex-1 flex flex-col bg-background/50 backdrop-blur-xl border-border/50 overflow-hidden shadow-xl">
          <ScrollArea className="flex-1 p-6" ref={scrollRef}>
            <div className="space-y-6">
              <AnimatePresence initial={false}>
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "flex gap-4 max-w-[85%]",
                      msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center shrink-0 border",
                      msg.role === 'user' ? "bg-primary border-primary" : "bg-muted border-border"
                    )}>
                      {msg.role === 'user' ? <User className="h-4 w-4 text-primary-foreground" /> : <Bot className="h-4 w-4" />}
                    </div>
                    <div className="flex flex-col gap-1.5">
                      {msg.taskType && (
                        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-muted-foreground mb-1">
                          <BrainCircuit className="h-3 w-3" /> Agent: {msg.taskType}
                        </div>
                      )}
                      <div className={cn(
                        "rounded-2xl p-4 shadow-sm",
                        msg.role === 'user' 
                          ? "bg-primary text-primary-foreground rounded-tr-none" 
                          : msg.isError 
                            ? "bg-destructive/10 border border-destructive/20 text-destructive rounded-tl-none"
                            : "bg-muted border border-border/50 rounded-tl-none prose dark:prose-invert max-w-none"
                      )}>
                        <MarkdownRenderer content={msg.content} />
                        {msg.metadata?.isHitl && (
                          <div className="flex gap-2 mt-4 pt-4 border-t border-border/50 not-prose">
                            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white h-8 text-[11px]" onClick={() => handleHitlApproval(msg.metadata)}>
                              Approve & Execute
                            </Button>
                            <Button size="sm" variant="outline" className="border-destructive/30 text-destructive h-8 text-[11px]" onClick={() => setMessages(prev => [...prev, { role: 'assistant', content: '_Action declined. EHR remained unchanged._' }])}>
                              Decline
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {isLoading && (
                <div className="flex gap-4 mr-auto animate-pulse">
                  <div className="w-8 h-8 rounded-full bg-muted border border-border flex items-center justify-center shrink-0">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                  <div className="bg-muted p-4 rounded-2xl rounded-tl-none border border-border/50 w-32 h-12" />
                </div>
              )}
            </div>
          </ScrollArea>

          <CardFooter className="p-4 border-t bg-muted/30">
            <form onSubmit={handleSubmit} className="flex gap-2 w-full">
              <div className="relative flex-1">
                <Input 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ask the Supervisor anything (e.g. 'Triage a patient with chest pain', 'Explain Warfarin mechanism')..."
                  className="rounded-full bg-background border-border/60 pl-4 pr-12 h-12 focus-visible:ring-primary/30"
                  disabled={isLoading}
                />
                <Button 
                    type="submit" 
                    size="icon" 
                    className="absolute right-1.5 top-1.5 rounded-full h-9 w-9" 
                    disabled={isLoading || !query.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </CardFooter>
        </Card>

        {/* Sidebar Status (Terminal Style) */}
        <div className="hidden lg:flex flex-col gap-4 w-72">
          <Card className="bg-zinc-950 border-zinc-800 text-[11px] font-mono p-4 flex-1">
            <div className="flex items-center gap-2 text-emerald-500 mb-4 border-b border-zinc-800 pb-2">
                <Terminal className="h-4 w-4" /> SYSTEM_LOG
            </div>
            <div className="space-y-3 overflow-hidden">
                <div className="text-zinc-500">
                    <span className="text-emerald-800">[OK]</span> MEM_SYNC_INITIALIZED
                </div>
                <AnimatePresence>
                    {activeTask && (
                        <motion.div 
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0 }}
                            className="text-amber-500"
                        >
                            <span className="text-amber-800 mr-2">>>></span> {activeTask}
                        </motion.div>
                    )}
                </AnimatePresence>
                {messages.length > 1 && (
                     <div className="pt-4 border-t border-zinc-800">
                        <p className="text-zinc-600 mb-2 uppercase text-[10px]">Recent Hierarchy Branching</p>
                        {messages.filter(m => m.taskType).slice(-5).map((m, i) => (
                            <div key={i} className="text-zinc-500 mb-1 truncate">
                                <RefreshCcw className="inline h-3 w-3 mr-1 opacity-50" />
                                {m.taskType?.toUpperCase()}
                            </div>
                        ))}
                     </div>
                )}
                <div className="pt-4 mt-auto">
                    <div className="bg-zinc-900 rounded p-3 text-zinc-500">
                        <p className="text-[9px] uppercase font-bold text-zinc-600 mb-2">Agentic Core (Goose/Nanobot/DeepTutor)</p>
                        <div className="flex flex-col gap-2">
                             <div className="flex items-center gap-2">
                                <div className={cn("w-2 h-2 rounded-full", activeTask ? "bg-emerald-500 animate-pulse" : "bg-zinc-700")} />
                                <span>Input Triage & Scrubbing</span>
                             </div>
                             <div className="flex items-center gap-2">
                                <div className={cn("w-2 h-2 rounded-full", activeTask?.includes('Agent') ? "bg-emerald-500 animate-pulse" : "bg-zinc-700")} />
                                <span>Specialist Delegation</span>
                             </div>
                             <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-zinc-700" />
                                <span>Output Fact-Check (QA)</span>
                             </div>
                        </div>
                    </div>
                    <div className="mt-2 p-2 bg-zinc-900/50 rounded border border-zinc-800/50">
                        <p className="text-[8px] text-zinc-600 uppercase font-bold mb-1">Architecture Adaptations</p>
                        <ul className="text-[9px] space-y-1">
                            <li className="flex items-center gap-1"><CheckSquare className="h-2 w-2" /> Living Profile (DeepTutor)</li>
                            <li className="flex items-center gap-1"><CheckSquare className="h-2 w-2" /> Idle Auto-Compact (Nanobot)</li>
                            <li className="flex items-center gap-1"><CheckSquare className="h-2 w-2" /> Clinical Recipes (Goose)</li>
                        </ul>
                    </div>
                    <div className="bg-zinc-900 rounded p-2 text-zinc-500 flex items-center gap-2 mt-2">
                        <History className="h-3 w-3" /> Recovery Layer: 03-Error-Logs
                    </div>
                </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
