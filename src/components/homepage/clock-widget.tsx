// src/components/homepage/clock-widget.tsx
"use client";

import { useState, useEffect, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { AlarmClockCheck, TimerIcon, BellRing, PlusCircle, Play, Pause, RotateCcw, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface Reminder {
  id: string;
  text: string;
  dateTime: Date;
}

interface ClockWidgetProps {
  onClose?: () => void;
}

// Isolated component for the clock display to prevent re-rendering the whole widget every second.
const ClockDisplay = () => {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const clockInterval = setInterval(() => {
        setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(clockInterval);
    }, []);

    const hoursForClock = currentTime.getHours() % 12;
    const minutesForClock = currentTime.getMinutes();
    const secondsForClock = currentTime.getSeconds();
    const hourAngle = (hoursForClock + minutesForClock / 60) * 30;
    const minuteAngle = (minutesForClock + secondsForClock / 60) * 6;
    const secondAngle = secondsForClock * 6;

    return (
        <>
            <div className="text-center">
                <p className="text-5xl font-bold tabular-nums text-foreground">{format(currentTime, "HH:mm")}</p>
                <p className="text-sm text-muted-foreground">{format(currentTime, "ss 'sec'")}</p>
                <p className="text-lg text-foreground mt-1">{format(currentTime, "eeee, MMMM do")}</p>
            </div>
            <div className="relative w-32 h-32 mx-auto mt-6" aria-label="Analogue clock">
                <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
                <circle cx="50" cy="50" r="48" stroke="hsl(var(--border))" strokeWidth="2" fill="hsl(var(--card))" />
                {[...Array(12)].map((_, i) => (
                    <line key={`h-marker-${i}`} x1="50" y1="10" x2="50" y2="14" stroke="hsl(var(--foreground))" strokeWidth="1.5" transform={`rotate(${i * 30} 50 50)`} />
                ))}
                {[...Array(60)].map((_, i) => (i % 5 === 0 ? null : 
                    <line key={`m-marker-${i}`} x1="50" y1="10" x2="50" y2="12" stroke="hsl(var(--muted-foreground))" strokeWidth="0.5" transform={`rotate(${i * 6} 50 50)`} />
                ))}
                <line x1="50" y1="50" x2="50" y2="30" stroke="hsl(var(--foreground))" strokeWidth="3.5" strokeLinecap="round" transform={`rotate(${hourAngle} 50 50)`} />
                <line x1="50" y1="50" x2="50" y2="20" stroke="hsl(var(--foreground))" strokeWidth="2.5" strokeLinecap="round" transform={`rotate(${minuteAngle} 50 50)`} />
                <line x1="50" y1="50" x2="50" y2="15" stroke="hsl(var(--primary))" strokeWidth="1" strokeLinecap="round" transform={`rotate(${secondAngle} 50 50)`} />
                <circle cx="50" cy="50" r="2.5" fill="hsl(var(--primary))" stroke="hsl(var(--card))" strokeWidth="1"/>
                </svg>
            </div>
        </>
    );
};


export function ClockWidget({ onClose }: ClockWidgetProps) {
  const { toast } = useToast();

  const [timerInputHours, setTimerInputHours] = useState(0);
  const [timerInputMinutes, setTimerInputMinutes] = useState(5);
  const [timerInputSeconds, setTimerInputSeconds] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0); 
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerIntervalId, setTimerIntervalId] = useState<NodeJS.Timeout | null>(null);

  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [newReminderText, setNewReminderText] = useState('');
  const [newReminderDateTime, setNewReminderDateTime] = useState<Date | undefined>(new Date());
  
  const startTimer = useCallback(() => {
    let initialTime = timeLeft; 
    if (!isTimerRunning && initialTime <= 0) { 
        initialTime = timerInputHours * 3600 + timerInputMinutes * 60 + timerInputSeconds;
    }

    if (initialTime <= 0) {
        toast({ title: "Invalid Duration", description: "Please set a timer duration greater than 0.", variant: "destructive" });
        return;
    }
    
    setTimeLeft(initialTime); 
    setIsTimerRunning(true);
    if (timerIntervalId) clearInterval(timerIntervalId);

    const newIntervalId = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(newIntervalId);
          setIsTimerRunning(false);
          toast({ title: "Timer Finished!", description: "Your timer has ended." });
          try {
            const audio = new Audio('/sounds/timer-finish.mp3'); 
            audio.play().catch(e => console.warn("Audio play failed:", e));
          } catch (e) {
            console.warn("Could not play timer sound", e);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    setTimerIntervalId(newIntervalId);
  }, [timeLeft, timerInputHours, timerInputMinutes, timerInputSeconds, timerIntervalId, toast, isTimerRunning]);


  const pauseTimer = () => {
    setIsTimerRunning(false);
    if (timerIntervalId) {
      clearInterval(timerIntervalId);
      setTimerIntervalId(null);
    }
  };

  const resetTimer = () => {
    pauseTimer();
    const totalSecondsFromInput = timerInputHours * 3600 + timerInputMinutes * 60 + timerInputSeconds;
    setTimeLeft(totalSecondsFromInput > 0 ? totalSecondsFromInput : 0);
  };
  
  const clearTimerInputsAndReset = () => {
    pauseTimer();
    setTimerInputHours(0);
    setTimerInputMinutes(5); 
    setTimerInputSeconds(0);
    setTimeLeft(0); 
  }

  const formatTime = (totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const handleAddReminder = () => {
    if (!newReminderText.trim() || !newReminderDateTime) {
      toast({ title: "Reminder Incomplete", description: "Please enter reminder text and select a date/time.", variant: "destructive" });
      return;
    }
    const newReminder: Reminder = {
      id: Date.now().toString(),
      text: newReminderText,
      dateTime: newReminderDateTime,
    };
    setReminders(prev => [...prev, newReminder].sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime()));
    setNewReminderText('');
    toast({ title: "Reminder Set", description: `Reminder "${newReminder.text}" scheduled.` });
  };

  const deleteReminder = (id: string) => {
    setReminders(prev => prev.filter(r => r.id !== id));
    toast({ title: "Reminder Deleted" });
  };
  
  return (
    <Card className="border-none shadow-none bg-transparent w-full">
      <Tabs defaultValue="clock" className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-12 rounded-t-lg rounded-b-none bg-muted border-b border-border/50">
          <TabsTrigger value="clock" className="text-xs h-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-tl-lg transition-colors duration-300"><AlarmClockCheck className="mr-1 h-4 w-4" />Clock</TabsTrigger>
          <TabsTrigger value="timer" className="text-xs h-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-colors duration-300"><TimerIcon className="mr-1 h-4 w-4" />Timer</TabsTrigger>
          <TabsTrigger value="reminders" className="text-xs h-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-tr-lg transition-colors duration-300"><BellRing className="mr-1 h-4 w-4" />Reminders</TabsTrigger>
        </TabsList>
        
        <TabsContent value="clock" className="p-4 pt-6">
          <ClockDisplay />
        </TabsContent>

        <TabsContent value="timer" className="p-4 space-y-4">
          <CardHeader className="p-0 mb-2">
            <CardTitle className="text-lg text-center text-primary">Timer</CardTitle>
          </CardHeader>
           <div className="text-center my-4">
            <p className="text-4xl font-bold tabular-nums text-foreground">
              {formatTime(timeLeft > 0 ? timeLeft : (timerInputHours * 3600 + timerInputMinutes * 60 + timerInputSeconds))}
            </p>
          </div>
          <div className="flex gap-2 items-end">
            <div><Label htmlFor="timer-hours" className="text-xs">H</Label><Input id="timer-hours" type="number" min="0" max="23" value={timerInputHours} onChange={e => setTimerInputHours(Math.max(0, parseInt(e.target.value)) || 0)} className="h-8 text-sm rounded-md border-input focus:border-primary" disabled={isTimerRunning}/></div>
            <div><Label htmlFor="timer-minutes" className="text-xs">M</Label><Input id="timer-minutes" type="number" min="0" max="59" value={timerInputMinutes} onChange={e => setTimerInputMinutes(Math.max(0, parseInt(e.target.value)) || 0)} className="h-8 text-sm rounded-md border-input focus:border-primary" disabled={isTimerRunning}/></div>
            <div><Label htmlFor="timer-seconds" className="text-xs">S</Label><Input id="timer-seconds" type="number" min="0" max="59" value={timerInputSeconds} onChange={e => setTimerInputSeconds(Math.max(0, parseInt(e.target.value)) || 0)} className="h-8 text-sm rounded-md border-input focus:border-primary" disabled={isTimerRunning}/></div>
          </div>
          <div className="flex justify-center gap-2 mt-3">
            {!isTimerRunning || timeLeft === 0 ? (
              <Button onClick={startTimer} size="sm" className="rounded-md bg-primary hover:bg-primary/90 text-primary-foreground"><Play className="mr-1 h-4 w-4"/> Start</Button>
            ) : (
              <Button onClick={pauseTimer} size="sm" className="rounded-md bg-amber-500 hover:bg-amber-600 text-white"><Pause className="mr-1 h-4 w-4"/> Pause</Button>
            )}
            <Button onClick={resetTimer} variant="outline" size="sm" className="rounded-md border-primary text-primary hover:bg-primary/10" disabled={timeLeft === 0 && !isTimerRunning}><RotateCcw className="mr-1 h-4 w-4"/> Reset</Button>
          </div>
           <Button onClick={clearTimerInputsAndReset} variant="ghost" size="sm" className="w-full text-xs text-muted-foreground rounded-md mt-1 hover:bg-muted/70" disabled={isTimerRunning}>Clear & Reset Duration</Button>
        </TabsContent>

        <TabsContent value="reminders" className="p-4 space-y-3">
          <CardHeader className="p-0 mb-2"><CardTitle className="text-lg text-center text-primary">Reminders</CardTitle></CardHeader>
          <div className="space-y-2">
            <div><Label htmlFor="reminder-text" className="text-xs">Reminder Note</Label><Input id="reminder-text" value={newReminderText} onChange={e => setNewReminderText(e.target.value)} placeholder="e.g., Call patient Smith" className="h-8 text-sm rounded-md border-input focus:border-primary" /></div>
            <div className="flex gap-2">
              <div className="flex-grow"><Label htmlFor="reminder-date-picker" className="text-xs">Date</Label><DatePicker date={newReminderDateTime} setDate={setNewReminderDateTime} buttonId="reminder-date-picker" buttonClassName="h-8 text-sm rounded-md w-full border-input focus:border-primary" /></div>
              <div className="w-28"><Label htmlFor="reminder-time-input" className="text-xs">Time</Label><Input type="time" id="reminder-time-input" className="h-8 text-sm rounded-md w-full border-input focus:border-primary" value={newReminderDateTime ? format(newReminderDateTime, "HH:mm") : ""} onChange={(e) => {const newDate = newReminderDateTime ? new Date(newReminderDateTime) : new Date();const [hours, minutes] = e.target.value.split(':');newDate.setHours(parseInt(hours, 10));newDate.setMinutes(parseInt(minutes, 10));setNewReminderDateTime(newDate);}}/></div>
            </div>
            <Button onClick={handleAddReminder} size="sm" className="w-full rounded-md bg-primary hover:bg-primary/90 text-primary-foreground"><PlusCircle className="mr-1 h-4 w-4"/> Add Reminder</Button>
          </div>
          <ScrollArea className="h-32 border border-border/50 rounded-md p-2 bg-muted/30">
            {reminders.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">No reminders set.</p>}
            <ul className="space-y-1.5">
              {reminders.map(reminder => (
                <li key={reminder.id} className="text-xs p-1.5 bg-background rounded-md shadow-sm flex justify-between items-center border border-border/40">
                  <div><p className="font-medium text-foreground">{reminder.text}</p><p className="text-muted-foreground">{format(reminder.dateTime, "MMM d, yyyy 'at' HH:mm")}</p></div>
                  <Button variant="ghost" size="iconSm" onClick={() => deleteReminder(reminder.id)} className="text-destructive hover:bg-destructive/10 h-6 w-6 rounded-full"><Trash2 className="h-3.5 w-3.5" /></Button>
                </li>
              ))}
            </ul>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
