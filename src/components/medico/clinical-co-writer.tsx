"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Sparkles, 
  Wand2, 
  History, 
  RotateCcw, 
  Save, 
  User, 
  Bot,
  Type,
  Layout,
  ScrollText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Textarea } from '@/components/ui/textarea';

/**
 * Architectural Mapping: DeepTutor "AI Co-Writer" capability.
 * Collaborative clinical documentation workbench.
 * Automates drafting of SOAP notes, discharge summaries, and referral letters.
 */
export function ClinicalCoWriter() {
  const [content, setContent] = useState('');
  const [isExpanding, setIsExpanding] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  const handleExpand = async () => {
    if (!content.trim()) return;
    setIsExpanding(true);
    setHistory(prev => [content, ...prev]);
    
    // Simulate EditAgent expanding shorthand to formal SOAP note
    await new Promise(r => setTimeout(r, 2000));
    const expanded = `### SOAP NOTE (AI DRAFT)

**S: (Subjective)** 
Patient reports 3-day history of productive cough, mild fever, and shortness of breath upon exertion. Shorthand indicates: "${content}"

**O: (Objective)**
[Pulls latest EHR vitals] 
- Temp: 101.4 F
- SpO2: 94% on room air
- Lung fields: Bilateral basilar crackles noted.

**A: (Assessment)**
Suspected acute community-acquired pneumonia. R/O COVID-19 and Influenza.

**P: (Plan)**
1. Start empiric Azithromycin.
2. Order Sputum culture and repeat SpO2 in 4 hours.
3. Patient education on hydration and signs of respiratory distress.`;

    setContent(expanded);
    setIsExpanding(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl p-4 rounded-3xl border border-white dark:border-white/5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-orange-500/10 text-orange-600">
            <ScrollText className="h-5 w-5" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">Clinical Co-Writer</h2>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" size="sm" className="rounded-full gap-2">
             <History className="h-4 w-4" /> Version History
           </Button>
           <Button size="sm" className="rounded-full bg-sky-600 hover:bg-sky-700 gap-2 px-6">
             <Save className="h-4 w-4" /> Finalize Note
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Editor Area */}
        <Card className="md:col-span-8 bg-background border-border/50 shadow-xl rounded-[2.5rem] overflow-hidden">
          <div className="p-4 border-b bg-muted/30 flex items-center gap-4">
             <Badge variant="outline" className="gap-1 bg-background">
               <User className="h-3 w-3" /> Dr. User
             </Badge>
             <Badge variant="outline" className="gap-1 bg-primary/5 text-primary border-primary/20">
               <Bot className="h-3 w-3" /> Medi Collaborative Agent
             </Badge>
          </div>
          <CardContent className="p-0">
            <Textarea 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter clinical shorthand here (e.g. 'Pt c/o cough, fever 3d, SOB...')"
              className="min-h-[500px] border-none focus-visible:ring-0 text-lg p-8 resize-none font-serif leading-relaxed"
            />
          </CardContent>
          <div className="p-4 bg-muted/20 border-t flex items-center justify-between">
             <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest px-4">
               Words: {content.split(' ').filter(x => x).length} | MedGemma-Active
             </div>
             <div className="flex gap-2 p-2">
               <Button variant="ghost" size="icon" className="rounded-xl"><Type className="h-4 w-4" /></Button>
               <Button variant="ghost" size="icon" className="rounded-xl"><Layout className="h-4 w-4" /></Button>
             </div>
          </div>
        </Card>

        {/* AI Action Palette */}
        <div className="md:col-span-4 space-y-6">
          <Card className="bg-gradient-to-br from-zinc-900 to-black text-white rounded-[2.5rem] border-none shadow-2xl p-6">
             <h4 className="text-lg font-bold flex items-center gap-2 mb-4">
               <Sparkles className="h-5 w-5 text-sky-400" />
               Agent Capabilities
             </h4>
             <div className="space-y-3">
                <Button 
                  onClick={handleExpand}
                  disabled={isExpanding || !content}
                  className="w-full h-14 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-between px-6 transition-all group"
                >
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-bold">Express to SOAP</span>
                    <span className="text-[10px] opacity-50">Expand shorthand to full note</span>
                  </div>
                  {isExpanding ? <Loader2 className="h-5 w-5 animate-spin" /> : <Wand2 className="h-5 w-5 text-sky-400 group-hover:scale-125 transition-transform" />}
                </Button>

                <Button 
                  className="w-full h-14 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-between px-6 transition-all opacity-60"
                >
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-bold">Clinical Synthesis</span>
                    <span className="text-[10px] opacity-50">Pull latest relevant EHR data</span>
                  </div>
                  <FileText className="h-5 w-5" />
                </Button>

                <Button 
                  className="w-full h-14 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-between px-6 transition-all opacity-60"
                >
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-bold">Med-Check</span>
                    <span className="text-[10px] opacity-50">Verify drug-drug interactions</span>
                  </div>
                  <ShieldCheck className="h-5 w-5" />
                </Button>
             </div>

             <div className="mt-8 pt-8 border-t border-white/10">
                <p className="text-[10px] uppercase font-bold text-zinc-500 mb-4 tracking-widest">Active Draft History</p>
                <div className="space-y-2">
                   {history.map((h, i) => (
                     <button 
                       key={i} 
                       onClick={() => setContent(h)}
                       className="w-full text-left p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors text-xs opacity-50 hover:opacity-100 flex items-center justify-between"
                     >
                       <span className="truncate flex-1 mr-2">{h.substring(0, 40)}...</span>
                       <RotateCcw className="h-3 w-3 shrink-0" />
                     </button>
                   ))}
                </div>
             </div>
          </Card>
          
          <div className="p-6 rounded-[2.5rem] bg-sky-500/10 border border-sky-500/20">
             <h5 className="text-xs font-bold text-sky-600 uppercase tracking-widest mb-2">Pro Tip</h5>
             <p className="text-xs text-sky-700 leading-relaxed italic">
               "Highlight any section of your note and ask Medi to 'Polish' or 'Investigate Differentials' for that specific segment."
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}

import { Loader2 } from 'lucide-react';
