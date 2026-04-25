"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, 
  Mic2, 
  AudioLines, 
  Music, 
  Image as ImageIcon, 
  Video, 
  FileSearch, 
  Maximize, 
  Bot, 
  BrainCircuit, 
  ZapOff, 
  Search, 
  MapPin, 
  Database,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const categories = [
  { id: 'audio', label: 'Audio & Voice', icon: Mic2, color: 'text-indigo-400' },
  { id: 'vision', label: 'Vision & Media', icon: ImageIcon, color: 'text-emerald-400' },
  { id: 'intel', label: 'Intelligence & Grounding', icon: BrainCircuit, color: 'text-amber-400' }
];

const features = [
  // Audio & Voice
  { 
    id: 'tts', 
    category: 'audio', 
    title: 'Convert Text to Speech', 
    description: 'Give the app a voice to read medical articles aloud with natural cadence.', 
    icon: AudioLines,
    status: 'Ready'
  },
  { 
    id: 'live-exam', 
    category: 'audio', 
    title: 'Live Conversational Exam', 
    description: 'Use Gemini Live API for real-time bidirectional OSCE oral practice.', 
    icon: Mic2,
    status: 'Beta'
  },
  { 
    id: 'asr', 
    category: 'audio', 
    title: 'Transcribe Ward Rounds', 
    description: 'VibeVoice-ASR powered realtime transcription of continuous clinical audio.', 
    icon: AudioLines,
    status: 'New'
  },
  { 
    id: 'jingles', 
    category: 'audio', 
    title: 'Generate Medical Jingles', 
    description: 'Create custom catchy mnemonic audio soundtracks using Lyria.', 
    icon: Music,
    status: 'Ready'
  },
  
  // Vision & Media
  { 
    id: 'concept-art', 
    category: 'vision', 
    title: 'Medical Concept Art', 
    description: 'Generate anatomical diagrams optimized for specific aspect ratios.', 
    icon: Zap,
    status: 'Ready'
  },
  { 
    id: 'scan-animator', 
    category: 'vision', 
    title: 'Animate Scans into Video', 
    description: 'Bring static 2D scans to life with Veo 3 volumetric motion.', 
    icon: Video,
    status: 'Pro'
  },
  { 
    id: 'video-gen', 
    category: 'vision', 
    title: 'Text-to-Video Study Guide', 
    description: 'Transform markdown study notes into high-quality educational clips.', 
    icon: Video,
    status: 'Ready'
  },
  { 
    id: 'vision-analyzer', 
    category: 'vision', 
    title: 'Analyze Charts & Scans', 
    description: 'High-capacity OCR and multimodal extraction for unformatted lab data.', 
    icon: FileSearch,
    status: 'Ready'
  },
  { 
    id: 'v-lecture-indexer', 
    category: 'vision', 
    title: 'Video Lecture Indexer', 
    description: 'Automatically find key clinical moments in long-form recordings.', 
    icon: Maximize,
    status: 'Beta'
  },

  // Intelligence
  { 
    id: 'it-chatbot', 
    category: 'intel', 
    title: 'Support Support Agent', 
    description: 'A context-aware Gemini chatbot that remembers your internal IT history.', 
    icon: Bot,
    status: 'Ready'
  },
  { 
    id: 'thinking-mode', 
    category: 'intel', 
    title: 'Enable High Thinking', 
    description: 'Activate specialized reasoning chains for complex multi-step diagnoses.', 
    icon: BrainCircuit,
    status: 'Ready'
  },
  { 
    id: 'lite-mode', 
    category: 'intel', 
    title: 'Low-Latency Responses', 
    description: 'Utilize Flash-Lite for instant feedback and auto-complete loops.', 
    icon: ZapOff,
    status: 'Speed'
  },
  { 
    id: 'search-data', 
    category: 'intel', 
    title: 'Live Search Grounding', 
    description: 'Connect to real-time epidemiological results and FDA recalls.', 
    icon: Search,
    status: 'Live'
  },
  { 
    id: 'maps-data', 
    category: 'intel', 
    title: 'Live Maps Routing', 
    description: 'Pull real-time facility information and emergency route calculations.', 
    icon: MapPin,
    status: 'Live'
  },
  { 
    id: 'db-sync', 
    category: 'intel', 
    title: 'Database & Auth Sync', 
    description: 'Seamlessly manage user records via Firestore and Google Sign-In.', 
    icon: Database,
    status: 'Core'
  }
];

