
"use client";

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, BellPlus } from 'lucide-react';
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { Reminder } from './patient-tabs';

interface AddReminderFormProps {
  onAddReminder: (reminder: Omit<Reminder, 'id'>) => void;
}

export function AddReminderForm({ onAddReminder }: AddReminderFormProps) {
  const [patientName, setPatientName] = useState('');
  const [reminderText, setReminderText] = useState('');
  const [reminderDateTime, setReminderDateTime] = useState<Date | undefined>(new Date());

  const handleSubmit = () => {
    if (!patientName || !reminderText || !reminderDateTime) {
      // Basic validation, could be improved with react-hook-form if needed
      alert("Please fill in all fields.");
      return;
    }
    onAddReminder({
      patientName,
      text: reminderText,
      dateTime: reminderDateTime,
    });
    // Reset form
    setPatientName('');
    setReminderText('');
    setReminderDateTime(new Date());
  };
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="reminder-patient-name">Patient Name</Label>
          <Input id="reminder-patient-name" placeholder="Enter patient name" value={patientName} onChange={e => setPatientName(e.target.value)} className="rounded-lg" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="reminder-datetime-trigger">Date & Time</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="reminder-datetime-trigger"
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal rounded-lg",
                  !reminderDateTime && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {reminderDateTime ? format(reminderDateTime, "PPP HH:mm") : <span>Pick date and time</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 rounded-xl">
              <Calendar
                mode="single"
                selected={reminderDateTime}
                onSelect={(date) => {
                  if(date && reminderDateTime) {
                      const newDate = new Date(date);
                      newDate.setHours(reminderDateTime.getHours());
                      newDate.setMinutes(reminderDateTime.getMinutes());
                      setReminderDateTime(newDate);
                  } else {
                      setReminderDateTime(date);
                  }
                }}
                initialFocus
                aria-label="Select reminder date"
              />
              <div className="p-2 border-t border-border/50">
                <Label htmlFor="reminder-time" className="text-sm">Time</Label>
                <Input type="time" id="reminder-time" className="rounded-md mt-1"
                    value={reminderDateTime ? format(reminderDateTime, "HH:mm") : ""}
                    onChange={e => {
                        if (reminderDateTime) {
                            const [hours, minutes] = e.target.value.split(':');
                            const newDate = new Date(reminderDateTime);
                            newDate.setHours(parseInt(hours, 10));
                            newDate.setMinutes(parseInt(minutes, 10));
                            setReminderDateTime(newDate);
                        } else {
                          const newDate = new Date();
                          const [hours, minutes] = e.target.value.split(':');
                          newDate.setHours(parseInt(hours, 10));
                          newDate.setMinutes(parseInt(minutes, 10));
                          newDate.setSeconds(0);
                          newDate.setMilliseconds(0);
                          setReminderDateTime(newDate);
                        }
                    }}
                    aria-label="Select reminder time"
                />
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="reminder-text">Reminder Details</Label>
        <Textarea id="reminder-text" placeholder="e.g., Administer medication, Check vitals" value={reminderText} onChange={e => setReminderText(e.target.value)} className="rounded-lg" />
      </div>
      <Button onClick={handleSubmit} className="w-full rounded-lg py-3 text-base group" aria-label="Add new reminder">
        <BellPlus className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:animate-pulse" /> Add Reminder
      </Button>
    </div>
  );
}
