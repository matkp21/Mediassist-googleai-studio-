// src/components/symptom-analyzer/symptom-form.tsx
"use client";

import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { analyzeSymptoms, type SymptomAnalyzerInput, type SymptomAnalyzerOutput } from '@/ai/agents/SymptomAnalyzerAgent';
import { useToast } from '@/hooks/use-toast';
import { Send } from 'lucide-react';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

const formSchema = z.object({
  symptoms: z.string().min(10, { message: "Please describe symptoms in at least 10 characters." }),
  age: z.coerce.number().int().positive().optional(),
  sex: z.enum(['male', 'female', 'other']).optional(),
  history: z.string().optional(),
});

type SymptomFormValues = z.infer<typeof formSchema>;

interface SymptomFormProps {
  onAnalysisComplete: (result: SymptomAnalyzerOutput | null, error?: string, rawInput?: SymptomAnalyzerInput) => void;
  setIsLoading: (loading: boolean) => void;
  isLoading?: boolean; 
}

export function SymptomForm({ onAnalysisComplete, setIsLoading, isLoading = false }: SymptomFormProps) {
  const { toast } = useToast();
  const form = useForm<SymptomFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      symptoms: "",
      age: undefined,
      sex: undefined,
      history: ""
    },
  });

  // This handler will now be used by the parent component (TriageAndReferral)
  // to trigger its own logic. For standalone use, it would still work.
  const onSubmit: SubmitHandler<SymptomFormValues> = async (data) => {
    setIsLoading(true);
    const agentInput: SymptomAnalyzerInput = {
        symptoms: data.symptoms,
        patientContext: {
            age: data.age,
            sex: data.sex,
            history: data.history
        }
    };
    // The parent component will now handle the logic
    onAnalysisComplete(null, undefined, agentInput);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="symptoms"
          render={({ field }) => (
            <FormItem className="input-focus-glow rounded-lg">
              <FormLabel htmlFor="symptoms-input" className="text-foreground/90">Symptoms Description</FormLabel>
              <FormControl>
                <Textarea
                  id="symptoms-input"
                  placeholder="e.g., persistent cough, fever for 3 days, headache..."
                  className="min-h-[120px] resize-none rounded-lg border-border/70 focus:border-primary"
                  aria-describedby="symptoms-description"
                  {...field}
                />
              </FormControl>
              <FormDescription id="symptoms-description">
                Provide as much detail as possible for a more relevant analysis.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="age" render={({ field }) => ( <FormItem><FormLabel>Age (Optional)</FormLabel><FormControl><Input type="number" placeholder="e.g., 45" {...field} value={field.value ?? ''} className="rounded-lg" /></FormControl></FormItem> )}/>
            <FormField control={form.control} name="sex" render={({ field }) => ( <FormItem><FormLabel>Sex (Optional)</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger className="rounded-lg"><SelectValue placeholder="Select sex" /></SelectTrigger></FormControl><SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem><SelectItem value="other">Other</SelectItem></SelectContent></Select></FormItem>)}/>
        </div>
        <FormField control={form.control} name="history" render={({ field }) => ( <FormItem><FormLabel>Brief History (Optional)</FormLabel><FormControl><Textarea placeholder="e.g., Smoker, Hypertensive..." className="rounded-lg min-h-[60px]" {...field} value={field.value ?? ''} /></FormControl></FormItem>)}/>

        <Button type="submit" className="w-full rounded-lg py-3 text-base group" disabled={form.formState.isSubmitting || isLoading} aria-label="Submit symptoms for analysis">
          {isLoading ? 'Analyzing...' : 'Analyze'}
          {!isLoading && <Send className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />}
        </Button>
      </form>
    </Form>
  );
}
