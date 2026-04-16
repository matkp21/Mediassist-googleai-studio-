// src/components/medico/mnemonics-generator.tsx
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
import { Loader2, Lightbulb, Wand2, Image as ImageIcon, Save, ArrowRight, ChevronDown } from 'lucide-react';
import { generateMnemonic } from '@/ai/agents/medico/MnemonicsGeneratorAgent';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { useAiAgent } from '@/hooks/use-ai-agent';
import { useProMode } from '@/contexts/pro-mode-context';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import Link from 'next/link';
import React from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const formSchema = z.object({
  topic: z.string().min(3, { message: "Topic must be at least 3 characters." }).max(150, { message: "Topic too long."}),
});

type MnemonicFormValues = z.infer<typeof formSchema>;

interface MnemonicGeneratorProps {
  initialTopic?: string | null;
}

export function MnemonicsGenerator({ initialTopic }: MnemonicGeneratorProps) {
  const { toast } = useToast();
  const { user } = useProMode();

  const { execute: runGenerateMnemonic, data: generatedMnemonic, isLoading, error, reset } = useAiAgent(generateMnemonic, {
    onSuccess: (data, input) => {
      if (!data?.mnemonic || !data.topicGenerated) {
        toast({
          title: "Generation Error",
          description: "The AI agent returned an incomplete response. Please try again.",
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "Mnemonic Generated!",
        description: `Mnemonic for "${data.topicGenerated}" is ready.`,
      });
    }
  });


  const form = useForm<MnemonicFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { topic: initialTopic || "" },
  });

  React.useEffect(() => {
    if (initialTopic) {
      form.setValue('topic', initialTopic);
    }
  }, [initialTopic, form]);

  const onSubmit: SubmitHandler<MnemonicFormValues> = async (data) => {
    await runGenerateMnemonic(data);
  };
  
  const handleReset = () => {
    form.reset();
    reset();
  }
  
  const handleSaveToLibrary = async () => {
    if (!generatedMnemonic || !user) {
      toast({ title: "Cannot Save", description: "No content to save or user not logged in.", variant: "destructive" });
      return;
    }
    try {
      await addDoc(collection(firestore, `users/${user.uid}/studyLibrary`), {
        type: 'mnemonic',
        topic: generatedMnemonic.topicGenerated,
        userId: user.uid,
        mnemonic: generatedMnemonic.mnemonic,
        explanation: generatedMnemonic.explanation || null,
        imageUrl: generatedMnemonic.imageUrl || null,
        createdAt: serverTimestamp(),
      });
      toast({ title: "Saved to Library", description: "Your generated mnemonic has been saved." });
    } catch (e) {
      console.error("Firestore save error:", e);
      toast({ title: "Save Failed", description: "Could not save mnemonic to your library.", variant: "destructive" });
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
                <FormLabel htmlFor="topic-mnemonic" className="text-base">Topic or List for Mnemonic</FormLabel>
                <FormControl>
                  <Input
                    id="topic-mnemonic"
                    placeholder="e.g., Cranial Nerves, Causes of Pancreatitis"
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
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                  Generate Mnemonic
                </>
              )}
            </Button>
            {generatedMnemonic && (
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

      {generatedMnemonic && (
        <Card className="shadow-md rounded-xl mt-6 border-yellow-500/30 bg-gradient-to-br from-card via-card to-yellow-500/5 relative">
          {isLoading && (
            <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-10 rounded-xl">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Updating...</span>
            </div>
          )}
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Lightbulb className="h-6 w-6 text-yellow-600" />
              Mnemonic for: {generatedMnemonic.topicGenerated}
            </CardTitle>
            <CardDescription>Here's a memory aid for your topic.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                  <div>
                      <h4 className="font-semibold text-md mb-1 text-yellow-700 dark:text-yellow-400">Mnemonic:</h4>
                      <p className="text-lg font-bold text-foreground whitespace-pre-wrap">{generatedMnemonic.mnemonic}</p>
                  </div>
                  {generatedMnemonic.explanation && (
                  <div className="mt-3">
                      <h4 className="font-semibold text-md mb-1 text-yellow-700 dark:text-yellow-400">Explanation:</h4>
                      <ScrollArea className="h-48">
                        <p className="text-sm whitespace-pre-wrap prose prose-sm dark:prose-invert max-w-none pr-3">{generatedMnemonic.explanation}</p>
                      </ScrollArea>
                  </div>
                  )}
              </div>
              <div className="space-y-3">
                 <h4 className="font-semibold text-md mb-1 text-yellow-700 dark:text-yellow-400">Visual Aid:</h4>
                  {generatedMnemonic.imageUrl ? (
                     <div className="relative aspect-square w-full border rounded-lg overflow-hidden bg-muted/30">
                        <Image src={generatedMnemonic.imageUrl} alt={`Visual for ${generatedMnemonic.topicGenerated}`} fill className="object-contain" data-ai-hint="medical mnemonic diagram"/>
                    </div>
                  ) : (
                    <div className="aspect-square w-full border border-dashed rounded-lg flex flex-col items-center justify-center text-muted-foreground bg-muted/20">
                        <ImageIcon className="h-10 w-10 opacity-50 mb-2"/>
                        <p className="text-xs">No visual generated.</p>
                    </div>
                  )}
              </div>
            </div>
          </CardContent>
          <CardFooter className="p-4 border-t flex items-center justify-between">
              <Button onClick={handleSaveToLibrary} disabled={!user}>
                <Save className="mr-2 h-4 w-4"/> Save to Library
              </Button>
              {generatedMnemonic.nextSteps && generatedMnemonic.nextSteps.length > 0 && (
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline">
                        Next Steps <ChevronDown className="ml-2 h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Recommended Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {generatedMnemonic.nextSteps.map((step, index) => (
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
