"use client";

import React, { useState, useEffect } from 'react';
import { CalendarDays, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export function DateTimeRibbon() {
  const [timeState, setTimeState] = useState({
    date: '',
    time: ''
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const updateDateTime = () => {
      const now = new Date();
      setTimeState({
        date: now.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric'
        }),
        time: now.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        })
      });
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) {
    return (
      <div className="h-10 opacity-0" aria-hidden="true" />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.5, duration: 0.5 }}
      className="mt-8 flex justify-center"
    >
      <div className="relative group">
        {/* Animated gradient glow effect backdrop */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-[hsl(var(--firebase-color-1-light-h),var(--firebase-color-1-light-s),var(--firebase-color-1-light-l))] via-[hsl(var(--firebase-color-2-light-h),var(--firebase-color-2-light-s),var(--firebase-color-2-light-l))] to-[hsl(var(--firebase-color-3-light-h),var(--firebase-color-3-light-s),var(--firebase-color-3-light-l))] dark:from-[hsl(var(--firebase-color-1-dark-h),var(--firebase-color-1-dark-s),var(--firebase-color-1-dark-l))] dark:via-[hsl(var(--firebase-color-2-dark-h),var(--firebase-color-2-dark-s),var(--firebase-color-2-dark-l))] dark:to-[hsl(var(--firebase-color-3-dark-h),var(--firebase-color-3-dark-s),var(--firebase-color-3-dark-l))] rounded-full blur opacity-40 group-hover:opacity-75 transition duration-1000 group-hover:duration-200 animate-pulse-medical" />
        
        {/* Ribbon Content */}
        <div className="relative flex items-center gap-4 bg-background/80 backdrop-blur-md px-6 py-2.5 rounded-full border border-border/50 text-sm font-medium text-foreground/90 shadow-sm leading-none">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-primary/80" />
            <span>{timeState.date}</span>
          </div>
          
          <div className="w-px h-4 bg-border/80" />
          
          <div className="flex items-center gap-2">
            <span className="tabular-nums tracking-tight">{timeState.time}</span>
            <Clock className="h-4 w-4 text-accent/80" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
