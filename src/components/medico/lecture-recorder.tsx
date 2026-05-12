'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Mic, MicOff, Loader2, BookOpen, Brain, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from '@/hooks/use-toast';

export default function LectureRecorder({ lectureId }: { lectureId: string }) {
  const [isRecording, setIsRecording] = useState(false);
  const [liveNotes, setLiveNotes] = useState<string[]>([]);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      
      mediaRecorderRef.current.ondataavailable = async (e) => {
        if (e.data.size > 0) {
          const formData = new FormData();
          formData.append('audio', e.data);
          formData.append('lectureId', lectureId);
          formData.append('timestamp', Date.now().toString());

          try {
            const res = await fetch('/api/lecture/chunk', { method: 'POST', body: formData });
            const data = await res.json();
            
            if (data.liveText) {
              setLiveNotes(prev => [...prev, data.liveText]);
            }
          } catch (err) {
            console.error("Failed to upload chunk:", err);
          }
        }
      };

      // Slice audio every 30 seconds
      mediaRecorderRef.current.start(30000); 
      setIsRecording(true);
      toast({
        title: "Lecture Recording Started",
        description: "Audio is being processed in 30-second intervals.",
      });
    } catch (err) {
      console.error("Media access denied:", err);
      toast({
        title: "Microphone Error",
        description: "Please grant microphone permissions to record the lecture.",
        variant: "destructive"
      });
    }
  };

  const stopRecording = async () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      // Important: Stop all tracks to release the microphone
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
    setIsRecording(false);
    setIsFinalizing(true);
    
    toast({
      title: "Recording Finished",
      description: "Finalizing and generating comprehensive notes...",
    });

    try {
      // Trigger final compilation
      const res = await fetch('/api/lecture/finalize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lectureId })
      });
      
      if (res.ok) {
        toast({
          title: "Lecture Finalized",
          description: "All notes and study materials are now ready in your dashboard.",
        });
      }
    } catch (err) {
      console.error("Finalization failed:", err);
      toast({
        title: "Finalization Error",
        description: "Failed to generate final notes. Please check the console.",
        variant: "destructive"
      });
    } finally {
      setIsFinalizing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-xl overflow-hidden">
        <CardHeader className="border-b border-zinc-800 bg-zinc-800/20">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
                <Brain className="text-teal-400" />
                Lecture Intelligence Pipeline
              </CardTitle>
              <p className="text-zinc-400 text-sm">Orchestrated medical lecture analysis in real-time.</p>
            </div>
            <div className="flex gap-4">
              {!isRecording ? (
                <Button 
                  onClick={startRecording} 
                  disabled={isFinalizing}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-full px-6"
                >
                  <Mic className="mr-2 h-4 w-4" /> Start Lecture
                </Button>
              ) : (
                <Button 
                  onClick={stopRecording} 
                  variant="destructive"
                  className="rounded-full px-6"
                >
                  <MicOff className="mr-2 h-4 w-4" /> End Lecture
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-zinc-800">
            <div className="col-span-2 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Live Corrected Transcript
                </h4>
                {isRecording && (
                  <Badge variant="outline" className="text-[10px] bg-red-500/10 text-red-400 border-red-500/20 animate-pulse">
                    Live
                  </Badge>
                )}
              </div>
              
              <ScrollArea className="h-[400px] rounded-xl bg-black/20 p-4 border border-zinc-800/50">
                <div className="space-y-4">
                  {liveNotes.length === 0 && !isRecording && !isFinalizing && (
                    <div className="h-full flex flex-col items-center justify-center text-zinc-600 py-20 grayscale opacity-20">
                      <Mic size={48} className="mb-4" />
                      <p className="font-bold uppercase tracking-tighter">Standby for Session</p>
                    </div>
                  )}
                  
                  {liveNotes.map((note, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 rounded-lg bg-zinc-800/30 border border-zinc-700/30 text-zinc-200 text-sm leading-relaxed"
                    >
                      {note}
                    </motion.div>
                  ))}
                  
                  {isRecording && (
                    <div className="flex gap-1 items-center p-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-bounce" />
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-bounce [animation-delay:0.2s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-bounce [animation-delay:0.4s]" />
                      <span className="text-[10px] text-teal-500 font-bold ml-2 uppercase">VibeVoice Processing...</span>
                    </div>
                  )}

                  {isFinalizing && (
                    <div className="flex flex-col items-center justify-center py-10 space-y-4">
                      <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
                      <p className="text-teal-400 font-bold text-sm uppercase tracking-widest">Generating Master Summary</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>

            <div className="p-6 bg-zinc-900/30 space-y-6">
              <div className="space-y-2">
                <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                  <BookOpen className="h-3 w-3" />
                  Pipeline Status
                </h4>
                <div className="space-y-3">
                  <StatusItem label="Transcription Service" status={isRecording ? "Active" : "Idle"} active={isRecording} />
                  <StatusItem label="Medical Correction" status={isRecording ? "Filtering" : "Idle"} active={isRecording} />
                  <StatusItem label="Genkit Orchestrator" status={isRecording || isFinalizing ? "Active" : "Idle"} active={isRecording || isFinalizing} />
                </div>
              </div>

              <div className="pt-6 border-t border-zinc-800">
                <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4">Features Active</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="bg-teal-500/10 text-teal-400 border-none text-[10px]">30s Chunking</Badge>
                  <Badge variant="secondary" className="bg-teal-500/10 text-teal-400 border-none text-[10px]">Medical OCR</Badge>
                  <Badge variant="secondary" className="bg-teal-500/10 text-teal-400 border-none text-[10px]">MCQ Generation</Badge>
                  <Badge variant="secondary" className="bg-teal-500/10 text-teal-400 border-none text-[10px]">Mermaid Mind Maps</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatusItem({ label, status, active }: { label: string, status: string, active: boolean }) {
  return (
    <div className="flex justify-between items-center text-xs">
      <span className="text-zinc-500">{label}</span>
      <span className={`font-bold ${active ? "text-emerald-400" : "text-zinc-700"}`}>{status}</span>
    </div>
  );
}
