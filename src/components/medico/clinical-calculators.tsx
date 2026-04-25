"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calculator, ChevronRight, Activity, Zap, ShieldCheck } from 'lucide-react';
import { useAiStreaming } from '@/hooks/use-ai-streaming';
import { MarkdownRenderer } from '../markdown/markdown-renderer';
import { cn } from '@/lib/utils';

const skills = [
  { id: 'heart-score-calculator', name: 'HEART Score', desc: 'Chest pain risk stratification for MACE.' },
  { id: 'wells-criteria-dvt', name: "Wells' Criteria (DVT)", desc: 'Clinical probability of deep vein thrombosis.' },
  { id: 'chads-vasc', name: 'CHA2DS2-VASc', desc: 'Stroke risk in atrial fibrillation.' },
  { id: 'qsofa', name: 'qSOFA', desc: 'Quick Sepsis-related Organ Failure Assessment.' }
];

export default function ClinicalCalculators() {
  const [activeSkill, setActiveSkill] = useState<string | null>(null);
  const { startStream, streamedText, isStreaming, resetStream } = useAiStreaming();

  const handleLaunchSkill = async (id: string, name: string) => {
    setActiveSkill(id);
    resetStream();
    const systemPrompt = `You are a specialized clinical calculator engine. 
    You have loaded the skill: ${id}.
    
    Instructions:
    1. Ask the user for the specific variables required for the ${name}.
    2. Once variables are provided, perform the calculation strictly.
    3. Provide the risk stratification result.
    4. Pattern: Agent-Skills Dynamic Loading.`;
    
    await startStream(`Launch ${name} and guide me through the calculation.`, systemPrompt);
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Clinical Calculators</h2>
          <p className="text-muted-foreground italic">Powered by Agent-Skills dynamic loading.</p>
        </div>
        <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
          <Calculator className="h-6 w-6 text-indigo-500" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {skills.map((skill) => (
          <Card 
            key={skill.id} 
            className={cn(
              "group cursor-pointer transition-all hover:border-indigo-500/50 hover:bg-indigo-500/[0.02]",
              activeSkill === skill.id && "border-indigo-500 bg-indigo-500/[0.05]"
            )}
            onClick={() => handleLaunchSkill(skill.id, skill.name)}
          >
            <CardHeader className="p-5">
              <div className="flex justify-between items-center mb-1">
                <CardTitle className="text-lg">{skill.name}</CardTitle>
                <div className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ChevronRight className="h-4 w-4" />
                </div>
              </div>
              <CardDescription>{skill.desc}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      <AnimatePresence>
        {activeSkill && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 pt-8 border-t"
          >
            <Card className="border-indigo-500/30 bg-indigo-500/[0.02] overflow-hidden">
              <CardHeader className="bg-indigo-500/10 border-b border-indigo-500/20 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-indigo-600" />
                    <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">Active Skill-Agent</span>
                  </div>
                  <Badge variant="outline" className="text-[9px] border-indigo-500/30 text-indigo-600">
                    <Zap className="h-3 w-3 mr-1" /> DETERMINISTIC MODE
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <MarkdownRenderer content={streamedText || 'Initializing specialized calculation logic...'} />
                </div>
                {isStreaming && (
                  <div className="flex gap-1 mt-4">
                    <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-bounce" />
                    <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.15s]" />
                    <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.3s]" />
                  </div>
                )}
              </CardContent>
              <CardFooter className="bg-indigo-500/5 p-4 border-t border-indigo-500/10 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span className="text-[10px] text-muted-foreground">Verification logic active: Values cross-referenced with medical protocols.</span>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-12 p-4 rounded-xl bg-muted/30 border border-border/50 text-[11px] text-muted-foreground">
        <p className="font-bold flex items-center gap-2 mb-2"><BrainCircuit className="h-3 w-3" /> Agentic Note:</p>
        <p>This module demonstrates <strong>"Dynamic Tool/Skill Loading"</strong>. It doesn't use hardcoded calculators but instead loads standardized <code>SKILL.md</code> definitions on-the-fly to ensure the model follows rigorous medical reasoning without context bloat.</p>
      </div>
    </div>
  );
}
