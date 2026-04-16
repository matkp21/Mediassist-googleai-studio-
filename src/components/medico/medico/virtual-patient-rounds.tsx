// src/components/medico/virtual-patient-rounds.tsx
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
import { Loader2, Users, Send, FilePlus, RotateCcw, UserCheck, Save, ArrowRight, ChevronDown } from 'lucide-react';
import { conductVirtualRound, type MedicoVirtualRoundsInput, type MedicoVirtualRoundsOutput } from '@/ai/agents/medico/VirtualPatientRoundsAgent';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { trackProgress } from '@/ai/agents/medico/ProgressTrackerAgent';
import { useProMode } from '@/contexts/pro-mode-context';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import Link from 'next/link';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const newRoundFormSchema = z.object({
  patientFocus: z.string().optional().describe('Specific patient type or condition for new round.'),
});
type NewRoundFormValues = z.infer<typeof newRoundFormSchema>;

const actionFormSchema = z.object({
  userAction: z.string().min(1, { message: "Action/query cannot be empty." }).max(1000, { message: "Action/query too long."}),
});
type ActionFormValues = z.infer<typeof actionFormSchema>;

export default function VirtualPatientRounds() {
  const [roundData, setRoundData] = useState<MedicoVirtualRoundsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useProMode();

  const newRoundForm = useForm<NewRoundFormValues>({
    resolver: zodResolver(newRoundFormSchema),
    defaultValues: { patientFocus: "" },
  });

  const actionForm = useForm<ActionFormValues>({
    resolver: zodResolver(actionFormSchema),
    defaultValues: { userAction: "" },
  });

  const handleNewRoundSubmit: SubmitHandler<NewRoundFormValues> = async (data) => {
    setIsLoading(true);
    setError(null);
    setRoundData(null);
    try {
      const input: MedicoVirtualRoundsInput = { patientFocus: data.patientFocus || undefined };
      const result = await conductVirtualRound(input);
      setRoundData(result);
      toast({ title: "New Round Started", description: `Virtual patient round has begun.` });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to start new round.";
      setError(msg);
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleActionSubmit: SubmitHandler<ActionFormValues> = async (data) => {
    if (!roundData?.caseId) return;
    setIsLoading(true);
    setError(null);
    try {
      const input: MedicoVirtualRoundsInput = { 
        caseId: roundData.caseId, 
        userAction: data.userAction,
        patientFocus: roundData.topic, // Pass topic back as patientFocus
      };
      const result = await conductVirtualRound(input);
      setRoundData(result);
      actionForm.reset(); // Clear action input
      toast({ title: "Action Submitted", description: "Round updated with your action." });

      if (result.isCompleted) {
        try {
            const progressResult = await trackProgress({
                activityType: 'case_sim_completed',
                topic: result.topic || 'Virtual Round'
            });
            toast({
                title: "Round Completed & Progress Tracked!",
                description: progressResult.progressUpdateMessage
            });
        } catch (progressError) {
            console.warn("Could not track progress for virtual round:", progressError);
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to submit action.";
      setError(msg);
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };
  
  const resetSimulation = () => {
    setRoundData(null);
    setError(null);
    setIsLoading(false);
    newRoundForm.reset();
    actionForm.reset();
  }
  
  const handleSaveToLibrary = async () => {
    if (!roundData || !roundData.isCompleted || !user) {
      toast({ title: "Cannot Save", description: "Only completed rounds can be saved.", variant: "destructive" });
      return;
    }
    const notesContent = `
## Patient Round Summary: ${roundData.topic || 'Completed Round'}
${roundData.patientSummary}
    `;
    try {
      await addDoc(collection(firestore, `users/${user.uid}/studyLibrary`), {
        type: 'notes',
        topic: `Virtual Round: ${roundData.topic || 'Completed Round'}`,
        userId: user.uid,
        notes: notesContent,
        createdAt: serverTimestamp(),
      });
      toast({ title: "Saved to Library", description: "This round summary has been saved as a note." });
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

      {!roundData && (
        <Card className="shadow-md rounded-xl border-emerald-500/30 bg-gradient-to-br from-card via-card to-emerald-500/5">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2"><FilePlus className="h-6 w-6 text-emerald-600"/> Start New Virtual Round</CardTitle>
            <CardDescription>Enter an optional patient focus (e.g., "Pediatric Asthma") or leave blank for a general case.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...newRoundForm}>
              <form onSubmit={newRoundForm.handleSubmit(handleNewRoundSubmit)} className="space-y-4">
                <FormField
                  control={newRoundForm.control}
                  name="patientFocus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="patient-focus" className="text-base">Patient Focus (Optional)</FormLabel>
                      <FormControl>
                        <Input id="patient-focus" placeholder="e.g., Post-operative care, Diabetic foot" {...field} className="rounded-lg text-base py-2.5 border-border/70 focus:border-primary" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full sm:w-auto rounded-lg py-3 text-base group" disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Users className="mr-2 h-4 w-4" />}
                  Start Round
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {roundData && (
        <Card className="shadow-md rounded-xl border-cyan-500/30 bg-gradient-to-br from-card via-card to-cyan-500/5">
          <CardHeader>
            <CardTitle className="text-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <UserCheck className="h-6 w-6 text-cyan-600"/> Virtual Patient Round
                </div>
                <Button variant="outline" size="sm" onClick={resetSimulation} className="text-xs rounded-md">
                    <RotateCcw className="mr-1.5 h-3 w-3"/> New Round
                </Button>
            </CardTitle>
            <CardDescription>Case ID: {roundData.caseId}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted/50 rounded-lg space-y-2">
              <div>
                <h3 className="font-semibold text-base mb-0.5 text-foreground">Patient Summary:</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{roundData.patientSummary}</p>
              </div>
              <div>
                <h3 className="font-semibold text-base mb-0.5 text-foreground">Current Observation/Status:</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{roundData.currentObservation}</p>
              </div>
              <div>
                <h3 className="font-semibold text-base mb-0.5 text-foreground">Next Prompt for Student:</h3>
                <p className="text-sm text-cyan-700 dark:text-cyan-400 whitespace-pre-wrap font-medium">{roundData.nextPrompt}</p>
              </div>
            </div>

            {roundData.isCompleted ? (
              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                <h3 className="font-semibold text-base mb-1 text-green-700 dark:text-green-400">Patient Encounter Completed!</h3>
                <p className="text-sm text-green-600/90 dark:text-green-400/90">This part of the round is finished. You can start a new round.</p>
                <Button onClick={resetSimulation} className="mt-4 rounded-lg" variant="default">
                  Start Another Round
                </Button>
              </div>
            ) : (
              <Form {...actionForm}>
                <form onSubmit={actionForm.handleSubmit(handleActionSubmit)} className="space-y-3">
                  <FormField
                    control={actionForm.control}
                    name="userAction"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="user-action" className="text-base">Your Action/Query:</FormLabel>
                        <FormControl>
                          <Textarea id="user-action" placeholder="e.g., Order CBC and electrolytes, Ask about medication history..." {...field} className="min-h-[100px] rounded-lg text-base py-2.5 border-border/70 focus:border-primary" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full sm:w-auto rounded-lg py-3 text-base group" disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                    Submit Action
                  </Button>
                </form>
              </Form>
            )}
          </CardContent>
          {roundData.isCompleted && (
            <CardFooter className="p-4 border-t flex items-center justify-between">
              <Button onClick={handleSaveToLibrary} disabled={!user}>
                <Save className="mr-2 h-4 w-4"/> Save Round Summary
              </Button>
              {roundData.nextSteps && roundData.nextSteps.length > 0 && (
                <div className="flex rounded-md border">
                  <Button asChild className="flex-grow rounded-r-none border-r-0 font-semibold">
                    <Link href={`/medico/${roundData.nextSteps[0].toolId}?topic=${encodeURIComponent(roundData.nextSteps[0].prefilledTopic)}`}>
                      {roundData.nextSteps[0].cta}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  {roundData.nextSteps.length > 1 && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon" className="rounded-l-none">
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>More Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {roundData.nextSteps.slice(1).map((step, index) => (
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
          )}
        </Card>
      )}
    </div>
  );
}
