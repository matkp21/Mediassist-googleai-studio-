
// src/components/guideline-retrieval/guideline-query-form.tsx
"use client";

import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { retrieveGuidelines, type GuidelineRetrievalInput, type GuidelineRetrievalOutput } from '@/ai/agents/GuidelineRetrievalAgent';
import { useToast } from '@/hooks/use-toast';
import { Search, Send } from 'lucide-react';

const formSchema = z.object({
  query: z.string().min(3, { message: "Query must be at least 3 characters long." }),
});

type GuidelineQueryFormValues = z.infer<typeof formSchema>;

interface GuidelineQueryFormProps {
  onRetrievalComplete: (result: GuidelineRetrievalOutput | null, error?: string) => void;
  setIsLoading: (loading: boolean) => void;
  isLoading: boolean; 
}

export function GuidelineQueryForm({ onRetrievalComplete, setIsLoading, isLoading }: GuidelineQueryFormProps) {
  const { toast } = useToast();
  const form = useForm<GuidelineQueryFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      query: "",
    },
  });

  const onSubmit: SubmitHandler<GuidelineQueryFormValues> = async (data) => {
    setIsLoading(true);
    onRetrievalComplete(null); 

    try {
      const result = await retrieveGuidelines(data as GuidelineRetrievalInput);
      onRetrievalComplete(result);
      toast({
        title: "Retrieval Complete",
        description: "Guidelines retrieved successfully.",
      });
    } catch (error) {
      console.error("Guideline retrieval error:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during guideline retrieval.";
      onRetrievalComplete(null, errorMessage);
      toast({
        title: "Retrieval Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="query"
          render={({ field }) => (
            <FormItem className="input-focus-glow rounded-lg">
              <FormLabel htmlFor="guideline-query-input" className="text-foreground/90">Medical Topic or Condition</FormLabel>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" aria-hidden="true"/>
                <FormControl>
                  <Input
                    id="guideline-query-input"
                    placeholder="e.g., 'treatment for type 2 diabetes', 'Thalassemia Major'"
                    className="pl-10 rounded-lg border-border/70 focus:border-primary"
                    aria-describedby="guideline-query-description"
                    {...field}
                  />
                </FormControl>
              </div>
              <FormDescription id="guideline-query-description">
                Enter a topic to search for related guidelines or educational information.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full rounded-lg py-3 text-base group" disabled={form.formState.isSubmitting || isLoading} aria-label="Retrieve medical guidelines and information">
          {isLoading ? 'Searching...' : 'Retrieve Information'}
          {!isLoading && <Send className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />}
        </Button>
      </form>
    </Form>
  );
}
