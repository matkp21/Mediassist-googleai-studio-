"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, CartesianGrid, Cell, PieChart, Pie, Legend } from 'recharts';
import { useProMode } from '@/contexts/pro-mode-context';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { BrainCircuit, Target, Activity } from 'lucide-react';

interface Task {
  status: string;
  isCompleted: boolean;
  requiresAdaptiveReview?: boolean;
  easeFactor?: number;
  repetitionCount?: number;
}

export function StudyAnalyticsDashboard() {
  const { user } = useProMode();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const tasksRef = collection(firestore, `users/${user.uid}/tasks`);
    const q = query(tasksRef);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedTasks = snapshot.docs.map(doc => doc.data() as Task);
      setTasks(fetchedTasks);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching analytics:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  if (loading || !user) return null;

  // Process data for charts
  const reviewCounts = { Excellent: 0, Good: 0, Hard: 0, Failed: 0, Unassessed: 0 };
  let adaptiveCount = 0;
  let totalEase = 0;
  let easeCount = 0;

  tasks.forEach(t => {
    // If it hasn't been assessed, easeFactor is usually missing or base 2.5 without repetitionCount
    if (t.easeFactor) {
        totalEase += t.easeFactor;
        easeCount++;
    }
    
    if (t.requiresAdaptiveReview) {
        adaptiveCount++;
    }

    if (t.status === 'Failed') reviewCounts.Failed++;
    else if (t.status === 'Hard') reviewCounts.Hard++;
    else if (t.status === 'Needs Review') reviewCounts.Failed++; // group them
    else if (t.status === 'PendingReview') reviewCounts.Good++; // loosely map
    else reviewCounts.Unassessed++;
  });

  const avgEase = easeCount > 0 ? (totalEase / easeCount).toFixed(2) : "2.50";
  const retentionRate = tasks.length > 0 ? (((tasks.length - adaptiveCount) / tasks.length) * 100).toFixed(0) : 0;

  const performanceData = [
    { name: 'Failed/Hard', count: reviewCounts.Failed + reviewCounts.Hard },
    { name: 'Good/Excellent', count: reviewCounts.Good },
    { name: 'Fresh', count: reviewCounts.Unassessed }
  ];

  const COLORS = ['#ef4444', '#22c55e', '#94a3b8'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10 items-stretch">
      <Card className="col-span-1 lg:col-span-2 shadow-lg rounded-xl max-h-[350px]">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary"/>
            Spaced Repetition Performance
          </CardTitle>
          <CardDescription>Distribution of active topic recall strength</CardDescription>
        </CardHeader>
        <CardContent className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} fontSize={12} tickLine={false} axisLine={false} />
                <RechartsTooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}/>
                <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={60}>
                  {performanceData.map((entry, index) => (
                    <Cell key={"cell-" + index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="col-span-1 shadow-lg rounded-xl flex flex-col max-h-[350px]">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl flex items-center gap-2">
             <BrainCircuit className="h-5 w-5 text-primary"/> 
             Memory Consolidation
          </CardTitle>
          <CardDescription>Autonomous ML memory constraints</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col justify-center items-center flex-1 gap-6 pb-6">
           <div className="flex w-full justify-between items-center bg-muted/30 p-4 rounded-lg">
             <div className="flex flex-col">
                <span className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Avg. SM-2 Ease</span>
                <span className="text-2xl font-bold text-primary">{avgEase}</span>
             </div>
             <Target className="h-8 w-8 text-primary/50" />
           </div>

           <div className="relative w-32 h-32 flex justify-center items-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[{value: Number(retentionRate)}, {value: 100 - Number(retentionRate)}]}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={60}
                    startAngle={90}
                    endAngle={-270}
                    dataKey="value"
                    stroke="none"
                  >
                    <Cell fill="#22c55e" />
                    <Cell fill="#ef4444" opacity={0.2} />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col justify-center items-center">
                 <span className="text-3xl font-bold">{retentionRate}%</span>
              </div>
           </div>
           <span className="text-xs text-muted-foreground tracking-wide font-medium">Est. Knowledge Retention</span>
        </CardContent>
      </Card>
    </div>
  );
}
