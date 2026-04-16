// src/components/medications/medication-management-animation.tsx
"use client";

import type { CSSProperties } from 'react';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { PillIcon, CalendarClock, BellRing, HeartPulse } from 'lucide-react';

interface MedicationManagementAnimationProps {
  onAnimationComplete: () => void;
}

export function MedicationManagementAnimation({ onAnimationComplete }: MedicationManagementAnimationProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onAnimationComplete();
    }, 3800); // Animation duration

    return () => clearTimeout(timer);
  }, [onAnimationComplete]);

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.7, ease: "circOut" }
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      transition: { duration: 0.5, ease: "circIn", delay: 3.3 }
    }
  };

  const iconVariants = (delay: number, yStart: number = -20) => ({
    hidden: { opacity: 0, y: yStart, scale: 0.7 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { delay: delay, duration: 0.8, type: "spring", stiffness: 100, damping: 12 }
    },
  });

  const textVariants = (delay: number) => ({
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { delay: delay, duration: 0.9, ease: "circOut" }
    },
  });

  const linePathVariants = (delay: number) => ({
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { type: "spring", duration: 1.5, bounce: 0, delay: delay },
        opacity: { duration: 0.01, delay: delay }
      }
    }
  });


  return (
    <motion.div
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-gradient-to-br from-sky-700 via-teal-700 to-green-700 text-white overflow-hidden p-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <div className="relative flex items-center justify-center mb-8">
        <motion.div variants={iconVariants(0.3, -30)} className="z-10">
          <PillIcon
            className="h-16 w-16 sm:h-20 sm:w-20 text-green-300 opacity-90"
            style={{ filter: 'drop-shadow(0 0 10px hsl(var(--accent)/0.5))' } as CSSProperties}
          />
        </motion.div>
        <motion.div variants={iconVariants(0.5, 20)} className="absolute -left-10 -bottom-5 z-0">
          <CalendarClock
            className="h-10 w-10 sm:h-12 sm:w-12 text-sky-300 opacity-70 transform -rotate-12"
            style={{ filter: 'drop-shadow(0 0 8px hsl(var(--primary)/0.4))' } as CSSProperties}
          />
        </motion.div>
        <motion.div variants={iconVariants(0.7, 15)} className="absolute -right-10 -top-5 z-0">
          <BellRing
            className="h-10 w-10 sm:h-12 sm:w-12 text-yellow-300 opacity-70 transform rotate-12"
            style={{ filter: 'drop-shadow(0 0 8px hsl(var(--welcome-color-1)/0.6))' } as CSSProperties}
          />
        </motion.div>
      </div>

      <motion.h1
        className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 text-center text-transparent bg-clip-text bg-gradient-to-r from-green-200 via-sky-300 to-teal-200"
        variants={textVariants(0.8)}
        style={{ filter: 'drop-shadow(0 2px 8px rgba(125, 211, 252, 0.2))' }}
      >
        Medication Manager
      </motion.h1>

      <motion.p
        className="text-md sm:text-lg text-sky-100/80 text-center mb-10"
        variants={textVariants(1.0)}
      >
        Keeping your health on track...
      </motion.p>
      
      <svg width="150" height="70" viewBox="0 0 150 70" className="opacity-50 absolute bottom-16">
        <motion.path
          d="M10 60 Q 40 10, 75 35 T 140 15"
          fill="none"
          strokeWidth="3"
          stroke="url(#medicationPulseGradient)"
          strokeLinecap="round"
          variants={linePathVariants(1.3)}
        />
        <defs>
          <linearGradient id="medicationPulseGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--sidebar-accent))" />
            <stop offset="50%" stopColor="hsl(var(--sidebar-primary))" />
            <stop offset="100%" stopColor="hsl(var(--accent))" />
          </linearGradient>
        </defs>
      </svg>

    </motion.div>
  );
}
