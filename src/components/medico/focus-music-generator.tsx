"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FocusMusicGeneratorInputSchema, type FocusMusicGeneratorInput } from '@/ai/schemas/medico-tools-schemas';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, Music, Wand2 } from 'lucide-react';
import { useAiAgent } from '@/hooks/use-ai-agent';
import { FocusMusicGeneratorAgent } from '@/ai/agents/medico/FocusMusicGeneratorAgent';
import { useToast } from '@/hooks/use-toast';

export default function FocusMusicGenerator() {
  const { toast } = useToast();
  const { execute, data, isLoading } = useAiAgent(FocusMusicGeneratorAgent, null, {
    onSuccess: () => {
      toast({ title: 'Focus Music Generated!' });
    }
  });

  const form = useForm<FocusMusicGeneratorInput>({
    resolver: zodResolver(FocusMusicGeneratorInputSchema),
    defaultValues: {
      studyVibe: 'Deep focus lo-fi',
    }
  });

  const onSubmit = async (data: FocusMusicGeneratorInput) => {
    execute(data);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Music className="w-5 h-5 text-primary" /> Focus Music Generator</CardTitle>
          <CardDescription>Generate perfect study soundtracks and Lyria prompts.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="studyVibe"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Desired Vibe</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Deep focus lo-fi, ambient rain, cinematic..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</> : <><Wand2 className="w-4 h-4 mr-2" /> Generate Prompts</>}
              </Button>
            </form>
          </Form>

          {data && (
            <div className="mt-8 space-y-4 p-4 border rounded-lg bg-muted/20">
              <h3 className="text-xl font-bold">{data.trackName}</h3>
              
              <div className="bg-background p-4 rounded-md border mt-2">
                <h4 className="font-semibold mb-2">Lyria Music Prompt</h4>
                <p className="text-sm italic">{data.musicPrompt}</p>
              </div>

              <div className="bg-background p-4 rounded-md border mt-2">
                <h4 className="font-semibold mb-2">Other Recommended Styles</h4>
                <ul className="list-disc pl-5">
                   {data.recommendations.map((r: string, idx: number) => (
                      <li key={idx} className="text-sm">{r}</li>
                   ))}
                </ul>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
