"use client";

import React, { useState, useEffect, useRef } from "react";

const CATEGORIES = [
  {
    id: "A",
    label: "Core Chat Workspace",
    color: "#00d4ff",
    icon: "⚡",
    features: [
      { id: 1, name: "Chat Mode", code: "import { genkit } from 'genkit';\n// Unified conversation with selectable tools." },
      { id: 2, name: "Deep Solve Mode", code: "// Multi-agent: Plan → Investigate → Solve → Verify." },
      { id: 3, name: "Quiz Generation", code: "// Generate assessments from Knowledge Base." },
      { id: 4, name: "Deep Research", code: "// Parallel agents across RAG, Web, and Academic papers." },
      { id: 5, name: "Math Animator", code: "// Visual explainers via Manim/SVG." },
      { id: 6, name: "Visualize Mode", code: "// Concept visualization via Mermaid.js." }
    ]
  },
  {
    id: "B",
    label: "Chat Tools",
    color: "#a78bfa",
    icon: "🔧",
    features: [
      { id: 7, name: "RAG Retrieval", code: "// Vector search over personalized KB." },
      { id: 8, name: "Web Search", code: "// Real-time ground via Tavily/Google." },
      { id: 9, name: "Code Execution", code: "// Inline Python/JS execution." },
      { id: 10, name: "Deep Reasoning", code: "// Chain-of-thought analysis." },
      { id: 11, name: "Brainstorming", code: "ai.generate({ system: 'Divergent idea mode' });" },
      { id: 12, name: "Paper Search", code: "// PubMed/ArXiv search tool." }
    ]
  },
  {
    id: "C",
    label: "Co-Writer & Editor",
    color: "#34d399",
    icon: "✍️",
    features: [
      { id: 13, name: "Markdown Editor", code: "// Tiptap-powered multi-document editor." },
      { id: 14, name: "AI Rewrite", code: "// Select text → AI rewrite (polished/technical)." },
      { id: 15, name: "AI Expand", code: "// Selection-based text elaboration." },
      { id: 16, name: "AI Shorten", code: "// Selection-based condensation." },
      { id: 17, name: "Undo System", code: "// Full non-destructive editing history." },
      { id: 18, name: "Save to Notebook", code: "// Persistent storage for editor segments." },
      { id: 19, name: "Scroll Sync", code: "// Sync between editor and live preview." }
    ]
  },
  {
    id: "D",
    label: "Guided Learning",
    color: "#fbbf24",
    icon: "📚",
    features: [
      { id: 20, name: "Learning Planner", code: "// designs 3-5 step progression." },
      { id: 21, name: "Interactive Pages", code: "// Rich visual page per learning step." },
      { id: 22, name: "Step Q&A", code: "// In-context chat during study." },
      { id: 23, name: "Progress Summary", code: "// Digest upon finishing a unit." },
      { id: 24, name: "Persistence", code: "// Resume study sessions anytime." },
      { id: 25, name: "Book Engine (5 steps)", code: "// Ideation → Source → Spine → Page → Block." },
      { id: 30, name: "Living Book", code: "// Dynamic interactive books with quizzes." }
    ]
  },
  {
    id: "E",
    label: "Knowledge Hub",
    color: "#f87171",
    icon: "🗃️",
    features: [
      { id: 31, name: "KB Creation", code: "// Indexing PDF/TXT/Markdown." },
      { id: 32, name: "Inc. Upload", code: "// Adding to existing KBs." },
      { id: 33, name: "LlamaIndex", code: "// Vector-based standard pipeline." },
      { id: 34, name: "LightRAG", code: "// Knowledge graph pipeline." },
      { id: 35, name: "RAG-Anything", code: "// Multimodal graph/academic." },
      { id: 37, name: "Notebooks", code: "// Categorized, color-coded records." }
    ]
  },
  {
    id: "F",
    label: "Memory System",
    color: "#e879f9",
    icon: "🧠",
    features: [
      { id: 40, name: "Summary Memory", code: "// Digest of learning progress." },
      { id: 41, name: "Profile Memory", code: "// Preferences/goals/style." },
      { id: 42, name: "Shared Memory", code: "// Cross-feature knowledge layer." },
      { id: 43, name: "Memory Reset", code: "// Delete session or long-term memory." }
    ]
  },
  {
    id: "G",
    label: "TutorBot",
    color: "#60a5fa",
    icon: "🤖",
    features: [
      { id: 44, name: "TutorBot System", code: "// Named autonomous tutor instances." },
      { id: 45, name: "Soul Templates", code: "// Personalities/teaching philosophy." },
      { id: 47, name: "Heartbeat", code: "// Proactive FCM check-ins." },
      { id: 49, name: "Teams", code: "// Multi-agent orchestration." },
      { id: 50, name: "Telegram Bot", code: "// Telegram integration." },
      { id: 51, name: "Email Channel", code: "// Email study nudges." }
    ]
  },
  {
    id: "I",
    label: "Infrastructure",
    color: "#9ca3af",
    icon: "⚙️",
    features: [
      { id: 62, name: "Multi-LLM", code: "// OpenAI/Gemini/Anthropic/Local." },
      { id: 71, name: "i18n", code: "// Multilingual UI (10 languages)." },
      { id: 72, name: "TTS", code: "// Text-to-Speech support." },
      { id: 74, name: "JSON Repair", code: "// Robust error handling for malformed LLM outputs." }
    ]
  }
];

