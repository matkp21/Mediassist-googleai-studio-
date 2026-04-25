"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { BookOpen, HelpCircle, MessageSquare, ChevronRight, ChevronLeft } from "lucide-react";

/**
 * FEATURE 30: Living Book
 * Interactive interactive books with read/quiz/discuss modes.
 */

interface PageBlock {
  type: "text" | "image" | "quote" | "diagram";
  content: string;
}

interface BookPage {
  id: string;
  title: string;
  blocks: PageBlock[];
}

export default function LivingBook({ pages }: { pages: BookPage[] }) {
  const [currentPageIdx, setCurrentPageIdx] = useState(0);
  const [mode, setMode] = useState<"read" | "quiz" | "discuss">("read");

  const currentPage = pages[currentPageIdx];

  return (
    <div className="flex flex-col h-full bg-[#0d1117] text-slate-300">
      {/* Header Tabs */}
      <div className="flex border-b border-slate-800 bg-[#161b22]">
        {(["read", "quiz", "discuss"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 flex items-center justify-center gap-2 ${
              mode === m ? "border-sky-500 text-sky-400 bg-sky-950/20" : "border-transparent text-slate-500 hover:text-slate-300"
            }`}
          >
            {m === "read" && <BookOpen size={14} />}
            {m === "quiz" && <HelpCircle size={14} />}
            {m === "discuss" && <MessageSquare size={14} />}
            {m}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto p-10 bg-[#0d1117]">
        <AnimatePresence mode="wait">
          {mode === "read" && (
            <motion.div
              key="read"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-2xl mx-auto"
            >
              <h1 className="text-4xl font-serif font-bold text-white mb-8 border-b border-slate-800 pb-4">
                {currentPage.title}
              </h1>
              <div className="space-y-6">
                {currentPage.blocks.map((block, idx) => (
                  <div key={idx} className="leading-relaxed text-lg text-slate-400">
                    {block.type === "text" && <p>{block.content}</p>}
                    {block.type === "quote" && (
                      <blockquote className="border-l-4 border-sky-500 pl-4 py-2 italic bg-sky-950/10 text-sky-200">
                        {block.content}
                      </blockquote>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {mode === "quiz" && (
            <motion.div
              key="quiz"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="max-w-xl mx-auto pt-10"
            >
              <div className="p-6 bg-[#161b22] border border-slate-800 rounded-xl shadow-2xl">
                <h3 className="text-xl font-bold mb-6 text-sky-400">Knowledge Check: {currentPage.title}</h3>
                <p className="mb-4">Based on the reading above, which clinical finding is most pathognomonic for this condition?</p>
                <div className="space-y-3">
                  {["A. Fever > 38°C", "B. Distant heart sounds", "C. Peripheral edema", "D. Pulmonary crackles"].map((opt) => (
                    <button key={opt} className="w-full text-left p-4 rounded-lg bg-slate-900 border border-slate-800 hover:border-sky-500 transition-colors">
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {mode === "discuss" && (
            <div className="h-full flex items-center justify-center italic text-slate-600">
              [Dr. Mat is joining the conversation about this chapter...]
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="p-4 border-t border-slate-800 bg-[#161b22] flex justify-between items-center">
        <button 
          disabled={currentPageIdx === 0}
          onClick={() => setCurrentPageIdx(p => p - 1)}
          className="flex items-center gap-2 text-sm disabled:opacity-30 hover:text-sky-400 transition-colors"
        >
          <ChevronLeft size={16} /> Previous Page
        </button>
        <span className="text-xs text-slate-500 font-mono">PAGE {currentPageIdx + 1} OF {pages.length}</span>
        <button 
          disabled={currentPageIdx === pages.length - 1}
          onClick={() => setCurrentPageIdx(p => p + 1)}
          className="flex items-center gap-2 text-sm disabled:opacity-30 hover:text-sky-400 transition-colors"
        >
          Next Page <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
