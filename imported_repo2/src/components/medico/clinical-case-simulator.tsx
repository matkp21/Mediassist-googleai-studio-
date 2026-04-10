
// src/components/medico/clinical-case-simulator.tsx
"use client";

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, CaseUpper, Send, FilePlus, RotateCcw, Save, ArrowRight, ChevronDown } from 'lucide-react';
import { simulateClinicalCase, type MedicoClinicalCaseInput, type MedicoClinicalCaseOutput } from '@/ai/agents/medico/ClinicalCaseSimulatorAgent';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { trackProgress } from '@/ai/agents/medico/ProgressTrackerAgent';
import { useProMode } from '@/contexts/pro-mode-context';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import Link from 'next/link';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const newCaseFormSchema = z.object({
  topic: z.string().min(3, { message: "Topic must be at least 3 characters." }).max(150, { message: "Topic too long."}),
});
type NewCaseFormValues = z.infer<typeof newCaseFormSchema>;

const responseFormSchema = z.object({
  userResponse: z.string().min(1, { message: "Response cannot be empty." }).max(1000, { message: "Response too long."}),
});
type ResponseFormValues = z.infer<typeof responseFormSchema>;

export default function ClinicalCaseSimulator() {
  const [caseData, setCaseData] = useState<MedicoClinicalCaseOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useProMode();

  const newCaseForm = useForm<NewCaseFormValues>({
    resolver: zodResolver(newCaseFormSchema),
    defaultValues: { topic: "" },
  });

  const responseForm = useForm<ResponseFormValues>({
    resolver: zodResolver(responseFormSchema),
    defaultValues: { userResponse: "" },
  });

  const handleNewCaseSubmit: SubmitHandler<NewCaseFormValues> = async (data) => {
    setIsLoading(true);
    setError(null);
    setCaseData(null);
    try {
      const input: MedicoClinicalCaseInput = { topic: data.topic };
      const result = await simulateClinicalCase(input);
      setCaseData(result);
      toast({ title: "New Case Started", description: `Case on "${data.topic}" has begun.` });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to start new case.";
      setError(msg);
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResponseSubmit: SubmitHandler<ResponseFormValues> = async (data) => {
    if (!caseData?.caseId) return;
    setIsLoading(true);
    setError(null);
    try {
      const input: MedicoClinicalCaseInput = { 
        caseId: caseData.caseId, 
        userResponse: data.userResponse,
        topic: caseData.topic
      };
      const result = await simulateClinicalCase(input);
      setCaseData(result);
      responseForm.reset(); // Clear response input
      toast({ title: "Response Submitted", description: "Case updated with your response." });

      if (result.isCompleted) {
        try {
            await trackProgress({
                activityType: 'case_sim_completed',
                topic: result.topic || 'Clinical Case',
            });
            toast({
                title: "Case Completed & Progress Tracked!",
                description: "This activity has been added to your progress."
            });
        } catch (progressError) {
            console.warn("Could not track progress for case simulation:", progressError);
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to submit response.";
      setError(msg);
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };
  
  const resetSimulation = () => {
    setCaseData(null);
    setError(null);
    setIsLoading(false);
    newCaseForm.reset();
    responseForm.reset();
  }

  const handleSaveToLibrary = async () => {
    if (!caseData || !caseData.isCompleted || !user) {
      toast({ title: "Cannot Save", description: "Only completed cases can be saved.", variant: "destructive" });
      return;
    }
    const notesContent = `
## Case Summary: ${caseData.topic || 'Clinical Case'}
${caseData.summary}
    `;
    try {
      await addDoc(collection(firestore, `users/${user.uid}/studyLibrary`), {
        type: 'notes',
        topic: `Case Simulation: ${caseData.topic || 'Completed Case'}`,
        userId: user.uid,
        notes: notesContent,
        createdAt: serverTimestamp(),
      });
      toast({ title: "Saved to Library", description: "This case summary has been saved as a note." });
    } catch (e) {
      console.error("Firestore save error:", e);
      toast({ title: "Save Failed", description: "Could not save to library.", variant: "destructive" });
    }
  };


  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive" className="rounded-lg">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!caseData && (
        <Card className="shadow-md rounded-xl border-purple-500/30 bg-gradient-to-br from-card via-card to-purple-500/5">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2"><FilePlus className="h-6 w-6 text-purple-600"/> Start New Clinical Case</CardTitle>
            <CardDescription>Enter a topic to begin a new simulation.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...newCaseForm}>
              <form onSubmit={newCaseForm.handleSubmit(handleNewCaseSubmit)} className="space-y-4">
                <FormField
                  control={newCaseForm.control}
                  name="topic"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="case-topic" className="text-base">Case Topic</FormLabel>
                      <FormControl>
                        <Input id="case-topic" placeholder="e.g., Myocardial Infarction, Pneumonia" {...field} className="rounded-lg text-base py-2.5 border-border/70 focus:border-primary" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full sm:w-auto rounded-lg py-3 text-base group" disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                  Start Case
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {caseData && (
        <Card className="shadow-md rounded-xl border-indigo-500/30 bg-gradient-to-br from-card via-card to-indigo-500/5">
          <CardHeader>
            <CardTitle className="text-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <CaseUpper className="h-6 w-6 text-indigo-600"/> Clinical Case Simulation
                </div>
                <Button variant="outline" size="sm" onClick={resetSimulation} className="text-xs rounded-md">
                    <RotateCcw className="mr-1.5 h-3 w-3"/> New Case
                </Button>
            </CardTitle>
            <CardDescription>Case ID: {caseData.caseId}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <h3 className="font-semibold text-base mb-1 text-foreground">Case Prompt:</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{caseData.prompt}</p>
            </div>

            {caseData.feedback && (
              <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                <h4 className="font-semibold text-sm text-green-700 dark:text-green-400">Feedback on previous response:</h4>
                <p className="text-xs text-green-600/90 dark:text-green-400/90 whitespace-pre-wrap">{caseData.feedback}</p>
              </div>
            )}

            {caseData.isCompleted ? (
              <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <h3 className="font-semibold text-base mb-1 text-blue-700 dark:text-blue-400">Case Completed!</h3>
                {caseData.summary && <p className="text-sm text-blue-600/90 dark:text-blue-400/90 whitespace-pre-wrap">{caseData.summary}</p>}
                <Button onClick={resetSimulation} className="mt-4 rounded-lg" variant="default">
                  Start Another Case
                </Button>
              </div>
            ) : (
              <Form {...responseForm}>
                <form onSubmit={responseForm.handleSubmit(handleResponseSubmit)} className="space-y-3">
                  <FormField
                    control={responseForm.control}
                    name="userResponse"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="case-response" className="text-base">Your Response/Action:</FormLabel>
                        <FormControl>
                          <Textarea id="case-response" placeholder="Enter your diagnosis, next steps, or questions..." {...field} className="min-h-[100px] rounded-lg text-base py-2.5 border-border/70 focus:border-primary" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full sm:w-auto rounded-lg py-3 text-base group" disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                    Submit Response
                  </Button>
                </form>
              </Form>
            )}
          </CardContent>
          {caseData.isCompleted && (
            <CardFooter className="p-4 border-t flex items-center justify-between">
              <Button onClick={handleSaveToLibrary} disabled={!user}>
                <Save className="mr-2 h-4 w-4"/> Save Case Summary
              </Button>
              {caseData.nextSteps && caseData.nextSteps.length > 0 && (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline">
                        Next Steps <ChevronDown className="ml-2 h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Recommended Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {caseData.nextSteps.map((step, index) => (
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
          )}
        </Card>
      )}
    </div>
  );
}
