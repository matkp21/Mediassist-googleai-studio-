// src/components/medico/study-timetable-creator.tsx
"use client";

import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, CalendarDays, Wand2, Lightbulb, Save, ArrowRight, ChevronDown } from 'lucide-react';
import { createStudyTimetable, type MedicoStudyTimetableInput, type MedicoStudyTimetableOutput } from '@/ai/agents/medico/StudyTimetableCreatorAgent';
import { useToast } from '@/hooks/use-toast';
import { DatePicker } from '@/components/ui/date-picker';
import { Textarea } from '@/components/ui/textarea';
import { MarkdownRenderer } from '@/components/markdown/markdown-renderer';
import { useProMode } from '@/contexts/pro-mode-context';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import Link from 'next/link';
import { useAiAgent } from '@/hooks/use-ai-agent';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const formSchema = z.object({
  examName: z.string().min(3, { message: "Exam name must be at least 3 characters." }).max(100, { message: "Exam name too long."}),
  examDate: z.date({ required_error: "Exam date is required." }),
  subjects: z.string().min(1, { message: "At least one subject is required."}),
  studyHoursPerWeek: z.coerce.number().int().min(1, {message: "Minimum 1 hour."}).max(100, {message: "Maximum 100 hours."}).default(20),
  performanceContext: z.string().optional(),
});

type TimetableFormValues = z.infer<typeof formSchema>;

