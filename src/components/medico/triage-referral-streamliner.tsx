// src/components/medico/triage-referral-streamliner.tsx
"use client";

import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, MapPin, Stethoscope, FileText, Compass, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAiAgent } from '@/hooks/use-ai-agent';
import { runTriageStreamliner, type TriageStreamlinerInput } from '@/ai/agents/medico/TriageStreamlinerAgent';
import { MarkdownRenderer } from '@/components/markdown/markdown-renderer';
import Link from 'next/link';
import { useProMode } from '@/contexts/pro-mode-context';

const formSchema = z.object({
  patientSymptoms: z.string().min(5, "Symptoms are required."),
  location: z.string().min(2, "Location is required for routing."),
  specialtyNeeded: z.string().optional()
});
type FormValues = z.infer<typeof formSchema>;

export function TriageReferralStreamliner() {
  const { toast } = useToast();
  const { user } = useProMode();

  const { execute, data, isLoading, error, reset } = useAiAgent(runTriageStreamliner, {
    onSuccess: () => {
      toast({ title: "Triage & Referral Complete!" });
    }
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { patientSymptoms: "", location: "", specialtyNeeded: "" },
  });

  const onSubmit: SubmitHandler<FormValues> = async (formData) => {
    await execute(formData);
  };

  return (
    <div className="space-y-6">
      {!data ? (
        <Card className="shadow-md rounded-xl border-blue-500/30 bg-gradient-to-br from-card via-card to-blue-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><MapPin className="h-6 w-6 text-blue-600"/> Triage & Referral Streamliner</CardTitle>
            <CardDescription>Enter patient symptoms and location to find nearby specialists using real-time Google Maps data.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="patientSymptoms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Patient Symptoms & History</FormLabel>
                      <FormControl>
                        <Textarea placeholder="e.g., 45yo M with acute chest pain radiating to left arm..." {...field} className="min-h-[100px]"/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Location / Zip Code</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Downtown Seattle, WA" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="specialtyNeeded"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preferred Specialty (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Cardiology, Orthopedics" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Compass className="mr-2 h-4 w-4"/>}
                  Find Facilities & Draft Referral
                </Button>
                {error && <Alert variant="destructive"><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}
              </form>
            </Form>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card className="shadow-md rounded-xl border-blue-500/30">
            <CardHeader className="bg-muted/30">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Triage Assessment</CardTitle>
                <Button variant="outline" size="sm" onClick={reset}>Start Over</Button>
              </div>
              <CardDescription>Recommended Specialty: <strong className="text-primary">{data.recommendedSpecialty}</strong></CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <MarkdownRenderer content={data.triageAssessment} />
              
              <h3 className="text-sm font-bold mt-6 mb-3 uppercase tracking-wider text-muted-foreground">Nearby Facilities (Via Google Maps)</h3>
              <div className="grid gap-4 md:grid-cols-2">
                {data.facilityRecommendations.map((fac, i) => (
                  <Card key={i} className="bg-card shadow-sm border-blue-500/20">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-start gap-2">
                         <MapPin className="h-4 w-4 mt-0.5 text-blue-500 shrink-0"/> {fac.name}
                      </CardTitle>
                      <CardDescription>{fac.address}</CardDescription>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground pb-4">
                      {fac.estimatedDistanceOrTime && <div className="mb-1 font-medium">{fac.estimatedDistanceOrTime}</div>}
                      {fac.reason}
                    </CardContent>
                  </Card>
                ))}
              </div>

              <h3 className="text-sm font-bold mt-6 mb-3 uppercase tracking-wider text-muted-foreground">Generated Referral Letter</h3>
              <div className="bg-muted/30 p-4 rounded-lg font-serif text-sm whitespace-pre-wrap border whitespace-pre-line leading-relaxed">
                {data.referralLetterDraft}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
