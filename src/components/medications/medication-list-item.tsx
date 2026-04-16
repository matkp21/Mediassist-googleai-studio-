
// src/components/medications/medication-list-item.tsx
"use client";

import React from 'react';
import type { Medication, MedicationLogEntry } from '@/types/medication';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pill, CalendarDays, Edit3, Trash2, Clock, AlertTriangle, Repeat, CheckCircle, XCircle, PackageSearch, ImageOff, StickyNote, CalendarClock, MinusCircle, BookOpen } from 'lucide-react';
import { format, isToday } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import Image from 'next/image';

// Updated SampleDrugInfo structure
export interface DosAndDontsItem {
  category: string; // e.g., "How to Take", "Precautions", "When to Call Your Doctor"
  advice: string[]; // Array of advice points for that category
}

export interface SampleDrugInfo {
  description: string;
  commonUses: string[];
  generalAdvice: string[];
  importantInfo?: DosAndDontsItem[]; // New field for structured "Do's and Don'ts"
}


interface MedicationListItemProps {
  medication: Medication;
  onEdit: (medication: Medication) => void;
  onDelete: (id: string) => void;
  onLogDose: (medicationId: string, status: MedicationLogEntry['status']) => void;
  onViewReminders: (medication: Medication) => void;
  onViewDrugInfo: (medication: Medication) => void;
}

function formatSchedule(schedule?: Medication['schedule']): string {
  if (!schedule) return "Not specified";

  let scheduleString = schedule.type;

  if (schedule.times && schedule.times.length > 0 && (schedule.type === "Once daily" || schedule.type === "Twice daily" || schedule.type === "Three times daily" || schedule.type === "Four times daily" || schedule.type === "Specific days of week")) {
    scheduleString += ` at ${schedule.times.join(', ')}`;
  }
  if (schedule.intervalHours && schedule.type === "Every X hours") {
    scheduleString += ` (every ${schedule.intervalHours} hrs)`;
  }
  if (schedule.daysOfWeek && schedule.daysOfWeek.length > 0 && schedule.type === "Specific days of week") {
    scheduleString += ` on ${schedule.daysOfWeek.join(', ')}`;
  }
  if (schedule.specificDate && schedule.type === "Specific date (one-time)") {
    scheduleString += ` on ${format(new Date(schedule.specificDate), "PPP")}`;
  }
  if (schedule.customInstructions) {
    scheduleString += ` (${schedule.customInstructions})`;
  }
  return scheduleString;
}

