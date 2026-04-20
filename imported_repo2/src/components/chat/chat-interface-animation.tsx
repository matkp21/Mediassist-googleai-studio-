// src/components/chat/chat-interface-animation.tsx
"use client";

import type { CSSProperties } from 'react';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { HeartPulse } from 'lucide-react';

interface ChatInterfaceAnimationProps {
  onAnimationComplete: () => void;
}

export function ChatInterfaceAnimation({ onAnimationComplete }: ChatInterfaceAnimationProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onAnimationComplete();
    }, 3800); // Total animation duration

    return () => clearTimeout(timer);
  }, [onAnimationComplete]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.4, ease: "circOut" }
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.4, ease: "circIn", delay: 3.4 } // Delay matches total sequence
    }
  };

  const iconContainerVariants = {
    hidden: { opacity: 0, scale: 0.5 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { delay: 0.2, duration: 0.7, type: "spring", stiffness: 150, damping: 15 }
    },
  };
  
  const iconPulseVariants = {
    pulse: {
      scale: [1, 1.15, 1],
      opacity: [0.8, 1, 0.8],
      transition: {
        duration: 1.8,
        ease: "easeInOut",
        repeat: Infinity,
      }
    }
  };

  const mainTitleContainerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.08, // Stagger for each letter/word
        delayChildren: 0.7, // Delay after icon
      }
    }
  };

  const mainTitleLetterVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, type: "spring", stiffness:100, damping:12 }
    }
  };

  const subtitleVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { delay: 1.5, duration: 0.6, ease: "easeOut" } // After main title
    },
  };

  const statusTextVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { delay: 1.9, duration: 0.7, ease: "easeOut" } // After subtitle
    },
  };
  
  const mainTitleText = "MediAssistant";

  return (
    <motion.div
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-gradient-to-br from-blue-800 via-teal-800 to-sky-900 text-white overflow-hidden p-4 chat-loading-bg-animated chat-interface-animation"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <motion.div variants={iconContainerVariants} className="mb-5">
        <motion.div variants={iconPulseVariants} animate="pulse">
            <HeartPulse
                className="h-20 w-20 sm:h-24 sm:w-24 text-sky-300 opacity-90"
                style={{
                    filter: 'drop-shadow(0 0 15px hsl(195, 80%, 70%, 0.7)) drop-shadow(0 0 8px hsl(180, 70%, 60%, 0.5))',
                } as CSSProperties}
            />
        </motion.div>
      </motion.div>

      <motion.h1
        className="text-4xl sm:text-5xl md:text-6xl font-bold text-center mb-1"
        variants={mainTitleContainerVariants}
        style={{
          filter: 'drop-shadow(0 2px 8px rgba(125, 211, 252, 0.2)) drop-shadow(0 0 10px rgba(100, 230, 250, 0.2))',
          backgroundImage: 'linear-gradient(120deg, #00ffff, #3be9d8, #00ffff)',
          backgroundSize: '200% auto',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          color: 'transparent',
          animation: 'ribbon-slide 3s ease-in-out forwards',
        }}
      >
        {mainTitleText.split("").map((char, index) => (
          <motion.span key={index} variants={mainTitleLetterVariants} className="inline-block">
            {char}
          </motion.span>
        ))}
      </motion.h1>

      <motion.p
        className="text-xl sm:text-2xl text-sky-200/90 text-center font-medium mb-8"
        variants={subtitleVariants} 
      >
        Chat
      </motion.p>

      <motion.div
        className="text-sm sm:text-base text-sky-100/80 text-center flex items-center"
        variants={statusTextVariants} 
      >
        Connecting
        <span className="inline-block ml-1">
            <span className="animate-pulse-dot-light delay-0 inline-block w-1.5 h-1.5 bg-sky-100 rounded-full"></span>
            <span className="animate-pulse-dot-light delay-150 inline-block w-1.5 h-1.5 bg-sky-100 rounded-full ml-0.5"></span>
            <span className="animate-pulse-dot-light delay-300 inline-block w-1.5 h-1.5 bg-sky-100 rounded-full ml-0.5"></span>
        </span>
      </motion.div>

    </motion.div>
  );
}
