// src/components/patient-management/patient-timeline.tsx
"use client";

import { useMemo } from 'react';
import { format } from 'date-fns';
import { Activity, BellRing, ListFilter } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';

interface RoundNote {
  id: string;
  date: Date;
  notes: string;
  patientName: string;
}

interface Reminder {
  id: string;
  text: string;
  dateTime: Date;
  patientName: string;
}

interface TimelineItem {
  id: string;
  type: 'roundNote' | 'reminder';
  date: Date;
  title: string;
  description: string;
}

interface PatientTimelineProps {
  roundNotes: RoundNote[];
  reminders: Reminder[];
}

export function PatientTimeline({ roundNotes, reminders }: PatientTimelineProps) {
  const timelineItems = useMemo(() => {
    const combined: TimelineItem[] = [];

    roundNotes.forEach(note => {
      combined.push({
        id: note.id,
        type: 'roundNote',
        date: note.date,
        title: `Round Note for ${note.patientName}`,
        description: note.notes,
      });
    });

    reminders.forEach(reminder => {
      combined.push({
        id: reminder.id,
        type: 'reminder',
        date: reminder.dateTime,
        title: `Reminder for ${reminder.patientName}`,
        description: reminder.text,
      });
    });

    return combined.sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [roundNotes, reminders]);

  if (timelineItems.length === 0) {
    return (
      <div className="text-muted-foreground text-center min-h-[200px] flex flex-col items-center justify-center bg-muted/50 rounded-lg p-8">
        <ListFilter className="h-16 w-16 mb-4 text-primary/70" />
        <p className="text-lg font-semibold">Timeline is Empty</p>
        <p className="text-sm">Add patient round notes or reminders to see them here.</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[60vh] p-1">
      <div className="relative pl-6">
        {/* Vertical line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border -translate-x-1/2" />
        
        <div className="space-y-8">
          {timelineItems.map((item, index) => (
            <div key={item.id} className="relative flex items-start">
              <div className="absolute left-6 top-1.5 -translate-x-1/2 h-3 w-3 rounded-full bg-primary ring-4 ring-background" />
              <div className="pl-8 w-full">
                <div className="flex justify-between items-center mb-1">
                  <h4 className="font-semibold text-md text-foreground flex items-center gap-2">
                    {item.type === 'roundNote' ? <Activity className="h-4 w-4 text-primary/80"/> : <BellRing className="h-4 w-4 text-primary/80" />}
                    {item.title}
                  </h4>
                  <p className="text-xs text-muted-foreground">{format(item.date, "PPP p")}</p>
                </div>
                <p className="text-sm text-foreground/80 p-3 bg-muted/40 rounded-md border border-border/30">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ScrollArea>
  );
}
