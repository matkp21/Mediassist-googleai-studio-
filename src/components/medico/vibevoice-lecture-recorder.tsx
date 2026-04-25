"use client";

import React, { useState } from 'react';
import { useVibeLecture } from '@/hooks/useVibeLecture';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Download, Loader2, Sparkles, Brain, FileText, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProMode } from '@/contexts/pro-mode-context';
import { toast } from '@/hooks/use-toast';
import { MarkdownRenderer } from '@/components/markdown/markdown-renderer';

export function VibeVoiceLectureRecorder() {
  const { user } = useProMode(); // Assuming user context provides uid
  const [sessionId] = useState(`session_${Date.now()}`);
  const uid = user?.uid || 'guest_user';
  
  const { 
    startLecture, 
    endLecture, 
    isRecording, 
    liveDraft, 
    verifiedChunks, 
    downloadAudio 
  } = useVibeLecture(uid, sessionId);

  const [isFinalizing, setIsFinalizing] = useState(false);

  const handleToggleRecording = async () => {
    if (isRecording) {
      setIsFinalizing(true);
      await endLecture();
      toast({
        title: "Lecture Recording Stopped",
        description: "Master synthesis pass initiated via Gemini 2.5 Pro.",
      });
      setIsFinalizing(false);
    } else {
      await startLecture();
      toast({
        title: "Lecture Recording Started",
        description: "Zero-latency VibeVoice layer active.",
      });
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            <Mic className={isRecording ? "text-red-500 animate-pulse" : "text-teal-400"} />
            VibeVoice <span className="text-teal-400">Lecture Recorder</span>
          </h2>
          <p className="text-zinc-400">Hybrid ASR + Agentic Synthesis for Medical Lectures.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            variant={isRecording ? "destructive" : "default"}
            size="lg"
            onClick={handleToggleRecording}
            disabled={isFinalizing}
            className="rounded-full px-8 shadow-xl"
          >
            {isRecording ? (
              <><MicOff className="mr-2 h-5 w-5" /> Stop Session</>
            ) : (
              <><Mic className="mr-2 h-5 w-5" /> Start Recording</>
            )}
          </Button>
          
          <Button variant="outline" size="icon" onClick={downloadAudio} disabled={isRecording} title="Download Audio">
            <Download className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Layer */}
        <Card className="lg:col-span-2 bg-zinc-900/50 border-zinc-800 backdrop-blur-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-teal-400" />
              Live Transcript Layer (Zero-Latency)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="min-h-[200px] p-4 rounded-xl bg-black/40 border border-zinc-800/50">
              <p className={isRecording ? "text-lg text-white leading-relaxed" : "text-zinc-500 italic"}>
                {isRecording ? (
                  liveDraft || "Initializing speech recognition..."
                ) : (
                  "Ready to capture. Start recording to see live transcription."
                )}
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t border-zinc-800/50 pt-4">
            <Badge variant="outline" className="bg-teal-500/10 text-teal-400 border-teal-500/20">
              {isRecording ? "Streaming Active" : "Standby"}
            </Badge>
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
              Web Speech API Layer
            </span>
          </CardFooter>
        </Card>

        {/* Status / Chunks */}
        <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400 flex items-center gap-2">
              <Clock className="h-4 w-4 text-teal-400" />
              6-Min Verified Chunks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-3">
                <AnimatePresence>
                  {verifiedChunks.length === 0 && (
                    <p className="text-xs text-zinc-600 text-center py-10">No verified chunks processed yet.</p>
                  )}
                  {verifiedChunks.map((chunk, index) => (
                    <motion.div 
                      key={chunk.timestamp}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-3 rounded-lg bg-zinc-800/40 border border-zinc-700/50 relative group"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-mono text-teal-500">#{index + 1} • {new Date(chunk.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                      </div>
                      <p className="text-[11px] text-zinc-300 line-clamp-3 group-hover:line-clamp-none transition-all cursor-pointer">
                        {chunk.structuredNotes || "Processing summary..."}
                      </p>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </ScrollArea>
          </CardContent>
          <CardFooter className="border-t border-zinc-800/50 pt-4">
             <div className="flex items-center gap-2 text-[10px] text-zinc-500">
               <div className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
               VibeVoice Microservice Active
             </div>
          </CardFooter>
        </Card>
      </div>

      {/* Synthesis Result */}
      {isFinalizing && (
        <Card className="bg-teal-500/5 border-teal-500/20">
          <CardContent className="py-12 flex flex-col items-center justify-center space-y-4">
             <Loader2 className="h-10 w-10 animate-spin text-teal-500" />
             <div className="text-center">
                <h3 className="text-xl font-bold text-teal-400">Genkit Master Pass</h3>
                <p className="text-zinc-400">Synthesizing 1-hour lecture into high-yield pearls & mind maps...</p>
             </div>
          </CardContent>
        </Card>
      )}

      {/* If we have a completed session summary, show it here or route to a dedicated page */}
      {/* For now, we can show a placeholder if we detect any finalized data in Firestore */}
    </div>
  );
}

// Helper icons
function Clock({ className }: { className?: string }) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
}
