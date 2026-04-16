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
}

export function AnimatedTagline({ className }: AnimatedTaglineProps) {
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
    <div className={cn("flex items-center justify-center text-sm sm:text-md text-foreground/80", className)}>
      <span className="mr-1.5">Simply</span>
      <AnimatePresence mode="wait">
        <motion.span
          key={smartWords[currentWordIndex]}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="font-semibold firebase-gradient-text" // Keep gradient for the smart word
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
