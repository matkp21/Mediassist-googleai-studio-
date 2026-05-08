// src/components/chat/model-thinking-card.tsx
"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModelThinkingCardProps {
  content: string;
  isStreaming?: boolean;
}

export const ModelThinkingCard: React.FC<ModelThinkingCardProps> = ({ content, isStreaming }) => {
  const [isExpanded, setIsExpanded] = useState(isStreaming || false);

  return (
    <div className="my-2 overflow-hidden rounded-xl border border-border bg-muted/40 transition-all duration-300">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted/60 transition-colors"
      >
        <div className="flex items-center gap-2">
          {isStreaming ? (
            <Loader2 className="h-3 w-3 animate-spin text-blue-500" />
          ) : (
            <BrainCircuit className="h-3 w-3 text-blue-500" />
          )}
          <span>Chain of Thought</span>
          {isStreaming && <span className="ml-2 inline-block h-1 w-1 rounded-full bg-blue-500 animate-pulse" />}
        </div>
        {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
      </button>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <div className="px-4 pb-4 pt-1 text-[13px] leading-relaxed text-muted-foreground/80 font-mono whitespace-pre-wrap select-none italic border-t border-border/50">
              {content || "Model is calculating weights..."}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