export function StudyTimetableCreator() {
  const { toast } = useToast();
  const { user } = useProMode();
  const { execute: runGenerateTimetable, data: generatedTimetable, isLoading, error, reset } = useAiAgent(createStudyTimetable, {
    onSuccess: (data, input) => {
        toast({
            title: "Personalized Timetable Generated!",
            description: `Your smart study plan for "${input.examName}" is ready.`,
        });
    }
  });

  const form = useForm<TimetableFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      examName: "",
      examDate: undefined,
      subjects: "",
      studyHoursPerWeek: 20,
      performanceContext: "",
    },
  });

  const onSubmit: SubmitHandler<TimetableFormValues> = async (data) => {
    const formattedData: MedicoStudyTimetableInput = {
      examName: data.examName,
      examDate: data.examDate.toISOString().split('T')[0], 
      subjects: data.subjects.split(',').map(s => s.trim()).filter(Boolean),
      studyHoursPerWeek: data.studyHoursPerWeek,
      performanceContext: data.performanceContext || undefined,
    };
    await runGenerateTimetable(formattedData);
  };
  
  const handleReset = () => {
    form.reset();
    reset();
  };

  const handleSaveToLibrary = async () => {
    if (!generatedTimetable || !user) {
      toast({ title: "Cannot Save", description: "No content to save or user not logged in.", variant: "destructive" });
      return;
    }
    const notesContent = `
## Timetable for ${form.getValues('examName')}
${generatedTimetable.timetable}

## AI Planning Rationale
${generatedTimetable.performanceAnalysis || 'N/A'}
    `;
    try {
      await addDoc(collection(firestore, `users/${user.uid}/studyLibrary`), {
        type: 'notes',
        topic: `Study Timetable: ${form.getValues('examName')}`,
        userId: user.uid,
        notes: notesContent,
        performanceAnalysis: generatedTimetable.performanceAnalysis || null, 
        createdAt: serverTimestamp(),
      });
      toast({ title: "Saved to Library", description: "This timetable has been saved as a note." });
    } catch (e) {
      console.error("Firestore save error:", e);
      toast({ title: "Save Failed", description: "Could not save to library.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
       <Alert variant="default" className="border-purple-500/50 bg-purple-500/10">
        <Lightbulb className="h-5 w-5 text-purple-600" />
        <AlertTitle className="font-semibold text-purple-700 dark:text-purple-500">Smart Planner</AlertTitle>
        <AlertDescription className="text-purple-600/90 dark:text-purple-500/90 text-xs">
          Provide your exam details and context about your performance. The AI will generate a prioritized schedule focusing on your weaker areas.
        </AlertDescription>
      </Alert>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="examName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="examName-timetable" className="text-base">Exam Name</FormLabel>
                  <FormControl>
                    <Input
                      id="examName-timetable"
                      placeholder="e.g., Final MBBS Prof"
                      className="rounded-lg text-base py-2.5 border-border/70 focus:border-primary"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="examDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="examDate-timetable" className="text-base">Exam Date</FormLabel>
                  <FormControl>
                     <DatePicker 
                        date={field.value} 
                        setDate={(date) => field.onChange(date)} 
                        buttonId="examDate-timetable"
                        buttonClassName="w-full rounded-lg py-2.5 border-border/70 focus:border-primary"
                     />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="subjects"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="subjects-timetable" className="text-base">Subjects to Cover (comma-separated)</FormLabel>
                <FormControl>
                  <Input
                    id="subjects-timetable"
                    placeholder="e.g., Surgery, Pediatrics, Medicine"
                    className="rounded-lg text-base py-2.5 border-border/70 focus:border-primary"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name="performanceContext"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="performanceContext-timetable" className="text-base">Performance Context / Weaker Areas (Optional)</FormLabel>
                 <FormControl>
                    <Textarea
                        id="performanceContext-timetable"
                        placeholder="e.g., 'Struggling with ECG interpretation and side effects of antiarrhythmics. Scored low on renal physiology quizzes.'"
                        className="min-h-[100px] rounded-lg text-base py-2.5 border-border/70 focus:border-primary"
                        {...field}
                    />
                </FormControl>
                <FormDescription className="text-xs">Provide details on topics you find difficult to get a more tailored plan.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="studyHoursPerWeek"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="studyHours-timetable" className="text-base">Study Hours Per Week</FormLabel>
                <FormControl>
                  <Input
                    id="studyHours-timetable"
                    type="number"
                    min="1"
                    max="100"
                    className="rounded-lg text-base py-2.5 border-border/70 focus:border-primary"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex gap-2">
            <Button type="submit" className="w-full sm:w-auto rounded-lg py-3 text-base group" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:rotate-6" />
                  Generate Personalized Plan
                </>
              )}
            </Button>
            {generatedTimetable && (
              <Button type="button" variant="outline" onClick={handleReset} className="rounded-lg">Clear</Button>
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

      {generatedTimetable && (
        <Card className="shadow-md rounded-xl mt-6 border-green-500/30 bg-gradient-to-br from-card to-green-500/5 relative">
           {isLoading && (
            <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-10 rounded-xl">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Updating...</span>
            </div>
          )}
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <CalendarDays className="h-6 w-6 text-green-600" />
              Your Personalized Study Plan: {form.getValues("examName")}
            </CardTitle>
          </CardHeader>
          <CardContent>
             {generatedTimetable.performanceAnalysis && (
                 <Alert variant="default" className="border-purple-500/50 bg-purple-500/10 mb-4">
                    <Lightbulb className="h-5 w-5 text-purple-600" />
                    <AlertTitle className="font-semibold text-purple-700 dark:text-purple-500">AI Planning Rationale</AlertTitle>
                    <AlertDescription className="text-purple-600/90 dark:text-purple-500/90 text-xs">
                    {generatedTimetable.performanceAnalysis}
                    </AlertDescription>
                 </Alert>
            )}
            <ScrollArea className="h-[400px] p-1 border bg-background rounded-lg">
              <div className="p-4">
                <MarkdownRenderer content={generatedTimetable.timetable} />
              </div>
            </ScrollArea>
          </CardContent>
          <CardFooter className="p-4 border-t flex items-center justify-between">
            <Button onClick={handleSaveToLibrary} disabled={!user}>
              <Save className="mr-2 h-4 w-4"/> Save to Library
            </Button>
             {generatedTimetable.nextSteps && generatedTimetable.nextSteps.length > 0 && (
                <div className="flex rounded-md border">
                  <Button asChild className="flex-grow rounded-r-none border-r-0 font-semibold">
                    <Link href={`/medico/${generatedTimetable.nextSteps[0].toolId}?topic=${encodeURIComponent(generatedTimetable.nextSteps[0].prefilledTopic)}`}>
                      {generatedTimetable.nextSteps[0].cta}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  {generatedTimetable.nextSteps.length > 1 && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon" className="rounded-l-none">
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>More Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {generatedTimetable.nextSteps.slice(1).map((step, index) => (
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
    </div>
  );
}
