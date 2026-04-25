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
    }, 2500); // Animation duration + a small buffer

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
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#07090F] text-white overflow-hidden"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit" 
    >
      <div 
        className="absolute inset-0 opacity-[0.1]" 
        style={{ 
          backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', 
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(circle at center, black, transparent 80%)'
        }} 
      />
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
        className="text-4xl sm:text-5xl md:text-7xl font-display italic mb-3 text-white"
        variants={textVariants}
      >
        Medico <span className="text-teal-400">Study Hub</span>
      </motion.h1>
      
      <motion.p 
        className="text-sm sm:text-base md:text-lg text-zinc-400 font-light tracking-widest uppercase"
        variants={textVariants}
        initial={{ opacity: 0, y:15 }}
        animate={{ opacity: 1, y:0, transition: {delay: 0.9, duration: 0.7}}}
      >
        Loading Your Learning Tools...
      </motion.p>

      {/* Agentic Pulse Network */}
      <div className="absolute bottom-12 w-full max-w-sm px-8">
        <div className="relative h-1 bg-white/5 rounded-full overflow-hidden">
          <motion.div 
            initial={{ left: "-100%" }}
            animate={{ left: "100%" }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute top-0 bottom-0 w-1/2 bg-gradient-to-r from-transparent via-teal-500 to-transparent"
          />
        </div>
        <div className="mt-2 flex justify-between">
          <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity }} className="text-[8px] font-bold tracking-[0.2em] text-teal-400">CONNECTING SUB-AGENTS</motion.div>
          <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }} className="text-[8px] font-bold tracking-[0.2em] text-teal-400">SYNCHRONIZING LIBRARY</motion.div>
          <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity, delay: 1 }} className="text-[8px] font-bold tracking-[0.2em] text-teal-400">VERIFYING CLINICAL DATA</motion.div>
        </div>
      </div>

    </motion.div>
  );
}
