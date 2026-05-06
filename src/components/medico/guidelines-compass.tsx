"use client";

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, BookOpen, Building2, Map } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { fetchGuidelines } from '@/ai/agents/medico/GuidelinesCompassAgent';
import { MarkdownRenderer } from '@/components/markdown/markdown-renderer';

const formSchema = z.object({
  topic: z.string().min(3, { message: "Topic is required" }),
  organization: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function GuidelinesCompass() {
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<Error | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { topic: "", organization: "" },
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsLoading(true);
    setError(null);
    try {
        const response = await fetchGuidelines(data);
        setResult(response);
        toast({ title: "Guidelines Loaded", description: "Successfully retrieved latest clinical guidelines." });
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
            <BookOpen className="h-6 w-6 text-purple-600" />
            Guidelines Compass
          </CardTitle>
          <CardDescription>
            Get the latest, evidence-based clinical guidelines and recommendations from international bodies like AHA, NICE, WHO, IDSA.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="topic"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Clinical Topic or Condition</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Heart Failure, Asthma, Sepsis" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="organization"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preferred Organization (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., NICE, AHA, WHO" {...field} />
                      </FormControl>
                      <FormDescription>Leave blank to get consensus or major guidelines.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => { form.reset(); reset(); }}>
                  Reset
                </Button>
                <Button type="submit" disabled={isLoading} className="gap-2 bg-purple-600 hover:bg-purple-700">
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Map className="h-4 w-4" />}
                  {isLoading ? 'Fetching Guidelines...' : 'Find Guidelines'}
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
        <Card className="shadow-md rounded-xl bg-accent/5">
          <CardHeader>
            <CardTitle>Guidelines for: {result.topic}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {result.organizationGuidance.map((org, idx) => (
                <div key={idx} className="bg-background rounded-lg border p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3 border-b pb-2">
                    <h3 className="font-semibold flex items-center gap-2 text-primary">
                      <Building2 className="h-4 w-4" /> {org.organization}
                    </h3>
                    <span className="text-xs font-mono bg-secondary px-2 py-1 rounded text-secondary-foreground">
                      {org.year}
                    </span>
                  </div>
                  <p className="text-sm text-foreground/80 mb-4">{org.summary}</p>
                  
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Key Recommendations</h4>
                    <ul className="list-disc pl-4 space-y-1.5 text-sm">
                      {org.keyRecommendations.map((rec, recIdx) => (
                        <li key={recIdx} className="text-muted-foreground">{rec}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>

            {result.clinicalAlgorithm && (
              <div className="mt-8 bg-purple-500/10 rounded-lg p-5 border border-purple-500/20">
                <h3 className="font-semibold text-purple-700 dark:text-purple-400 mb-3 flex items-center gap-2">
                  <Map className="h-5 w-5" /> Clinical Algorithm
                </h3>
                <div className="prose prose-sm dark:prose-invert">
                  <MarkdownRenderer content={result.clinicalAlgorithm} />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