function highlight(code: string): string {
  return code
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    // Fix: Properly escaped forward slashes for JavaScript single-line comments
    .replace(/(\/\/[^\n]*)/g, '<span style="color:#6a9955;font-style:italic">$1</span>')
    // Fix: Properly escaped block comments
    .replace(/(\/\*[\s\S]*?\*\/)/g, '<span style="color:#6a9955;font-style:italic">$1</span>')
    // Fix: Properly escaped double quotes and backslashes
    .replace(/("(?:[^"\\]|\\.)*")/g, '<span style="color:#ce9178">$1</span>')
    // Fix: Properly escaped backticks for template literals
    .replace(/(`(?:[^`\\]|\\.)*`)/g, '<span style="color:#ce9178">$1</span>')
    // Standard keywords (unchanged, these were fine)
    .replace(/\b(const|let|var|async|await|return|export|import|from|type|interface|extends|implements|new|if|else|switch|case|default|for|while|of|in|true|false|null|undefined|void|class|function|try|catch|throw|break|continue|static|readonly|as|typeof|keyof)\b/g, '<span style="color:#569cd6">$1</span>')
    // Specific types
    .replace(/\b(string|number|boolean|Array|Record|Promise|Buffer|Map|Set|Error|Date)\b/g, '<span style="color:#4ec9b0">$1</span>')
    // Genkit & Firebase specific keywords
    .replace(/\b(z|ai|db|genkit|defineFlow|defineTool|generate|getFirestore|collection|doc|set|get|update|delete|batch|FieldValue)\b/g, '<span style="color:#4ec9b0">$1</span>')
    // Capitalized classes/components
    .replace(/\b([A-Z][A-Za-z]+)(?=[\s<(])/g, '<span style="color:#4ec9b0">$1</span>');
}

export default function App() {
  const [selectedCat, setSelectedCat]  = useState("A");
  const [selectedFeat, setSelectedFeat] = useState(1);
  const codeRef = useRef<HTMLPreElement>(null);

  const currentCat  = CATEGORIES.find((c) => c.id === selectedCat)!;
  const currentFeat = currentCat.features.find((f) => f.id === selectedFeat) ?? currentCat.features[0];

  useEffect(() => {
    if (codeRef.current) {
      codeRef.current.innerHTML = highlight(currentFeat.code);
    }
  }, [currentFeat]);

  return (
    <div style={{ background: "#0d1117", color: "#c9d1d9", height: "100vh", display: "flex", flexDirection: "column", fontFamily: "monospace" }}>
      <div style={{ background: "#161b22", padding: "10px 20px", borderBottom: "1px solid #30363d", display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontWeight: "bold" }}>🏥 MediAssistant Gallery</span>
        <span style={{ fontSize: 12, opacity: 0.6 }}>75 Features Checklist</span>
      </div>
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <div style={{ width: 250, borderRight: "1px solid #30363d", overflowY: "auto", background: "#161b22" }}>
           {CATEGORIES.map(cat => (
             <div key={cat.id}>
               <button onClick={() => setSelectedCat(cat.id)} style={{ width: "100%", textAlign: "left", padding: "8px 15px", background: selectedCat === cat.id ? "#1f2937" : "transparent", border: "none", color: "inherit", cursor: "pointer", borderLeft: selectedCat === cat.id ? `3px solid ${cat.color}` : "3px solid transparent" }}>
                 {cat.icon} {cat.label}
               </button>
               {selectedCat === cat.id && cat.features.map(f => (
                 <button key={f.id} onClick={() => setSelectedFeat(f.id)} style={{ width: "100%", textAlign: "left", padding: "5px 15px 5px 35px", background: selectedFeat === f.id ? "#30363d" : "transparent", border: "none", color: selectedFeat === f.id ? "#fff" : "#8b949e", fontSize: 12, cursor: "pointer" }}>
                   #{f.id} {f.name}
                 </button>
               ))}
             </div>
           ))}
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <div style={{ padding: 15, borderBottom: "1px solid #30363d", fontWeight: "bold" }}>
             {currentFeat.name}
          </div>
          <pre ref={codeRef} style={{ margin: 0, padding: 20, flex: 1, overflow: "auto", whiteSpace: "pre-wrap" }} />
        </div>
      </div>
    </div>
  );
}
