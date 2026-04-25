"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, FileText, Wand2, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Architectural Mapping: Inspired by midudev/autoskills.
 * UI for the Document-to-Skill Pipeline.
 * Converts static hospital guidelines into structured AI tools.
 */
export function ClinicalSkillGenerator() {
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!text.trim()) {
      toast({ title: "Input Required", description: "Please paste the medical procedure or guideline text.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      // In a real implementation this calls the Genkit flow: documentToSkillFlow
      // For now we simulate the API call
      const response = await fetch('/api/medico/flows/document-to-skill', {
        method: 'POST',
        body: JSON.stringify({ documentText: text }),
      });
      
      const data = await response.json();
      setResult(data);
      toast({ title: "Skill Extracted", description: "The AI has successfully mapped the guideline to a structured skill." });
    } catch (error) {
      console.error("Generation failed:", error);
      toast({ title: "Extraction Error", description: "Failed to generate structured skill. Check API connection.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-6">
      <header>
         <h1 className="text-3xl font-bold tracking-tight">Clinical Skill Generator</h1>
         <p className="text-muted-foreground italic">Inspired by autoskills: Document-to-Skill Pipeline.</p>
      </header>

      <Card className="border-sky-500/20 bg-sky-500/5 backdrop-blur-xl rounded-[2rem] overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-sky-600" />
            Guideline Source
          </CardTitle>
          <CardDescription>Paste the unstructured medical guideline or procedure text below.</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea 
            placeholder="e.g., Clinical Pathway for Managing Chronic Heart Failure: 1. Assess NYHA class. 2. Prescribe ACE-I/ARB if EF < 40%..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="min-h-[200px] bg-white/50 border-sky-500/10 rounded-2xl focus-visible:ring-sky-500"
          />
        </CardContent>
        <CardFooter className="flex justify-end p-6 bg-sky-500/5">
          <Button onClick={handleGenerate} disabled={isLoading} className="rounded-full bg-sky-600 hover:bg-sky-700 px-8 shadow-lg shadow-sky-500/20">
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
            Generate AI Skill
          </Button>
        </CardFooter>
      </Card>

      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
             <Card className="border-emerald-500/30 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-3xl rounded-[2.5rem] shadow-2xl">
               <CardHeader className="bg-emerald-500/10 p-6 flex flex-row items-center justify-between">
                  <div className="flex items-center gap-3">
                     <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                     <CardTitle className="text-xl">Generated Skill Schema</CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    {result.isClinical && <span className="px-3 py-1 bg-emerald-500 text-white text-[10px] font-bold rounded-full uppercase tracking-widest">Clinical Grade</span>}
                  </div>
               </CardHeader>
               <CardContent className="p-8 space-y-6">
                  <div>
                    <h4 className="text-[10px] font-bold uppercase text-muted-foreground mb-1">Skill Name</h4>
                    <p className="text-lg font-bold">{result.skillName}</p>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-bold uppercase text-muted-foreground mb-1">Operational Description</h4>
                    <p className="text-sm text-slate-500 leading-relaxed">{result.description}</p>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-bold uppercase text-muted-foreground mb-1">Required Inputs</h4>
                    <div className="flex flex-wrap gap-2 mt-2">
                       {result.requiredInputs.map((input: string, i: number) => (
                         <span key={i} className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-xs font-medium border border-zinc-200 dark:border-zinc-700">
                            {input}
                         </span>
                       ))}
                    </div>
                  </div>
               </CardContent>
               <CardFooter className="p-8 pt-0 flex gap-4">
                  <Button variant="outline" className="flex-1 rounded-2xl">SAVE TO ARCHIVE</Button>
                  <Button className="flex-1 rounded-2xl bg-zinc-900 text-white">INSTALL AS AGENT SKILL</Button>
               </CardFooter>
             </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 flex items-start gap-4">
         <ShieldAlert className="h-5 w-5 text-amber-500 shrink-0 mt-1" />
         <p className="text-xs text-amber-900 dark:text-amber-500">
           <strong>Security Note:</strong> Skill generation includes background semantic extraction logic that automatically excludes any data wrapped in <code>&lt;private&gt;</code> tags to maintain HIPPA compliance during the Document-to-Skill pipeline.
         </p>
      </div>
    </div>
  );
}
