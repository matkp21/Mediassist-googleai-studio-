// src/components/layout/animated-tagline.tsx
"use client";

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
// Heart icon is no longer used here directly for the tagline, emojis are used.

const smartWords = [
  "Smart", "Intelligent", "Caring", "Healing", "Diagnosing", "Supportive", "Better", "Helping", "Insightful", "Efficient", "Constructive", "Decisive"
];

interface AnimatedTaglineProps {
  className?: string;
  isReverse?: boolean; // For high contrast white/light text
}

export function AnimatedTagline({ className, isReverse = false }: AnimatedTaglineProps) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  useEffect(() => {
    const wordInterval = setInterval(() => {
      setCurrentWordIndex((prevIndex) => (prevIndex + 1) % smartWords.length);
    }, 2500); // Change word every 2.5 seconds

    return () => {
      clearInterval(wordInterval);
    };
  }, []);

  const emojiVariants = {
    initial: { opacity: 0.7, scale: 1 },
    animate: {
      opacity: [0.7, 1, 0.7],
      scale: [1, 1.15, 1],
      transition: {
        duration: 1.5, // Slower, more subtle pulse for emojis
        repeat: Infinity,
        ease: "easeInOut",
      }
    }
  };

  return (
    <div className={cn("flex flex-wrap items-center justify-center text-sm sm:text-md", isReverse ? "text-white/90 drop-shadow-md" : "text-foreground/80", className)}>
      <span className="mr-1.5">Simply</span>
      <AnimatePresence mode="wait">
        <motion.span
          key={smartWords[currentWordIndex]}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className={cn(
            "font-semibold", 
            isReverse ? "text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.7)]" : "bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-[#00FFFF] to-cyan-500 animate-[gradient-flow_2.6s_linear_infinite] bg-[length:200%_auto] [text-shadow:_0_0_1px_rgba(255,255,255,0.01)]"
          )}
        >
          #{smartWords[currentWordIndex]}
        </motion.span>
      </AnimatePresence>
      <span className="ml-1.5">. Always</span>
      {/* Animated Emojis */}
      <motion.span
        className="ml-1.5 inline-block"
        variants={emojiVariants}
        initial="initial"
        animate="animate"
        role="img"
        aria-label="sparks and brain"
      >
        ✨
      </motion.span>
      <motion.span
         className="inline-block" // Removed ml-0.5 if they should be closer or part of one animated block
         variants={emojiVariants}
         initial="initial"
         animate="animate"
         transition={{ delay: 0.2 }} // Slightly delay the second emoji for a cascading effect
         role="img"
         aria-label="brain"
      >
        🧠
      </motion.span>
    </div>
  );
}
