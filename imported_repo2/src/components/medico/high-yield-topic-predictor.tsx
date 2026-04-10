
// src/components/medico/high-yield-topic-predictor.tsx
"use client";

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, TrendingUp, Wand2, ListChecks, Save, ArrowRight, ChevronDown } from 'lucide-react';
import { predictHighYieldTopics, type MedicoTopicPredictorInput, type MedicoTopicPredictorOutput } from '@/ai/agents/medico/HighYieldTopicPredictorAgent';
import { useToast } from '@/hooks/use-toast';
import { trackProgress } from '@/ai/agents/medico/ProgressTrackerAgent';
import { useProMode } from '@/contexts/pro-mode-context';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import Link from 'next/link';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const formSchema = z.object({
  examType: z.string().min(3, { message: "Exam type must be at least 3 characters." }).max(100, { message: "Exam type too long."}),
  subject: z.string().optional(),
});

type TopicPredictorFormValues = z.infer<typeof formSchema>;

export function HighYieldTopicPredictor() {
  const [isLoading, setIsLoading] = useState(false);
  const [predictionResult, setPredictionResult] = useState<MedicoTopicPredictorOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useProMode();

  const form = useForm<TopicPredictorFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      examType: "",
      subject: "",
    },
  });

  const onSubmit: SubmitHandler<TopicPredictorFormValues> = async (data) => {
    setIsLoading(true);
    setPredictionResult(null);
    setError(null);

    try {
      const input: MedicoTopicPredictorInput = {
        examType: data.examType,
        subject: data.subject || undefined, // Pass undefined if empty
      };
      const result = await predictHighYieldTopics(input);
      setPredictionResult(result);

       if (result.predictedTopics.length > 0) {
            // Track progress only on successful prediction
            try {
                await trackProgress({
                    activityType: 'notes_review', // Consider this a planning activity
                    topic: `Topic Prediction for ${data.examType}`
                });
                toast({
                    title: "Progress Tracked!",
                    description: "This activity has been added to your progress."
                });
            } catch (progressError) {
                console.warn("Could not track progress for topic prediction:", progressError);
            }
       }

    } catch (err) {
      console.error("High-yield topic prediction error:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(errorMessage);
      toast({
        title: "Prediction Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveToLibrary = async () => {
    if (!predictionResult || !user) {
      toast({ title: "Cannot Save", description: "No content to save or user not logged in.", variant: "destructive" });
      return;
    }
    const notesContent = `
## Predicted High-Yield Topics for ${form.getValues('examType')}
${predictionResult.predictedTopics.map(t => `- ${t}`).join('\n')}

## Rationale
${predictionResult.rationale || 'N/A'}
    `;
    try {
      await addDoc(collection(firestore, `users/${user.uid}/studyLibrary`), {
        type: 'notes',
        topic: `High-Yield Topics: ${form.getValues('examType')}`,
        userId: user.uid,
        notes: notesContent,
        rationale: predictionResult.rationale || null,
        createdAt: serverTimestamp(),
      });
      toast({ title: "Saved to Library", description: "This topic prediction has been saved as a note." });
    } catch (e) {
      console.error("Firestore save error:", e);
      toast({ title: "Save Failed", description: "Could not save to library.", variant: "destructive" });
    }
  };


  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="examType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="examType-topics" className="text-base">Exam Type</FormLabel>
                  <FormControl>
                    <Input
                      id="examType-topics"
                      placeholder="e.g., MBBS Final Year, USMLE Step 1"
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
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="subject-topics" className="text-base">Subject (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      id="subject-topics"
                      placeholder="e.g., Surgery, Pediatrics"
                      className="rounded-lg text-base py-2.5 border-border/70 focus:border-primary"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button type="submit" className="w-full sm:w-auto rounded-lg py-3 text-base group" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Predicting...
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                Predict High-Yield Topics
              </>
            )}
          </Button>
        </form>
      </Form>

      {error && (
        <Alert variant="destructive" className="rounded-lg">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {predictionResult && (
        <Card className="shadow-md rounded-xl mt-6 border-orange-500/30 bg-gradient-to-br from-card via-card to-orange-500/5">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-orange-600" />
              High-Yield Topics for: {form.getValues("examType")} {form.getValues("subject") && `(${form.getValues("subject")})`}
            </CardTitle>
            <CardDescription>Focus on these topics for your exam preparation.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
                <h3 className="font-semibold text-md text-orange-700 dark:text-orange-400 flex items-center">
                    <ListChecks className="mr-2 h-5 w-5" />
                    Predicted Topics:
                </h3>
                {predictionResult.predictedTopics.length > 0 ? (
                <ul className="list-decimal list-inside bg-muted/50 p-4 rounded-lg space-y-1 text-sm text-secondary-foreground">
                    {predictionResult.predictedTopics.map((topic, index) => (
                    <li key={index}>{topic}</li>
                    ))}
                </ul>
                ) : (
                <p className="text-muted-foreground text-sm">No specific topics could be predicted based on the input.</p>
                )}

                {predictionResult.rationale && (
                    <div className="mt-3">
                        <h4 className="font-semibold text-md text-orange-700 dark:text-orange-400">Rationale:</h4>
                        <p className="text-sm bg-muted/50 p-3 rounded-lg whitespace-pre-wrap text-secondary-foreground">
                            {predictionResult.rationale}
                        </p>
                    </div>
                )}
            </div>
          </CardContent>
          <CardFooter className="p-4 border-t flex items-center justify-between">
            <Button onClick={handleSaveToLibrary} disabled={!user || predictionResult.predictedTopics.length === 0}>
              <Save className="mr-2 h-4 w-4"/> Save as Note
            </Button>
             {predictionResult.nextSteps && predictionResult.nextSteps.length > 0 && (
                <div className="flex rounded-md border">
                  <Button asChild className="flex-grow rounded-r-none border-r-0 font-semibold">
                    <Link href={`/medico/${predictionResult.nextSteps[0].toolId}?topic=${encodeURIComponent(predictionResult.nextSteps[0].prefilledTopic)}`}>
                      {predictionResult.nextSteps[0].cta}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  {predictionResult.nextSteps.length > 1 && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon" className="rounded-l-none">
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>More Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {predictionResult.nextSteps.slice(1).map((step, index) => (
                          <DropdownMenuItem key={index} asChild className="cursor-pointer">
                            <Link href={`/medico/${step.toolId}?topic=${encodeURIComponent(step.prefilledTopic)}`}>
                              {step.cta}
                            </Link>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              )}
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
