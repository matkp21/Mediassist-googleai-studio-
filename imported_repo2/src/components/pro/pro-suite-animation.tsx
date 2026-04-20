// src/components/pro/pro-suite-animation.tsx
"use client";

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { BriefcaseMedical } from 'lucide-react'; 
import type { CSSProperties } from 'react';

interface ProSuiteAnimationProps {
  onAnimationComplete: () => void;
}

export function ProSuiteAnimation({ onAnimationComplete }: ProSuiteAnimationProps) {
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
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { delay: 0.4, duration: 0.8, type: "spring", stiffness: 100 }
    },
  };
  
  const textVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { delay: 0.8, duration: 0.7 }
    },
  };

  const lineVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { delay: 1.2, type: "tween", duration: 1.5, ease: "easeInOut" },
        opacity: { delay: 1.2, duration: 0.01 }
      }
    }
  };


  return (
    <motion.div
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 text-white overflow-hidden"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit" 
    >
      <motion.div variants={itemVariants}>
        <BriefcaseMedical 
            className="h-20 w-20 sm:h-24 sm:w-24 text-purple-400 mb-6 animate-pulse-medical" 
            style={{
                "--medical-pulse-scale-peak": "1.15", 
                "--medical-pulse-opacity-peak": "0.6",
                animationDuration: '2s'
            } as CSSProperties}
        />
      </motion.div>
      
      <motion.h1 
        className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-400 to-orange-300"
        variants={textVariants}
        style={{ animation: "gradient-flow 8s ease infinite alternate", backgroundSize: "250% 250%" }}
      >
        Clinical Suite
      </motion.h1>
      
      <motion.p 
        className="text-md sm:text-lg md:text-xl text-slate-300/90"
        variants={textVariants}
        initial={{ opacity: 0, y:10 }}
        animate={{ opacity: 1, y:0, transition: {delay: 1.0, duration: 0.6}}}
      >
        Initializing Advanced Tools...
      </motion.p>

      <svg 
        width="90%" 
        style={{ maxWidth: '400px' }} 
        height="100" 
        viewBox="0 0 300 100" 
        className="absolute bottom-10 opacity-25"
      >
        <motion.path
          d="M0 50 Q 75 10, 150 50 T 300 50"
          fill="transparent"
          stroke="url(#proSuiteLineGradient)"
          strokeWidth="2.5"
          variants={lineVariants}
        />
        <defs>
            <linearGradient id="proSuiteLineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{stopColor: "hsl(var(--primary)/0.7)", stopOpacity:1}} />
            <stop offset="50%" style={{stopColor: "hsl(var(--accent)/0.7)", stopOpacity:1}} />
            <stop offset="100%" style={{stopColor: "hsl(var(--primary)/0.7)", stopOpacity:1}} />
            </linearGradient>
        </defs>
      </svg>

    </motion.div>
  );
}
