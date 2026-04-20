// src/components/medico/progress-tracker.tsx
"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Award, BarChart2, CheckCircle, Target, Lightbulb, Save, ArrowRight } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts"
import { useTheme } from '@/contexts/theme-provider';
import type { MedicoProgressTrackerOutput } from '@/ai/agents/medico/ProgressTrackerAgent';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';


// More detailed placeholder data for demonstration
const sampleProgressData: MedicoProgressTrackerOutput & { subjects: any[], achievements: any[] } = {
  progressUpdateMessage: "Welcome to your progress dashboard! This is a sample view.",
  updatedTopicProgress: { topic: "Overall", newProgressPercentage: 65 },
  subjects: [
    { name: 'Pediatrics', progress: 75, quizzesCompleted: 5, notesReviewed: 12 },
    { name: 'Surgery', progress: 50, quizzesCompleted: 3, notesReviewed: 8 },
    { name: 'Medicine', progress: 70, quizzesCompleted: 6, notesReviewed: 15 },
    { name: 'Ob/Gyn', progress: 80, quizzesCompleted: 7, notesReviewed: 10 },
    { name: 'Pharmacology', progress: 45, quizzesCompleted: 2, notesReviewed: 18 },
  ],
  newAchievements: [
    { id: 'ach1', name: 'Pediatrics Quiz Master', icon: Award, unlocked: true },
    { id: 'ach2', name: 'Surgery Note Taker', icon: CheckCircle, unlocked: true },
    { id: 'ach3', name: 'Study Streak: 7 Days', icon: Target, unlocked: false },
    { id: 'ach4', name: 'Pharmacology Powerhouse', icon: Award, unlocked: false },
  ],
  nextSteps: [
    {
        "title": "Tackle a Weak Area",
        "description": "Generate practice MCQs for Pharmacology to improve your score.",
        "toolId": "mcq",
        "prefilledTopic": "Pharmacology",
        "cta": "Practice Pharmacology MCQs"
    }
  ]
};

export default function ProgressTracker() {
  const [progressData] = useState(sampleProgressData);
  const { resolvedTheme } = useTheme();

  return (
    <div className="space-y-6">
      <Alert variant="default" className="border-green-500/50 bg-green-500/10">
            <Lightbulb className="h-5 w-5 text-green-600" />
            <AlertTitle className="font-semibold text-green-700 dark:text-green-500">Progress Dashboard</AlertTitle>
            <AlertDescription className="text-green-600/90 dark:text-green-500/90 text-xs">
              Activity tracking is now active across all Medico tools! As you generate notes, take quizzes, or complete cases, you'll receive toast notifications with gamified feedback. This dashboard visualizes sample data to demonstrate how your future progress will be displayed.
            </AlertDescription>
      </Alert>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-3 shadow-md rounded-xl">
          <CardHeader>
            <CardTitle className="text-xl">Overall Progress</CardTitle>
          </CardHeader>
          <CardContent>
             <Label className="text-sm font-medium">Overall Syllabus Completion: {progressData.updatedTopicProgress?.newProgressPercentage}%</Label>
             <Progress value={progressData.updatedTopicProgress?.newProgressPercentage} className="w-full mt-2 h-4 rounded-full" />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 shadow-md rounded-xl">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <BarChart2 className="h-6 w-6 text-primary" />
              Subject Progress
            </CardTitle>
            <CardDescription>Your current progress across different subjects.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={progressData.subjects} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={resolvedTheme === 'dark' ? 0.2 : 0.5} />
                <XAxis 
                  dataKey="name" 
                  stroke={resolvedTheme === 'dark' ? "hsl(var(--muted-foreground))" : "#555"}
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false}
                />
                <YAxis 
                  stroke={resolvedTheme === 'dark' ? "hsl(var(--muted-foreground))" : "#555"} 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip 
                  cursor={{ fill: 'hsla(var(--primary)/0.1)' }}
                  contentStyle={{
                    backgroundColor: `hsl(var(--background))`,
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 'var(--radius)',
                  }}
                />
                <Legend iconSize={10} wrapperStyle={{fontSize: "12px"}}/>
                <Bar 
                  dataKey="progress" 
                  fill="hsl(var(--primary))" 
                  radius={[4, 4, 0, 0]} 
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
          {progressData.nextSteps && progressData.nextSteps.length > 0 && (
            <CardFooter className="p-4 border-t flex items-center justify-end">
                <div className="flex rounded-md border">
                  <Button asChild className="flex-grow rounded-r-none border-r-0 font-semibold">
                    <Link href={`/medico/${progressData.nextSteps[0].toolId}?topic=${encodeURIComponent(progressData.nextSteps[0].prefilledTopic)}`}>
                      {progressData.nextSteps[0].cta}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  {progressData.nextSteps.length > 1 && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon" className="rounded-l-none">
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>More Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {progressData.nextSteps.slice(1).map((step, index) => (
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
            </CardFooter>
          )}
        </Card>

        <Card className="lg:col-span-1 shadow-md rounded-xl">
           <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Award className="h-6 w-6 text-yellow-500" />
              Achievements
            </CardTitle>
            <CardDescription>Milestones you've unlocked.</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="space-y-3">
              {progressData.newAchievements.map(ach => (
                <div key={(ach as any).id} className={`flex items-center gap-3 p-2 border rounded-lg ${(ach as any).unlocked ? 'border-green-500/50 bg-green-500/10' : 'border-dashed opacity-70'}`}>
                  <div className={`p-1.5 rounded-full ${(ach as any).unlocked ? 'bg-green-600' : 'bg-muted-foreground'}`}>
                    <Award className={`h-5 w-5 ${(ach as any).unlocked ? 'text-white' : 'text-background'}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{(ach as any).name}</p>
                    {!(ach as any).unlocked && <p className="text-xs text-muted-foreground">(Locked)</p>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
