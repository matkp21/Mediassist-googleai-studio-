// src/components/medico/anatomy-visualizer.tsx
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Eye, Wand2, Bone, Brain, Save, ArrowRight, ChevronDown } from 'lucide-react';
import { getAnatomyDescription, type MedicoAnatomyVisualizerInput, type MedicoAnatomyVisualizerOutput } from '@/ai/agents/medico/AnatomyVisualizerAgent';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { useProMode } from '@/contexts/pro-mode-context';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import Link from 'next/link';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAiAgent } from '@/hooks/use-ai-agent';
import { MedicoAnatomyVisualizerOutputSchema } from '@/ai/schemas/medico-tools-schemas';

const formSchema = z.object({
  anatomicalStructure: z.string().min(3, { message: "Structure name must be at least 3 characters." }).max(100, { message: "Structure name too long."}),
});

type AnatomyFormValues = z.infer<typeof formSchema>;

export default function AnatomyVisualizer() {
  const { toast } = useToast();
  const { user } = useProMode();
  const { execute: runGetAnatomy, data: anatomyData, isLoading, error, reset } = useAiAgent(getAnatomyDescription, MedicoAnatomyVisualizerOutputSchema, {
    onSuccess: (data, input) => {
        toast({
            title: "Anatomy Description Ready!",
            description: `Details for "${input.anatomicalStructure}" have been generated.`,
        });
    }
  });


  const form = useForm<AnatomyFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      anatomicalStructure: "",
    },
  });

  const onSubmit: SubmitHandler<AnatomyFormValues> = async (data) => {
    await runGetAnatomy(data as MedicoAnatomyVisualizerInput);
  };
  
  const handleSaveToLibrary = async () => {
    if (!anatomyData || !user) {
      toast({ title: "Cannot Save", description: "No content to save or user not logged in.", variant: "destructive" });
      return;
    }
    const notesContent = `
## Description
${anatomyData.description}

## Related Structures
${anatomyData.relatedStructures?.map(s => `- ${s}`).join('\n') || 'N/A'}
    `;
    try {
      await addDoc(collection(firestore, `users/${user.uid}/studyLibrary`), {
        type: 'notes',
        topic: `Anatomy: ${form.getValues('anatomicalStructure')}`,
        userId: user.uid,
        notes: notesContent,
        imageUrl: anatomyData.imageUrl || null,
        createdAt: serverTimestamp(),
      });
      toast({ title: "Saved to Library", description: "This anatomy description has been saved as a note." });
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
            name="anatomicalStructure"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="anatomicalStructure-input" className="text-base">Anatomical Structure</FormLabel>
                <FormControl>
                  <Input
                    id="anatomicalStructure-input"
                    placeholder="e.g., Liver, Femur, Circle of Willis"
                    className="rounded-lg text-base py-2.5 border-border/70 focus:border-primary"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full sm:w-auto rounded-lg py-3 text-base group" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Visualizing...
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                Get Description
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

      {anatomyData && (
        <Card className="shadow-md rounded-xl mt-6 border-teal-500/30 bg-gradient-to-br from-card via-card to-teal-500/5">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Eye className="h-6 w-6 text-teal-600" />
              Anatomy: {form.getValues("anatomicalStructure")}
            </CardTitle>
            <CardDescription>Detailed information about the selected structure.</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] p-1 border bg-background rounded-lg">
              <div className="p-4 space-y-3">
                {anatomyData.imageUrl && (
                  <div className="relative aspect-video w-full max-w-md mx-auto border rounded-lg overflow-hidden bg-muted/30 mb-3">
                    <Image src={anatomyData.imageUrl} alt={`Diagram of ${form.getValues("anatomicalStructure")}`} fill objectFit="contain" data-ai-hint="anatomical diagram" />
                  </div>
                )}
                <div>
                    <h4 className="font-semibold text-md mb-1 text-teal-700 dark:text-teal-400">Description:</h4>
                    <p className="text-sm whitespace-pre-wrap prose prose-sm dark:prose-invert max-w-none">{anatomyData.description}</p>
                </div>
                {anatomyData.relatedStructures && anatomyData.relatedStructures.length > 0 && (
                  <div className="mt-3">
                    <h4 className="font-semibold text-md mb-1 text-teal-700 dark:text-teal-400">Related Structures:</h4>
                    <ul className="list-disc list-inside ml-4 space-y-0.5 text-sm">
                      {anatomyData.relatedStructures.map((structure, index) => (
                        <li key={index}>{structure}</li>
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
            {anatomyData.nextSteps && anatomyData.nextSteps.length > 0 && (
              <div className="flex rounded-md border">
                <Button asChild className="flex-grow rounded-r-none border-r-0 font-semibold">
                  <Link href={`/medico/${anatomyData.nextSteps[0].toolId}?topic=${encodeURIComponent(anatomyData.nextSteps[0].prefilledTopic)}`}>
                    {anatomyData.nextSteps[0].cta}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                {anatomyData.nextSteps.length > 1 && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon" className="rounded-l-none">
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>More Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {anatomyData.nextSteps.slice(1).map((step, index) => (
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
