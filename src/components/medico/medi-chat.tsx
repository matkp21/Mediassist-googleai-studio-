"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Send, Bot, User, Loader2, Sparkles, Brain, 
  Search, BookOpen, Calculator, Wand2, History,
  LayoutGrid, Settings, Trash2, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { MarkdownRenderer } from '@/components/markdown/markdown-renderer';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export function MediChat() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'chat' | 'deepSolve' | 'research'>('chat');
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/medi-assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input, mode }),
      });

      const data = await response.json();
      if (data.response) {
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.response,
          timestamp: Date.now(),
        }]);
      }
    } catch (error) {
      toast({
        title: "Chat Failed",
        description: "Could not connect to the medical AI agent.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] max-w-6xl mx-auto shadow-2xl rounded-2xl overflow-hidden border border-zinc-800 bg-black/40 backdrop-blur-xl">
      <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-900/50">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-teal-500/10 border border-teal-500/20">
            <Bot className="w-5 h-5 text-teal-400" />
          </div>
          <div>
            <h2 className="font-bold text-white tracking-tight">MediAssistant <span className="text-teal-400">Pro</span></h2>
            <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
               <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Clinical Agent Active</p>
            </div>
          </div>
        </div>
        
        <Tabs value={mode} onValueChange={(v: any) => setMode(v)} className="w-[300px]">
          <TabsList className="grid grid-cols-3 bg-black/40 border border-zinc-800">
            <TabsTrigger value="chat" className="text-xs data-[state=active]:bg-teal-500/20 data-[state=active]:text-teal-400">Chat</TabsTrigger>
            <TabsTrigger value="deepSolve" className="text-xs data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">Solve</TabsTrigger>
            <TabsTrigger value="research" className="text-xs data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400">Research</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <ScrollArea className="flex-1 p-6">
        <div className="space-y-6 pb-20">
          <AnimatePresence>
            {messages.length === 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-20 space-y-4"
              >
                <div className="mx-auto w-16 h-16 rounded-full bg-teal-500/10 flex items-center justify-center border border-teal-500/20">
                  <Sparkles className="w-8 h-8 text-teal-400" />
                </div>
                <div>
                   <h3 className="text-xl font-bold text-white">How can I assist you today?</h3>
                   <p className="text-zinc-500 text-sm max-w-sm mx-auto">Ask about symptoms, drug interactions, clinical guidelines, or research papers.</p>
                </div>
                <div className="grid grid-cols-2 gap-2 max-w-lg mx-auto">
                   {["Differential for Cough", "MOA of Metformin", "Latest T2DM Guidelines", "Explain ECG markers"].map((s, i) => (
                     <Button key={i} variant="outline" size="sm" onClick={() => setInput(s)} className="text-[11px] justify-start bg-zinc-900/30 border-zinc-800 hover:border-teal-500/50">
                       <ChevronRight className="w-3 h-3 mr-1 text-teal-500" /> {s}
                     </Button>
                   ))}
                </div>
              </motion.div>
            )}
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`mt-1 p-2 rounded-lg h-fit ${msg.role === 'user' ? 'bg-zinc-800' : 'bg-teal-500/10 border border-teal-500/20'}`}>
                    {msg.role === 'user' ? <User className="w-4 h-4 text-zinc-400" /> : <Bot className="w-4 h-4 text-teal-400" />}
                  </div>
                  <div className={`p-4 rounded-2xl shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-teal-600 text-white' 
                      : 'bg-zinc-900/50 border border-zinc-800 text-zinc-100'
                  }`}>
                    <MarkdownRenderer content={msg.content} />
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex gap-3 max-w-[85%]">
                <div className="mt-1 p-2 rounded-lg h-fit bg-teal-500/10 border border-teal-500/20">
                  <Bot className="w-4 h-4 text-teal-400" />
                </div>
                <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 flex items-center gap-3">
                  <Loader2 className="w-4 h-4 animate-spin text-teal-400" />
                  <span className="text-xs text-zinc-500 uppercase tracking-widest font-bold">Synthesizing Clinical Response...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      <div className="p-4 bg-zinc-900/50 border-t border-zinc-800">
        <div className="relative group max-w-4xl mx-auto">
          <Input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={
              mode === 'chat' ? "Speak with MediAssistant..." :
              mode === 'deepSolve' ? "Submit a complex medical case..." :
              "Research deep clinical topics..."
            }
            className="pr-12 py-6 bg-black/40 border-zinc-700 focus:border-teal-500/50 transition-all text-white placeholder:text-zinc-600 rounded-xl"
          />
          <Button 
            size="icon" 
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-2 rounded-lg bg-teal-600 hover:bg-teal-500 shadow-lg shadow-teal-900/20"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-[9px] text-zinc-600 text-center mt-3 uppercase tracking-[0.2em] font-bold">
          Empowered by Gemini 2.5 Pro & Genkit • Clinical reasoning may vary
        </p>
      </div>
    </div>
  );
}
