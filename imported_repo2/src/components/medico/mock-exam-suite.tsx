// src/components/medico/mock-exam-suite.tsx
"use client";

import { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Trophy, Clock, Loader2, PlayCircle, BarChart, CheckCircle, XCircle, FilePlus, Wand2, Save, Textarea } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { trackProgress } from '@/ai/agents/medico/ProgressTrackerAgent';
import { generateExamPaper, type MedicoExamPaperInput, type MedicoExamPaperOutput } from '@/ai/agents/medico/ExamPaperAgent';
import { MedicoExamPaperOutputSchema, type EssayQuestion as EssayQuestionType } from '@/ai/schemas/medico-tools-schemas';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormMessage } from '@/components/ui/form';
import { useProMode } from '@/contexts/pro-mode-context';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAiAgent } from '@/hooks/use-ai-agent';

type Question = Exclude<MedicoExamPaperOutput['mcqs'], undefined>[number];
type EssayQuestion = EssayQuestionType;

interface Exam {
  id: string;
  title: string;
  timeLimitMinutes: number;
  questions: Question[];
  essays?: EssayQuestion[];
}

const formSchema = z.object({
  examType: z.string().min(3, { message: "Exam type must be at least 3 characters." }).max(100),
  count: z.coerce.number().int().min(5, "Minimum 5 MCQs.").max(20, "Maximum 20 MCQs.").default(10),
});
type ExamFormValues = z.infer<typeof formSchema>;


