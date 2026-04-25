// src/components/medico/study-notes-generator.tsx
"use client";

import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, BookOpen, Wand2, FileText, Save, ArrowRight, ChevronDown, Sparkles } from 'lucide-react';
import { generateStudyNotes, type StudyNotesGeneratorOutput } from '@/ai/agents/medico/StudyNotesAgent';
import { useToast } from '@/hooks/use-toast';
import { useAiAgent } from '@/hooks/use-ai-agent';
import { useProMode } from '@/contexts/pro-mode-context';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { trackProgress } from '@/ai/agents/medico/ProgressTrackerAgent';
import React, { useEffect, useState, useCallback } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { MarkdownRenderer } from '@/components/markdown/markdown-renderer';
import Link from 'next/link';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MermaidRenderer } from '@/components/markdown/mermaid-renderer';
import { StudyNotesGeneratorOutputSchema } from '@/ai/schemas/medico-tools-schemas';
import { Play, Square, Volume2 } from 'lucide-react';

const subjects = ["Anatomy", "Physiology", "Biochemistry", "Pathology", "Pharmacology", "Microbiology", "Forensic Medicine", "Community Medicine", "Ophthalmology", "ENT", "General Medicine", "General Surgery", "Obstetrics & Gynaecology", "Pediatrics", "Other"] as const;
const systems = ["Cardiovascular", "Respiratory", "Gastrointestinal", "Neurological", "Musculoskeletal", "Endocrine", "Genitourinary", "Integumentary", "Hematological", "Immunological", "Other"] as const;

const formSchema = z.object({
  topic: z.string().min(3, { message: "Topic must be at least 3 characters long." }).max(100, {message: "Topic too long."}),
  answerLength: z.enum(['10-mark', '5-mark']).default('10-mark'),
  subject: z.enum(subjects).optional(),
  system: z.enum(systems).optional(),
});

type StudyNotesFormValues = z.infer<typeof formSchema>;

interface StudyNotesGeneratorProps {
  initialTopic?: string | null;
}

const seedQuestions = [
  "Papillary carcinoma thyroid", "Varicose veins", "Inguinal hernia", "Carcinoma breast", "Nephrotic syndrome", "Rheumatic heart disease", "Pneumonia in children", "Cirrhosis of liver", "Malignant melanoma", "Dengue fever"
];

