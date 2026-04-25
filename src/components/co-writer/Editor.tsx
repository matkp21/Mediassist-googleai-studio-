"use client";

import React, { useState } from "react";
import { useEditor, EditorContent, BubbleMenu } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { 
  Type, 
  Sparkles, 
  AlignLeft, 
  ChevronDown, 
  Save, 
  Trash2,
  Maximize2,
  Minimize2
} from "lucide-react";

/**
 * FEATURE 13-16: Co-Writer (AI Document Editor)
 * Implementation of a multi-document editor with AI transformation tools.
 */

export default function CoWriter() {
  const [activeDoc, setActiveDoc] = useState("untitled-1");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const editor = useEditor({
    extensions: [StarterKit],
    content: `<h1>Clinical Impression: Patient X</h1><p>Patient presents with persistent cough and low-grade fever...</p>`,
    editorProps: {
      attributes: {
        class: "prose prose-invert max-w-none focus:outline-none min-h-[500px] p-8",
      },
    },
  });

  const handleAiAction = (action: "rewrite" | "expand" | "shorten") => {
    if (!editor) return;
    const { from, to } = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(from, to, " ");
    
    if (!selectedText) {
      alert("Please select some text first!");
      return;
    }

    // Simulate AI Action (In production, call Genkit flow)
    console.log(`AI Action: ${action} on "${selectedText}"`);
    
    // Placeholder replacement
    const replacement = `[AI ${action.toUpperCase()}D]: ${selectedText}`;
    editor.chain().focus().insertContentAt({ from, to }, replacement).run();
  };

  return (
    <div className="flex h-full bg-[#0d1117] text-[#c9d1d9] border border-[#30363d] rounded-lg overflow-hidden">
      {/* Document Sidebar (Feature 13) */}
      {isSidebarOpen && (
        <aside className="w-64 border-r border-[#30363d] bg-[#161b22] flex flex-col">
          <div className="p-4 border-bottom border-[#30363d] flex justify-between items-center">
            <span className="font-bold text-sm">Documents</span>
            <button className="p-1 hover:bg-[#30363d] rounded">
              <Maximize2 size={14} />
            </button>
          </div>
          <div className="flex-1 overflow-auto p-2">
            {["untitled-1", "case-notes", "research-draft"].map(doc => (
              <button 
                key={doc}
                onClick={() => setActiveDoc(doc)}
                className={`w-full text-left p-2 rounded text-sm mb-1 ${activeDoc === doc ? "bg-sky-900/50 text-sky-400" : "hover:bg-[#30363d]"}`}
              >
                {doc}.md
              </button>
            ))}
          </div>
        </aside>
      )}

      {/* Editor Main */}
      <main className="flex-1 flex flex-col relative">
        <div className="h-12 border-b border-[#30363d] bg-[#161b22] flex items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-1 hover:bg-[#30363d] rounded text-slate-400"
            >
              <AlignLeft size={18} />
            </button>
            <span className="text-sm font-medium">{activeDoc}.md</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1 px-3 py-1 bg-sky-600 hover:bg-sky-700 text-white text-xs rounded transition-colors">
              <Save size={14} />
              Save
            </button>
            <button className="p-1 hover:bg-red-900/50 text-red-500 rounded">
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {editor && (
          <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
            <div className="flex bg-[#161b22] border border-[#30363d] rounded-lg shadow-xl overflow-hidden divide-x divide-[#30363d]">
              <button 
                onClick={() => handleAiAction("rewrite")}
                className="px-3 py-2 hover:bg-[#30363d] flex items-center gap-1.5 text-xs text-sky-400"
              >
                <Sparkles size={14} /> Rewrite
              </button>
              <button 
                onClick={() => handleAiAction("expand")}
                className="px-3 py-2 hover:bg-[#30363d] text-xs"
              >
                Expand
              </button>
              <button 
                onClick={() => handleAiAction("shorten")}
                className="px-3 py-2 hover:bg-[#30363d] text-xs"
              >
                Shorten
              </button>
            </div>
          </BubbleMenu>
        )}

        <div className="flex-1 overflow-auto bg-[#0d1117] relative">
           <EditorContent editor={editor} />
        </div>

        {/* Footer Info */}
        <div className="h-8 border-t border-[#30363d] bg-[#161b22] flex items-center px-4 text-[10px] text-slate-500 justify-between">
           <div className="flex gap-4">
             <span>Words: 124</span>
             <span>Characters: 842</span>
           </div>
           <div className="flex items-center gap-1">
             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
             AI Writing Assistant: Active
           </div>
        </div>
      </main>
    </div>
  );
}
