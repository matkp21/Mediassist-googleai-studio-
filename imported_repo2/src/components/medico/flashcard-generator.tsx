// src/components/medico/flashcard-generator.tsx
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
import { Loader2, Layers, Wand2, ArrowLeftRight, CheckCircle, XCircle, Save, ArrowRight, ChevronDown } from 'lucide-react';
import { generateFlashcards, type MedicoFlashcardGeneratorInput, type MedicoFlashcard } from '@/ai/agents/medico/FlashcardGeneratorAgent';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useAiAgent } from '@/hooks/use-ai-agent';
import { useProMode } from '@/contexts/pro-mode-context';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import React, { useState, useEffect } from 'react';
import { trackProgress } from '@/ai/agents/medico/ProgressTrackerAgent';
import Link from 'next/link';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MedicoFlashcardGeneratorOutputSchema } from '@/ai/schemas/medico-tools-schemas';

const formSchema = z.object({
  topic: z.string().min(3, { message: "Topic must be at least 3 characters long." }).max(100, { message: "Topic too long." }),
  count: z.coerce.number().int().min(1, { message: "Minimum 1 flashcard." }).max(20, { message: "Maximum 20 flashcards." }).default(10),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
  examType: z.enum(['university', 'neet-pg', 'usmle']).default('university'),
});

type FlashcardFormValues = z.infer<typeof formSchema>;

interface FlashcardDisplay extends MedicoFlashcard {
  id: string;
  isFlipped: boolean;
  status: 'new' | 'learning' | 'mastered';
}

interface FlashcardGeneratorProps {
  initialTopic?: string | null;
}

