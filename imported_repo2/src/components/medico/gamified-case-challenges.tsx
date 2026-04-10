// src/components/medico/gamified-case-challenges.tsx
"use client";

import { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Swords, Trophy, Clock, Loader2, PlayCircle, Target, CheckCircle, XCircle, Save, ArrowRight, ChevronDown } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { generateCaseChallenge, type MedicoCaseChallengeGeneratorOutput } from '@/ai/agents/medico/CaseChallengeGeneratorAgent';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { useProMode } from '@/contexts/pro-mode-context';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import Link from 'next/link';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

type Challenge = MedicoCaseChallengeGeneratorOutput;

const sampleLeaderboard = [
  { rank: 1, name: 'Dr. Ace', score: 2850 },
  { rank: 2, name: 'MedicoMax', score: 2700 },
  { rank: 3, name: 'StudentX', score: 2550 },
  { rank: 4, name: 'Learner99', score: 2400 },
  { rank: 5, name: 'FutureDoc', score: 2250 },
];


export default function GamifiedCaseChallenges() {
  const [activeChallenge, setActiveChallenge] = useState<Challenge | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerId, setTimerId] = useState<NodeJS.Timeout | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [result, setResult] = useState<'correct' | 'incorrect' | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const { toast } = useToast();
  const { user } = useProMode();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');

  const startChallenge = useCallback((challenge: Challenge) => {
    setActiveChallenge(challenge);
    setTimeLeft(challenge.timeLimitSeconds);
    setResult(null);
    setUserAnswer('');
    setScore(null);
    const newTimerId = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(newTimerId);
          // Use a function reference that captures the current state
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    setTimerId(newTimerId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  const handleFetchChallenge = async () => {
    setIsLoading(true);
    try {
      const challengeData = await generateCaseChallenge({ difficulty: selectedDifficulty });
      startChallenge(challengeData);
    } catch (err) {
      toast({
        title: "Failed to Generate Challenge",
        description: err instanceof Error ? err.message : "An unknown error occurred.",
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleTimeUp = useCallback(() => {
     if (timerId) clearInterval(timerId);
     setResult('incorrect');
     setScore(0);
     toast({
        title: "Time's Up!",
        description: "You ran out of time for this challenge.",
        variant: 'destructive',
     });
  }, [timerId, toast]);

  const handleSubmitAnswer = () => {
    if (!activeChallenge) return;
    if (timerId) clearInterval(timerId);
    
    const isCorrect = userAnswer.trim().toLowerCase() === activeChallenge.correctAnswer.toLowerCase();
    
    if (isCorrect) {
      setResult('correct');
      const points = 50 + timeLeft; // Base points + time bonus
      setScore(points);
      toast({ title: 'Correct!', description: `You earned ${points} points!` });
    } else {
      setResult('incorrect');
      setScore(0);
      toast({ title: 'Incorrect', description: 'Better luck next time!', variant: 'destructive' });
    }
  };

  const resetChallenge = () => {
    if (timerId) clearInterval(timerId);
    setActiveChallenge(null);
    setResult(null);
    setScore(null);
    setUserAnswer('');
  };

  const handleSaveToLibrary = async () => {
    if (!activeChallenge || !user) {
      toast({ title: "Cannot Save", description: "No active challenge or user not logged in.", variant: "destructive" });
      return;
    }
    const notesContent = `
## Case Challenge: ${activeChallenge.title}
**Difficulty:** ${activeChallenge.difficulty}

**Case Details:**
${activeChallenge.caseDetails}

**Correct Answer:**
${activeChallenge.correctAnswer}
    `;
    try {
      await addDoc(collection(firestore, `users/${user.uid}/studyLibrary`), {
        type: 'notes',
        topic: `Case Challenge: ${activeChallenge.title}`,
        userId: user.uid,
        notes: notesContent,
        createdAt: serverTimestamp(),
      });
      toast({ title: "Saved to Library", description: "This case challenge has been saved as a note." });
    } catch (e) {
      console.error("Firestore save error:", e);
      toast({ title: "Save Failed", description: "Could not save to library.", variant: "destructive" });
    }
  };

  const getDifficultyClass = (difficulty: Challenge['difficulty']) => {
    if (difficulty === 'Hard') return 'text-red-500 bg-red-500/10';
    if (difficulty === 'Medium') return 'text-orange-500 bg-orange-500/10';
    return 'text-green-500 bg-green-500/10';
  }

  if (activeChallenge) {
    return (
        <Card className="shadow-lg rounded-xl border-blue-500/30">
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span>{activeChallenge.title}</span>
                    <span className={cn('text-xs font-semibold px-2 py-1 rounded-full', getDifficultyClass(activeChallenge.difficulty))}>
                        {activeChallenge.difficulty}
                    </span>
                </CardTitle>
                <CardDescription>Read the case and submit your primary diagnosis within the time limit.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <Label className="font-semibold">Case Details:</Label>
                    <p className="text-sm p-3 bg-muted/50 rounded-md mt-1 whitespace-pre-wrap">{activeChallenge.caseDetails}</p>
                </div>
                <div className="space-y-2">
                    <Label className="font-semibold flex items-center gap-2"><Clock className="h-4 w-4"/>Time Remaining:</Label>
                    <Progress value={(timeLeft / activeChallenge.timeLimitSeconds) * 100} className="h-3" />
                    <p className="text-center font-mono text-lg">{timeLeft}s</p>
                </div>
                
                {result === null ? (
                    <div className="space-y-2">
                        <Label htmlFor="diagnosis-answer">Your Diagnosis:</Label>
                        <Input id="diagnosis-answer" value={userAnswer} onChange={e => setUserAnswer(e.target.value)} placeholder="Type your diagnosis here..." className="rounded-md"/>
                        <Button onClick={handleSubmitAnswer} className="w-full rounded-lg">Submit Answer</Button>
                    </div>
                ) : (
                    <div className="space-y-3 pt-3 border-t">
                        <h3 className="font-semibold text-lg text-center">Result</h3>
                        {result === 'correct' ? (
                            <Alert variant="default" className="border-green-500 bg-green-500/10">
                                <CheckCircle className="h-5 w-5 text-green-600"/>
                                <AlertTitle className="text-green-700">Correct!</AlertTitle>
                                <AlertDescription className="text-green-600/90">
                                    The correct diagnosis was: <strong>{activeChallenge.correctAnswer}</strong>. You scored {score} points!
                                </AlertDescription>
                            </Alert>
                        ) : (
                             <Alert variant="destructive">
                                <XCircle className="h-5 w-5"/>
                                <AlertTitle>Incorrect</AlertTitle>
                                <AlertDescription>
                                    The correct diagnosis was: <strong>{activeChallenge.correctAnswer}</strong>. Keep practicing!
                                </AlertDescription>
                            </Alert>
                        )}
                        <Button onClick={resetChallenge} variant="outline" className="w-full rounded-lg">Back to Challenges</Button>

                         {result !== null && (
                            <div className="pt-3 border-t mt-3 flex items-center justify-between">
                                <Button onClick={handleSaveToLibrary} disabled={!user}>
                                    <Save className="mr-2 h-4 w-4"/> Save Case
                                </Button>
                                {activeChallenge.nextSteps && activeChallenge.nextSteps.length > 0 && (
                                  <div className="flex rounded-md border">
                                    <Button asChild className="flex-grow rounded-r-none border-r-0 font-semibold">
                                      <Link href={`/medico/${activeChallenge.nextSteps[0].toolId}?topic=${encodeURIComponent(activeChallenge.nextSteps[0].prefilledTopic)}`}>
                                        {activeChallenge.nextSteps[0].cta}
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                      </Link>
                                    </Button>
                                    {activeChallenge.nextSteps.length > 1 && (
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <Button variant="outline" size="icon" className="rounded-l-none">
                                            <ChevronDown className="h-4 w-4" />
                                          </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                          <DropdownMenuLabel>More Actions</DropdownMenuLabel>
                                          <DropdownMenuSeparator />
                                          {activeChallenge.nextSteps.slice(1).map((step, index) => (
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
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-md rounded-xl">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Target className="h-6 w-6 text-primary"/>Start a New Challenge</CardTitle>
                <CardDescription>Select a difficulty and the AI will generate a unique case for you to solve.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="difficulty-select">Difficulty</Label>
                  <Select value={selectedDifficulty} onValueChange={(v) => setSelectedDifficulty(v as any)}>
                    <SelectTrigger id="difficulty-select" className="w-full mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Easy">Easy</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleFetchChallenge} disabled={isLoading} className="w-full rounded-lg">
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <PlayCircle className="mr-2 h-4 w-4"/>}
                  Generate & Start Challenge
                </Button>
            </CardContent>
        </Card>
        <Card className="shadow-md rounded-xl">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Trophy className="h-6 w-6 text-yellow-500"/>Leaderboard</CardTitle>
                <CardDescription>See how you rank against other students. (Demo)</CardDescription>
            </CardHeader>
            <CardContent>
                <ul className="space-y-1">
                    {sampleLeaderboard.map(entry => (
                        <li key={entry.rank} className="flex justify-between items-center p-2 rounded-md hover:bg-muted/50 text-sm">
                            <span className="font-medium">#{entry.rank} {entry.name}</span>
                            <span className="text-muted-foreground">{entry.score} pts</span>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
