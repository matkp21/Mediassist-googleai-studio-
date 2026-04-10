
"use client";

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, PlusCircle } from 'lucide-react';
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { RoundNote } from './patient-tabs';

interface AddRoundNoteFormProps {
  onAddNote: (note: Omit<RoundNote, 'id'>) => void;
}

export function AddRoundNoteForm({ onAddNote }: AddRoundNoteFormProps) {
  const [patientName, setPatientName] = useState('');
  const [admissionOpdNumber, setAdmissionOpdNumber] = useState('');
  const [noteText, setNoteText] = useState('');
  const [date, setDate] = useState<Date | undefined>(new Date());

  const handleSubmit = () => {
    if (!patientName || !noteText || !date) {
      // Basic validation, could be improved with react-hook-form if needed
      alert("Please fill in all fields.");
      return;
    }
    onAddNote({
      patientName,
      admissionOpdNumber,
      date,
      notes: noteText,
    });
    // Reset form
    setPatientName('');
    setAdmissionOpdNumber('');
    setNoteText('');
    setDate(new Date());
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="round-patient-name">Patient Name</Label>
          <Input id="round-patient-name" placeholder="Enter patient name" value={patientName} onChange={e => setPatientName(e.target.value)} className="rounded-lg"/>
        </div>
        <div className="space-y-2">
          <Label htmlFor="round-admission-opd">Admission/OPD No.</Label>
          <Input id="round-admission-opd" placeholder="e.g., A123 / OPD456" value={admissionOpdNumber} onChange={e => setAdmissionOpdNumber(e.target.value)} className="rounded-lg"/>
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="round-date">Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="round-date"
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal rounded-lg",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 rounded-xl">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
                aria-label="Select round date"
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="round-notes">Notes</Label>
        <Textarea id="round-notes" placeholder="Enter round notes..." value={noteText} onChange={e => setNoteText(e.target.value)} className="min-h-[100px] rounded-lg" />
      </div>
      <Button onClick={handleSubmit} className="w-full rounded-lg py-3 text-base group" aria-label="Add new round note">
        <PlusCircle className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:rotate-90" /> Add Round Note
      </Button>
    </div>
  );
}
