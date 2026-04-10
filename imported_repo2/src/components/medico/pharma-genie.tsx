// src/components/medico/pharma-genie.tsx

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
import { Loader2, FlaskConical, Wand2, Save, ArrowRight, ChevronDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAiAgent } from '@/hooks/use-ai-agent';
import { getDrugInfo, type PharmaGenieInput, type PharmaGenieOutput } from '@/ai/agents/medico/PharmaGenieAgent';
import { useProMode } from '@/contexts/pro-mode-context';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import Link from 'next/link';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';


const formSchema = z.object({
  drugName: z.string().min(3, { message: "Drug name must be at least 3 characters." }),
});
type PharmaGenieFormValues = z.infer<typeof formSchema>;

export function PharmaGenie() {
  const { toast } = useToast();
  const { user } = useProMode();
  const { execute: runGetDrugInfo, data: drugData, isLoading, error, reset } = useAiAgent(getDrugInfo, {
    onSuccess: (data, input) => {
      toast({
        title: "Drug Info Ready!",
        description: `Information for "${input.drugName}" has been generated.`,
      });
    },
  });

  const form = useForm<PharmaGenieFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { drugName: "" },
  });

  const onSubmit: SubmitHandler<PharmaGenieFormValues> = async (data) => {
    await runGetDrugInfo(data as PharmaGenieInput);
  };

  const handleReset = () => {
    form.reset();
    reset();
  };
  
  const handleSaveToLibrary = async () => {
    if (!drugData || !user) {
      toast({ title: "Cannot Save", description: "No content to save or user not logged in.", variant: "destructive" });
      return;
    }
    const notesContent = `
## Drug Class
${drugData.drugClass}

## Mechanism of Action
${drugData.mechanismOfAction}

## Key Indications
${drugData.indications.map(i => `- ${i}`).join('\n')}

## Common Side Effects
${drugData.sideEffects.map(s => `- ${s}`).join('\n')}
    `;
    try {
      await addDoc(collection(firestore, `users/${user.uid}/studyLibrary`), {
        type: 'notes',
        topic: `Pharmacology: ${form.getValues('drugName')}`,
        userId: user.uid,
        notes: notesContent,
        createdAt: serverTimestamp(),
      });
      toast({ title: "Saved to Library", description: "This drug profile has been saved as a note." });
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
            name="drugName"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="drugName" className="text-base">Drug Name</FormLabel>
                <FormControl>
                  <Input
                    id="drugName"
                    placeholder="e.g., Aspirin, Metformin"
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
                <><Wand2 className="mr-2 h-4 w-4 transition-transform group-hover:rotate-12" /> Get Drug Info</>
              )}
            </Button>
            {drugData && (
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

      {drugData && (
        <Card className="shadow-md rounded-xl mt-6 border-rose-500/30 bg-gradient-to-br from-card via-card to-rose-500/5 relative">
           {isLoading && (
            <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-10 rounded-xl">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Updating...</span>
            </div>
          )}
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <FlaskConical className="h-6 w-6 text-rose-600" />
              Pharmacology Profile: {form.getValues("drugName")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] p-1 border bg-background rounded-lg">
                <div className="p-4 space-y-4">
                    <div>
                        <h4 className="font-semibold text-md mb-1 text-rose-700 dark:text-rose-400">Drug Class:</h4>
                        <p className="text-sm">{drugData.drugClass}</p>
                    </div>
                     <div>
                        <h4 className="font-semibold text-md mb-1 text-rose-700 dark:text-rose-400">Mechanism of Action:</h4>
                        <p className="text-sm whitespace-pre-wrap prose prose-sm dark:prose-invert max-w-none">{drugData.mechanismOfAction}</p>
                    </div>
                     <div>
                        <h4 className="font-semibold text-md mb-1 text-rose-700 dark:text-rose-400">Key Indications:</h4>
                         <ul className="list-disc list-inside ml-4 space-y-1 text-sm">
                            {drugData.indications.map((item, index) => (
                                <li key={index}>{item}</li>
                            ))}
                        </ul>
                    </div>
                     <div>
                        <h4 className="font-semibold text-md mb-1 text-rose-700 dark:text-rose-400">Common Side Effects:</h4>
                        <ul className="list-disc list-inside ml-4 space-y-1 text-sm">
                            {drugData.sideEffects.map((item, index) => (
                                <li key={index}>{item}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            </ScrollArea>
          </CardContent>
          <CardFooter className="p-4 border-t flex items-center justify-between">
            <Button onClick={handleSaveToLibrary} disabled={!user}>
              <Save className="mr-2 h-4 w-4"/> Save to Library
            </Button>
             {drugData.nextSteps && drugData.nextSteps.length > 0 && (
                <div className="flex rounded-md border">
                  <Button asChild className="flex-grow rounded-r-none border-r-0 font-semibold">
                    <Link href={`/medico/${drugData.nextSteps[0].toolId}?topic=${encodeURIComponent(drugData.nextSteps[0].prefilledTopic)}`}>
                      {drugData.nextSteps[0].cta}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  {drugData.nextSteps.length > 1 && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon" className="rounded-l-none">
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>More Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {drugData.nextSteps.slice(1).map((step, index) => (
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
