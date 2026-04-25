'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, 
  Mic2, 
  Eye, 
  BrainCircuit, 
  Sparkles, 
  Activity, 
  Bot, 
  Search, 
  Map as MapIcon, 
  Music, 
  Video, 
  FileText, 
  Smartphone, 
  ShieldCheck,
  SearchCheck,
  MessageSquare,
  Globe,
  Database,
  ArrowRight,
  TrendingUp,
  Microscope,
  Volume2
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const categories = [
  {
    title: "Audio & Voice Agents",
    description: "Conversational medical intelligence with real-time audio and voice synthesis.",
    icon: Mic2,
    color: "text-rose-500",
    bg: "bg-rose-500/10",
    tools: [
      { id: "voice-conversations", title: "Gemini Live API", desc: "Real-time, bidirectional audio clinical scenarios.", icon: Volume2 },
      { id: "asr-transcriber", title: "Ward Round ASR", desc: "Speaker-aware transcription for long ward rounds.", icon: Mic2 },
      { id: "podcast-gen", title: "Clinical Podcast", desc: "Convert study guides into multi-speaker audio.", icon: MessageSquare },
      { id: "cloning", title: "Voice Cloning", desc: "Patient comms in your own synthesized voice.", icon: Bot },
      { id: "jingles", title: "Medical Jingles", desc: "AI-generated mnemonics with catchy audio.", icon: Music }
    ]
  },
  {
    title: "Vision & Media Agents",
    description: "Multimodal extraction and generative medical media for visual learning.",
    icon: Eye,
    color: "text-sky-500",
    bg: "bg-sky-500/10",
    tools: [
      { id: "scan-animator", title: "Veo 3 Animator", desc: "Animate 2D scans into dynamic 3D-depth videos.", icon: Video },
      { id: "art-aspect", title: "Vertical Art Gen", desc: "Perfect-fit anatomical diagrams for mobile.", icon: Smartphone },
      { id: "video-synthesizer", title: "Lecture indices", desc: "Find key moments in long lecture videos.", icon: SearchCheck },
      { id: "lab-extractor", title: "Smart OCR", desc: "Instant data extraction from photos of lab reports.", icon: Microscope },
      { id: "concept-art", title: "Concept Art Creator", desc: "Generate clinical context illustrations with one click.", icon: Sparkles }
    ]
  },
  {
    title: "Intelligence & Grounding",
    description: "Enterprise-grade reasoning, persistent memory, and live epidemiological tracking.",
    icon: BrainCircuit,
    color: "text-indigo-500",
    bg: "bg-indigo-500/10",
    tools: [
      { id: "high-thinking", title: "Thinking Mode", desc: "Chain-of-thought diagnostics for rare cases.", icon: BrainCircuit },
      { id: "support-ai", title: "Context Support", desc: "Gemini chatbot that remembers app troubleshooting.", icon: MessageSquare },
      { id: "epi-tracker", title: "Live Epidemiologist", desc: "Grounding via Google Search for news & outbreaks.", icon: Globe },
      { id: "geo-routing", title: "Geospatial Referrals", desc: "Live routing to care centers using Google Maps.", icon: MapIcon },
      { id: "low-latency", title: "Flash-Lite Turbo", desc: "Sub-second triage and auto-complete analysis.", icon: Zap },
      { id: "auth-db", title: "Secure Cloud Core", desc: "Firebase Auth & Firestore for persistent records.", icon: Database }
    ]
  }
];

export default function AddAiFeaturesPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white relative overflow-hidden pb-20">
      {/* Background Orbs */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-sky-500/10 to-transparent pointer-events-none" />
      <div className="absolute top-[-200px] left-[-200px] w-96 h-96 bg-indigo-500/20 blur-[150px] rounded-full pointer-events-none" />
      
      <div className="container mx-auto px-4 pt-20 max-w-7xl relative z-10">
        <header className="mb-16 text-center">
          <Badge variant="outline" className="mb-4 bg-indigo-500/10 text-indigo-400 border-indigo-500/20 py-1 px-4 text-[10px] tracking-widest uppercase font-bold">
            MediAssist Architecture Expansion
          </Badge>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6">
            Add AI <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-500">Features</span>
          </h1>
          <p className="text-zinc-500 text-xl max-w-2xl mx-auto">
            Enable specialized agent modules to supercharge your clinical reasoning and study workflows.
          </p>
        </header>

        <div className="space-y-20">
          {categories.map((category, catIdx) => (
            <section key={catIdx}>
              <div className="flex items-center gap-4 mb-8">
                <div className={`${category.bg} p-3 rounded-2xl`}>
                  <category.icon className={`h-8 w-8 ${category.color}`} />
                </div>
                <div>
                  <h2 className="text-3xl font-bold">{category.title}</h2>
                  <p className="text-zinc-500">{category.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.tools.map((tool, toolIdx) => (
                  <motion.div
                    key={tool.id}
                    whileHover={{ scale: 1.02, translateY: -5 }}
                    className="group"
                  >
                    <Card className="h-full bg-zinc-900/50 backdrop-blur-3xl border-white/5 hover:border-white/10 hover:bg-zinc-900 transition-all rounded-[2rem] overflow-hidden flex flex-col cursor-pointer">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start mb-4">
                          <div className="bg-zinc-800 p-3 rounded-2xl group-hover:bg-zinc-700 transition-colors">
                            <tool.icon className="h-6 w-6 text-zinc-400" />
                          </div>
                          <Badge variant="secondary" className="bg-zinc-800 text-zinc-400 text-[9px] uppercase font-bold">Inactive</Badge>
                        </div>
                        <CardTitle className="text-xl group-hover:text-sky-400 transition-colors">{tool.title}</CardTitle>
                        <CardDescription className="text-zinc-600 line-clamp-2">{tool.desc}</CardDescription>
                      </CardHeader>
                      <CardFooter className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                         <span className="text-[10px] font-bold text-zinc-700 uppercase tracking-widest">Expansion Pack</span>
                         <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full bg-zinc-800 hover:bg-sky-500/20 hover:text-sky-400">
                           <Zap className="h-4 w-4" />
                         </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-24 p-10 rounded-[3rem] bg-gradient-to-br from-indigo-600 to-indigo-900 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent" />
            <Bot className="h-16 w-16 mx-auto mb-6 text-indigo-200" />
            <h3 className="text-3xl font-bold mb-4">Autonomous Capability Discovery</h3>
            <p className="text-indigo-100/70 max-w-xl mx-auto mb-8">
              MediAssist constantly analyzes your workflow behaviors. New tools will automatically be promoted to your "Next Step" recommendations as you learn.
            </p>
            <Button size="lg" className="bg-white text-indigo-900 hover:bg-white/90 rounded-2xl px-8 font-bold gap-2">
              Run Dream Discovery Agent <TrendingUp className="h-4 w-4" />
            </Button>
        </div>
      </div>
    </div>
  );
}
