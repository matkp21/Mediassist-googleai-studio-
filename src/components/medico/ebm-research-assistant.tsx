"use client";

import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Search, Link as LinkIcon, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAiAgent } from '@/hooks/use-ai-agent';
import { generateEbmResearch, EbmResearchInputSchema, EbmResearchOutputSchema, type EbmResearchOutput } from '@/ai/agents/medico/EbmResearchAgent';
import { MarkdownRenderer } from '@/components/markdown/markdown-renderer';

const formSchema = z.object({
  query: z.string().min(5, { message: "Query must be at least 5 characters long." }).max(200, {message: "Query too long."}),
});

type EbmResearchFormValues = z.infer<typeof formSchema>;

export function EbmResearchAssistant() {
  const { toast } = useToast();
  
  const { execute: runEbmSearch, data: generatedResearch, isLoading, error, reset } = useAiAgent(
    generateEbmResearch, EbmResearchOutputSchema,
    {
      onSuccess: () => {
        toast({
          title: "Research complete",
          description: "Synthesized evidence based on PubMed literature."
        });
      }
    }
  );

  const form = useForm<EbmResearchFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      query: ""
    },
  });

  const onSubmit: SubmitHandler<EbmResearchFormValues> = async (data) => {
    await runEbmSearch(data);
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-md rounded-xl">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Search className="h-6 w-6 text-primary" />
            EBM Research Assistant
          </CardTitle>
          <CardDescription>
            Enter a clinical question or PICO query. The AI will search PubMed for relevant papers and synthesize an evidence-based answer.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="query"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Clinical Question</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Are corticosteroids effective for severe COVID-19?" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => { form.reset(); reset(); }}>
                  Reset
                </Button>
                <Button type="submit" disabled={isLoading} className="gap-2">
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  {isLoading ? 'Searching...' : 'Synthesize Research'}
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

      {generatedResearch && (
        <Card className="shadow-md rounded-xl bg-accent/5 max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>Clinical Synthesis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
             <div className="bg-background rounded-lg p-4 border border-border/50 shadow-sm prose prose-sm dark:prose-invert max-w-none">
               <MarkdownRenderer content={generatedResearch.synthesizedAnswer} />
             </div>
             
             {generatedResearch.papers && generatedResearch.papers.length > 0 && (
               <div className="space-y-3">
                 <h3 className="font-semibold text-lg flex items-center gap-2">
                   <LinkIcon className="h-5 w-5 text-muted-foreground" />
                   Sourced PubMed Literature
                 </h3>
                 <div className="grid grid-cols-1 gap-3">
                   {generatedResearch.papers.map((paper, idx) => (
                     <div key={idx} className="p-3 bg-secondary/10 rounded-lg border border-primary/10">
                       <h4 className="font-medium text-primary mb-1">{paper.title}</h4>
                       <p className="text-sm text-muted-foreground mb-2">{paper.summary}</p>
                       <a href={paper.url} target="_blank" rel="noopener noreferrer" className="text-xs flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline">
                         <ExternalLink className="h-3 w-3" /> PubMed Link
                       </a>
                     </div>
                   ))}
                 </div>
               </div>
             )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
