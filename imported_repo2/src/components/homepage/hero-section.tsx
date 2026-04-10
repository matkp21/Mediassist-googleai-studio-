
// src/components/homepage/hero-section.tsx
"use client";

import type { CSSProperties } from 'react';
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { HeartPulse, BookHeart, BriefcaseMedical, Sparkles } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useProMode } from '@/contexts/pro-mode-context';
// Removed HeroWidgets import as it's no longer used here

const greetings = [
  { lang: "en", text: "Hello," },
  { lang: "hi", text: "नमस्ते," },
  { lang: "ml", text: "നമസ്കാരം," },
  { lang: "es", text: "Hola," },
  { lang: "fr", text: "Bonjour," },
];

export function HeroSection() {
  const [currentGreetingIndex, setCurrentGreetingIndex] = useState(0);
  const { userRole } = useProMode();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const interval = setInterval(() => {
      setCurrentGreetingIndex((prevIndex) => (prevIndex + 1) % greetings.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  let ctaLink = "/chat";
  let ctaText = "Get Started";
  let CtaIcon = HeartPulse;
  let ctaAriaLabel = "Get started with MediAssistant features";
  let ctaBaseClasses = "bg-primary hover:bg-primary/90 text-primary-foreground hover:shadow-primary/30";
  let ctaSpecificAnimation = "";

  if (userRole === 'medico') {
    ctaLink = "/medico";
    ctaText = "Medico Study Hub";
    CtaIcon = BookHeart;
    ctaAriaLabel = "Go to Medico Study Hub";
    ctaBaseClasses = `
      bg-gradient-to-r
      from-[hsl(var(--firebase-color-1-light-h),var(--firebase-color-1-light-s),var(--firebase-color-1-light-l))]
      via-[hsl(var(--firebase-color-2-light-h),var(--firebase-color-2-light-s),var(--firebase-color-2-light-l))]
      to-[hsl(var(--firebase-color-3-light-h),var(--firebase-color-3-light-s),var(--firebase-color-3-light-l))]
      dark:from-[hsl(var(--firebase-color-1-dark-h),var(--firebase-color-1-dark-s),var(--firebase-color-1-dark-l))]
      dark:via-[hsl(var(--firebase-color-2-dark-h),var(--firebase-color-2-dark-s),var(--firebase-color-2-dark-l))]
      dark:to-[hsl(var(--firebase-color-3-dark-h),var(--firebase-color-3-dark-s),var(--firebase-color-3-dark-l))]
      text-white
      firebase-button-interactive
    `;
    ctaSpecificAnimation = "gemini-cta-button";
  } else if (userRole === 'pro') {
    ctaLink = "/pro";
    ctaText = "Pro Clinical Suite";
    CtaIcon = BriefcaseMedical;
    ctaAriaLabel = "Go to Professional Clinical Suite";
     ctaBaseClasses = `
      bg-gradient-to-r
      from-purple-500
      via-purple-600
      to-purple-700
      hover:from-purple-600
      hover:to-purple-800
      text-white
      hover:shadow-purple-500/40
      gemini-cta-button
    `;
  }

  return (
    <section className="relative bg-background py-16 md:py-20 overflow-hidden">
      {/* Decorative blurred gradient circles */}
      <motion.div
        className="absolute top-[-50px] left-[-50px] w-72 h-72 sm:w-96 sm:h-96 bg-gradient-to-br from-primary/30 to-accent/30 rounded-full blur-3xl opacity-20 dark:opacity-15 pointer-events-none"
        animate={{ scale: [1, 1.05, 1], opacity: [0.2, 0.25, 0.2] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden="true"
      />
      <motion.div
        className="absolute bottom-[-80px] right-[-80px] w-80 h-80 sm:w-[400px] sm:h-[400px] bg-gradient-to-tl from-accent/30 to-primary/30 rounded-full blur-3xl opacity-20 dark:opacity-15 pointer-events-none"
        animate={{ scale: [1, 1.03, 1], opacity: [0.2, 0.23, 0.2] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        aria-hidden="true"
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
      {isClient && (
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-center mb-6">
          <AnimatePresence mode="wait">
            <motion.span
              key={greetings[currentGreetingIndex].text}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              lang={greetings[currentGreetingIndex].lang}
              className="inline-block firebase-gradient-text" // Changed to firebase-gradient-text
            >
              {greetings[currentGreetingIndex].text}
            </motion.span>
          </AnimatePresence>
         </h1>
        )}
        {!isClient && ( // Fallback for SSR/initial render before client-side hydration
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-center mb-6">
                <span className="inline-block firebase-gradient-text">{greetings[0].text}</span>
            </h1>
         )}

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-xl sm:text-2xl md:text-3xl font-semibold text-foreground/90 dark:text-foreground/90 mb-4 flex items-center justify-center"
        >
          Welcome to&nbsp;
          <span className="animated-gradient-text">MediAssistant</span>
          <Sparkles className="ml-2 h-6 w-6 text-accent animate-pulse-medical" style={{"--medical-pulse-opacity-base": "0.6", "--medical-pulse-opacity-peak": "1", "--medical-pulse-scale-peak": "1.2"} as CSSProperties} />
          .
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="text-md sm:text-lg text-muted-foreground max-w-3xl mx-auto mb-8"
        >
          Your intelligent partner for AI-powered diagnostics, imaging analysis, and educational support—all at your fingertips.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.2, duration: 0.5 }}
          className="mb-10"
        >
          <Button
            asChild
            size="lg"
            className={cn(
              "rounded-lg group px-8 py-6 text-lg shadow-lg transition-all duration-300 transform hover:scale-105",
              ctaBaseClasses,
              ctaSpecificAnimation
            )}
            aria-label={ctaAriaLabel}
          >
            <Link href={ctaLink} className="flex items-center">
              {ctaText}
              <CtaIcon
                className={cn(
                  "ml-2 h-6 w-6 group-hover:scale-110 animate-pulse-medical",
                   userRole === 'pro' || userRole === 'medico' ? "text-white" : "text-primary-foreground"
                )}
                style={{"--medical-pulse-opacity-base": "0.8", "--medical-pulse-opacity-peak": "1", "--medical-pulse-scale-peak": "1.15"} as CSSProperties}
              />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
