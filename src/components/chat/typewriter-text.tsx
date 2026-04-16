
"use client";

import type { HTMLAttributes } from 'react';
import React, { useState, useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';

interface TypewriterTextProps extends HTMLAttributes<HTMLParagraphElement> {
  text: string;
  speed?: number; // Speed now means delay between words/whitespace segments
  onComplete?: () => void;
}

export function TypewriterText({ text, speed = 50, onComplete, className, ...props }: TypewriterTextProps) {
  const [displayedText, setDisplayedText] = useState('');

  const words = useMemo(() => {
    if (!text) return [];
    // This regex splits by whitespace but keeps the whitespace as a separate element in the array.
    // This is crucial for preserving formatting like newlines and multiple spaces.
    return text.split(/(\s+)/).filter(Boolean);
  }, [text]);

  useEffect(() => {
    setDisplayedText(''); // Reset when the text prop changes
    
    if (words.length === 0) {
      onComplete?.();
      return;
    }

    let currentWordIndex = 0;
    const intervalId = setInterval(() => {
      if (currentWordIndex < words.length) {
        setDisplayedText(prev => prev + words[currentWordIndex]);
        currentWordIndex++;
      } else {
        clearInterval(intervalId);
        onComplete?.();
      }
    }, speed);

    return () => clearInterval(intervalId);
  }, [words, speed, onComplete]);

  return <p className={cn("text-sm whitespace-pre-wrap", className)} {...props}>{displayedText}</p>;
}
