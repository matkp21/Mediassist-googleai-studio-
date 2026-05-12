"use client";

import React, { useState } from 'react';
import { useVibeLecture } from '@/hooks/useVibeLecture';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Download, Loader2, Sparkles, Brain, FileText, CheckCircle2, Bookmark, BarChart3, Copy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProMode } from '@/contexts/pro-mode-context';
import { toast } from '@/hooks/use-toast';
import { MarkdownRenderer } from '@/components/markdown/markdown-renderer';
import { MermaidRenderer } from '@/components/markdown/mermaid-renderer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function VibeVoiceLectureRecorder({ initialTopic }: { initialTopic?: string | null }) {
  const { user } = useProMode();
  const [sessionId] = useState(`session_${Date.now()}`);
  const uid = user?.uid || 'guest_user';
  
  const { 
    startLecture, 
    endLecture, 
    isRecording, 
    liveDraft, 
    verifiedChunks, 
    sessionData,
    downloadAudio 
  } = useVibeLecture(uid, sessionId);

  const [isFinalizing, setIsFinalizing] = useState(false);

  const handleToggleRecording = async () => {
    if (isRecording) {
      setIsFinalizing(true);
      await endLecture();
      toast({
        title: "Lecture Recording Stopped",
        description: "Master synthesis pass initiated via Gemini 3 Pro.",
      });
      // We don't set setIsFinalizing(false) here because we'll wait for sessionData.status === 'completed'
    } else {
      await startLecture();
      toast({
        title: "Lecture Recording Started",
        description: "Zero-latency VibeVoice layer active.",
      });
    }
  };

  const handleSaveText = () => {
    if (!sessionData?.masterSummary) {
      toast({ title: "No summary available yet", variant: "destructive" });
      return;
    }
    const blob = new Blob([sessionData.masterSummary], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MediAssistant_Lecture_Summary_${sessionId}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    toast({ title: "Summary saved as Markdown" });
  };

  const isCompleted = sessionData?.status === 'completed';

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <motion.h2 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-extrabold tracking-tighter text-white flex items-center gap-3"
          >
            <div className="relative">
              <Mic className={isRecording ? "text-red-500" : "text-teal-400"} size={32} />
              {isRecording && (
                <motion.div 
                  layoutId="mic-pulse"
                  className="absolute -inset-2 bg-red-500/20 rounded-full -z-10"
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
            </div>
            VibeVoice <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-emerald-500">Lecture Genius</span>
          </motion.h2>
          <p className="text-zinc-400 mt-2 font-medium">
            {initialTopic ? `Analyzing: ${initialTopic}` : 'Ready for Med School Brain transformation.'}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            variant={isRecording ? "destructive" : "default"}
            size="lg"
            onClick={handleToggleRecording}
            disabled={isFinalizing && !isCompleted}
            className={`rounded-full px-8 shadow-2xl transition-all duration-500 hover:scale-105 ${!isRecording ? 'bg-teal-600 hover:bg-teal-500' : ''}`}
          >
            {isRecording ? (
              <><MicOff className="mr-2 h-5 w-5" /> End Lecture</>
            ) : (
              <><Mic className="mr-2 h-5 w-5" /> Start Session</>
            )}
          </Button>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handleSaveText} 
              disabled={!isCompleted}
              className="border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 rounded-xl"
              title="Save Summary"
            >
              <FileText className="h-5 w-5 text-teal-400" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={downloadAudio} 
              disabled={isRecording || masterAudioBlobs.current.length === 0} 
              className="border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 rounded-xl"
              title="Download Audio Vault"
            >
              <Download className="h-5 w-5 text-amber-400" />
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Live Layer & Final Results */}
        <div className="lg:col-span-3 space-y-6">
          <AnimatePresence mode="wait">
            {!isCompleted ? (
              <motion.div
                key="live-layer"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <Card className="bg-zinc-900/60 border-zinc-800 border-2 overflow-hidden backdrop-blur-2xl transition-all duration-300">
                  <CardHeader className="pb-4 bg-zinc-800/20 border-b border-zinc-800/50">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-sm font-bold text-zinc-100 flex items-center gap-2 uppercase tracking-tighter">
                        <Sparkles className="h-4 w-4 text-teal-400" />
                        Live Captions (Web Speech API)
                      </CardTitle>
                      {isRecording && (
                        <div className="flex items-center gap-1.5">
                          <motion.div animate={{ opacity: [1, 0.4, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                          <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Live Capture</span>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="min-h-[250px] relative">
                      <p className={`text-xl leading-relaxed transition-colors duration-500 ${isRecording ? "text-zinc-100" : "text-zinc-600"}`}>
                        {isRecording ? (
                          liveDraft || <span className="animate-pulse">Listening to professor...</span>
                        ) : (
                          "The lecture stream is currently inactive. Press start to begin captures."
                        )}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                key="master-layer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <Tabs defaultValue="summary" className="w-full">
                  <TabsList className="bg-zinc-900/80 border border-zinc-800 p-1 rounded-2xl w-full justify-start overflow-auto h-auto no-scrollbar">
                    <TabsTrigger value="summary" className="rounded-xl data-[state=active]:bg-teal-600 px-6 py-2">Master Summary</TabsTrigger>
                    <TabsTrigger value="mindmap" className="rounded-xl data-[state=active]:bg-teal-600 px-6 py-2">Visual Pathway</TabsTrigger>
                    <TabsTrigger value="flashcards" className="rounded-xl data-[state=active]:bg-teal-600 px-6 py-2">Flashcards</TabsTrigger>
                    <TabsTrigger value="pearls" className="rounded-xl data-[state=active]:bg-teal-600 px-6 py-2">Clinical Pearls</TabsTrigger>
                  </TabsList>

                  <TabsContent value="summary" className="mt-4">
                    <Card className="bg-zinc-900/60 border-zinc-800 backdrop-blur-xl p-8">
                       <MarkdownRenderer content={sessionData?.masterSummary || ''} />
                    </Card>
                  </TabsContent>

                  <TabsContent value="mindmap" className="mt-4">
                    <Card className="bg-zinc-900/60 border-zinc-800 backdrop-blur-xl p-8 flex justify-center overflow-auto">
                       <MermaidRenderer chart={sessionData?.mermaidMindMap || ''} />
                    </Card>
                  </TabsContent>

                  <TabsContent value="flashcards" className="mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {sessionData?.flashcards?.map((card: any, idx: number) => (
                        <Card key={idx} className="bg-zinc-900/60 border-zinc-800 p-6 flex flex-col justify-between hover:border-teal-500/50 transition-all cursor-pointer group">
                           <div>
                              <Badge variant="outline" className="mb-4 text-teal-400 border-teal-500/20">MCQ {idx + 1}</Badge>
                              <p className="text-zinc-100 font-semibold mb-4 leading-relaxed">{card.front}</p>
                           </div>
                           <div className="mt-4 pt-4 border-t border-zinc-800 opacity-0 group-hover:opacity-100 transition-opacity">
                              <p className="text-teal-400 font-bold mb-2">Answer: {card.back}</p>
                              <p className="text-[11px] text-zinc-400 italic">{card.explanation}</p>
                           </div>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="pearls" className="mt-4">
                    <div className="space-y-4">
                      {sessionData?.clinicalPearls?.map((pearl: string, idx: number) => (
                        <div key={idx} className="flex gap-4 p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800">
                           <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                              <CheckCircle2 className="text-emerald-400 h-5 w-5" />
                           </div>
                           <p className="text-zinc-200 mt-1">{pearl}</p>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </motion.div>
            )}
          </AnimatePresence>

          {isFinalizing && !isCompleted && (
            <Card className="bg-zinc-900/80 border-teal-500/30 border-2 overflow-hidden backdrop-blur-3xl shadow-[0_0_50px_rgba(20,184,166,0.1)]">
              <CardContent className="py-20 flex flex-col items-center justify-center space-y-6">
                <div className="relative">
                  <Loader2 className="h-16 w-16 animate-spin text-teal-500" />
                  <Brain className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-emerald-400" />
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-2xl font-bold text-white tracking-tight">The Master Pass Synthesis</h3>
                  <p className="text-zinc-400 max-w-sm mx-auto">
                    VibeVoice is performing speaker diarization while Gemini 3 Pro structures your medical masterpiece.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar: Chunks & Metadata */}
        <div className="space-y-6">
          <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-xl border-2">
            <CardHeader className="pb-2 border-b border-zinc-800/50 mb-4">
              <CardTitle className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                <BarChart3 className="h-3 w-3" />
                Parallel Processing (Layer 2)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[450px] pr-4">
                <div className="space-y-4">
                  {verifiedChunks.length === 0 && !isRecording && (
                    <div className="text-center py-20 opacity-30 grayscale">
                      <Loader2 className="mx-auto mb-2 opacity-50" />
                      <p className="text-xs uppercase tracking-tight font-black">Waiting for Data</p>
                    </div>
                  )}
                  {verifiedChunks.map((chunk, index) => (
                    <motion.div 
                      key={chunk.timestamp}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-4 rounded-2xl bg-zinc-800/30 border border-zinc-700/30 relative group overflow-hidden"
                    >
                      <div className="flex justify-between items-center mb-3">
                        <Badge variant="outline" className="bg-zinc-900 text-teal-500 border-teal-500/10 text-[9px]">CHUNK #{index + 1}</Badge>
                        <span className="text-[9px] font-mono text-zinc-600">{new Date(chunk.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div className="prose prose-invert prose-xs text-[11px] leading-relaxed text-zinc-400">
                        <MarkdownRenderer content={chunk.structuredNotes || "Transcribing..."} />
                      </div>
                    </motion.div>
                  ))}
                  {isRecording && (
                    <div className="p-4 rounded-2xl border-dashed border-2 border-teal-500/20 bg-teal-500/5 animate-pulse">
                      <p className="text-[10px] text-teal-400 font-bold uppercase text-center">Processing Current Chunk...</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
            <CardFooter className="bg-black/20 p-4 flex items-center gap-2 border-t border-zinc-800/50">
              <div className="flex items-center gap-1.5">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                 <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Medical Dictionary Active</span>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Helper icons
function BarChart({ className }: { className?: string }) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>;
}

// Helper icons
function Clock({ className }: { className?: string }) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
}