export function FlashcardGenerator({ initialTopic }: FlashcardGeneratorProps) {
  const { toast } = useToast();
  const { user } = useProMode();
  const [generatedFlashcards, setGeneratedFlashcards] = useState<FlashcardDisplay[] | null>(null);
  const [currentTopic, setCurrentTopic] = useState<string | null>(null);

  const { execute: runGenerateFlashcards, data: aiData, isLoading, error, reset } = useAiAgent(generateFlashcards, MedicoFlashcardGeneratorOutputSchema, {
    onSuccess: async (data, input) => {
      if (!data?.flashcards || !data.topicGenerated) {
        toast({
          title: "Generation Error",
          description: "The AI agent returned an incomplete response. Please try again.",
          variant: "destructive",
        });
        return;
      }
      const displayFlashcards = data.flashcards.map((fc, index) => ({
        ...fc,
        id: `${input.topic}-${index}-${Date.now()}`,
        isFlipped: false,
        status: 'new' as const,
      }));
      setGeneratedFlashcards(displayFlashcards);
      setCurrentTopic(data.topicGenerated);
      
      try {
        await trackProgress({
            activityType: 'notes_review',
            topic: `Flashcards: ${input.topic}`
        });
      } catch (progressError) {
          console.warn("Could not track progress for flashcard generation:", progressError);
      }
    },
  });

  const form = useForm<FlashcardFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: initialTopic || "",
      count: 10,
      difficulty: 'medium',
      examType: 'university',
    },
  });
  
  useEffect(() => {
    if (initialTopic) {
        form.setValue('topic', initialTopic);
    }
  }, [initialTopic, form]);

  const handleReset = () => {
    form.reset({ topic: "", count: 10, difficulty: "medium", examType: "university" });
    reset();
    setGeneratedFlashcards(null);
    setCurrentTopic(null);
  }

  const onSubmit: SubmitHandler<FlashcardFormValues> = async (data) => {
    setGeneratedFlashcards(null);
    setCurrentTopic(null);
    await runGenerateFlashcards(data);
  };

  const flipCard = (id: string) => {
    setGeneratedFlashcards(prev =>
      prev?.map(card =>
        card.id === id ? { ...card, isFlipped: !card.isFlipped } : card
      ) || null
    );
  };
  
  const markCardStatus = (id: string, status: 'learning' | 'mastered') => {
     setGeneratedFlashcards(prev =>
      prev?.map(card =>
        card.id === id ? { ...card, status: status, isFlipped: false } : card
      ) || null
    );
  };

  const handleSaveToLibrary = async () => {
    if (!aiData || !user) {
      toast({ title: "Cannot Save", description: "No content to save or user not logged in.", variant: "destructive" });
      return;
    }
    try {
      await addDoc(collection(firestore, `users/${user.uid}/studyLibrary`), {
        type: 'flashcards',
        topic: aiData.topicGenerated,
        userId: user.uid,
        flashcards: aiData.flashcards,
        createdAt: serverTimestamp(),
      });
      toast({ title: "Saved to Library", description: "Your generated flashcards have been saved." });
    } catch (firestoreError) {
      console.error("Firestore save error:", firestoreError);
      toast({ title: "Save Failed", description: "Could not save flashcards to your library.", variant: "destructive" });
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
              <FormItem className="sm:col-span-2">
                <FormLabel htmlFor="topic-flashcard" className="text-base">Medical Topic</FormLabel>
                <FormControl>
                  <Input
                    id="topic-flashcard"
                    placeholder="e.g., Antibiotics, Cranial Nerves"
                    className="rounded-lg text-base py-2.5 border-border/70 focus:border-primary"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="count"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="count-flashcard" className="text-base">Number of Cards</FormLabel>
                  <FormControl>
                    <Input
                      id="count-flashcard"
                      type="number"
                      min="1"
                      max="20"
                      className="rounded-lg text-base py-2.5 border-border/70 focus:border-primary"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="difficulty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="difficulty-flashcard" className="text-base">Difficulty</FormLabel>
                   <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger id="difficulty-flashcard" className="rounded-lg text-base py-2.5 border-border/70 focus:border-primary">
                        <SelectValue placeholder="Select difficulty"/>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="examType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="examType-flashcard" className="text-base">Exam Style</FormLabel>
                   <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger id="examType-flashcard" className="rounded-lg text-base py-2.5 border-border/70 focus:border-primary">
                        <SelectValue placeholder="Select exam style"/>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="university">University</SelectItem>
                      <SelectItem value="neet-pg">NEET-PG</SelectItem>
                      <SelectItem value="usmle">USMLE</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" className="w-full sm:w-auto rounded-lg py-3 text-base group" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:rotate-12" />
                  Generate Flashcards
                </>
              )}
            </Button>
            {generatedFlashcards && (
              <Button type="button" variant="outline" onClick={handleReset} className="rounded-lg">
                Clear
              </Button>
            )}
          </div>
        </form>
      </Form>

      {error && (
        <Alert variant="destructive" className="rounded-lg">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {generatedFlashcards && (
        <Card className="shadow-md rounded-xl mt-6 border-blue-500/30 bg-gradient-to-br from-card via-card to-blue-500/5 relative">
           {isLoading && (
            <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-10 rounded-xl">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Updating...</span>
            </div>
          )}
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Layers className="h-6 w-6 text-blue-600" />
              Flashcards: {currentTopic}
            </CardTitle>
            <CardDescription>Click a card to flip it. Mark your progress using the buttons below each card.</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px] p-1 border bg-background rounded-lg">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                {generatedFlashcards.map((card) => (
                  <Card 
                    key={card.id} 
                    className={cn(
                        "min-h-[220px] flex flex-col justify-between shadow-md rounded-lg overflow-hidden transition-all duration-300 ease-in-out transform hover:scale-[1.03] focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2",
                        card.status === 'mastered' && 'border-2 border-green-500 bg-green-500/5',
                        card.status === 'learning' && 'border-2 border-yellow-500 bg-yellow-500/5',
                        card.status === 'new' && 'border-border',
                        card.isFlipped && 'bg-secondary/30'
                    )}
                  >
                    <CardContent 
                        className="flex-grow flex items-center justify-center p-4 text-center cursor-pointer min-h-[150px]"
                        onClick={() => flipCard(card.id)}
                        role="button"
                        aria-label={`Flashcard: ${card.isFlipped ? 'Back' : 'Front'}. Question: ${card.front}. Click to flip.`}
                        tabIndex={0}
                        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && flipCard(card.id)}
                    >
                      <p className="text-sm md:text-base text-foreground whitespace-pre-wrap">
                        {card.isFlipped ? card.back : card.front}
                      </p>
                    </CardContent>
                    <CardFooter className="p-2 border-t bg-muted/20 flex justify-between items-center">
                        <Button variant="ghost" size="sm" onClick={() => flipCard(card.id)} className="text-xs text-muted-foreground hover:text-primary hover:bg-primary/10 flex-1 justify-center">
                            <ArrowLeftRight className="mr-1.5 h-3.5 w-3.5" /> Flip
                        </Button>
                        <div className="flex gap-1.5">
                             <Button 
                                variant={card.status === 'learning' ? "secondary" : "outline"} 
                                size="iconSm" 
                                onClick={() => markCardStatus(card.id, 'learning')} 
                                className={cn(
                                    "h-7 w-7 rounded-md",
                                    card.status === 'learning' ? "bg-yellow-500 hover:bg-yellow-600 text-white border-yellow-600" : "border-yellow-500 text-yellow-600 hover:bg-yellow-500/10"
                                )}
                                aria-label="Mark as learning"
                            >
                                <XCircle className="h-4 w-4" />
                            </Button>
                            <Button 
                                variant={card.status === 'mastered' ? "default" : "outline"} 
                                size="iconSm" 
                                onClick={() => markCardStatus(card.id, 'mastered')} 
                                className={cn(
                                    "h-7 w-7 rounded-md",
                                    card.status === 'mastered' ? "bg-green-600 hover:bg-green-700 text-white border-green-700" : "border-green-600 text-green-600 hover:bg-green-500/10"
                                )}
                                aria-label="Mark as mastered"
                            >
                                <CheckCircle className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
           <CardFooter className="p-4 border-t flex items-center justify-between">
              <Button onClick={handleSaveToLibrary} disabled={!user}>
                <Save className="mr-2 h-4 w-4"/> Save to Library
              </Button>
              {aiData?.nextSteps && aiData.nextSteps.length > 0 && (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline">
                        Next Steps <ChevronDown className="ml-2 h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Recommended Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {aiData.nextSteps.map((step, index) => (
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