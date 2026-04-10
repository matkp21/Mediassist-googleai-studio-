// src/app/medico/mock-pyqs/page.tsx
'use client';

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, BookCopy, Wand2, Save, ArrowRight, ChevronDown, FileQuestion, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAiAgent } from '@/hooks/use-ai-agent';
import { generateExamPaper, type MedicoExamPaperInput, type MedicoExamPaperOutput } from '@/ai/agents/medico/ExamPaperAgent';
import { useProMode } from '@/contexts/pro-mode-context';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { cn } from '@/lib/utils';
import { MarkdownRenderer } from '@/components/markdown/markdown-renderer';
import Link from 'next/link';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { StructuredAnswerDetails } from '@/components/medico/library/structured-answer-details';
import { Badge } from '@/components/ui/badge';
import { MedicoExamPaperOutputSchema } from '@/ai/schemas/medico-tools-schemas';

const formSchema = z.object({
  examType: z.string().min(3, { message: "Exam type must be at least 3 characters." }).max(100),
  year: z.string().optional(),
  count: z.coerce.number().int().min(1, "At least 1 MCQ.").max(20, "Max 20 MCQs.").default(10),
});
type ExamPaperFormValues = z.infer<typeof formSchema>;

export default function MockPYQsPage() {
  const { toast } = useToast();
  const { user } = useProMode();
  const { execute: runGenerateExam, data: examData, isLoading, error, reset } = useAiAgent(generateExamPaper, MedicoExamPaperOutputSchema, {
    onSuccess: (data, input) => {
      if (!data || (!data.mcqs?.length && !data.essays?.length)) {
        toast({
          title: "Generation Issue",
          description: "The AI returned an empty paper. Please try a different topic.",
          variant: "default",
        });
        return;
      }
      toast({
        title: "Exam Paper Generated!",
        description: `Mock paper for "${input.examType}" is ready.`,
      });
    },
  });

  const form = useForm<ExamPaperFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { examType: "Final MBBS Prof Mock", year: "", count: 10 },
  });

  const onSubmit: SubmitHandler<ExamPaperFormValues> = async (data) => {
    await runGenerateExam(data);
  };

  const handleReset = () => {
    form.reset();
    reset();
  };

  const handleSaveToLibrary = async () => {
    if (!examData || !user) {
      toast({ title: "Cannot Save", description: "No content to save or user not logged in.", variant: "destructive" });
      return;
    }
    try {
      await addDoc(collection(firestore, `users/${user.uid}/studyLibrary`), {
        type: 'examPaper',
        topic: examData.topicGenerated,
        userId: user.uid,
        mcqs: examData.mcqs || [],
        essays: examData.essays || [],
        createdAt: serverTimestamp(),
      });
      toast({ title: "Saved to Library", description: "This exam paper has been saved." });
    } catch (e) {
      console.error("Firestore save error:", e);
      toast({ title: "Save Failed", description: "Could not save to library.", variant: "destructive" });
    }
  };

  return (
    <PageWrapper title="Mock Previous Year Question Paper">
      <div className="space-y-6">
        <Card className="shadow-lg rounded-xl">
            <CardHeader>
                <CardTitle className="text-xl">Generate Exam Paper</CardTitle>
                <CardDescription>Create a mock exam paper by specifying the exam type and number of questions. AI will attempt to map questions to relevant NMC competencies.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <FormField
                        control={form.control}
                        name="examType"
                        render={({ field }) => (
                            <FormItem className="sm:col-span-3">
                            <FormLabel htmlFor="examType-gen">Exam Name / Type</FormLabel>
                            <FormControl>
                                <Input id="examType-gen" placeholder="e.g., Final MBBS Prof, USMLE Step 1" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                        control={form.control}
                        name="year"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel htmlFor="year-gen">Year (Optional)</FormLabel>
                            <FormControl>
                                <Input id="year-gen" placeholder="e.g., 2023" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                        control={form.control}
                        name="count"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel htmlFor="count-gen">Number of MCQs</FormLabel>
                            <FormControl>
                                <Input id="count-gen" type="number" min="1" max="20" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button type="submit" className="w-full sm:w-auto rounded-lg group" disabled={isLoading}>
                        {isLoading ? (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</>
                        ) : (
                            <><Wand2 className="mr-2 h-4 w-4 transition-transform" /> Generate Exam Paper</>
                        )}
                        </Button>
                        {examData && (
                        <Button type="button" variant="outline" onClick={handleReset} className="rounded-lg">Clear</Button>
                        )}
                    </div>
                    </form>
                </Form>
            </CardContent>
        </Card>

        {error && (
            <Alert variant="destructive" className="rounded-lg">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}

        {examData && (
            <Card className="shadow-lg rounded-xl mt-6 border-green-500/30 bg-gradient-to-br from-card to-green-500/5 relative">
            <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                <BookCopy className="h-6 w-6 text-green-600" />
                Generated Paper: {examData.topicGenerated}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[60vh] p-1 border bg-background rounded-lg">
                <div className="p-4 space-y-6">
                    {examData.essays && examData.essays.length > 0 && (
                    <div>
                        <h3 className="font-semibold text-lg mb-2 flex items-center gap-2"><FileText className="h-5 w-5"/>Essay Questions</h3>
                        <div className="space-y-4">
                        {examData.essays.map((essay, index) => (
                           <Card key={`essay-${index}`} className="p-4 bg-card/80 shadow-sm rounded-lg">
                            <p className="font-semibold mb-2 text-foreground text-sm">Essay Q{index + 1}: {essay.question}</p>
                            {essay.competencyIds && essay.competencyIds.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-2">
                                    {essay.competencyIds.map(id => <Badge key={id} variant="secondary">{id}</Badge>)}
                                </div>
                            )}
                            <Accordion type="single" collapsible className="w-full">
                              <AccordionItem value="answer-10m">
                                <AccordionTrigger>View 10-Mark Answer</AccordionTrigger>
                                <AccordionContent>
                                  <StructuredAnswerDetails answer={essay.answer10M} />
                                </AccordionContent>
                              </AccordionItem>
                              <AccordionItem value="answer-5m">
                                <AccordionTrigger>View 5-Mark Answer</AccordionTrigger>
                                <AccordionContent>
                                  <MarkdownRenderer content={essay.answer5M} />
                                </AccordionContent>
                              </AccordionItem>
                            </Accordion>
                          </Card>
                        ))}
                        </div>
                    </div>
                    )}
                    {examData.mcqs && examData.mcqs.length > 0 && (
                    <div>
                        <h3 className="font-semibold text-lg mb-2 flex items-center gap-2"><FileQuestion className="h-5 w-5"/>Multiple Choice Questions</h3>
                        <div className="space-y-4">
                        {examData.mcqs.map((mcq, index) => (
                            <Card key={index} className="p-3 bg-card/80 shadow-sm rounded-lg">
                            <p className="font-semibold mb-2 text-foreground text-sm">Q{index + 1}: {mcq.question}</p>
                             {mcq.competencyIds && mcq.competencyIds.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-2">
                                    {mcq.competencyIds.map(id => <Badge key={id} variant="secondary">{id}</Badge>)}
                                </div>
                            )}
                            <ul className="space-y-1.5 text-xs">
                                {mcq.options.map((opt, optIndex) => (
                                <li key={optIndex} className={cn("p-2 border rounded-md transition-colors", opt.isCorrect ? "border-green-500 bg-green-500/10 text-green-700 dark:text-green-400 font-medium" : "border-border")}>
                                    {String.fromCharCode(65 + optIndex)}. {opt.text}
                                </li>
                                ))}
                            </ul>
                            {mcq.explanation && (
                                <div className="text-xs mt-2 text-muted-foreground italic border-t pt-2">
                                <MarkdownRenderer content={`**Explanation:** ${mcq.explanation}`} />
                                </div>
                            )}
                            </Card>
                        ))}
                        </div>
                    </div>
                    )}
                </div>
                </ScrollArea>
            </CardContent>
            <CardFooter className="p-4 border-t flex items-center justify-between">
                <Button onClick={handleSaveToLibrary} disabled={!user}>
                <Save className="mr-2 h-4 w-4"/> Save to Library
                </Button>
                {examData.nextSteps && examData.nextSteps.length > 0 && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                        <Button variant="outline">
                            Next Steps <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Recommended Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {examData.nextSteps.map((step, index) => (
                            <DropdownMenuItem key={index} asChild className="cursor-pointer">
                            <Link href={`/medico/${step.toolId}?topic=${encodeURIComponent(step.prefilledTopic)}`}>
                                {step.cta}
                            </Link>
                            </DropdownMenuItem>
                        ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </CardFooter>
            </Card>
        )}
      </div>
    </PageWrapper>
  );
}
