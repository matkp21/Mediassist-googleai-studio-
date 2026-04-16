// src/components/medico/medico-hub-animation.tsx
"use client";

import type { CSSProperties } from 'react';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookHeart, GraduationCap } from 'lucide-react'; 

interface MedicoHubAnimationProps {
  onAnimationComplete: () => void;
}

export function MedicoHubAnimation({ onAnimationComplete }: MedicoHubAnimationProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onAnimationComplete();
    }, 3500); // Animation duration + a small buffer

    return () => clearTimeout(timer);
  }, [onAnimationComplete]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.5 }
    },
    exit: { 
      opacity: 0,
      transition: { duration: 0.5, delay: 3 } 
    }
  };

  const itemVariants = {
    hidden: { scale: 0.5, opacity: 0, rotate: -15 },
    visible: {
      scale: 1,
      opacity: 1,
      rotate: 0,
      transition: { delay: 0.3, duration: 0.9, type: "spring", stiffness: 120, damping: 10 }
    },
  };
  
  const textVariants = {
    hidden: { y: 25, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { delay: 0.7, duration: 0.8, ease: "easeOut" }
    },
  };

  const lineVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: (i: number) => ({
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { delay: 1.2 + i * 0.2, type: "tween", duration: 1.2, ease: "circOut" },
        opacity: { delay: 1.2 + i * 0.2, duration: 0.01 }
      }
    })
  };


  return (
    <motion.div
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-gradient-to-br from-sky-800 via-teal-800 to-sky-900 text-white overflow-hidden"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit" 
    >
      <motion.div variants={itemVariants} className="relative">
        <BookHeart 
            className="h-20 w-20 sm:h-24 sm:w-24 text-sky-300 mb-6 opacity-90 animate-pulse-medical" 
            style={{
                "--medical-pulse-scale-peak": "1.1", 
                "--medical-pulse-opacity-peak": "0.7",
                animationDuration: '2.2s'
            } as CSSProperties}
        />
         <GraduationCap 
            className="absolute -bottom-2 -right-3 h-10 w-10 text-teal-300 opacity-80 transform rotate-12"
        />
      </motion.div>
      
      <motion.h1 
        className="text-4xl sm:text-5xl md:text-6xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-sky-200 via-teal-300 to-cyan-200"
        variants={textVariants}
        style={{ animation: "gradient-flow 8s ease infinite alternate", backgroundSize: "200% 200%" }}
      >
        Medico Study Hub
      </motion.h1>
      
      <motion.p 
        className="text-md sm:text-lg md:text-xl text-sky-100/90"
        variants={textVariants}
        initial={{ opacity: 0, y:15 }}
        animate={{ opacity: 1, y:0, transition: {delay: 0.9, duration: 0.7}}}
      >
        Loading Your Learning Tools...
      </motion.p>

      <svg 
        width="80%" 
        style={{ maxWidth: '350px' }} 
        height="80" 
        viewBox="0 0 300 80" 
        className="absolute bottom-12 opacity-30"
      >
        {/* Simulating stacked books or notes */}
        <motion.rect x="0" y="40" width="300" height="15" rx="3" fill="url(#medicoLineGradient)" variants={lineVariants} custom={0} />
        <motion.rect x="20" y="20" width="260" height="15" rx="3" fill="url(#medicoLineGradient)" variants={lineVariants} custom={1} />
        <motion.rect x="40" y="0" width="220" height="15" rx="3" fill="url(#medicoLineGradient)" variants={lineVariants} custom={2} />
        <defs>
            <linearGradient id="medicoLineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{stopColor: "hsl(var(--sidebar-accent)/0.8)", stopOpacity:1}} />
            <stop offset="50%" style={{stopColor: "hsl(var(--sidebar-primary)/0.8)", stopOpacity:1}} />
            <stop offset="100%" style={{stopColor: "hsl(var(--sidebar-accent)/0.8)", stopOpacity:1}} />
            </linearGradient>
        </defs>
      </svg>

    </motion.div>
  );
}
