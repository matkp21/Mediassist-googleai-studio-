"use client";

import React from "react";
import { motion, AnimatePresence } from "motion/react";

/**
 * FEATURE 21: Interactive HTML Page per Step
 * Renders learning steps with animations and rich content.
 */
interface StepPageProps {
  step: {
    title: string;
    content: string;
    visualData?: any; // e.g. Mermaid diagram or chart data
  };
  isActive: boolean;
}

export function LearningStepPage({ step, isActive }: StepPageProps) {
  return (
    <AnimatePresence mode="wait">
      {isActive && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="p-8 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl"
        >
          <header className="mb-6">
            <h2 className="text-3xl font-bold text-sky-400 mb-2">{step.title}</h2>
            <div className="h-1 w-20 bg-sky-500 rounded-full" />
          </header>
          
          <article className="prose prose-invert max-w-none mb-8">
            <p className="text-lg leading-relaxed text-slate-300">
              {step.content}
            </p>
          </article>

          {step.visualData && (
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-6 p-4 bg-slate-800 rounded-lg overflow-hidden border border-slate-700"
            >
              {/* Placeholder for Mermaid/D3 rendering logic */}
              <div className="flex items-center justify-center h-48 italic text-slate-500">
                Visualizing concepts: {JSON.stringify(step.visualData)}
              </div>
            </motion.div>
          )}

          <footer className="mt-10 flex justify-between items-center text-sm text-slate-500 border-t border-slate-800 pt-6">
            <span>Module: Clinical Reasoning</span>
            <span>Duration: ~10 mins</span>
          </footer>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
