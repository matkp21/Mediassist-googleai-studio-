// src/components/chat/chat-message.tsx
"use client";

import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { HeartPulse, FileText, FileSpreadsheet, FilePieChart, FileQuestion } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';
import { parseModelThinkingSegments } from '@/lib/think-segments';
import { ModelThinkingCard } from './model-thinking-card';
import { TypewriterText } from './typewriter-text';

export interface Message {
  id: string;
  content: ReactNode | string;
  sender: 'user' | 'bot';
  timestamp: Date;
  isCommandResponse?: boolean;
  isErrorResponse?: boolean;
  attachments?: Array<{ name: string, type: string, size?: string }>;
  isStreaming?: boolean;
}

interface ChatMessageProps {
  message: Message;
}

const ChatMessageComponent: React.FC<ChatMessageProps> = ({ message }) => {
  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return <FileText className="h-4 w-4 text-red-500" />;
    if (type.includes('sheet') || type.includes('csv')) return <FileSpreadsheet className="h-4 w-4 text-green-500" />;
    if (type.includes('presentation')) return <FilePieChart className="h-4 w-4 text-orange-500" />;
    if (type.includes('word')) return <FileText className="h-4 w-4 text-blue-500" />;
    return <FileQuestion className="h-4 w-4 text-muted-foreground" />;
  };

  const renderContent = () => {
    if (typeof message.content !== 'string') {
      return message.content;
    }

    const segments = parseModelThinkingSegments(message.content);
    return (
      <div className="flex flex-col gap-1">
        {segments.map((segment, idx) => (
          segment.type === 'thinking' ? (
            <ModelThinkingCard key={idx} content={segment.content} isStreaming={message.isStreaming && idx === segments.length - 1} />
          ) : (
            segment.content.trim() && (
              <div key={idx} className="whitespace-pre-wrap">
                {message.sender === 'bot' ? (
                  <TypewriterText text={segment.content} speed={25} />
                ) : (
                  segment.content
                )}
              </div>
            )
          )
        ))}
      </div>
    );
  };

  return (
    <div
      className={cn(
        "flex items-end gap-2 fade-in group",
        message.sender === 'user' ? 'justify-end' : 'justify-start'
      )}
    >
      {message.sender === 'bot' && (
        <Avatar className="h-8 w-8 self-start flex-shrink-0">
          <AvatarImage src="/placeholder-bot.jpg" alt="Bot Avatar" data-ai-hint="robot avatar" />
          <AvatarFallback className="bg-gradient-to-br from-sky-500 via-blue-600 to-blue-700 glowing-ring-firebase">
            <HeartPulse className="h-4 w-4 text-white" />
          </AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          "max-w-[85%] lg:max-w-md rounded-xl p-3 shadow-md transition-all duration-300",
          message.sender === 'user'
            ? 'bg-primary text-primary-foreground rounded-br-none'
            : message.isErrorResponse
              ? 'bg-destructive/20 border border-destructive/50 text-destructive-foreground rounded-bl-none animate-error-highlight'
              : message.isCommandResponse
                ? "bg-gradient-to-tr from-accent/20 via-accent/30 to-accent/40 border border-accent/60 text-accent-foreground rounded-bl-none shadow-accent/20"
                : 'bg-secondary text-secondary-foreground rounded-bl-none shadow-secondary/20 font-medium tracking-tight'
        )}
      >
        {message.attachments && message.attachments.length > 0 && (
          <div className="mb-3 flex flex-col gap-1.5">
            {message.attachments.map((file, i) => (
              <div key={i} className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-black/10 dark:bg-white/5 border border-white/10 group/file cursor-default">
                {getFileIcon(file.type)}
                <div className="flex flex-col min-w-0">
                  <span className="text-[11px] font-bold truncate leading-tight">{file.name}</span>
                  {file.size && <span className="text-[10px] opacity-60 leading-tight">{file.size}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="text-[14px] leading-relaxed">
          {renderContent()}
        </div>
        <p className="mt-2 text-[10px] opacity-50 text-right font-bold tracking-widest uppercase">
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
      {message.sender === 'user' && (
        <Avatar className="h-8 w-8 self-start flex-shrink-0">
          <AvatarImage src="https://picsum.photos/id/237/100/100" alt="User Avatar" data-ai-hint="person doctor" />
          <AvatarFallback>DR</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};

export const ChatMessage = React.memo(ChatMessageComponent);
