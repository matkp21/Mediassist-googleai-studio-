"use client";

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Sparkles, BookOpen, Layers } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { augmentKnowledge } from '@/ai/agents/medico/KnowledgeAugmenterAgent';
import { MarkdownRenderer } from '@/components/markdown/markdown-renderer';
import { ScrollArea } from '@/components/ui/scroll-area';

const formSchema = z.object({
  briefNotes: z.string().min(5, { message: "Please provide at least 5 characters." }),
});

type FormValues = z.infer<typeof formSchema>;

export function KnowledgeAugmenter() {
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<Error | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { briefNotes: "" },
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsLoading(true);
    setError(null);
    try {
        const response = await augmentKnowledge(data);
        setResult(response);
        toast({ title: "Notes Augmented", description: "Successfully expanded your brief notes." });
    } catch (err: any) {
        setError(err);
    } finally {
        setIsLoading(false);
    }
  };

  const reset = () => {
      setResult(null);
      setError(null);
      form.reset();
  };


  return (
    <div className="space-y-6">
      <Card className="shadow-md rounded-xl">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-indigo-500" />
            Knowledge Augmenter
          </CardTitle>
          <CardDescription>
            Provide your brief or incomplete notes, and the AI will expand them into comprehensive, high-yield medical context with pathophysiology and clinical relevance.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="briefNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brief Notes or Keywords</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="e.g., Mitral stenosis -> rheumatic fever -> diastolic murmur, LA enlargement..." 
                        className="min-h-[120px] rounded-lg"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => { form.reset(); reset(); }}>
                  Clear
                </Button>
                <Button type="submit" disabled={isLoading} className="gap-2 bg-indigo-600 hover:bg-indigo-700">
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  {isLoading ? 'Augmenting...' : 'Augment Knowledge'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      {result && (
        <Card className="shadow-md rounded-xl border-indigo-500/30 bg-gradient-to-br from-card via-card to-indigo-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-indigo-600" />
              Expanded Context
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <h4 className="font-semibold text-primary flex items-center gap-2 text-sm uppercase tracking-wider">
                <Layers className="h-4 w-4" /> Comprehensive Synthesis
              </h4>
              <div className="bg-background rounded-lg p-5 border shadow-sm">
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <MarkdownRenderer content={result.augmentedText} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-muted/50 rounded-lg p-4">
                <h4 className="font-semibold mb-3 text-sm border-b pb-2">Key Concepts</h4>
                <ul className="list-disc pl-4 space-y-1 text-sm text-muted-foreground">
                  {result.keyConcepts.map((concept, idx) => (
                    <li key={idx}>{concept}</li>
                  ))}
                </ul>
              </div>
              <div className="bg-muted/50 rounded-lg p-4">
                <h4 className="font-semibold mb-3 text-sm border-b pb-2">Clinical Relevance</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {result.clinicalRelevance}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
