// src/components/welcome/welcome-display.tsx
"use client";

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';
import { Logo } from '@/components/logo'; // Import the main Logo component
import { AnimatedTagline } from '@/components/layout/animated-tagline'; // Import AnimatedTagline

interface WelcomeDisplayProps {
  onDisplayComplete: () => void;
}

const WelcomeDisplay: React.FC<WelcomeDisplayProps> = ({ onDisplayComplete }) => {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    const displayTimer = setTimeout(() => {
      onDisplayComplete();
    }, 4800); // Adjusted total duration for the welcome screen

    return () => clearTimeout(displayTimer);
  }, [onDisplayComplete]);

  if (!hasMounted) {
    return (
      <div
        className="simple-welcome-screen"
        style={{ opacity: 0 }} // Start invisible to prevent flash of unstyled content
        onClick={onDisplayComplete}
      />
    );
  }

  // Framer Motion Variants
  const screenVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5, ease: "easeInOut" } },
    exit: { opacity: 0, transition: { duration: 0.5, delay: 0.3,  ease: "easeInOut" } }
  };

  const logoContainerVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.7, ease: [0.25, 1, 0.5, 1], delay: 0.3 }
    }
  };

  const taglineVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut", delay: 0.8 } // Delay after logo
    }
  };

  const setupMessageVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { delay: 1.3, duration: 0.6, ease: "easeOut" } } // After tagline
  };
  
  const continueHintVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { delay: 2.0, duration: 0.5, ease: "easeOut" } } // After setup message
  };


  return (
    <motion.div
      className="simple-welcome-screen" // Styled by globals.css for background
      variants={screenVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      onClick={onDisplayComplete} // Click anywhere to skip/continue
    >
      <motion.div variants={logoContainerVariants} className="mb-3 sm:mb-4">
        <Logo simple={false} /> {/* Using the main Logo component, not simple for prominence */}
      </motion.div>

      <motion.div variants={taglineVariants}>
        {/* Using the existing AnimatedTagline component which has its own internal animations */}
        <AnimatedTagline className="simple-welcome-tagline" />
      </motion.div>

      <motion.p
        variants={setupMessageVariants}
        className="mt-4 text-center text-sm text-muted-foreground/90 max-w-xs px-4"
      >
        You&apos;re all set! Explore the features and enjoy MediAssistant.
      </motion.p>

      <motion.div
        variants={continueHintVariants}
        className="absolute bottom-8 text-xs text-muted-foreground/80 flex items-center gap-1 z-20"
      >
        Tap to continue <ArrowRight size={14} />
      </motion.div>
    </motion.div>
  );
};

export default WelcomeDisplay;
