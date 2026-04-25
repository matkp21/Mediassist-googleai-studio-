"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Loader2, User, Bot, Sparkles, Brain, MessageSquare, Zap, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MarkdownRenderer } from '@/components/markdown/markdown-renderer';

export function TutorBot() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
     if (!input.trim() || isLoading) return;
     const userMsg = { role: 'user', content: input };
     setMessages([...messages, userMsg]);
     setInput('');
     setIsLoading(true);

     try {
       const resp = await fetch('/api/medico/tutorbot', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ message: input, history: messages }),
       });
       const data = await resp.json();
       setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
     } catch (err) {
       console.error(err);
     } finally {
       setIsLoading(false);
     }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <div className="flex items-center gap-4 mb-6">
        <div className="p-3 bg-fuchsia-500/10 border border-fuchsia-500/20 rounded-2xl">
           <Brain className="text-fuchsia-500 w-8 h-8" />
        </div>
        <div>
           <h2 className="text-2xl font-bold text-white">MedTutor <span className="text-fuchsia-500">Soul</span></h2>
           <p className="text-zinc-500 text-sm">Autonomous tutor with persistent clinical persona.</p>
        </div>
      </div>

      <div className="space-y-4 min-h-[400px]">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
             <div className={`max-w-[80%] p-4 rounded-2xl ${m.role === 'user' ? 'bg-zinc-800 text-white' : 'bg-fuchsia-500/5 border border-fuchsia-500/10 text-zinc-200'}`}>
                <MarkdownRenderer content={m.content} />
             </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
             <div className="p-4 rounded-2xl bg-fuchsia-500/5 border border-fuchsia-500/10 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-fuchsia-500" />
                <span className="text-xs text-fuchsia-500 uppercase font-bold">Deep Thinking...</span>
             </div>
          </div>
        )}
      </div>

      <div className="sticky bottom-4 flex gap-2">
        <Input 
          value={input} 
          onChange={e => setInput(e.target.value)} 
          placeholder="Ask your tutor anything..."
          className="bg-zinc-900 border-zinc-800 text-white"
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
        />
        <Button onClick={sendMessage} className="bg-fuchsia-600 hover:bg-fuchsia-500 font-bold">
           Send
        </Button>
      </div>
    </div>
  );
}

function Input({ className, ...props }: any) {
  return <input className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`} {...props} />;
}
