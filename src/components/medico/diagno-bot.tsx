// src/components/medico/diagno-bot.tsx

"use client";

import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, TestTubeDiagonal, Wand2, Save, ArrowRight, ChevronDown, ImageIcon } from 'lucide-react';
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
import { useState } from 'react';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  labResults: z.string().optional(),
  file: z.instanceof(File).optional()
}).refine(data => data.labResults || data.file, {
  message: "Either text results or an image file is required.",
  path: ["labResults"]
});
type DiagnoBotFormValues = z.infer<typeof formSchema>;

export function DiagnoBot() {
  const { toast } = useToast();
  const { user } = useProMode();
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const { execute: runInterpretation, data: interpretationData, isLoading, error, reset } = useAiAgent(interpretLabs, {
    onSuccess: (data, input) => {
      toast({
        title: "Interpretation Ready!",
        description: "Results have been interpreted.",
      });
    },
  });

  const form = useForm<DiagnoBotFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { labResults: "" },
  });

  const onSubmit: SubmitHandler<DiagnoBotFormValues> = async (data) => {
    let imageDataUri: string | undefined = undefined;

    if (data.file) {
      if (data.file.type === 'image/jpeg' || data.file.type === 'image/png' || data.file.type === 'application/pdf') {
        const reader = new FileReader();
        const dataUriPromise = new Promise<string>((resolve, reject) => {
            reader.onerror = reject;
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(data.file as File);
        });
        imageDataUri = await dataUriPromise;
      } else {
        toast({ title: "Unsupported File", description: "Only JPEG, PNG, or PDF files are supported.", variant: "destructive" });
        return;
      }
    }

    const payload: DiagnoBotInput = {
      labResults: data.labResults || undefined,
      imageDataUri: imageDataUri
    };

    await runInterpretation(payload);
  };

  const handleReset = () => {
    form.reset({ labResults: "", file: undefined });
    setImagePreview(null);
    reset();
  };

  const handleSaveToLibrary = async () => {
    if (!interpretationData || !user) {
      toast({ title: "Cannot Save", description: "No content to save or user not logged in.", variant: "destructive" });
      return;
    }
    const notesContent = `
## Interpretation
${interpretationData.interpretation}

## Likely Differentials Suggested by Results
${interpretationData.likelyDifferentials.map(d => `- ${d}`).join('\n')}
    `;
    try {
      await addDoc(collection(firestore, `users/${user.uid}/studyLibrary`), {
        type: 'notes',
        topic: `Interpretation for: ${(form.getValues('labResults')? form.getValues('labResults')?.substring(0, 30) : form.getValues('file')?.name) || 'Results'}...`,
        userId: user.uid,
        notes: notesContent,
        createdAt: serverTimestamp(),
      });
      toast({ title: "Saved to Library", description: "This interpretation has been saved as a note." });
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
                <FormLabel htmlFor="lab-results" className="text-base">Results, Chart, or Printout</FormLabel>
                <Card className="p-3 shadow-none border-dashed bg-muted/20">
                  <div className="mb-4">
                     <FormLabel className="text-sm font-medium mb-1 block">1. Upload an Image (Optional but recommended for ECGs/X-Rays)</FormLabel>
                     <FormDescription className="text-xs mb-2">Upload a photo or screenshot of the ECG, ABG printout, or lab results chart.</FormDescription>
                     <Input 
                        type="file" 
                        accept=".pdf,image/jpeg,image/png" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          form.setValue('file', file);
                          if (file && (file.type === 'image/jpeg' || file.type === 'image/png')) {
                            const reader = new FileReader();
                            reader.onload = (e) => setImagePreview(e.target?.result as string);
                            reader.readAsDataURL(file);
                          } else {
                            setImagePreview(null);
                          }
                        }}
                        className="cursor-pointer file:cursor-pointer"
                     />
                     {imagePreview && (
                        <div className="mt-2 w-32 h-32 rounded-lg border overflow-hidden relative">
                           {/* eslint-disable-next-line @next/next/no-img-element */}
                           <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                     )}
                  </div>
                  
                  <div className="flex items-center my-3"><div className="flex-1 border-t"/><span className="mx-4 text-muted-foreground text-xs font-semibold">OR/AND</span><div className="flex-1 border-t"/></div>
                  
                  <div>
                    <FormLabel className="text-sm font-medium mb-1 block">2. Type / Paste Text Results</FormLabel>
                    <FormControl>
                      <Textarea
                        id="lab-results"
                        placeholder="e.g., 'CBC: Hb 10.5 g/dL, WBC 15,000/µL, Platelets 450,000/µL. BMP: Na 135, K 3.0, Cr 1.5.'"
                        className="rounded-lg text-base py-2.5 bg-background focus:border-primary min-h-[120px]"
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                  </div>
                </Card>
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