export function StudyNotesGenerator({ initialTopic }: StudyNotesGeneratorProps) {
  const { toast } = useToast();
  const { user } = useProMode();
  const [isPlaying, setIsPlaying] = useState(false);
  const [speechSynthesis, setSpeechSynthesis] = useState<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setSpeechSynthesis(window.speechSynthesis);
    }
  }, []);

  const stopAudio = useCallback(() => {
    if (speechSynthesis) {
        speechSynthesis.cancel();
        setIsPlaying(false);
    }
  }, [speechSynthesis]);

  const toggleAudiobook = () => {
    if (!speechSynthesis || !generatedAnswer) return;

    if (isPlaying) {
      stopAudio();
    } else {
      const textToRead = generatedAnswer.notes.replace(/[*#`]/g, ''); // Basic markdown stripping for reading
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);
      speechSynthesis.speak(utterance);
      setIsPlaying(true);
    }
  };

  useEffect(() => {
    return () => {
      stopAudio(); // Cleanup on unmount
    };
  }, [stopAudio]);

  const { execute: runGenerateAnswer, data: generatedAnswer, isLoading, error, reset } = useAiAgent(generateStudyNotes, StudyNotesGeneratorOutputSchema, {
     onSuccess: async (data, input) => {
      toast({
          title: "Structured Notes Generated!",
          description: `Notes for "${input.topic}" are ready.`
      });
      
      try {
        await trackProgress({
            activityType: 'notes_review',
            topic: input.topic,
        });
      } catch (progressError) {
          console.warn("Could not track progress:", progressError);
      }
    }
  });

  const form = useForm<StudyNotesFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: initialTopic || "",
      answerLength: '10-mark',
      subject: undefined,
      system: undefined,
    },
  });

  useEffect(() => {
    if (initialTopic) {
        form.setValue('topic', initialTopic);
    }
  }, [initialTopic, form]);

  const handleReset = () => {
    form.reset({ topic: "", answerLength: "10-mark", subject: undefined, system: undefined });
    reset();
  }
  
  const handleSeedQuestionClick = (question: string) => {
    form.setValue('topic', question);
    form.handleSubmit(onSubmit)();
  }

  const onSubmit: SubmitHandler<StudyNotesFormValues> = async (data) => {
    await runGenerateAnswer(data);
  };
  
  const handleSaveToLibrary = async () => {
    if (!generatedAnswer || !user) {
        toast({ title: "Cannot Save", description: "No content to save or user not logged in.", variant: "destructive" });
        return;
    }
    const { topic, subject, system } = form.getValues();
    try {
        await addDoc(collection(firestore, `users/${user.uid}/studyLibrary`), {
            type: 'notes',
            topic: topic,
            subject: subject || null,
            system: system || null,
            userId: user.uid,
            notes: generatedAnswer.notes,
            summaryPoints: generatedAnswer.summaryPoints || [],
            diagram: generatedAnswer.diagram || null,
            createdAt: serverTimestamp(),
        });
        toast({ title: "Saved to Library", description: "Your generated notes have been saved." });
    } catch (e) {
        console.error("Firestore save error:", e);
        toast({ title: "Save Failed", description: "Could not save notes to your library.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
       <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-1">
          <FormField
            control={form.control}
            name="topic"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="topic-notes" className="text-base">University Question / Topic</FormLabel>
                <FormControl>
                  <Input
                    id="topic-notes"
                    placeholder="e.g., Inguinal Hernia, Rheumatic Heart Disease"
                    className="rounded-lg text-base py-2.5 border-border/70 focus:border-primary"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
                control={form.control}
                name="answerLength"
                render={({ field }) => (
                <FormItem>
                    <FormLabel className="text-base">Answer Length</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger className="rounded-lg"><SelectValue/></SelectTrigger></FormControl>
                    <SelectContent>
                        <SelectItem value="10-mark">10-Mark Answer (~500 words)</SelectItem>
                        <SelectItem value="5-mark">5-Mark Answer (~250 words)</SelectItem>
                    </SelectContent>
                    </Select>
                    <FormMessage/>
                </FormItem>
                )}
            />
             <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                <FormItem>
                    <FormLabel className="text-base">Subject (Optional)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger className="rounded-lg"><SelectValue placeholder="Select Subject"/></SelectTrigger></FormControl>
                    <SelectContent>
                        {subjects.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                    </Select>
                    <FormMessage/>
                </FormItem>
                )}
            />
             <FormField
                control={form.control}
                name="system"
                render={({ field }) => (
                <FormItem>
                    <FormLabel className="text-base">System (Optional)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger className="rounded-lg"><SelectValue placeholder="Select System"/></SelectTrigger></FormControl>
                    <SelectContent>
                         {systems.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                    </Select>
                    <FormMessage/>
                </FormItem>
                )}
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" className="w-full sm:w-auto rounded-lg py-3 text-base group" disabled={isLoading}>
                {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</>
                : <><Wand2 className="mr-2 h-4 w-4" /> Generate Notes</>}
            </Button>
             {generatedAnswer && ( <Button type="button" variant="outline" onClick={handleReset} className="rounded-lg">Clear</Button> )}
          </div>
        </form>
      </Form>
      
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground mb-2">Or, try a sample university question:</h3>
        <div className="flex flex-wrap gap-2">
          {seedQuestions.map(q => (
            <Button key={q} variant="outline" size="sm" onClick={() => handleSeedQuestionClick(q)} disabled={isLoading}>
              {q}
            </Button>
          ))}
        </div>
      </div>

      {error && <Alert variant="destructive" className="rounded-lg"><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}

      {generatedAnswer && (
        <Card className="shadow-md rounded-xl mt-6 border-primary/30 bg-gradient-to-br from-card to-primary/5 relative">
          {isLoading && (
            <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-10 rounded-xl">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Updating...</span>
            </div>
          )}
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-xl flex items-center gap-2"><FileText className="h-6 w-6 text-primary" />Structured Notes: {form.getValues("topic")}</CardTitle>
                <CardDescription>AI-generated structured notes for your exam preparation.</CardDescription>
              </div>
              <Button 
                variant={isPlaying ? "default" : "secondary"}
                onClick={toggleAudiobook} 
                className="gap-2"
              >
                {isPlaying ? <Square className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                {isPlaying ? "Stop Audio" : "Audiobook Mode"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {generatedAnswer.summaryPoints && generatedAnswer.summaryPoints.length > 0 && (
                  <div>
                      <h3 className="font-semibold text-lg text-primary mb-2">Key Summary Points</h3>
                      <ul className="space-y-1.5 list-disc list-inside bg-primary/10 p-4 rounded-lg text-primary-foreground">
                          {generatedAnswer.summaryPoints.map((point, index) => (
                              <li key={index} className="text-sm text-foreground">{point}</li>
                          ))}
                      </ul>
                  </div>
              )}
              <div>
                  <h4 className="font-semibold mb-2 text-lg text-primary">Notes Breakdown:</h4>
                  <ScrollArea className="h-[400px] p-1 border bg-background rounded-lg">
                      <div className="p-4">
                          <MarkdownRenderer content={generatedAnswer.notes} />
                      </div>
                  </ScrollArea>
              </div>
              <div>
                  <h4 className="font-semibold mb-2 text-lg text-primary">Diagram / Flowchart:</h4>
                    <div className="h-auto p-1 border bg-background rounded-lg">
                          {generatedAnswer.diagram ? (
                              <MermaidRenderer chart={generatedAnswer.diagram} />
                          ) : <p className="text-muted-foreground text-center py-8">No diagram was generated for this topic.</p>}
                    </div>
              </div>
              {generatedAnswer.imagePrompts && generatedAnswer.imagePrompts.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2 text-lg text-primary flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-amber-500" />
                    Imagen 3: Concept Art Prompts
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {generatedAnswer.imagePrompts.map((prompt, idx) => (
                      <Card key={idx} className="bg-primary/5 border-dashed border-primary/30">
                        <CardContent className="p-4 space-y-3">
                          <p className="text-xs text-muted-foreground italic line-clamp-3">"{prompt}"</p>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full text-[10px] h-7 gap-1"
                            onClick={() => {
                              toast({ 
                                title: "Agent Initiated", 
                                description: "Imagen 3 is synthesising clinical concept art..." 
                              });
                            }}
                          >
                            <Wand2 className="h-3 w-3" /> Generate Concept Art
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
           <CardFooter className="p-4 border-t flex items-center justify-between">
              <Button onClick={handleSaveToLibrary} disabled={!user}>
                <Save className="mr-2 h-4 w-4"/> Save to Library
              </Button>
               {generatedAnswer.nextSteps && generatedAnswer.nextSteps.length > 0 && (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline">
                        Next Steps <ChevronDown className="ml-2 h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Recommended Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {generatedAnswer.nextSteps.map((step, index) => (
                        <DropdownMenuItem key={index} asChild className="cursor-pointer">
                          <Link href={`/medico/${step.toolId}?topic=${encodeURIComponent(step.prefilledTopic)}`}>
                            {step.cta}
                          </Link>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                </DropdownMenu>
                )}
            </CardFooter>
        </Card>
      )}
    </div>
  );
}
