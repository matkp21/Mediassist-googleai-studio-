// src/components/medico/pathomind-explainer.tsx
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
import { Loader2, BrainCircuit, Wand2, Save, ArrowRight, ChevronDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAiAgent } from '@/hooks/use-ai-agent';
import { explainPathophysiology, type PathoMindInput, type PathoMindOutput } from '@/ai/agents/medico/PathoMindAgent';
import { useProMode } from '@/contexts/pro-mode-context';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { MarkdownRenderer } from '@/components/markdown/markdown-renderer';
import Link from 'next/link';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MermaidRenderer } from '@/components/markdown/mermaid-renderer';

const formSchema = z.object({
  topic: z.string().min(3, { message: "Topic must be at least 3 characters." }).max(150),
});
type PathoMindFormValues = z.infer<typeof formSchema>;

export function PathoMindExplainer() {
  const { toast } = useToast();
  const { user } = useProMode();
  const { execute: runExplanation, data: explanationData, isLoading, error, reset } = useAiAgent(explainPathophysiology, {
    onSuccess: (data, input) => {
      toast({
        title: "Explanation Ready!",
        description: `Pathophysiology for "${input.topic}" has been generated.`,
      });
    },
  });

  const form = useForm<PathoMindFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { topic: "" },
  });

  const onSubmit: SubmitHandler<PathoMindFormValues> = async (data) => {
    await runExplanation(data as PathoMindInput);
  };

  const handleReset = () => {
    form.reset();
    reset();
  };

  const handleSaveToLibrary = async () => {
    if (!explanationData || !user) {
      toast({ title: "Cannot Save", description: "No content to save or user not logged in.", variant: "destructive" });
      return;
    }
    try {
      await addDoc(collection(firestore, `users/${user.uid}/studyLibrary`), {
        type: 'notes', // Save as a note type
        topic: `Pathophysiology of ${form.getValues('topic')}`,
        userId: user.uid,
        notes: explanationData.explanation,
        diagram: explanationData.diagram || null,
        createdAt: serverTimestamp(),
      });
      toast({ title: "Saved to Library", description: "This explanation has been saved." });
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
            name="topic"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="topic-pathomind" className="text-base">Disease or Topic</FormLabel>
                <FormControl>
                  <Input
                    id="topic-pathomind"
                    placeholder="e.g., Diabetes Mellitus Type 1, Asthma"
                    className="rounded-lg text-base py-2.5 border-border/70 focus:border-primary"
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
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Explaining...</>
              ) : (
                <><Wand2 className="mr-2 h-4 w-4 transition-transform group-hover:rotate-12" /> Explain Pathophysiology</>
              )}
            </Button>
            {explanationData && (
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

      {explanationData && (
        <Card className="shadow-md rounded-xl mt-6 border-blue-500/30 bg-gradient-to-br from-card via-card to-blue-500/5 relative">
          {isLoading && (
            <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-10 rounded-xl">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Updating...</span>
            </div>
          )}
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <BrainCircuit className="h-6 w-6 text-blue-600" />
              Pathophysiology: {form.getValues("topic")}
            </CardTitle>
            <CardDescription>AI-generated explanation of the disease process.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="lg:col-span-1">
                <h4 className="font-semibold mb-2">Explanation</h4>
                <ScrollArea className="h-[400px] p-1 border bg-background rounded-lg">
                  <div className="p-4">
                    <MarkdownRenderer content={explanationData.explanation} />
                  </div>
                </ScrollArea>
              </div>
              <div className="lg:col-span-1">
                <h4 className="font-semibold mb-2">Process Diagram</h4>
                <div className="h-[400px] p-1 border bg-background rounded-lg">
                  <div className="p-4 text-sm h-full">
                    {explanationData.diagram ? (
                       <MermaidRenderer chart={explanationData.diagram} />
                    ) : <p className="text-muted-foreground text-center py-8">No diagram was generated for this topic.</p>}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="p-4 border-t flex items-center justify-between">
            <Button onClick={handleSaveToLibrary} disabled={!user}>
              <Save className="mr-2 h-4 w-4"/> Save to Library
            </Button>
            {explanationData.nextSteps && explanationData.nextSteps.length > 0 && (
              <div className="flex rounded-md border">
                <Button asChild className="flex-grow rounded-r-none border-r-0 font-semibold">
                  <Link href={`/medico/${explanationData.nextSteps[0].toolId}?topic=${encodeURIComponent(explanationData.nextSteps[0].prefilledTopic)}`}>
                    {explanationData.nextSteps[0].cta}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                {explanationData.nextSteps.length > 1 && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon" className="rounded-l-none">
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>More Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {explanationData.nextSteps.slice(1).map((step, index) => (
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