export default function MockExamSuite() {
  const [activeExam, setActiveExam] = useState<Exam | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerId, setTimerId] = useState<NodeJS.Timeout | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [examResult, setExamResult] = useState<{ score: number; correct: number; total: number } | null>(null);
  const { toast } = useToast();
  const { user } = useProMode();

  const { execute: runGenerateExam, data: examData, isLoading, error } = useAiAgent(
    generateExamPaper, 
    MedicoExamPaperOutputSchema,
    {
      onSuccess: (data) => {
        if (!data.mcqs || data.mcqs.length === 0) {
          toast({ title: "No MCQs Generated", description: "The AI did not generate any multiple-choice questions for this exam.", variant: "destructive" });
          return;
        }
        const exam: Exam = {
          id: `exam-${Date.now()}`,
          title: data.topicGenerated,
          timeLimitMinutes: (data.mcqs.length * 1) + ((data.essays?.length || 0) * 5),
          questions: data.mcqs,
          essays: data.essays || [],
        };
        startExam(exam);
      }
    }
  );

  const form = useForm<ExamFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { examType: "Final MBBS Prof Mock", count: 10 },
  });
  
  const startExam = (exam: Exam) => {
    setActiveExam(exam);
    setTimeLeft(exam.timeLimitMinutes * 60);
    setExamResult(null);
    setUserAnswers({});
    const newTimerId = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(newTimerId);
          handleSubmitExam(true); // Pass true to indicate time's up
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    setTimerId(newTimerId);
  };

  const handleSubmitExam = useCallback((timeUp = false) => {
    if (!activeExam) return;
    if (timerId) clearInterval(timerId);

    let correctCount = 0;
    activeExam.questions.forEach(q => {
        const correctIndex = q.options.findIndex(opt => opt.isCorrect);
        if (userAnswers[q.question] === correctIndex) {
            correctCount++;
        }
    });
    
    const score = Math.round((correctCount / activeExam.questions.length) * 100);
    setExamResult({ score, correct: correctCount, total: activeExam.questions.length });
    
    if (timeUp) {
        toast({ title: "Time's Up!", description: `Exam submitted automatically. Your score: ${score}%`, variant: 'destructive'});
    } else {
        toast({ title: 'Exam Submitted!', description: `You scored ${score}%!` });
    }

    trackProgress({
        activityType: 'mcq_session',
        topic: `Mock Exam: ${activeExam.title}`,
        score: score,
    }).catch(err => console.warn("Failed to track progress for mock exam:", err));

  }, [activeExam, timerId, userAnswers, toast]);


  const handleGenerateAndStart: SubmitHandler<ExamFormValues> = async (data) => {
    const input: MedicoExamPaperInput = { examType: data.examType, count: data.count };
    await runGenerateExam(input);
  };
  
  const handleAnswerChange = (questionId: string, answerIndex: number) => {
    setUserAnswers(prev => ({...prev, [questionId]: answerIndex}));
  };

  const resetExam = () => {
    if (timerId) clearInterval(timerId);
    setActiveExam(null);
    setExamResult(null);
    setUserAnswers({});
  };

  const handleSaveToLibrary = async () => {
    if (!activeExam || !user || !examData) {
      toast({ title: "Cannot Save", description: "No active exam to save or user not logged in.", variant: "destructive" });
      return;
    }
     const notesContent = `
## Mock Exam: ${activeExam.title}
This mock exam contained ${activeExam.questions.length} questions.
(Questions and answers are stored in the data fields).
    `;
    try {
      await addDoc(collection(firestore, `users/${user.uid}/studyLibrary`), {
        type: 'examPaper',
        topic: activeExam.title,
        userId: user.uid,
        mcqs: examData.mcqs,
        essays: examData.essays,
        createdAt: serverTimestamp(),
      });
      toast({ title: "Saved to Library", description: "This mock exam has been saved." });
    } catch (e) {
      console.error("Firestore save error:", e);
      toast({ title: "Save Failed", description: "Could not save exam to library.", variant: "destructive" });
    }
  };


  if (activeExam) {
    return (
        <Card className="shadow-lg rounded-xl border-blue-500/30">
            <CardHeader>
                <CardTitle>{activeExam.title}</CardTitle>
                <CardDescription>Answer all questions before the time runs out.</CardDescription>
                <div className="space-y-1 pt-2">
                    <Label className="text-xs font-semibold">Time Remaining:</Label>
                    <Progress value={(timeLeft / (activeExam.timeLimitMinutes * 60)) * 100} className="h-2" />
                    <p className="text-center font-mono text-sm text-muted-foreground">
                        {Math.floor(timeLeft / 60).toString().padStart(2, '0')}:{ (timeLeft % 60).toString().padStart(2, '0')}
                    </p>
                </div>
            </CardHeader>
            <CardContent>
                {examResult ? (
                    <div className="text-center space-y-4">
                        <h3 className="text-2xl font-bold">Exam Finished!</h3>
                        <p className="text-4xl font-bold text-primary">{examResult.score}%</p>
                        <p>You answered {examResult.correct} out of {examResult.total} questions correctly.</p>
                        <div className="flex justify-center gap-2">
                            <Button onClick={resetExam} className="rounded-lg">Back to Exam Setup</Button>
                            <Button onClick={handleSaveToLibrary} variant="outline" disabled={!user}>
                                <Save className="mr-2 h-4 w-4" /> Save Exam
                            </Button>
                        </div>
                    </div>
                ) : (
                    <ScrollArea className="h-[60vh] p-1">
                      <div className="space-y-4 p-2">
                          {activeExam.questions.map((q, index) => (
                              <div key={q.question} className="p-3 border rounded-lg">
                                  <p className="font-semibold text-sm mb-2">Q{index+1}: {q.question}</p>
                                  <RadioGroup onValueChange={(val) => handleAnswerChange(q.question, parseInt(val))} value={String(userAnswers[q.question])}>
                                      {q.options.map((opt, i) => (
                                          <div key={i} className="flex items-center space-x-2">
                                              <RadioGroupItem value={String(i)} id={`${q.question}-opt${i}`} />
                                              <Label htmlFor={`${q.question}-opt${i}`} className="text-sm font-normal">{opt.text}</Label>
                                          </div>
                                      ))}
                                  </RadioGroup>
                              </div>
                          ))}
                          {activeExam.essays && activeExam.essays.map((essay, index) => (
                             <div key={essay.question} className="p-3 border rounded-lg">
                                <p className="font-semibold text-sm mb-2">Essay Q{index+1}: {essay.question}</p>
                                <Textarea placeholder="Type your essay answer here..." className="min-h-[120px]"/>
                            </div>
                          ))}
                      </div>
                    </ScrollArea>
                )}
            </CardContent>
            <CardFooter className="border-t pt-4">
                 {!examResult && <Button onClick={() => handleSubmitExam(false)} className="w-full rounded-lg">Submit Exam</Button>}
            </CardFooter>
        </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-md rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Trophy className="h-6 w-6 text-primary"/>Generate Mock Exam</CardTitle>
          <CardDescription>Create a timed mock exam with AI-generated questions to simulate real test conditions.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleGenerateAndStart)} className="space-y-4">
              <FormField
                control={form.control}
                name="examType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Exam Type / Topic</FormLabel>
                    <Input placeholder="e.g., USMLE Step 1 Pharmacology, Final MBBS Prof" {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="count"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of MCQs</FormLabel>
                    <Input type="number" {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full rounded-lg" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                Generate & Start Exam
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
