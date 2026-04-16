
// src/components/medico/note-summarizer.tsx
"use client";

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, FileText, Wand2, Save, ArrowRight, ChevronDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { summarizeNoteText, type MedicoNoteSummarizerInput, type MedicoNoteSummarizerOutput } from '@/ai/agents/medico/NoteSummarizerAgent';
import { useProMode } from '@/contexts/pro-mode-context';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { trackProgress } from '@/ai/agents/medico/ProgressTrackerAgent';
import Link from 'next/link';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MermaidRenderer } from '@/components/markdown/mermaid-renderer';

const formSchema = z.object({
  file: z.instanceof(File, { message: "Please upload a file." })
    .refine(file => file.size > 0, "File cannot be empty.")
    .refine(file => file.size < 5 * 1024 * 1024, "File size must be less than 5MB.")
    .refine(file => ["text/plain", "image/jpeg", "image/png"].includes(file.type), "Only .txt, .jpeg, and .png files are supported."),
  format: z.enum(['bullet', 'flowchart', 'table', 'diagram']).default('bullet'),
});

type SummarizerFormValues = z.infer<typeof formSchema>;

export default function NoteSummarizer() {
  const [isLoading, setIsLoading] = useState(false);
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const [summaryResult, setSummaryResult] = useState<MedicoNoteSummarizerOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useProMode();

  const form = useForm<SummarizerFormValues>({
    resolver: zodResolver(formSchema),
  });

  const extractTextFromFile = async (file: File) => {
    if (file.type === 'text/plain') {
      return file.text();
    }
    throw new Error("Unsupported file type for text extraction");
  };

  const onSubmit: SubmitHandler<SummarizerFormValues> = async (data) => {
    setIsLoading(true);
    setSummaryResult(null);
    setExtractedText(null);
    setError(null);

    try {
      let input: MedicoNoteSummarizerInput;
      const fileType = data.file.type;

      if (fileType === 'text/plain') {
        const text = await extractTextFromFile(data.file);
        setExtractedText(text);
        if (text.length < 100) {
          throw new Error("Document content is too short to summarize effectively.");
        }
        input = { text, format: data.format };
      } else if (fileType === 'image/jpeg' || fileType === 'image/png') {
        const reader = new FileReader();
        const dataUriPromise = new Promise<string>((resolve, reject) => {
            reader.onerror = reject;
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(data.file);
        });
        const imageDataUri = await dataUriPromise;
        setExtractedText(null); // No text preview for images
        input = { imageDataUri, format: data.format };
      } else {
        throw new Error("Unsupported file type.");
      }

      const result = await summarizeNoteText(input);
      setSummaryResult(result);
      
      // Track Progress
      try {
        await trackProgress({
            activityType: 'notes_review',
            topic: `Summarized: ${data.file.name}`
        });
      } catch (progressError) {
          console.warn("Could not track progress for note summarizer:", progressError);
      }

    } catch (err) {
      console.error("Summarization error:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(errorMessage);
      toast({
        title: "Summarization Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSaveToLibrary = async () => {
    if (!summaryResult || !user || !form.getValues('file')) {
      toast({ title: "Cannot Save", description: "No content to save, user not logged in, or file info missing.", variant: "destructive" });
      return;
    }
    try {
      await addDoc(collection(firestore, `users/${user.uid}/studyLibrary`), {
        type: 'summary',
        summary: summaryResult.summary,
        format: summaryResult.format,
        originalFileName: form.getValues('file').name,
        createdAt: serverTimestamp(),
        topic: `Summary of ${form.getValues('file').name}`,
      });
      toast({ title: "Summary saved to your library." });
    } catch (firestoreError) {
      console.error("Failed to save summary to Firestore:", firestoreError);
      toast({ title: "Could not save summary", description: "Your summary was generated but failed to save to your cloud library.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="file"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="file-upload-summarizer" className="text-base">Upload Notes File</FormLabel>
                  <FormControl>
                    <Input
                      id="file-upload-summarizer"
                      type="file"
                      accept=".txt,.jpeg,.jpg,.png"
                      onChange={(e) => field.onChange(e.target.files?.[0])}
                      className="rounded-lg text-base py-2.5 border-border/70 focus:border-primary file:text-sm file:font-medium"
                    />
                  </FormControl>
                  <FormDescription className="text-xs">Supports .txt, .jpeg, and .png files up to 5MB.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="format"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="format-select-summarizer" className="text-base">Summary Format</FormLabel>
                   <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger id="format-select-summarizer" className="rounded-lg text-base py-2.5 border-border/70 focus:border-primary">
                        <SelectValue placeholder="Select a format" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="bullet">Bullet Points</SelectItem>
                      <SelectItem value="flowchart">Flowchart (Mermaid)</SelectItem>
                      <SelectItem value="table">Table (Markdown)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button type="submit" className="w-full sm:w-auto rounded-lg py-3 text-base group" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Summarizing...
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                Summarize Notes
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
      
      {summaryResult && (
        <Card className="shadow-md rounded-xl mt-6 border-fuchsia-500/30 bg-gradient-to-br from-card via-card to-fuchsia-500/5 relative">
            {isLoading && (
              <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-10 rounded-xl">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Updating...</span>
              </div>
            )}
            <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                    <FileText className="h-6 w-6 text-fuchsia-600" />
                    AI-Generated Summary
                </CardTitle>
                 <CardDescription>Format: <span className="font-semibold capitalize">{summaryResult.format}</span>. You can copy the content below.</CardDescription>
            </CardHeader>
             <CardContent>
                <div className="h-auto max-h-[400px] p-1 border bg-background rounded-lg">
                    {summaryResult.format === 'flowchart' ? (
                        <MermaidRenderer chart={summaryResult.summary} />
                    ) : (
                      <ScrollArea className="h-full max-h-[380px]">
                        <pre className="p-4 whitespace-pre-wrap text-sm font-sans">
                            <code>{summaryResult.summary}</code>
                        </pre>
                      </ScrollArea>
                    )}
                </div>
            </CardContent>
             <CardFooter className="p-4 border-t flex items-center justify-between">
              <Button onClick={handleSaveToLibrary} disabled={!user}>
                <Save className="mr-2 h-4 w-4"/> Save to Library
              </Button>
               {summaryResult.nextSteps && summaryResult.nextSteps.length > 0 && (
                <div className="flex rounded-md border">
                  <Button asChild className="flex-grow rounded-r-none border-r-0 font-semibold">
                    <Link href={`/medico/${summaryResult.nextSteps[0].toolId}?topic=${encodeURIComponent(summaryResult.nextSteps[0].prefilledTopic)}`}>
                      {summaryResult.nextSteps[0].cta}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  {summaryResult.nextSteps.length > 1 && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon" className="rounded-l-none">
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>More Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {summaryResult.nextSteps.slice(1).map((step, index) => (
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

      {extractedText && !summaryResult && (
        <Card className="shadow-md rounded-xl mt-6">
            <CardHeader>
                <CardTitle>Extracted Text</CardTitle>
                <CardDescription>Review the text extracted from your document before summarization.</CardDescription>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-48 border rounded-lg bg-muted/30 p-2">
                    <p className="text-xs text-muted-foreground whitespace-pre-wrap">{extractedText}</p>
                </ScrollArea>
            </CardContent>
        </Card>
      )}

    </div>
  );
}
