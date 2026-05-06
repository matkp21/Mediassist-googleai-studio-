"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Bot, SendHorizonal, BrainCircuit, Stethoscope, 
  Pill, Activity, BookOpen, Target, Search, Copy, 
  ThumbsUp, ThumbsDown, RotateCcw, Check, X, AlertTriangle
} from "lucide-react";
import { useAiStreaming } from "@/hooks/use-ai-streaming";
import { getMedicalOrchestrator } from "@/ai/orchestrator/MedicalOrchestrator";
import { MarkdownRenderer } from "@/components/markdown/markdown-renderer";

const SUGGESTIONS = [
  { icon: BrainCircuit, label: "Quiz me on Lens anatomy" },
  { icon: Stethoscope, label: "Simulate a glaucoma case" },
  { icon: Pill, label: "Explain timolol's MOA" },
  { icon: Activity, label: "Interpret this ECG pattern" },
  { icon: BookOpen, label: "Summarise latest AAO guidelines" },
  { icon: Target, label: "Build my study plan for tomorrow" },
];

type Message = {
  role: "user" | "ai" | "system";
  content?: string;
  metadata?: any;
};

function AskMediContent() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const q = searchParams.get('q');
  const action = searchParams.get('action');
  const initialized = useRef(false);

  const { startStream, streamedText, isStreaming, fullResponse, resetStream } = useAiStreaming();
  
  useEffect(() => {
    if ((q || action) && !initialized.current) {
      initialized.current = true;
      const initialQuery = q || action || "";
      if (initialQuery.trim()) {
        setInput(initialQuery);
        handleSend(initialQuery);
      }
    }
  }, [q, action]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streamedText, isStreaming]);

  // Sync streamed text
  useEffect(() => {
    if (isStreaming && streamedText) {
      setMessages(prev => {
        const lastMsg = prev[prev.length - 1];
        if (lastMsg && lastMsg.metadata?.isStreaming) {
          return [...prev.slice(0, -1), { ...lastMsg, content: streamedText }];
        } else {
          return [...prev, { role: 'ai', content: streamedText, metadata: { isStreaming: true } }];
        }
      });
    }
  }, [streamedText, isStreaming]);

  // Sync history and completion
  useEffect(() => {
    if (!isStreaming && fullResponse) {
       setMessages(prev => {
         const filtered = prev.filter(m => !m.metadata?.isStreaming);
         return [...filtered, { role: 'ai', content: fullResponse }];
       });
       resetStream();
    }
  }, [fullResponse, isStreaming, resetStream]);

  const handleSend = async (text: string = input) => {
    if (!text.trim() || isStreaming) return;
    
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: text }]);

    try {
      const orchestrator = getMedicalOrchestrator();
      const taskType = await orchestrator.determineTaskType(text);
      
      const systemPrompt = `You are "Medi", a highly intelligent clinical companion.
      You have access to a neural engine that tracks user progress, study contexts, and memory.
      Respond accurately to the student's request, formatted using clean markdown.`;
      
      await startStream(text, systemPrompt);
    } catch (error) {
      setMessages(prev => [...prev, { role: "system", content: "Error: Unable to connect to the AI engine."}]);
    }
  };

  return (
    <div className="flex flex-col h-[100vh] bg-transparent pb-4 max-h-[100vh] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-7 pt-7 pb-4 shrink-0">
        <h1 className="font-[Fraunces] font-light text-[17px] text-[var(--lb)]">Ask Medi</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-7 pb-32" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center max-w-2xl mx-auto text-center mt-[-5vh]">
            <div className="w-20 h-20 rounded-[24px] bg-gradient-to-br from-[var(--blue)] to-[var(--cyan)] flex items-center justify-center text-white mb-8 shadow-lg shadow-[var(--blue)]/20 shadow-[0_0_20px_#4b8ff7_inset]">
              <Bot size={40} strokeWidth={1.5} />
            </div>
            <h2 className="font-[Fraunces] font-light text-4xl mb-4 text-[var(--lb)]">How can I help you today?</h2>
            <p className="text-[15px] font-medium text-[var(--sec)] mb-12 max-w-lg">
              I'm Medi, your intelligent clinical companion. I can analyze cases, quiz your knowledge, or explore our knowledge graphs.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
              {SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(s.label)}
                  className="flex items-center gap-3 p-4 rounded-[20px] bg-[var(--s1)] border border-[var(--sep)] hover:bg-[var(--fill2)] transition-colors text-left group"
                >
                  <div className="w-10 h-10 rounded-[12px] bg-[var(--fill)] flex items-center justify-center text-[var(--sec)] group-hover:text-[var(--blue)] group-hover:bg-[var(--blue)]/10 transition-colors">
                    <s.icon size={18} />
                  </div>
                  <span className="text-[13px] font-semibold text-[var(--lb)]">{s.label}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto flex flex-col gap-6 py-4">
            {messages.map((m, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className={`flex gap-4 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.role !== 'user' && (
                  <div className="w-10 h-10 shrink-0 rounded-full bg-[var(--blue)]/10 flex items-center justify-center text-[var(--blue)] border border-[var(--blue)]/20 mt-1">
                    {m.role === 'ai' ? <Bot size={20} /> : <AlertTriangle size={20} className="text-red-500" />}
                  </div>
                )}
                
                <div className={`flex flex-col gap-3 max-w-[85%] ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                  {m.role === 'user' ? (
                    <div className="px-5 py-3.5 rounded-[24px] rounded-tr-[8px] bg-[var(--userBubble)] text-white shadow-md text-[15px] font-medium leading-relaxed">
                      {m.content}
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3 w-full">
                      <div className="px-6 py-4 rounded-[24px] rounded-tl-[8px] bg-[var(--aiBubble)] text-[var(--lb)] shadow-[var(--sh)] border border-[var(--aiBorder)] text-[15px] font-medium leading-relaxed whitespace-pre-wrap">
                        <MarkdownRenderer content={m.content || ""} />
                      </div>
                      
                      {/* Message Actions */}
                      <div className="flex items-center gap-2 mt-1 ml-2">
                        {[Copy, ThumbsUp, ThumbsDown, RotateCcw].map((Icon, idx) => (
                          <button key={idx} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[var(--fill)] text-[var(--sec)] hover:text-[var(--lb)] transition-colors">
                            <Icon size={14} />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
            
            {isStreaming && !streamedText && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-4 justify-start">
                <div className="w-10 h-10 shrink-0 rounded-full bg-[var(--blue)]/10 flex items-center justify-center text-[var(--blue)] border border-[var(--blue)]/20 mt-1">
                  <Bot size={20} />
                </div>
                <div className="px-6 py-4 rounded-[24px] rounded-tl-[8px] bg-[var(--aiBubble)] border border-[var(--aiBorder)] shadow-[var(--sh)] flex items-center gap-1.5 h-[52px]">
                   <span className="w-2 h-2 rounded-full bg-[var(--sec)] animate-[bounce_1.4s_infinite_.2s]" />
                   <span className="w-2 h-2 rounded-full bg-[var(--sec)] animate-[bounce_1.4s_infinite_.4s]" />
                   <span className="w-2 h-2 rounded-full bg-[var(--sec)] animate-[bounce_1.4s_infinite_.6s]" />
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] max-w-3xl shrink-0">
        <div className="relative glass-card rounded-[32px] p-2 flex items-center shadow-[var(--shm)]">
          <input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about medical protocols, diagnosis, or study guides..."
            className="w-full bg-transparent px-5 py-3 text-[15px] text-[var(--lb)] placeholder:text-[var(--ter)] focus:outline-none font-medium h-[52px]"
          />
          <button 
            onClick={() => handleSend()}
            disabled={!input.trim() || isStreaming}
            className="w-12 h-12 shrink-0 rounded-[20px] bg-[var(--blue)] text-white flex items-center justify-center shadow-[0_4px_16px_rgba(75,143,247,0.3)] disabled:bg-[var(--fill)] disabled:text-[var(--ter)] disabled:shadow-none transition-all mr-1"
          >
            <SendHorizonal size={20} className={input.trim() ? "translate-x-[-2px] translate-y-[2px]" : ""} />
          </button>
        </div>
        <div className="text-center mt-3 text-[11px] font-medium text-[var(--sec)]">
          Medi AI can make mistakes. Always verify clinical information via reference protocols.
        </div>
      </div>
    </div>
  );
}

export default function AskMedi() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-[var(--sec)]">Loading...</div>}>
      <AskMediContent />
    </Suspense>
  )
}

