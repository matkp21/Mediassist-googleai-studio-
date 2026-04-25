"use client";

import { useEditor, EditorContent, BubbleMenu } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import BubbleMenuExtension from "@tiptap/extension-bubble-menu";
import { useState, useCallback, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Wand2, BookOpen, Scissors, Save, X, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { doc, setDoc, serverTimestamp, collection, getDocs, addDoc, query, orderBy, increment, updateDoc } from "firebase/firestore";
import { firestore as db } from "@/lib/firebase";

export type NotebookColor = "emerald" | "sky" | "rose" | "amber" | "violet" | "teal";
export type RecordType = "note" | "chat" | "mcq" | "research" | "case" | "flashcard";

const COLOR_MAP: Record<NotebookColor, { bg: string; border: string; text: string }> = {
  emerald: { bg: "#064e3b", border: "#34d399", text: "#6ee7b7" },
  sky:     { bg: "#0c4a6e", border: "#38bdf8", text: "#7dd3fc" },
  rose:    { bg: "#4c0519", border: "#fb7185", text: "#fda4af" },
  amber:   { bg: "#451a03", border: "#fbbf24", text: "#fcd34d" },
  violet:  { bg: "#2e1065", border: "#a78bfa", text: "#c4b5fd" },
  teal:    { bg: "#042f2e", border: "#2dd4bf", text: "#5eead4" },
};

interface MediNotebook {
  notebookId: string;
  name: string;
  color: NotebookColor;
  recordCount: number;
}

export default function CoWriterEditor({ uid, docId }: { uid: string; docId: string }) {
  const [showNotebookPicker, setShowNotebookPicker] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [notebooks, setNotebooks] = useState<MediNotebook[]>([]);
  const [nbLoading, setNbLoading] = useState(false);
  const [savingToNb, setSavingToNb] = useState<string | null>(null);
  const { toast } = useToast();

  const editor = useEditor({
    extensions: [
      StarterKit,
      BubbleMenuExtension.configure({
        element: null, // will be handled by the BubbleMenu component
      }),
    ],
    content: "<p>Start writing your medical document...</p>",
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[500px] p-4 text-white',
      },
    },
  });

  const getSelectedText = () => {
    if (!editor) return "";
    const { from, to } = editor.state.selection;
    return editor.state.doc.textBetween(from, to).trim();
  };

  const applyAIAction = useCallback(async (action: "rewrite" | "expand" | "shorten") => {
    const selected = getSelectedText();
    if (!selected || !editor) {
      toast({ title: "No text selected", description: "Please highlight some text to use AI actions.", variant: "destructive" });
      return;
    }
    
    setAiLoading(true);
    try {
      const response = await fetch('/api/co-write/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: selected, action }),
      });
      
      const data = await response.json();
      if (data.result) {
        editor.chain().focus().insertContent(data.result).run();
      }
    } catch (err) {
      console.error(err);
      toast({ title: "AI Action Failed", description: "Failed to process text synthesis.", variant: "destructive" });
    } finally {
      setAiLoading(false);
    }
  }, [editor, toast]);

  const loadNotebooks = async () => {
    setNbLoading(true);
    try {
      const q = query(collection(db, "users", uid, "notebooks"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setNotebooks(snap.docs.map(d => ({ notebookId: d.id, ...d.data() } as MediNotebook)));
    } catch (err) {
      console.error(err);
    } finally {
      setNbLoading(false);
    }
  };

  useEffect(() => {
    if (showNotebookPicker) loadNotebooks();
  }, [showNotebookPicker]);

  const saveToNotebook = async (notebookId: string) => {
    const content = getSelectedText() || editor?.getHTML() || "";
    if (!content) return;

    setSavingToNb(notebookId);
    try {
      // Get title
      const titleRes = await fetch('/api/co-write/title', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: content.slice(0, 500) }),
      });
      const { title } = await titleRes.json();

      // Save record
      await addDoc(collection(db, "users", uid, "notebooks", notebookId, "records"), {
        type: "note",
        title: title || "Untitled Note",
        content,
        sourceFeature: "co-writer",
        tags: [],
        createdAt: serverTimestamp(),
      });

      // Update count
      await updateDoc(doc(db, "users", uid, "notebooks", notebookId), {
        recordCount: increment(1)
      });

      toast({ title: "Saved to Notebook", description: `Saved as "${title}"` });
      setShowNotebookPicker(false);
    } catch (err) {
      console.error(err);
      toast({ title: "Save Failed", description: "Failed to save record to notebook.", variant: "destructive" });
    } finally {
      setSavingToNb(null);
    }
  };

  if (!editor) return null;

  return (
    <div className="relative w-full max-w-4xl mx-auto space-y-4">
      <div className="flex justify-between items-center bg-zinc-900/50 p-2 rounded-t-lg border-b border-zinc-800">
        <div className="flex gap-2">
           <Button variant="ghost" size="sm" onClick={() => setShowNotebookPicker(true)} className="text-teal-400 hover:text-teal-300">
             <Save className="w-4 h-4 mr-2" /> Save to Notebook
           </Button>
        </div>
      </div>

      <div className="bg-zinc-950 border border-zinc-800 rounded-b-lg shadow-2xl relative">
        <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
          <div className="flex bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl overflow-hidden">
            <button 
              onClick={() => applyAIAction("rewrite")}
              disabled={aiLoading}
              className="px-3 py-1.5 text-xs font-medium hover:bg-zinc-800 text-blue-400 transition-colors flex items-center gap-1"
            >
              <Wand2 className="w-3 h-3" /> Rewrite
            </button>
            <button 
              onClick={() => applyAIAction("expand")}
              disabled={aiLoading}
              className="px-3 py-1.5 text-xs font-medium hover:bg-zinc-800 text-teal-400 border-l border-zinc-700 transition-colors flex items-center gap-1"
            >
              <BookOpen className="w-3 h-3" /> Expand
            </button>
            <button 
              onClick={() => applyAIAction("shorten")}
              disabled={aiLoading}
              className="px-3 py-1.5 text-xs font-medium hover:bg-zinc-800 text-amber-400 border-l border-zinc-700 transition-colors flex items-center gap-1"
            >
              <Scissors className="w-3 h-3" /> Shorten
            </button>
          </div>
        </BubbleMenu>

        <EditorContent editor={editor} />
        
        {aiLoading && (
          <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px] flex items-center justify-center rounded-b-lg">
            <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
          </div>
        )}
      </div>

      {showNotebookPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <Card className="w-full max-w-md bg-zinc-900 border-zinc-800">
            <div className="flex justify-between items-center p-4 border-b border-zinc-800">
              <h3 className="font-bold text-lg text-white">Save to Notebook</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowNotebookPicker(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            <CardContent className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
              {nbLoading ? (
                <div className="flex justify-center p-8"><Loader2 className="animate-spin text-teal-500" /></div>
              ) : notebooks.length === 0 ? (
                <p className="text-center text-zinc-500 text-sm py-8">No notebooks found. Create one first.</p>
              ) : (
                <div className="space-y-2">
                  {notebooks.map(nb => (
                    <button
                      key={nb.notebookId}
                      onClick={() => saveToNotebook(nb.notebookId)}
                      disabled={!!savingToNb}
                      className="w-full flex justify-between items-center p-3 rounded-lg border transition-all text-left"
                      style={{
                        backgroundColor: `${COLOR_MAP[nb.color].bg}`,
                        borderColor: `${COLOR_MAP[nb.color].border}44`,
                        color: COLOR_MAP[nb.color].text
                      }}
                    >
                      <span className="font-bold">{nb.name}</span>
                      {savingToNb === nb.notebookId ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <span className="text-xs opacity-70">{nb.recordCount} records</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
