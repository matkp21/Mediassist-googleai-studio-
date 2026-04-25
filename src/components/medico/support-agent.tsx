'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, User, Send, Loader2, Info, LifeBuoy } from 'lucide-react';
import { useProMode } from '@/contexts/pro-mode-context';
import { motion, AnimatePresence } from 'framer-motion';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export default function SupportAgent() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hello! I am the MediAssistant Support Agent. I know your application history and can help you troubleshoot tools or find specific features. How can I assist you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { user } = useProMode();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Simulation of context-aware support query
      // In production, this would query the conversation history + docs
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const assistantMessage: Message = { 
        role: 'assistant', 
        content: `I see you've been using the Study Hub recently. If you're experiencing issues with the 'MarkItDown' tool, ensure your files are under 10MB. Based on your profile, I recommend checking the 'Autonomous Supervisor' for complex multi-agent routing.`
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 text-white rounded-[2rem] overflow-hidden border border-white/5">
      <CardHeader className="border-b border-white/5 bg-zinc-900/50 backdrop-blur-xl shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/20 rounded-xl">
            <LifeBuoy className="h-6 w-6 text-indigo-400" />
          </div>
          <div>
            <CardTitle className="text-xl">MediSupport Agent</CardTitle>
            <CardDescription className="text-zinc-500">Context-aware technical assistance for MediAssistant.</CardDescription>
          </div>
        </div>
      </CardHeader>

      <ScrollArea ref={scrollRef} className="flex-1 p-6">
        <div className="space-y-6 max-w-3xl mx-auto">
          <AnimatePresence initial={false}>
            {messages.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`p-2 rounded-xl h-fit ${m.role === 'user' ? 'bg-zinc-800' : 'bg-indigo-600'}`}>
                  {m.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>
                <div className={`max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed ${
                  m.role === 'user' ? 'bg-zinc-900 text-zinc-100' : 'bg-zinc-800/50 text-zinc-300'
                }`}>
                  {m.content}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {isLoading && (
            <div className="flex gap-3">
              <div className="p-2 rounded-xl bg-indigo-600 h-fit">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
              <div className="bg-zinc-800/50 rounded-2xl p-4 text-xs font-mono text-zinc-500 animate-pulse">
                RETRIEVING APPLICATION CONTEXT...
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-6 border-t border-white/5 bg-zinc-900/30 shrink-0">
        <div className="max-w-3xl mx-auto relative">
          <Input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Describe your technical issue or ask about a feature..."
            className="h-14 bg-zinc-900 border-white/10 rounded-2xl pl-6 pr-14 focus-visible:ring-indigo-500"
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-2 h-10 w-10 p-0 rounded-xl bg-indigo-600 hover:bg-indigo-700"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
