"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle2, 
  Circle, 
  ChevronRight, 
  Calendar, 
  Activity, 
  Dumbbell, 
  Utensils, 
  Stethoscope,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface Milestone {
  day: number;
  title: string;
  description: string;
  type: 'mobility' | 'nutrition' | 'medication' | 'followup';
  status: 'completed' | 'current' | 'upcoming';
}

interface GuidedRehabJourneyProps {
  patientName: string;
  procedure: string;
  currentDay: number;
  milestones: Milestone[];
}

/**
 * Architectural Mapping: DeepTutor "Guided Learning" capability.
 * Transposes step-by-step educational journeys into structured recovery pathways.
 * Converts unstructured discharge papers into interactive post-operative milestones.
 */
export function GuidedRehabJourney({ 
  patientName, 
  procedure, 
  currentDay, 
  milestones 
}: GuidedRehabJourneyProps) {
  
  const [selectedDay, setSelectedDay] = useState(currentDay);
  
  const currentMilestone = milestones.find(m => m.day === selectedDay) || milestones[0];
  const progress = (milestones.filter(m => m.status === 'completed').length / milestones.length) * 100;

  const getIcon = (type: Milestone['type']) => {
    switch (type) {
      case 'mobility': return <Dumbbell className="h-4 w-4" />;
      case 'nutrition': return <Utensils className="h-4 w-4" />;
      case 'medication': return <Activity className="h-4 w-4" />;
      case 'followup': return <Stethoscope className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Recovery Overview Header */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl font-bold tracking-tight">Recovery Milestone: Day {currentDay}</CardTitle>
              <CardDescription>{patientName} • Post-{procedure}</CardDescription>
            </div>
            <Badge variant="outline" className="bg-background/80 backdrop-blur-sm px-4 py-1">
              Phase 1: Acute Recovery
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold uppercase text-muted-foreground tracking-widest">
              <span>Overall Journey Progress</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2 rounded-full" />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Day Selector Sidebar */}
        <div className="md:col-span-4 lg:col-span-3 space-y-2 h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          {milestones.map((milestone) => (
            <button
              key={milestone.day}
              onClick={() => setSelectedDay(milestone.day)}
              className={cn(
                "w-full flex items-center gap-3 p-4 rounded-2xl border transition-all duration-300 text-left",
                selectedDay === milestone.day 
                  ? "bg-primary text-primary-foreground border-primary shadow-lg scale-[1.02] z-10" 
                  : "bg-background/50 hover:bg-background border-border"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                selectedDay === milestone.day ? "bg-primary-foreground/20" : "bg-muted"
              )}>
                {milestone.status === 'completed' ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  <span className="text-xs font-bold">D{milestone.day}</span>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase opacity-60">Day {milestone.day}</p>
                <p className="text-xs font-bold truncate">{milestone.title}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Selected Milestone Detail */}
        <Card className="md:col-span-8 lg:col-span-9 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-3xl border-white dark:border-white/5 rounded-[2.5rem]">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedDay}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="p-8"
            >
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                  {getIcon(currentMilestone.type)}
                </div>
                <div>
                  <h3 className="text-2xl font-bold tracking-tight">{currentMilestone.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="capitalize text-[10px] h-5 tracking-widest">{currentMilestone.type}</Badge>
                    <span className="text-xs text-muted-foreground">• Recommended for Day {currentMilestone.day}</span>
                  </div>
                </div>
              </div>

              <div className="prose prose-sm dark:prose-invert max-w-none bg-muted/30 p-6 rounded-[2rem] border border-border/50">
                <p className="text-slate-600 dark:text-zinc-400 leading-relaxed italic">
                  {currentMilestone.description}
                </p>
                <div className="mt-6 flex flex-col gap-3">
                   <h4 className="text-sm font-bold flex items-center gap-2">
                     <CheckCircle2 className="h-4 w-4 text-emerald-500" /> 
                     Guidelines for this step:
                   </h4>
                   <ul className="text-xs space-y-2 list-none p-0">
                     <li className="flex gap-2">
                       <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                       Ensure adequate hydration before commencing the prescribed mobility exercises.
                     </li>
                     <li className="flex gap-2">
                       <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                       Record pain levels on a scale of 1-10 immediately following completion.
                     </li>
                   </ul>
                </div>
              </div>

              <div className="mt-8 flex items-center justify-between">
                <Button variant="outline" className="rounded-full px-6">
                  <Info className="h-4 w-4 mr-2" /> Message Care Agent
                </Button>
                {currentMilestone.status !== 'completed' && (
                  <Button className="rounded-full px-8 bg-sky-600 hover:bg-sky-700 shadow-lg shadow-sky-500/20">
                    Mark as Completed <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </Card>
      </div>
    </div>
  );
}
