// src/components/homepage/hero-widgets.tsx
"use client";

import type { ReactNode } from 'react';
import React, { useState, useEffect, useCallback } from 'react';
import { Button, buttonVariants } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from "@/lib/utils";
import { format, isSameDay } from "date-fns";
import { CalendarDays, Clock, Dot } from "lucide-react";
import { ClockWidget } from './clock-widget';
import { useToast } from '@/hooks/use-toast';

export interface HeroTask {
  id: string;
  date: Date;
  title: string;
  description: string;
}

interface HeroWidgetsProps {
  tasks: HeroTask[];
}

const CurrentDateDisplay: React.FC = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    useEffect(() => {
        const timerId = setInterval(() => setCurrentDate(new Date()), 60000); // Update every minute
        return () => clearInterval(timerId);
    }, []);
    return <span className="font-semibold text-foreground">{format(currentDate, "E, MMM d")}</span>;
};

const CurrentTimeDisplay: React.FC = () => {
    const [currentTime, setCurrentTime] = useState(new Date());
    useEffect(() => {
        const timerId = setInterval(() => setCurrentTime(new Date()), 1000); // Update every second
        return () => clearInterval(timerId);
    }, []);
    return <span className="font-semibold text-foreground">{format(currentTime, "p")}</span>;
};

export const HeroWidgets: React.FC<HeroWidgetsProps> = ({ tasks }) => {
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date | undefined>(new Date());
  const [isCalendarPopoverOpen, setIsCalendarPopoverOpen] = useState(false);
  const [isClockWidgetPopoverOpen, setIsClockWidgetPopoverOpen] = useState(false);
  
  const tasksForSelectedDate = tasks.filter(task => selectedCalendarDate && isSameDay(task.date, selectedCalendarDate));

  return (
    <div
      className={cn(
        "relative mt-4 flex w-full max-w-md mx-auto items-center justify-between gap-2 md:gap-4 py-2 px-3 rounded-xl shadow-lg",
        "bg-card border border-border/60"
      )}
      aria-label="Date and Time Information Panel"
    >
      <Popover open={isCalendarPopoverOpen} onOpenChange={setIsCalendarPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            className="flex-1 justify-center text-left font-normal text-xs sm:text-sm rounded-md h-auto p-2 text-foreground hover:bg-accent/10 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background"
            aria-label="Open calendar and tasks"
          >
            <CalendarDays className="mr-1.5 h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            <CurrentDateDisplay />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 rounded-xl shadow-xl border border-border/50 bg-card" align="start">
          <Calendar
            mode="single"
            selected={selectedCalendarDate}
            onSelect={setSelectedCalendarDate}
            initialFocus
            modifiers={{ taskDay: tasks.map(task => task.date) }}
            modifiersStyles={{ taskDay: { position: 'relative' } }}
            classNames={{
              caption_label: "text-sm font-semibold text-foreground",
              nav_button: cn(buttonVariants({ variant: "ghost" }), "h-7 w-7 bg-transparent p-0 opacity-70 hover:opacity-100"),
              day_selected: "bg-primary text-primary-foreground hover:bg-primary/90 focus:bg-primary",
              day_today: "ring-1 ring-primary text-primary font-semibold",
              cell: "h-9 w-9 text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
            }}
            components={{
              DayContent: (props) => {
                const isTaskDay = tasks.some(task => isSameDay(task.date, props.date));
                return (
                  <div className="relative flex items-center justify-center h-full w-full">
                    {props.date.getDate()}
                    {isTaskDay && <Dot className="absolute bottom-0 left-1/2 transform -translate-x-1/2 h-4 w-4 text-primary fill-primary" />}
                  </div>
                );
              }
            }}
          />
          {selectedCalendarDate && tasksForSelectedDate.length > 0 && (
            <div className="p-4 border-t border-border/50">
              <h4 className="text-sm font-semibold mb-2 text-primary">Tasks for {format(selectedCalendarDate, "PPP")}:</h4>
              <ScrollArea className="h-[100px]">
                <ul className="space-y-1.5 text-xs">{tasksForSelectedDate.map(task => (
                  <li key={task.id} className="p-1.5 bg-muted/50 rounded-md border">
                    <p className="font-medium text-secondary-foreground">{task.title}</p>
                    <p className="text-muted-foreground">{task.description}</p>
                  </li>))}
                </ul>
              </ScrollArea>
            </div>
          )}
           <div className="p-2 border-t border-border/50 text-center">
               <Button variant="link" size="sm" className="text-xs text-primary hover:text-primary/80">View Full Schedule</Button>
           </div>
        </PopoverContent>
      </Popover>

      <div className="h-6 w-px bg-border/70" />

      <Popover open={isClockWidgetPopoverOpen} onOpenChange={setIsClockWidgetPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            className="flex-1 justify-center text-left font-normal text-xs sm:text-sm rounded-md h-auto p-2 text-foreground hover:bg-accent/10 focus-visible:ring-2"
            aria-label="Open clock, timer, and reminders widget"
          >
            <CurrentTimeDisplay />
            <Clock className="ml-1.5 h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0 rounded-xl shadow-xl border bg-card" align="end">
          <ClockWidget onClose={() => setIsClockWidgetPopoverOpen(false)} />
        </PopoverContent>
      </Popover>
    </div>
  );
};
