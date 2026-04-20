
// src/components/pro/discharge-summary-generator.tsx
"use client";

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { FilePlus, Lightbulb, Loader2, Download, Share2, Edit3, Trash2, PlusCircle } from 'lucide-react'; // Added PlusCircle
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '../ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { generateDischargeSummary, type DischargeSummaryInput, type DischargeSummaryOutput } from '@/ai/agents/pro/DischargeSummaryGeneratorAgent';
import { DischargeSummaryInputSchema } from '@/ai/schemas/pro-schemas'; // Updated import path

type DischargeSummaryFormValues = DischargeSummaryInput;

export function DischargeSummaryGenerator() {
  const [generatedSummary, setGeneratedSummary] = useState<DischargeSummaryOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<DischargeSummaryFormValues>({
    resolver: zodResolver(DischargeSummaryInputSchema),
    defaultValues: {
      patientName: '',
      patientAge: '',
      admissionNumber: '',
      primaryDiagnosis: '',
      keySymptomsOrProcedure: '',
      additionalContext: '',
    },
  });

  const handleGenerateSummary: SubmitHandler<DischargeSummaryFormValues> = async (data) => {
    setIsLoading(true);
    setGeneratedSummary(null); 

    try {
      const result = await generateDischargeSummary(data);
      setGeneratedSummary(result);
      toast({ title: "Draft Summary Generated", description: "Review and refine the AI-generated discharge summary." });
    } catch (error) {
        console.error("Discharge summary generation error:", error);
        toast({
            title: "Generation Failed",
            description: (error as Error).message || "Could not generate draft summary.",
            variant: "destructive",
        });
    } finally {
        setIsLoading(false);
    }
  };
  
  const handleSummaryFieldChange = <K extends keyof DischargeSummaryOutput>(
    field: K,
    value: DischargeSummaryOutput[K]
  ) => {
    setGeneratedSummary(prev => prev ? { ...prev, [field]: value } : null);
  };

  const handleArrayItemChange = (
    field: keyof Pick<DischargeSummaryOutput, 'dischargeMedications' | 'followUpPlans' | 'patientEducation' | 'redFlags'>,
    index: number,
    value: string
  ) => {
    if (!generatedSummary) return;
    const currentArray = generatedSummary[field] as string[] | undefined;
    if (currentArray) {
      const newArray = [...currentArray];
      newArray[index] = value;
      handleSummaryFieldChange(field, newArray as any);
    }
  };
  
  const addArrayItem = (
    field: keyof Pick<DischargeSummaryOutput, 'dischargeMedications' | 'followUpPlans' | 'patientEducation' | 'redFlags'>
  ) => {
    if (!generatedSummary) return;
    const currentArray = generatedSummary[field] as string[] | undefined;
    const newArray = currentArray ? [...currentArray, ''] : [''];
    handleSummaryFieldChange(field, newArray as any);
  };

  const removeArrayItem = (
    field: keyof Pick<DischargeSummaryOutput, 'dischargeMedications' | 'followUpPlans' | 'patientEducation' | 'redFlags'>,
    index: number
  ) => {
    if (!generatedSummary) return;
    const currentArray = generatedSummary[field] as string[] | undefined;
    if (currentArray) {
      const newArray = currentArray.filter((_, i) => i !== index);
      handleSummaryFieldChange(field, newArray as any);
    }
  };

  const renderEditableArrayField = (
    fieldKey: keyof Pick<DischargeSummaryOutput, 'dischargeMedications' | 'followUpPlans' | 'patientEducation' | 'redFlags'>,
    label: string
  ) => {
    const items = generatedSummary?.[fieldKey] as string[] | undefined;
    return (
      <div>
        <div className="flex justify-between items-center mb-1">
          <Label htmlFor={`summary-${fieldKey}`} className="text-md font-semibold text-foreground/90">{label}</Label>
          <Button variant="outline" size="sm" onClick={() => addArrayItem(fieldKey)} className="rounded-md h-7 px-2 text-xs">
            <PlusCircle className="mr-1 h-3.5 w-3.5"/> Add Item
          </Button>
        </div>
        {items && items.length > 0 ? (
          items.map((item, index) => (
            <div key={`${fieldKey}-${index}`} className="flex items-center gap-2 mb-1.5">
              <Textarea
                id={`summary-${fieldKey}-${index}`}
                value={item}
                onChange={(e) => handleArrayItemChange(fieldKey, index, e.target.value)}
                className="mt-1 rounded-md min-h-[60px] border-border/70 focus:border-primary flex-grow"
                placeholder={`Edit ${label} item ${index + 1}`}
              />
              <Button variant="ghost" size="iconSm" onClick={() => removeArrayItem(fieldKey, index)} className="text-destructive hover:bg-destructive/10 rounded-full mt-1">
                <Trash2 className="h-4 w-4"/>
              </Button>
            </div>
          ))
        ) : (
          <p className="text-xs text-muted-foreground mt-1">No items for ${label.toLowerCase()} yet. Add one if needed.</p>
        )}
      </div>
    );
  };


  return (
    <div className="space-y-6">
      <Alert variant="default" className="border-blue-500/50 bg-blue-500/10">
        <Lightbulb className="h-5 w-5 text-blue-600" />
        <AlertTitle className="font-semibold text-blue-700 dark:text-blue-500">AI-Assisted Discharge Summary</AlertTitle>
        <AlertDescription className="text-blue-600/90 dark:text-blue-500/90 text-xs">
          Enter patient identifiers and key clinical anchors. The AI will aggregate data and draft a comprehensive summary.
          Review and refine the draft before finalizing. This tool aims to streamline documentation.
        </AlertDescription>
      </Alert>

      <Card className="shadow-md rounded-xl border-sky-500/30 bg-gradient-to-br from-card via-card to-sky-500/5">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleGenerateSummary)}>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <FilePlus className="h-6 w-6 text-sky-600" />
                Generate Discharge Summary
              </CardTitle>
              <CardDescription>Provide minimal identifiers and clinical anchors to initiate AI drafting.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="admissionNumber"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel htmlFor="admission-number">Admission/OPD Number</FormLabel>
                                <FormControl><Input id="admission-number" placeholder="e.g., MRN12345" {...field} className="mt-1 rounded-lg"/></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="primaryDiagnosis"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel htmlFor="primary-diagnosis">Primary Diagnosis (Clinical Anchor)</FormLabel>
                                <FormControl><Input id="primary-diagnosis" placeholder="e.g., Acute Myocardial Infarction" {...field} className="mt-1 rounded-lg"/></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="patientName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel htmlFor="patient-name-ds">Patient Name (Optional)</FormLabel>
                                <FormControl><Input id="patient-name-ds" placeholder="e.g., John Doe" {...field} className="mt-1 rounded-lg"/></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="patientAge"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel htmlFor="patient-age-ds">Patient Age (Optional)</FormLabel>
                                <FormControl><Input id="patient-age-ds" placeholder="e.g., 45 years" {...field} className="mt-1 rounded-lg"/></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="keySymptomsOrProcedure"
                        render={({ field }) => (
                            <FormItem className="md:col-span-2">
                                <FormLabel htmlFor="key-symptoms">Key Symptoms / Procedure (Optional Anchor)</FormLabel>
                                <FormControl><Input id="key-symptoms" placeholder="e.g., Severe abdominal pain, Laparoscopic Cholecystectomy" {...field} className="mt-1 rounded-lg"/></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="additionalContext"
                        render={({ field }) => (
                            <FormItem className="md:col-span-2">
                                <FormLabel htmlFor="additional-context">Additional Context (Optional)</FormLabel>
                                <FormControl><Textarea id="additional-context" placeholder="e.g., Complicated by AKI, Known allergy to penicillin" {...field} className="mt-1 rounded-lg min-h-[80px]"/></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
              <Button type="submit" disabled={isLoading} className="w-full sm:w-auto rounded-lg py-3 text-base group">
                {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Edit3 className="mr-2 h-5 w-5" />}
                Generate Draft Summary
              </Button>
            </CardContent>
          </form>
        </Form>
      </Card>

      {generatedSummary && (
        <Card className="mt-6 shadow-lg rounded-xl border-green-500/30">
          <CardHeader>
            <CardTitle className="text-xl text-green-700 dark:text-green-400">Draft Discharge Summary for: {form.getValues("patientName") || form.getValues("admissionNumber")}</CardTitle>
            <CardDescription>Review, edit, and complete the sections below. AI suggestions are provided.</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[60vh] p-1 border bg-background rounded-lg">
                <div className="p-4 space-y-6">
                    <div>
                        <Label htmlFor="summary-hospitalCourse" className="text-md font-semibold text-foreground/90">Hospital Course</Label>
                        <Textarea
                            id="summary-hospitalCourse"
                            value={generatedSummary.hospitalCourse}
                            onChange={(e) => handleSummaryFieldChange('hospitalCourse', e.target.value)}
                            className="mt-1 rounded-md min-h-[120px] border-border/70 focus:border-primary"
                            placeholder="Edit Hospital Course"
                        />
                    </div>
                    
                    {renderEditableArrayField('dischargeMedications', 'Discharge Medications')}
                    {renderEditableArrayField('followUpPlans', 'Follow-up Plans')}
                    {renderEditableArrayField('patientEducation', 'Patient Education')}
                    {renderEditableArrayField('redFlags', 'Red Flag Warnings')}

                    {generatedSummary.notesForDoctor && (
                       <div>
                            <Label htmlFor="summary-notesForDoctor" className="text-md font-semibold text-foreground/90">Notes for Doctor (AI Suggestion)</Label>
                            <Textarea
                                id="summary-notesForDoctor"
                                value={generatedSummary.notesForDoctor}
                                onChange={(e) => handleSummaryFieldChange('notesForDoctor', e.target.value)}
                                className="mt-1 rounded-md min-h-[60px] border-border/70 focus:border-primary bg-amber-500/10 border-amber-500/30"
                                placeholder="Edit AI notes for doctor"
                            />
                        </div>
                    )}
                </div>
            </ScrollArea>
          </CardContent>
          <CardFooter className="flex justify-end gap-2 p-4 border-t">
            <Button variant="outline" className="rounded-lg">
                <Share2 className="mr-2 h-4 w-4"/> Share / Export
            </Button>
            <Button className="rounded-lg bg-green-600 hover:bg-green-700 text-white">
                <Download className="mr-2 h-4 w-4"/> Finalize & Save
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
