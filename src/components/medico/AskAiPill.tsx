"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  X, 
  MessageSquare, 
  FileText, 
  Table, 
  Zap, 
  TrendingUp,
  BrainCircuit,
  Settings2,
  ChevronRight,
  Loader2,
  Send,
  Layers,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAiStreaming } from '@/hooks/use-ai-streaming';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import { ScrollArea } from '@/components/ui/scroll-area';
import { usePathname } from 'next/navigation';
import { useProMode } from '@/contexts/pro-mode-context';

export function AskAiPill() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [context, setContext] = useState('');
  const pathname = usePathname();
  const { userRole, examTarget } = useProMode();
  const { startStream, streamedText, isStreaming, fullResponse, resetStream } = useAiStreaming();
  const [messages, setMessages] = useState<{role: 'user' | 'assistant', content: string}[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scrape context whenever open or path changes
  useEffect(() => {
    if (isOpen) {
      const mainContent = document.querySelector('main')?.textContent || '';
      setContext(mainContent.substring(0, 3000)); // Limit context size
    }
  }, [isOpen, pathname]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streamedText]);

  const handleSend = async (e?: React.FormEvent, customPrompt?: string) => {
    e?.preventDefault();
    const finalQuery = customPrompt || query;
    if (!finalQuery.trim() || isStreaming) return;

    setMessages(prev => [...prev, { role: 'user', content: finalQuery }]);
    setQuery('');

    const systemPrompt = `You are "Medi", a context-aware resident genius mentor.
    Current User Role: ${userRole || 'student'}
    Target Exam: ${examTarget}
    Current Page Context: ${context}
    
    Instructions:
    1. Answer specifically based on the context of what the user is looking at.
    2. Be concise but clinically accurate.
    3. Use technical terms like a resident talking to a medical student.
    4. If asked to "View As", transform the existing context into requested format.
    5. PRO-MODE (Item 15): If user role is "pro", prioritize rapid clinical synthesis and differential prioritization. Link symptoms using semantic similarity logic.`;

    await startStream(finalQuery, systemPrompt);
  };

  useEffect(() => {
    if (!isStreaming && fullResponse) {
      setMessages(prev => [...prev, { role: 'assistant', content: fullResponse }]);
      resetStream();
    }
  }, [fullResponse, isStreaming, resetStream]);

  const handleViewAs = (type: string) => {
    const prompt = `Can you reformat the current information as a ${type}? Use clinical guidelines.`;
    handleSend(undefined, prompt);
  };

  const handleProSynthesize = () => {
    if (userRole !== 'pro') return;
    const prompt = `Perform a high-fidelity clinical synthesis of the current patient history. Highlight key differentials and semantic links between symptoms.`;
    handleSend(undefined, prompt);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-3">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: 20, scale: 0.95, filter: 'blur(10px)' }}
            className="w-[380px] sm:w-[450px] h-[600px] max-h-[80vh] flex flex-col bg-white/80 dark:bg-zinc-950/80 backdrop-blur-2xl border border-white/20 dark:border-white/10 shadow-2xl rounded-[2.5rem] overflow-hidden"
          >
            {/* Header */}
            <div className="p-5 border-b flex items-center justify-between bg-gradient-to-r from-sky-500/10 to-indigo-500/10">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-sky-500/20 text-sky-600">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold tracking-tight">Ask Medi {userRole === 'pro' && '(Pro)'}</h3>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Context-Aware Intel</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="rounded-full">
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Transformations / "View As" Bar */}
            <div className="px-4 py-2 bg-muted/30 border-b flex items-center gap-2 overflow-x-auto no-scrollbar">
              <span className="text-[10px] uppercase font-bold text-muted-foreground shrink-0 mr-1">Engine:</span>
              {userRole === 'pro' && (
                <Button variant="outline" size="sm" className="h-7 px-3 rounded-full text-[10px] gap-1 border-sky-500/30 bg-sky-500/5" onClick={handleProSynthesize}>
                  <BrainCircuit className="h-3 w-3 text-sky-500" /> Pro Synthesis
                </Button>
              )}
              <Button variant="outline" size="sm" className="h-7 px-3 rounded-full text-[10px] gap-1" onClick={() => handleViewAs('Mnemonic')}>
                <Zap className="h-3 w-3 text-amber-500" /> Mnemonic
              </Button>
              <Button variant="outline" size="sm" className="h-7 px-3 rounded-full text-[10px] gap-1" onClick={() => handleViewAs('Comparison Table')}>
                <Table className="h-3 w-3 text-blue-500" /> Table
              </Button>
              <Button variant="outline" size="sm" className="h-7 px-3 rounded-full text-[10px] gap-1" onClick={() => handleViewAs('High-Yield Flowchart')}>
                <TrendingUp className="h-3 w-3 text-emerald-500" /> Flowchart
              </Button>
            </div>

            {/* Chat Area */}
            <ScrollArea ref={scrollRef} className="flex-1 p-5">
              <div className="space-y-6">
                {messages.length === 0 && (
                  <div className="py-12 text-center space-y-4">
                    <div className="p-4 bg-sky-500/5 rounded-full inline-block">
                      <BrainCircuit className="h-10 w-10 text-sky-500/30" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-foreground">Listening to your session...</p>
                      <p className="text-xs text-muted-foreground">I track exactly what you&apos;re looking at. Ask about it or transform it above.</p>
                    </div>
                  </div>
                )}
                {messages.map((m, i) => (
                  <div key={i} className={cn("flex flex-col gap-2", m.role === 'user' ? "items-end" : "items-start")}>
                    <div className={cn(
                      "px-4 py-2.5 rounded-2xl text-sm max-w-[85%]",
                      m.role === 'user' ? "bg-sky-600 text-white rounded-tr-none" : "bg-muted/50 border rounded-tl-none"
                    )}>
                      {m.role === 'assistant' ? (
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          <ReactMarkdown>{m.content}</ReactMarkdown>
                        </div>
                      ) : m.content}
                    </div>
                  </div>
                ))}
                {!isStreaming && messages.length > 0 && messages[messages.length - 1].role === 'assistant' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-wrap gap-2 pt-2 pb-6"
                  >
                    <span className="text-[10px] uppercase font-bold text-muted-foreground w-full mb-1">Recommended Next Steps:</span>
                    <Button variant="outline" size="sm" className="h-7 text-[10px] rounded-lg border-sky-500/20 hover:bg-sky-500/5 font-bold text-sky-600" onClick={() => handleSend(undefined, "⚡ Research the latest clinical guidelines for this topic on PubMed and WHO using Firecrawl.")}>
                      <Zap className="h-3 w-3 mr-1" /> Research Latest
                    </Button>
                    <Button variant="outline" size="sm" className="h-7 text-[10px] rounded-lg border-sky-500/20 hover:bg-sky-500/5" onClick={() => handleSend(undefined, "Generate 5 practice MCQs based on this.")}>
                      <Zap className="h-3 w-3 mr-1" /> Practice MCQs
                    </Button>
                    <Button variant="outline" size="sm" className="h-7 text-[10px] rounded-lg border-sky-500/20 hover:bg-sky-500/5" onClick={() => handleSend(undefined, "Create flashcards for this topic.")}>
                      <Layers className="h-3 w-3 mr-1" /> Flashcards
                    </Button>
                    <Button variant="outline" size="sm" className="h-7 text-[10px] rounded-lg border-sky-500/20 hover:bg-sky-500/5" onClick={() => handleSend(undefined, "Summarize the high-yield clinical pearls.")}>
                      <Star className="h-3 w-3 mr-1" /> Clinical Pearls
                    </Button>
                  </motion.div>
                )}
                {isStreaming && (
                  <div className="flex flex-col items-start gap-2 animate-in fade-in slide-in-from-left-2">
                    <div className="bg-muted/50 border rounded-2xl rounded-tl-none px-4 py-3 text-sm max-w-[85%]">
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown>{streamedText || 'Thinking...'}</ReactMarkdown>
                      </div>
                      {streamedText === '' && (
                        <div className="flex gap-1 mt-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-sky-500 animate-bounce" />
                          <div className="h-1.5 w-1.5 rounded-full bg-sky-500 animate-bounce [animation-delay:-0.15s]" />
                          <div className="h-1.5 w-1.5 rounded-full bg-sky-500 animate-bounce [animation-delay:-0.3s]" />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Input Footer */}
            <div className="p-4 bg-background border-t backdrop-blur-md">
              <form onSubmit={handleSend} className="relative">
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ask specifically about this page..."
                  className="rounded-full pl-5 pr-12 h-12 bg-muted/30 border-none focus-visible:ring-sky-500/50"
                  disabled={isStreaming}
                />
                <Button 
                  size="icon" 
                  type="submit" 
                  disabled={!query.trim() || isStreaming}
                  className="absolute right-1 top-1 bottom-1 h-10 w-10 rounded-full bg-sky-600 hover:bg-sky-700"
                >
                  <Send className="h-4 w-4 text-white" />
                </Button>
              </form>
              <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground/60 px-2">
                <span className="flex items-center gap-1"><Settings2 className="h-3 w-3" /> USMLE Optimization Active</span>
                <span className="flex items-center gap-1"><Zap className="h-3 w-3" /> Grounded in Guidelines</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* The Actual Pill Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "h-14 px-6 rounded-full flex items-center gap-3 shadow-[0_10px_30px_rgba(14,165,233,0.3)] transition-all border border-white/20",
          isOpen ? "bg-zinc-900 border-zinc-700" : "bg-sky-600 text-white"
        )}
      >
        <div className="relative">
          <Sparkles className="h-6 w-6" />
          {!isOpen && (
            <motion.div
              layoutId="badge"
              className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-sky-600 shadow-sm"
            />
          )}
        </div>
        <span className="font-bold tracking-tight">{isOpen ? "Hide Intel" : "Ask AI"}</span>
      </motion.button>
    </div>
  );
}
