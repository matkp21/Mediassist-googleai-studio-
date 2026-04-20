// src/components/patient-management/patient-tabs.tsx
"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useCallback } from "react";
import { Clock, Trash2, ListFilter, Activity, BellPlus, BriefcaseMedical, FilePlus, ClipboardEdit } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DischargeSummaryGenerator } from '@/components/pro/discharge-summary-generator';
import { ScrollArea } from "../ui/scroll-area";
import { PatientTimeline } from "./patient-timeline";
import { AddRoundNoteForm } from './AddRoundNoteForm';
import { AddReminderForm } from './AddReminderForm';

export interface RoundNote {
  id: string;
  date: Date;
  notes: string;
  patientName: string;
  admissionOpdNumber?: string; 
}

export interface Reminder {
  id: string;
  text: string;
  dateTime: Date;
  patientName: string;
}

export function PatientTabs() {
  const [roundNotes, setRoundNotes] = useState<RoundNote[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  
  const [isClient, setIsClient] = useState(false);
  const [showDischargeModal, setShowDischargeModal] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleAddRoundNote = useCallback((noteData: Omit<RoundNote, 'id'>) => {
    if (!isClient) return;
    const newNote: RoundNote = {
      id: Date.now().toString(),
      ...noteData
    };
    setRoundNotes(prev => [newNote, ...prev].sort((a, b) => b.date.getTime() - a.date.getTime()));
  }, [isClient]);

  const handleAddReminder = useCallback((reminderData: Omit<Reminder, 'id'>) => {
    if (!isClient) return;
    const newReminder: Reminder = {
      id: `rem-${Date.now().toString()}`,
      ...reminderData,
    };
    setReminders(prev => [newReminder, ...prev].sort((a,b) => a.dateTime.getTime() - b.dateTime.getTime()));
  }, [isClient]);

  const deleteRoundNote = (id: string) => { 
    setRoundNotes(prev => prev.filter(note => note.id !== id));
  };

  const deleteReminder = (id: string) => { 
    setReminders(prev => prev.filter(reminder => reminder.id !== id));
  };


  if (!isClient) {
    return <div className="flex justify-center items-center min-h-[200px]"><p>Loading patient management tools...</p></div>;
  }

  const tabTriggerClassName = cn(
    "flex-1 justify-center px-4 py-2 sm:px-6 sm:py-2.5 rounded-lg text-sm sm:text-base font-medium transition-all duration-300 ease-in-out transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-muted",
    "text-foreground/70 hover:bg-background/50 hover:text-foreground",
    "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm data-[state=active]:hover:bg-primary/90"
  );

  return (
    <Tabs defaultValue="rounds" className="w-full">
      <TabsList className="flex space-x-1 bg-muted p-1 rounded-xl shadow-md mb-6">
        <TabsTrigger value="rounds" className={tabTriggerClassName}>
          <Activity className="mr-2 h-5 w-5" />
          Rounds
        </TabsTrigger>
        <TabsTrigger value="timeline" className={tabTriggerClassName}>
          <ListFilter className="mr-2 h-5 w-5" />
          Timeline
        </TabsTrigger>
        <TabsTrigger value="reminders" className={tabTriggerClassName}>
          <BellPlus className="mr-2 h-5 w-5" />
          Reminders
        </TabsTrigger>
      </TabsList>

      <TabsContent value="rounds">
        <Card className="shadow-md rounded-xl">
          <CardHeader>
            <CardTitle>Patient Rounds</CardTitle>
            <CardDescription>Log notes from patient rounds.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <AddRoundNoteForm onAddNote={handleAddRoundNote} />
            
            <div className="mt-6 space-y-4 max-h-[400px] overflow-y-auto p-1">
              {roundNotes.length === 0 && (
                <div className="text-muted-foreground text-center min-h-[200px] flex flex-col items-center justify-center bg-muted/20 rounded-lg p-8">
                  <ClipboardEdit className="h-16 w-16 mb-4 text-primary/70" />
                  <p className="text-lg font-semibold">No Round Notes Logged</p>
                  <p className="text-sm">Add patient round details using the form above.</p>
                </div>
              )}
              {roundNotes.map(note => (
                <Card key={note.id} className="bg-card/80 backdrop-blur-sm shadow-sm rounded-lg">
                  <CardHeader className="flex flex-row justify-between items-start pb-2 pt-4 px-4">
                    <div>
                      <CardTitle className="text-md font-semibold text-foreground">{note.patientName}</CardTitle>
                      {note.admissionOpdNumber && (
                        <CardDescription className="text-xs text-muted-foreground">
                          <BriefcaseMedical className="inline-block h-3 w-3 mr-1 opacity-70"/> {note.admissionOpdNumber}
                        </CardDescription>
                      )}
                      <CardDescription className="text-xs text-muted-foreground">{format(note.date, "PPP, EEEE")}</CardDescription>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => deleteRoundNote(note.id)} className="text-destructive hover:bg-destructive/10 rounded-full" aria-label={`Delete round note for ${note.patientName} on ${format(note.date, "PPP")}`}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent className="px-4 pb-4">
                    <p className="text-sm text-foreground/90 whitespace-pre-wrap">{note.notes}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
          <CardFooter className="p-4 border-t">
            <Dialog open={showDischargeModal} onOpenChange={setShowDischargeModal}>
              <DialogTrigger asChild>
                <Button variant="default" className="w-full sm:w-auto rounded-lg group">
                  <FilePlus className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:scale-105" />
                  Generate Discharge Summary
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl max-h-[90vh] flex flex-col p-0">
                <DialogHeader className="p-6 pb-4 sticky top-0 bg-background border-b z-10">
                  <DialogTitle className="text-2xl flex items-center gap-2">
                    <FilePlus className="h-6 w-6 text-primary" /> Discharge Summary Generator
                  </DialogTitle>
                </DialogHeader>
                <ScrollArea className="flex-grow overflow-y-auto">
                  <div className="p-6 pt-0">
                    <DischargeSummaryGenerator />
                  </div>
                </ScrollArea>
              </DialogContent>
            </Dialog>
          </CardFooter>
        </Card>
      </TabsContent>

      <TabsContent value="timeline">
        <Card className="shadow-md rounded-xl">
          <CardHeader>
            <CardTitle>Patient Timeline</CardTitle>
            <CardDescription>View a chronological timeline of patient events and notes.</CardDescription>
          </CardHeader>
          <CardContent>
            <PatientTimeline roundNotes={roundNotes} reminders={reminders} />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="reminders">
        <Card className="shadow-md rounded-xl">
          <CardHeader>
            <CardTitle>Set Reminders</CardTitle>
            <CardDescription>Create reminders for patient care tasks.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <AddReminderForm onAddReminder={handleAddReminder} />

            <div className="mt-6 space-y-4 max-h-[400px] overflow-y-auto p-1">
              {reminders.length === 0 && <p className="text-muted-foreground text-center py-10">No reminders set yet. Add one above!</p>}
              {reminders.map(reminder => (
                <Card key={reminder.id} className="bg-accent/80 backdrop-blur-sm shadow-sm rounded-lg">
                   <CardHeader className="flex flex-row justify-between items-start pb-2 pt-4 px-4">
                    <div>
                      <CardTitle className="text-md font-semibold text-accent-foreground">{reminder.patientName}</CardTitle>
                      <CardDescription className="text-xs text-accent-foreground/80">
                        <Clock className="inline-block h-3 w-3 mr-1" />
                        {format(reminder.dateTime, "PPP, HH:mm ('"+format(reminder.dateTime, "EEEE")+")")}
                      </CardDescription>
                    </div>
                     <Button variant="ghost" size="icon" onClick={() => deleteReminder(reminder.id)} className="text-destructive-foreground hover:bg-destructive/20 rounded-full" aria-label={`Delete reminder for ${reminder.patientName} scheduled for ${format(reminder.dateTime, "PPP HH:mm")}`}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent className="px-4 pb-4">
                    <p className="text-sm text-accent-foreground">{reminder.text}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
