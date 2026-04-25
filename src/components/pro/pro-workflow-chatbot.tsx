"use client";

import { useState } from 'react';
import { ProWorkflowChatinputSchema, type ProWorkflowChatinput } from '@/ai/schemas/pro-schemas';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Bot, Send } from 'lucide-react';
import { useAiAgent } from '@/hooks/use-ai-agent';
import { ProWorkflowChatbotAgent } from '@/ai/agents/pro/ProWorkflowChatbotAgent';

export default function ProWorkflowChatbot() {
  const [messages, setMessages] = useState<{ role: 'user'|'agent', content: string }[]>([]);
  const [inputVal, setInputVal] = useState('');
  
  const { execute, isLoading } = useAiAgent(ProWorkflowChatbotAgent, null, {
    onSuccess: (data) => {
      setMessages(prev => [...prev, { role: 'agent', content: data.reply }]);
    }
  });

  const handleSend = () => {
    if (!inputVal.trim()) return;
    setMessages(prev => [...prev, { role: 'user', content: inputVal }]);
    execute({ message: inputVal, context: messages.slice(-3).map(m => `${m.role}: ${m.content}`).join('\n') });
    setInputVal('');
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Bot className="w-5 h-5 text-primary" /> Pro Workflow Chatbot</CardTitle>
        <CardDescription>Context-aware administrative assistant.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto space-y-4 max-h-[400px]">
        {messages.map((m, i) => (
          <div key={i} className={`p-3 rounded-lg max-w-[80%] ${m.role === 'user' ? 'bg-primary text-primary-foreground ml-auto' : 'bg-muted mr-auto'}`}>
            {m.content}
          </div>
        ))}
        {isLoading && (
          <div className="bg-muted p-3 rounded-lg mr-auto flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" /> Thinking...
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-4">
        <div className="flex w-full gap-2">
          <Input 
            placeholder="Ask about a workflow or task..." 
            value={inputVal} 
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <Button onClick={handleSend} disabled={isLoading || !inputVal.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