const MedicationListItemComponent: React.FC<MedicationListItemProps> = ({ medication, onEdit, onDelete, onLogDose, onViewReminders, onViewDrugInfo }) => {
  const lastThreeLogs = medication.log?.slice(-3).reverse() || [];

  return (
    <Card className="shadow-md rounded-xl border-border/50 overflow-hidden bg-card/90 backdrop-blur-sm flex flex-col">
      <CardHeader className="p-4 border-b bg-muted/30">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg flex items-center gap-2 text-primary">
              <Pill className="h-5 w-5" />
              {medication.name}
            </CardTitle>
            <CardDescription className="text-xs">
              {medication.dosageStrength} - {medication.form} ({medication.route})
            </CardDescription>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="iconSm" onClick={() => onEdit(medication)} aria-label={`Edit ${medication.name}`} className="text-muted-foreground hover:text-primary">
              <Edit3 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="iconSm" onClick={() => onDelete(medication.id)} aria-label={`Delete ${medication.name}`} className="text-destructive/70 hover:text-destructive">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 text-sm space-y-3 flex-grow">
        {medication.photoUrl && (
          <div className="mb-2 border rounded-lg overflow-hidden aspect-video relative bg-muted/40">
            <Image src={medication.photoUrl} alt={`${medication.name} photo`} fill className="object-contain" data-ai-hint="medication pill bottle" />
          </div>
        )}
        {!medication.photoUrl && (
            <div className="mb-2 border border-dashed rounded-lg aspect-video relative bg-muted/20 flex flex-col items-center justify-center text-muted-foreground">
                <ImageOff className="h-8 w-8 opacity-50" />
                <p className="text-xs mt-1">No photo</p>
            </div>
        )}

        {medication.reason && <p><span className="font-semibold">Reason:</span> {medication.reason}</p>}
        <p><span className="font-semibold">Prescribed:</span> {format(new Date(medication.prescriptionDate), "PPP")} {medication.prescribingDoctor && `by ${medication.prescribingDoctor}`}</p>}
        {medication.duration && <p><span className="font-semibold">Duration:</span> {medication.duration}</p>}

        <div className="mt-2 pt-2 border-t border-dashed">
          <p className="font-semibold text-xs text-muted-foreground mb-1 flex items-center gap-1"><Repeat className="h-3.5 w-3.5" />Schedule:</p>
          <Badge variant="secondary" className="text-xs font-normal whitespace-normal text-left py-1 h-auto leading-snug">
            {formatSchedule(medication.schedule)}
          </Badge>
        </div>

        {medication.instructions && <p className="mt-2 pt-2 border-t border-dashed"><span className="font-semibold">Instructions:</span> {medication.instructions}</p>}
        
        {medication.personalNotes && (
            <div className="mt-2 pt-2 border-t border-dashed">
                <p className="font-semibold text-xs text-muted-foreground mb-1 flex items-center gap-1"><StickyNote className="h-3.5 w-3.5"/>Personal Notes:</p>
                <p className="text-xs bg-amber-500/10 p-2 rounded-md text-amber-700 dark:text-amber-400 whitespace-pre-wrap">{medication.personalNotes}</p>
            </div>
        )}

        <div className="mt-2 pt-2 border-t border-dashed">
          <p className="font-semibold text-xs text-muted-foreground mb-1">Log Today's Dose:</p>
          <div className="flex gap-1.5 mt-1.5">
            <Button size="xs" variant="outline" onClick={() => onLogDose(medication.id, 'taken')} className="text-green-600 border-green-500 hover:bg-green-500/10">
              <CheckCircle className="mr-1 h-3.5 w-3.5" /> Taken
            </Button>
            <Button size="xs" variant="outline" onClick={() => onLogDose(medication.id, 'skipped')} className="text-red-600 border-red-500 hover:bg-red-500/10">
              <XCircle className="mr-1 h-3.5 w-3.5" /> Skipped
            </Button>
            <Button size="xs" variant="outline" onClick={() => onLogDose(medication.id, 'snoozed')} className="text-amber-600 border-amber-500 hover:bg-amber-500/10">
              <Clock className="mr-1 h-3.5 w-3.5" /> Snooze
            </Button>
          </div>
        </div>
        {lastThreeLogs.length > 0 && (
          <div className="mt-2 pt-2 border-t border-dashed">
            <p className="font-semibold text-xs text-muted-foreground mb-1">Recent Log:</p>
            <ul className="space-y-1 text-xs">
              {lastThreeLogs.map((log, index) => (
                <li key={index} className="flex items-center gap-1.5 p-1 bg-muted/40 rounded-sm">
                  {log.status === 'taken' && <CheckCircle className="h-3.5 w-3.5 text-green-600" />}
                  {log.status === 'skipped' && <XCircle className="h-3.5 w-3.5 text-red-600" />}
                  {log.status === 'snoozed' && <Clock className="h-3.5 w-3.5 text-amber-600" />}
                  <span className="capitalize">{log.status}</span>
                  <span className="text-muted-foreground/80">- {format(new Date(log.date), "MMM d, HH:mm")}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {medication.refillInfo && (
          <div className="mt-2 pt-2 border-t border-dashed">
            <p className="font-semibold text-xs text-muted-foreground mb-1 flex items-center gap-1"><PackageSearch className="h-3.5 w-3.5" />Refill Info:</p>
            <div className="text-xs space-y-0.5">
              {medication.refillInfo.lastRefillDate && <p>Last Refilled: {format(new Date(medication.refillInfo.lastRefillDate), "PPP")}</p>}
              {medication.refillInfo.quantityDispensed && <p>Quantity: {medication.refillInfo.quantityDispensed}</p>}
              {medication.refillInfo.pharmacy && <p>Pharmacy: {medication.refillInfo.pharmacy}</p>}
              {medication.refillInfo.daysSupply && medication.refillInfo.lastRefillDate && (
                <p className="font-medium text-blue-600 dark:text-blue-400">
                  Estimated Next Refill: {format(new Date(new Date(medication.refillInfo.lastRefillDate).setDate(new Date(medication.refillInfo.lastRefillDate).getDate() + medication.refillInfo.daysSupply)), "PPP")}
                </p>
              )}
            </div>
          </div>
        )}

      </CardContent>
      <CardFooter className="p-3 bg-muted/20 border-t flex flex-col sm:flex-row justify-between items-center mt-auto gap-2">
        <Button variant="outline" size="sm" onClick={() => onViewReminders(medication)} className="text-xs rounded-md w-full sm:w-auto">
          <CalendarClock className="mr-1.5 h-3.5 w-3.5" /> View Upcoming Doses
        </Button>
        <Button variant="outline" size="sm" onClick={() => onViewDrugInfo(medication)} className="text-xs rounded-md w-full sm:w-auto">
          <BookOpen className="mr-1.5 h-3.5 w-3.5" /> View Drug Info
        </Button>
      </CardFooter>
    </Card>
  );
}

MedicationListItemComponent.displayName = 'MedicationListItem';
export const MedicationListItem = React.memo(MedicationListItemComponent);