export default function AiToolsDirectory() {
  const [activeCat, setActiveCat] = useState('audio');
  const [search, setSearch] = useState('');

  const filteredFeatures = features.filter(f => 
    (f.category === activeCat) && 
    (f.title.toLowerCase().includes(search.toLowerCase()) || f.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-white selection:bg-indigo-500/30">
      {/* Aurora Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-30">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[10%] right-[-10%] w-[30%] h-[50%] bg-emerald-500/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-20 max-w-6xl">
        <header className="mb-16 text-center">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-white/5 text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-6"
            >
                <Sparkles className="h-3 w-3 text-indigo-400" /> Advanced AI Directory
            </motion.div>
            <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-5xl md:text-7xl font-bold tracking-tight mb-6"
            >
                Add AI Features
            </motion.h1>
            <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-zinc-400 text-lg max-w-2xl mx-auto"
            >
                Choose from a library of specialized agents and multimodal handlers to enhance your clinical workflow.
            </motion.p>
        </header>

        {/* Search and Categories */}
        <div className="flex flex-col md:flex-row gap-6 mb-12 items-center justify-between border-b border-white/5 pb-8">
            <div className="flex gap-2 p-1 bg-zinc-900/50 backdrop-blur-xl border border-white/5 rounded-2xl">
                {categories.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setActiveCat(cat.id)}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all",
                            activeCat === cat.id 
                                ? "bg-white text-zinc-950 shadow-lg" 
                                : "text-zinc-400 hover:text-white hover:bg-white/5"
                        )}
                    >
                        <cat.icon className={cn("h-4 w-4", activeCat === cat.id ? "text-zinc-950" : cat.color)} />
                        {cat.label}
                    </button>
                ))}
            </div>
            <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <Input 
                    placeholder="Search agents..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="bg-zinc-900/50 border-white/5 pl-10 rounded-xl h-11 focus:ring-indigo-500/50"
                />
            </div>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
                {filteredFeatures.map((f, i) => (
                    <motion.div
                        key={f.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: i * 0.05 }}
                    >
                        <Card className="group h-full bg-zinc-900/40 border-white/5 hover:border-white/10 transition-all backdrop-blur-md relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <CardHeader className="relative">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-zinc-800 rounded-2xl border border-white/5 text-zinc-400 group-hover:text-white transition-colors group-hover:bg-indigo-600">
                                        <f.icon className="h-5 w-5" />
                                    </div>
                                    <Badge className="bg-zinc-800 text-zinc-400 border-white/5 text-[9px] group-hover:bg-indigo-500/20 group-hover:text-indigo-300">
                                        {f.status}
                                    </Badge>
                                </div>
                                <CardTitle className="text-xl font-bold tracking-tight text-white group-hover:text-indigo-200 transition-colors">
                                    {f.title}
                                </CardTitle>
                                <CardDescription className="text-zinc-500 line-clamp-2 leading-relaxed">
                                    {f.description}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="relative pt-0">
                                <Button className="w-full bg-white text-zinc-950 hover:bg-indigo-50 rounded-xl group/btn overflow-hidden">
                                    <span className="relative z-10 flex items-center justify-center gap-2">
                                        Activate Agent <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                                    </span>
                                </Button>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>

        {filteredFeatures.length === 0 && (
            <div className="text-center py-20 bg-zinc-900/20 rounded-3xl border border-dashed border-white/5">
                <Bot className="h-12 w-12 text-zinc-700 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">No specialized agents found</h3>
                <p className="text-zinc-500">Try adjusting your category or search term.</p>
            </div>
        )}
      </div>
    </div>
  );
}
