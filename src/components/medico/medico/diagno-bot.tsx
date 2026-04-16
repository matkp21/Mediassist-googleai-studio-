// src/components/medico/diagno-bot.tsx

"use client";

import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, TestTubeDiagonal, Wand2, Save, ArrowRight, ChevronDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAiAgent } from '@/hooks/use-ai-agent';
import { interpretLabs, type DiagnoBotInput, type DiagnoBotOutput } from '@/ai/agents/medico/DiagnoBotAgent';
import { Textarea } from '../ui/textarea';
import { useProMode } from '@/contexts/pro-mode-context';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { MarkdownRenderer } from '@/components/markdown/markdown-renderer';
import Link from 'next/link';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';


const formSchema = z.object({
  labResults: z.string().min(10, { message: "Please provide some lab results to interpret." }),
});
type DiagnoBotFormValues = z.infer<typeof formSchema>;

export function DiagnoBot() {
  const { toast } = useToast();
  const { user } = useProMode();
  const { execute: runInterpretation, data: interpretationData, isLoading, error, reset } = useAiAgent(interpretLabs, {
    onSuccess: (data, input) => {
      toast({
        title: "Interpretation Ready!",
        description: "Lab results have been interpreted.",
      });
    },
  });

  const form = useForm<DiagnoBotFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { labResults: "" },
  });

  const onSubmit: SubmitHandler<DiagnoBotFormValues> = async (data) => {
    await runInterpretation(data as DiagnoBotInput);
  };

  const handleReset = () => {
    form.reset();
    reset();
  };

  const handleSaveToLibrary = async () => {
    if (!interpretationData || !user) {
      toast({ title: "Cannot Save", description: "No content to save or user not logged in.", variant: "destructive" });
      return;
    }
    const notesContent = `
## Lab Interpretation
${interpretationData.interpretation}

## Likely Differentials Suggested by Labs
${interpretationData.likelyDifferentials.map(d => `- ${d}`).join('\n')}
    `;
    try {
      await addDoc(collection(firestore, `users/${user.uid}/studyLibrary`), {
        type: 'notes',
        topic: `Lab Interpretation for: ${form.getValues('labResults').substring(0, 30)}...`,
        userId: user.uid,
        notes: notesContent,
        createdAt: serverTimestamp(),
      });
      toast({ title: "Saved to Library", description: "This lab interpretation has been saved as a note." });
    } catch (e) {
      console.error("Firestore save error:", e);
      toast({ title: "Save Failed", description: "Could not save to library.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-1">
          <FormField
            control={form.control}
            name="labResults"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="lab-results" className="text-base">Lab Results</FormLabel>
                <FormControl>
                  <Textarea
                    id="lab-results"
                    placeholder="Paste or type lab results here. e.g., 'CBC: Hb 10.5 g/dL, WBC 15,000/µL, Platelets 450,000/µL. BMP: Na 135, K 3.0, Cr 1.5.'"
                    className="rounded-lg text-base py-2.5 border-border/70 focus:border-primary min-h-[150px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex gap-2">
            <Button type="submit" className="w-full sm:w-auto rounded-lg py-3 text-base group" disabled={isLoading}>
              {isLoading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Interpreting...</>
              ) : (
                <><Wand2 className="mr-2 h-4 w-4 transition-transform group-hover:rotate-12" /> Interpret Results</>
              )}
            </Button>
            {interpretationData && (
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

      {interpretationData && (
        <Card className="shadow-md rounded-xl mt-6 border-cyan-500/30 bg-gradient-to-br from-card via-card to-cyan-500/5 relative">
           {isLoading && (
            <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-10 rounded-xl">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Updating...</span>
            </div>
          )}
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <TestTubeDiagonal className="h-6 w-6 text-cyan-600" />
              DiagnoBot Interpretation
            </CardTitle>
          </CardHeader>
          <CardContent>
             <ScrollArea className="h-[400px] p-1 border bg-background rounded-lg">
                <div className="p-4 space-y-4">
                     <div>
                        <h4 className="font-semibold text-md mb-2 text-cyan-700 dark:text-cyan-400">Interpretation:</h4>
                        <div className="p-4 bg-muted/50 rounded-md">
                            <MarkdownRenderer content={interpretationData.interpretation} />
                        </div>
                    </div>
                     {interpretationData.likelyDifferentials && interpretationData.likelyDifferentials.length > 0 && (
                        <div>
                            <h4 className="font-semibold text-md mb-2 text-cyan-700 dark:text-cyan-400">Likely Differentials Suggested by Labs:</h4>
                             <ul className="list-disc list-inside ml-4 space-y-1 text-sm">
                                {interpretationData.likelyDifferentials.map((item, index) => (
                                    <li key={index}>{item}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </ScrollArea>
          </CardContent>
          <CardFooter className="p-4 border-t flex items-center justify-between">
            <Button onClick={handleSaveToLibrary} disabled={!user}>
              <Save className="mr-2 h-4 w-4"/> Save to Library
            </Button>
             {interpretationData.nextSteps && interpretationData.nextSteps.length > 0 && (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline">
                        Next Steps <ChevronDown className="ml-2 h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Recommended Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {interpretationData.nextSteps.map((step, index) => (
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
