"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Send, Bot, User, DatabaseZap } from 'lucide-react';
import { askMedicalTutor } from '@/app/actions/rag-actions';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export function RagTutor() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchStatus, setSearchStatus] = useState<string>('');
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages, searchStatus]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    
    // Ask Medi: Show semantic search steps
    setSearchStatus('Searching semantic vector DB for PYQs and Flashcards...');
    
    setTimeout(() => {
      setSearchStatus('Running RAG pipeline against medical literature...');
    }, 1500);

    try {
      const response = await askMedicalTutor(userMessage.content);
      
      if (response.error) {
        toast({
          title: "Error",
          description: response.error,
          variant: "destructive"
        });
      } else {
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: response.answer || "I don't have enough grounded information to answer that."
        };
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      toast({
        title: "Connection Error",
        description: "Failed to connect to Medi.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setSearchStatus('');
    }
  };

  return (
    <Card className="flex flex-col h-[700px] max-h-[85vh] shadow-lg rounded-xl overflow-hidden bg-gradient-to-br from-card via-card to-accent/5">
      <CardHeader className="border-b bg-card pb-4">
        <CardTitle className="text-xl flex items-center gap-2">
          <DatabaseZap className="h-6 w-6 text-primary" />
          Ask Medi: Your Resident Genius Mentor
        </CardTitle>
        <CardDescription>
          Ask natural questions to instantly pull semantic flashcards, PYQs, and grounded medical literature via RAG.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex flex-col p-0 flex-1 overflow-hidden relative">
        <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
          <div className="space-y-4 max-w-3xl mx-auto pb-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-20 text-muted-foreground">
                <DatabaseZap className="h-16 w-16 mb-4 opacity-20 text-primary" />
                <h3 className="text-lg font-medium text-foreground mb-2">I'm Medi, your resident on call.</h3>
                <p className="max-w-sm text-sm">
                  Powered by advanced semantic vector search and RAG. I can pull up flashcards, past questions, and synthesize complex topics instantly.
                </p>
                <div className="mt-8 flex flex-col gap-2 w-full max-w-sm">
                  <p className="text-xs font-semibold uppercase text-muted-foreground/60 tracking-wider">Try asking me...</p>
                  <Button variant="outline" className="justify-start h-auto py-2 px-3 text-left font-normal border-primary/20 hover:border-primary/50" onClick={() => setInputValue("Give me 5 questions on the skeletal system")}>
                    "Give me 5 questions on the skeletal system"
                  </Button>
                  <Button variant="outline" className="justify-start h-auto py-2 px-3 text-left font-normal border-primary/20 hover:border-primary/50" onClick={() => setInputValue("Generate some quick flashcards for acute coronary syndrome")}>
                    "Generate some quick flashcards for ACS"
                  </Button>
                  <Button variant="outline" className="justify-start h-auto py-2 px-3 text-left font-normal border-primary/20 hover:border-primary/50" onClick={() => setInputValue("Search previous year questions on pharmacology")}>
                    "Search previous year questions on pharmacology"
                  </Button>
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <div 
                  key={message.id} 
                  className={cn(
                    "flex gap-3 max-w-[85%]", 
                    message.role === 'user' ? "ml-auto flex-row-reverse" : ""
                  )}
                >
                  <div className={cn(
                    "h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1",
                    message.role === 'user' ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"
                  )}>
                    {message.role === 'user' ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
                  </div>
                  <div className={cn(
                    "rounded-2xl px-4 py-3 text-sm",
                    message.role === 'user' 
                      ? "bg-primary text-primary-foreground rounded-tr-sm" 
                      : "bg-muted text-foreground rounded-tl-sm border shadow-sm"
                  )}>
                    {message.role === 'user' ? (
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    ) : (
                      <div className="prose prose-sm dark:prose-invert max-w-none 
                                      prose-p:leading-relaxed prose-pre:bg-primary/5 
                                      prose-pre:border prose-pre:border-primary/10
                                      prose-strong:text-primary">
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex gap-3 max-w-[85%]">
                <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot className="h-5 w-5" />
                </div>
                <div className="bg-muted border rounded-2xl rounded-tl-sm px-4 py-4 flex flex-col gap-2">
                  <div className="flex space-x-1 items-center">
                    <div className="h-2 w-2 bg-primary/50 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="h-2 w-2 bg-primary/50 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="h-2 w-2 bg-primary/50 rounded-full animate-bounce"></div>
                  </div>
                  <span className="text-xs text-muted-foreground animate-pulse">{searchStatus || 'Processing...'}</span>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        
        <div className="p-4 bg-background border-t">
          <form onSubmit={handleSendMessage} className="flex gap-2 max-w-3xl mx-auto relative">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask Medi about topics, flashcards, or past questions..."
              disabled={isLoading}
              className="flex-1 rounded-full pl-5 pr-12 focus-visible:ring-primary shadow-sm"
            />
            <Button 
              type="submit" 
              size="icon" 
              disabled={!inputValue.trim() || isLoading}
              className="absolute right-1 top-1 bottom-1 h-auto w-10 rounded-full"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
          <p className="text-center text-[10px] text-muted-foreground mt-2">
            Ask Medi | Uses semantic vector search & RAG pipeline
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default RagTutor;
