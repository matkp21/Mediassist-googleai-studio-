// src/components/chat/chat-message.tsx
"use client";

import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { HeartPulse } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

export interface Message {
  id: string;
  content: ReactNode;
  sender: 'user' | 'bot';
  timestamp: Date;
  isCommandResponse?: boolean;
  isErrorResponse?: boolean;
}

interface ChatMessageProps {
  message: Message;
}

const ChatMessageComponent: React.FC<ChatMessageProps> = ({ message }) => {
  return (
    <div
      className={`flex items-end gap-2 fade-in ${
        message.sender === 'user' ? 'justify-end' : 'justify-start'
      }`}
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
          "max-w-xs lg:max-w-md rounded-xl p-3 shadow-md transition-all duration-300",
          message.sender === 'user'
            ? 'bg-primary text-primary-foreground rounded-br-none'
            : message.isErrorResponse
              ? 'bg-destructive/20 border border-destructive/50 text-destructive-foreground rounded-bl-none animate-error-highlight'
              : message.isCommandResponse
                ? "bg-gradient-to-tr from-accent/20 via-accent/30 to-accent/40 border border-accent/60 text-accent-foreground rounded-bl-none shadow-accent/20"
                : 'bg-secondary text-secondary-foreground rounded-bl-none shadow-secondary/20'
        )}
      >
        {message.content}
        <p className="mt-1 text-xs opacity-70 text-right">
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
