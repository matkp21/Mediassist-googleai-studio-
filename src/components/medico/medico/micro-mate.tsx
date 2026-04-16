// src/components/medico/micro-mate.tsx
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
import { Loader2, Microscope, Wand2, Save, ArrowRight, ChevronDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAiAgent } from '@/hooks/use-ai-agent';
import { getMicrobeInfo, type MicroMateInput, type MicroMateOutput } from '@/ai/agents/medico/MicroMateAgent';
import { useProMode } from '@/contexts/pro-mode-context';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import Link from 'next/link';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MicroMateOutputSchema } from '@/ai/schemas/medico-tools-schemas';


const formSchema = z.object({
  microorganism: z.string().min(3, { message: "Microorganism name must be at least 3 characters." }),
});
type MicroMateFormValues = z.infer<typeof formSchema>;

export default function MicroMate() {
  const { toast } = useToast();
  const { user } = useProMode();
  const { execute: runGetMicrobeInfo, data: microbeData, isLoading, error, reset } = useAiAgent(getMicrobeInfo, MicroMateOutputSchema, {
    onSuccess: (data, input) => {
      toast({
        title: "Microbe Info Ready!",
        description: `Information for "${input.microorganism}" has been generated.`,
      });
    },
  });

  const form = useForm<MicroMateFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { microorganism: "" },
  });

  const onSubmit: SubmitHandler<MicroMateFormValues> = async (data) => {
    await runGetMicrobeInfo(data as MicroMateInput);
  };

  const handleReset = () => {
    form.reset();
    reset();
  };

  const handleSaveToLibrary = async () => {
    if (!microbeData || !user) {
      toast({ title: "Cannot Save", description: "No content to save or user not logged in.", variant: "destructive" });
      return;
    }
    const notesContent = `
## Key Characteristics
${microbeData.characteristics}

## Virulence Factors
${microbeData.virulenceFactors}

## Diseases Caused
${microbeData.diseasesCaused}

## Lab Diagnosis
${microbeData.labDiagnosis}
    `;
    try {
      await addDoc(collection(firestore, `users/${user.uid}/studyLibrary`), {
        type: 'notes',
        topic: `Microbiology: ${form.getValues('microorganism')}`,
        userId: user.uid,
        notes: notesContent,
        createdAt: serverTimestamp(),
      });
      toast({ title: "Saved to Library", description: "This microbe profile has been saved as a note." });
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
            name="microorganism"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="microorganism" className="text-base">Microorganism Name</FormLabel>
                <FormControl>
                  <Input
                    id="microorganism"
                    placeholder="e.g., Staphylococcus aureus, Escherichia coli"
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
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</>
              ) : (
                <><Wand2 className="mr-2 h-4 w-4 transition-transform group-hover:rotate-12" /> Get Info</>
              )}
            </Button>
            {microbeData && (
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

      {microbeData && (
        <Card className="shadow-md rounded-xl mt-6 border-lime-500/30 bg-gradient-to-br from-card via-card to-lime-500/5 relative">
           {isLoading && (
            <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-10 rounded-xl">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Updating...</span>
            </div>
          )}
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Microscope className="h-6 w-6 text-lime-600" />
              Microbe Profile: {form.getValues("microorganism")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] p-1 border bg-background rounded-lg">
                <div className="p-4 space-y-4">
                    <div>
                        <h4 className="font-semibold text-md mb-1 text-lime-700 dark:text-lime-400">Key Characteristics:</h4>
                        <p className="text-sm whitespace-pre-wrap prose prose-sm dark:prose-invert max-w-none">{microbeData.characteristics}</p>
                    </div>
                     <div>
                        <h4 className="font-semibold text-md mb-1 text-lime-700 dark:text-lime-400">Virulence Factors:</h4>
                        <p className="text-sm whitespace-pre-wrap prose prose-sm dark:prose-invert max-w-none">{microbeData.virulenceFactors}</p>
                    </div>
                     <div>
                        <h4 className="font-semibold text-md mb-1 text-lime-700 dark:text-lime-400">Diseases Caused:</h4>
                        <p className="text-sm whitespace-pre-wrap prose prose-sm dark:prose-invert max-w-none">{microbeData.diseasesCaused}</p>
                    </div>
                     <div>
                        <h4 className="font-semibold text-md mb-1 text-lime-700 dark:text-lime-400">Lab Diagnosis:</h4>
                        <p className="text-sm whitespace-pre-wrap prose prose-sm dark:prose-invert max-w-none">{microbeData.labDiagnosis}</p>
                    </div>
                </div>
            </ScrollArea>
          </CardContent>
          <CardFooter className="p-4 border-t flex items-center justify-between">
            <Button onClick={handleSaveToLibrary} disabled={!user}>
              <Save className="mr-2 h-4 w-4"/> Save to Library
            </Button>
            {microbeData.nextSteps && microbeData.nextSteps.length > 0 && (
                <div className="flex rounded-md border">
                  <Button asChild className="flex-grow rounded-r-none border-r-0 font-semibold">
                    <Link href={`/medico/${microbeData.nextSteps[0].toolId}?topic=${encodeURIComponent(microbeData.nextSteps[0].prefilledTopic)}`}>
                      {microbeData.nextSteps[0].cta}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  {microbeData.nextSteps.length > 1 && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon" className="rounded-l-none">
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>More Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {microbeData.nextSteps.slice(1).map((step, index) => (
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
