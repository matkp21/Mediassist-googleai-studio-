'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, MicOff, Volume2, Bot, User, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * LIVE ORAL EXAM PROCTOR
 * Integrates Gemini Live API principles for bidirectional clinical viva sessions.
 */
export default function OralExamProctor() {
  const [isActive, setIsActive] = useState(false);
  const [transcript, setTranscript] = useState<any[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [examStatus, setExamStatus] = useState<'idle' | 'intro' | 'viva' | 'feedback'>('idle');

  const startExam = () => {
    setIsActive(true);
    setExamStatus('intro');
    addMessage('assistant', 'Good morning. I am your clinical proctor. Today we will evaluate your management plan for a 54-year old male presenting with acute substernal chest pain. Are you ready to begin?');
  };

  const addMessage = (role: 'user' | 'assistant', text: string) => {
    setTranscript(prev => [...prev, { role, text, timestamp: new Date().toLocaleTimeString() }]);
  };

  return (
    <div className="max-w-4xl mx-auto h-[600px] flex flex-col gap-6">
      <Card className="flex-1 bg-zinc-900/50 border-white/5 rounded-[3rem] overflow-hidden flex flex-col backdrop-blur-xl">
        <CardHeader className="bg-zinc-800/50 p-6 flex flex-row items-center justify-between">
           <div className="flex items-center gap-3">
             <div className="p-2 bg-rose-500/20 rounded-xl">
               <Activity className="h-5 w-5 text-rose-500" />
             </div>
             <div>
               <CardTitle className="text-lg">OSCE Oral Exam</CardTitle>
               <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Gemini Live API Optimized</p>
             </div>
           </div>
           <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">Bidirectional Audio Active</Badge>
        </CardHeader>

        <CardContent className="flex-1 p-8 overflow-y-auto space-y-6">
          {!isActive ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
               <div className="w-24 h-24 bg-zinc-800 rounded-full flex items-center justify-center animate-pulse">
                  <Mic className="h-10 w-10 text-zinc-500" />
               </div>
               <div className="space-y-2">
                 <h3 className="text-xl font-bold">Ready for your Clinical Viva?</h3>
                 <p className="text-zinc-500 text-sm max-w-xs">Participate in a real-time, voice-first clinical examination. The AI will evaluate your reasoning, bedside manner, and clinical decision trees.</p>
               </div>
               <Button onClick={startExam} size="lg" className="bg-sky-600 hover:bg-sky-700 rounded-2xl px-10 font-bold">
                 Initialize Exam Logic
               </Button>
            </div>
          ) : (
            <AnimatePresence>
              {transcript.map((m, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, x: m.role === 'user' ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex gap-4 ${m.role === 'user' ? 'flex-row-reverse text-right' : ''}`}
                >
                  <div className={`p-2 rounded-xl h-fit ${m.role === 'user' ? 'bg-zinc-800' : 'bg-rose-600'}`}>
                    {m.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  </div>
                  <div className={`max-w-[80%] space-y-1`}>
                    <div className={`p-4 rounded-2xl text-sm leading-relaxed ${m.role === 'user' ? 'bg-zinc-900 border border-white/5' : 'bg-zinc-800/80'}`}>
                       {m.text}
                    </div>
                    <p className="text-[9px] text-zinc-600 font-bold uppercase">{m.timestamp}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </CardContent>

        <div className="p-10 bg-zinc-900/80 border-t border-white/5 flex flex-col items-center gap-6">
          <div className="flex gap-4 items-center">
            {isActive && (
              <div className="flex gap-2">
                 {[1, 2, 3, 4, 5].map(i => (
                    <motion.div
                      key={i}
                      animate={{ height: isSpeaking ? [8, 24, 8] : 8 }}
                      transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                      className="w-1 bg-sky-500 rounded-full"
                    />
                 ))}
              </div>
            )}
            <Button 
               size="lg" 
               variant={isSpeaking ? 'destructive' : 'default'}
               className={`h-20 w-20 rounded-full shadow-2xl transition-all ${isSpeaking ? 'bg-red-600 scale-110 shadow-red-500/20' : 'bg-sky-600'}`}
               onMouseDown={() => setIsSpeaking(true)}
               onMouseUp={() => setIsSpeaking(false)}
            >
               {isSpeaking ? <Mic className="h-8 w-8" /> : <MicOff className="h-8 w-8" />}
            </Button>
            {isActive && (
              <div className="flex gap-2">
                 {[1, 2, 3, 4, 5].map(i => (
                    <motion.div
                      key={i}
                      animate={{ height: isSpeaking ? [8, 24, 8] : 8 }}
                      transition={{ duration: 0.5, repeat: Infinity, delay: (5-i) * 0.1 }}
                      className="w-1 bg-sky-500 rounded-full"
                    />
                 ))}
              </div>
            )}
          </div>
          <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">
            {isSpeaking ? "Listening to your logic..." : "Push to Respond"}
          </p>
        </div>
      </Card>
      
      <div className="grid grid-cols-2 gap-4">
         <Card className="bg-zinc-900/50 border-white/5 rounded-3xl p-4 flex items-center gap-4">
            <div className="p-3 bg-zinc-800 rounded-2xl"><Volume2 className="h-5 w-5 text-zinc-500" /></div>
            <div>
               <p className="text-[10px] text-zinc-600 font-black uppercase tracking-tighter">Proctor Voice</p>
               <p className="text-sm font-bold">Standard Neutral English</p>
            </div>
         </Card>
         <Card className="bg-zinc-900/50 border-white/5 rounded-3xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-zinc-800 rounded-2xl"><Activity className="h-5 w-5 text-emerald-500" /></div>
              <div>
                 <p className="text-[10px] text-zinc-600 font-black uppercase tracking-tighter">Current Phase</p>
                 <p className="text-sm font-bold uppercase tracking-widest">{examStatus}</p>
              </div>
            </div>
            <Button variant="ghost" className="text-zinc-500 hover:text-white" onClick={() => setIsActive(false)}>End</Button>
         </Card>
      </div>
    </div>
  );
}
