// src/components/medico/pro-workflow-chatbot.tsx
"use client";

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BotMessageSquare, User, Loader2, Send } from 'lucide-react';
import { useProMode } from '@/contexts/pro-mode-context';
import { useToast } from '@/hooks/use-toast';
import { MarkdownRenderer } from '@/components/markdown/markdown-renderer';
import { runProChatbot } from '@/ai/agents/medico/ProChatbotAgent';

interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export function ProWorkflowChatbot() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      // Build conversation history format for the agent
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.content }]
      }));

      const reply = await runProChatbot({ message: userMsg, history });
      setMessages(prev => [...prev, { role: 'model', content: reply.response }]);
    } catch (err) {
      console.error(err);
      toast({ title: 'Error', description: 'Failed to chat with Pro agent.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-md rounded-xl border-purple-500/30 flex flex-col h-[500px]">
      <CardHeader className="py-4 border-b bg-muted/20">
        <CardTitle className="flex items-center gap-2"><BotMessageSquare className="h-5 w-5 text-purple-600"/> Pro Workflow Agent</CardTitle>
        <CardDescription>A dedicated conversational agent designed for multi-step administrative troubleshooting and coordinating complex clinical workflows.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full px-4" ref={scrollRef}>
           <div className="py-4 space-y-4">
            {messages.length === 0 && (
               <div className="text-center text-muted-foreground mt-10 p-4">
                  <BotMessageSquare className="h-10 w-10 mx-auto mb-2 opacity-50"/>
                  <p className="text-sm">Hi, I&apos;m your Pro Workflow Agent. How can I assist you with clinical administration or workflow coordination today?</p>
               </div>
            )}
            {messages.map((m, idx) => (
              <div key={idx} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.role === 'model' && <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center shrink-0"><BotMessageSquare className="h-4 w-4 text-purple-700"/></div>}
                
                <div className={`p-3 rounded-xl max-w-[85%] text-sm ${m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted/50 border'}`}>
                   {m.role === 'model' ? <MarkdownRenderer content={m.content} /> : <div className="whitespace-pre-wrap">{m.content}</div>}
                </div>

                {m.role === 'user' && <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0"><User className="h-4 w-4 text-primary"/></div>}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3 justify-start">
                 <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center shrink-0"><BotMessageSquare className="h-4 w-4 text-purple-700"/></div>
                 <div className="p-3 rounded-xl bg-muted/50 border flex items-center"><Loader2 className="h-4 w-4 animate-spin text-muted-foreground"/></div>
              </div>
            )}
           </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="p-3 border-t">
         <form onSubmit={handleSubmit} className="flex gap-2 w-full">
            <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type your request here..." disabled={isLoading} className="flex-1"/>
            <Button type="submit" disabled={!input.trim() || isLoading} size="icon"><Send className="h-4 w-4"/></Button>
         </form>
      </CardFooter>
    </Card>
  );
}
