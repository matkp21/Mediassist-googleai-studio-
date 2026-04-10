
// src/app/medications/page.tsx
"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { MedicationForm } from '@/components/medications/medication-form';
import { MedicationListItem, type SampleDrugInfo, type DosAndDontsItem } from '@/components/medications/medication-list-item';
import { DrugInteractionChecker } from '@/components/medications/drug-interaction-checker';
import type { Medication, MedicationLogEntry, MedicationRefillInfo, MedicationSchedule } from '@/types/medication';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { PlusCircle, PillIcon, Info, Loader2, CalendarClock, AlertTriangle, BookOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle as AlertTitleComponent } from '@/components/ui/alert';
import { MedicationManagementAnimation } from '@/components/medications/medication-management-animation';
import { format, addHours, addDays, setHours, setMinutes, setSeconds, isFuture, getDay, nextDay, parse } from 'date-fns';
import { daysOfWeek } from '@/types/medication';
import { Card, CardHeader, CardTitle as CardTitleComponent, CardDescription as CardDescriptionComponent, CardContent } from '@/components/ui/card';


const getUpcomingDoses = (medication: Medication, count: number = 5): Date[] => {
    if (!medication.schedule) return [];

    const upcoming: Date[] = [];
    const now = new Date();
    const { type, times, intervalHours, daysOfWeek: scheduledDays, specificDate } = medication.schedule;

    if (type === 'Specific date (one-time)') {
        if (specificDate && isFuture(specificDate)) {
            upcoming.push(specificDate);
        }
        return upcoming;
    }

    if (type === 'As needed (PRN)' || type === 'Other (custom)') {
        return [];
    }

    if (type === 'Every X hours' && intervalHours) {
        let lastTaken = medication.log?.filter(l => l.status === 'taken').sort((a,b) => b.date.getTime() - a.date.getTime())[0]?.date;
        let startDate = lastTaken || medication.prescriptionDate || now;
        
        while (upcoming.length < count) {
            startDate = addHours(startDate, intervalHours);
            if (isFuture(startDate)) {
                upcoming.push(startDate);
            }
            if (upcoming.length >= 50) break; // Safety break
        }
        return upcoming.slice(0, count);
    }
    
    // For daily, twice daily, etc.
    if (times && times.length > 0) {
        let searchDate = new Date();
        // Start from yesterday to catch all of today's times
        searchDate.setDate(searchDate.getDate() - 1); 

        for (let i = 0; i < 14; i++) { // Search up to 2 weeks ahead
            const currentDayIndex = getDay(searchDate); // 0 for Sunday, 1 for Monday etc.

            const isScheduledDay = !scheduledDays || scheduledDays.length === 0 || scheduledDays.includes(daysOfWeek[currentDayIndex]);

            if (isScheduledDay) {
                for (const timeStr of times) {
                    const [hour, minute] = timeStr.split(':').map(Number);
                    const potentialDoseDate = setSeconds(setMinutes(setHours(new Date(searchDate), hour), minute), 0);

                    if (isFuture(potentialDoseDate) && !upcoming.some(d => d.getTime() === potentialDoseDate.getTime())) {
                        upcoming.push(potentialDoseDate);
                    }
                }
            }
            if (upcoming.length >= count) break;
            searchDate = addDays(searchDate, 1);
        }
    }

    return upcoming.sort((a, b) => a.getTime() - b.getTime()).slice(0, count);
};

// Sample drug info database for API simulation
const sampleApiDrugInfo: Record<string, SampleDrugInfo> = {
  "aspirin": {
    description: "Aspirin is a nonsteroidal anti-inflammatory drug (NSAID). It was the first of this class of drugs to be discovered. It is used to reduce pain, fever, and inflammation.",
    commonUses: ["Pain relief (headaches, muscle aches, arthritis)", "Fever reduction", "Prevention of blood clots (low dose)"],
    generalAdvice: ["Take with food or milk to reduce stomach upset.", "Do not give to children or teenagers with flu-like symptoms (risk of Reye's syndrome).", "Consult your doctor if you have bleeding disorders or are taking anticoagulants."],
    importantInfo: [
      { category: "How to Take", advice: ["Take with a full glass of water unless your doctor tells you otherwise.", "If for daily preventive use, take it exactly as prescribed by your doctor.", "Do not crush or chew enteric-coated tablets."] },
      { category: "Important Precautions", advice: ["Inform your doctor about any history of ulcers, kidney disease, or gout.", "Stop taking aspirin and tell your doctor if you have ringing in your ears or severe stomach pain.", "Avoid alcohol as it may increase the risk of stomach bleeding."] },
      { category: "Activities to Avoid/Use Caution With", advice: ["Use caution with activities requiring alertness if you experience dizziness (rare)."] },
      { category: "When to Call Your Doctor", advice: ["If you experience signs of an allergic reaction (rash, swelling, difficulty breathing).", "If you have easy bruising or bleeding, black or tarry stools, or persistent stomach upset."] },
      { category: "General Good Practices", advice: ["Do not share your medication with others.", "Do not use expired medication."] }
    ]
  },
  "metformin": {
    description: "Metformin is an oral medication used to treat type 2 diabetes. It helps control blood sugar levels by reducing glucose production by the liver and improving insulin sensitivity.",
    commonUses: ["Type 2 diabetes mellitus"],
    generalAdvice: ["Take with meals to reduce gastrointestinal side effects.", "Monitor kidney function regularly.", "Be aware of symptoms of lactic acidosis (rare but serious)."],
    importantInfo: [
      { category: "How to Take", advice: ["Swallow the tablet whole with a main meal.", "Do not crush or chew extended-release tablets.", "Stay well hydrated by drinking plenty of fluids."] },
      { category: "Important Precautions", advice: ["Temporarily stop taking metformin before any surgery or medical procedure requiring contrast dye (iodinated contrast agents).", "Inform your doctor if you have kidney, liver, or heart problems.", "Avoid excessive alcohol consumption as it increases the risk of lactic acidosis."] },
      { category: "When to Call Your Doctor", advice: ["If you develop symptoms of lactic acidosis like unusual muscle pain, trouble breathing, severe weakness, or unexplained vomiting.", "If you experience symptoms of hypoglycemia (low blood sugar) if taking other diabetes medications."] },
      { category: "General Good Practices", advice: ["Follow the diet and exercise plan recommended by your doctor.", "Regularly monitor your blood sugar levels as instructed."] }
    ]
  },
  "amoxicillin": {
    description: "Amoxicillin is an antibiotic in the penicillin group of drugs. It fights bacteria in your body.",
    commonUses: ["Bacterial infections (e.g., ear infections, pneumonia, bronchitis, urinary tract infections, skin infections)."],
    generalAdvice: ["Take the full course of medication as prescribed, even if you feel better.", "Inform your doctor of any allergies to penicillin or other antibiotics.", "May decrease the effectiveness of oral contraceptives; consider backup contraception."],
    importantInfo: [
      { category: "How to Take", advice: ["May be taken with or without food.", "If liquid form, shake well before measuring a dose with the provided measuring spoon/syringe.", "Complete the full prescribed course."] },
      { category: "Important Precautions", advice: ["Inform your doctor if you have a history of mononucleosis, kidney disease, or severe allergies.", "This medication may cause diarrhea; contact your doctor if it's severe, watery, or contains blood."] },
      { category: "When to Call Your Doctor", advice: ["If you experience signs of an allergic reaction (rash, hives, swelling, difficulty breathing, wheezing).", "If your symptoms do not improve within a few days, or if they get worse."] },
      { category: "General Good Practices", advice: ["Do not share your medication with others.", "This medication treats only bacterial infections. It will not work for viral infections (e.g., common cold, flu)."] }
    ]
  }
};


export default function MedicationManagementPage() {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null);
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  const [showAnimation, setShowAnimation] = useState(true);

  const [showRemindersDialog, setShowRemindersDialog] = useState(false);
  const [selectedMedicationForReminders, setSelectedMedicationForReminders] = useState<Medication | null>(null);

  const [showDrugInfoDialog, setShowDrugInfoDialog] = useState(false);
  const [selectedMedicationForInfo, setSelectedMedicationForInfo] = useState<Medication | null>(null);
  const [drugInfoLoading, setDrugInfoLoading] = useState(false);
  const [fetchedDrugInfo, setFetchedDrugInfo] = useState<SampleDrugInfo | null>(null);

  const upcomingDoses = useMemo(() => {
    if (selectedMedicationForReminders) {
      return getUpcomingDoses(selectedMedicationForReminders);
    }
    return [];
  }, [selectedMedicationForReminders]);

  useEffect(() => {
    setIsClient(true);
    const storedMeds = localStorage.getItem('medications');
    if (storedMeds) {
      try {
        const parsedMeds = JSON.parse(storedMeds) as Medication[];
        const medsWithDates = parsedMeds.map(med => ({
          ...med,
          prescriptionDate: new Date(med.prescriptionDate),
          schedule: med.schedule ? {
            ...med.schedule,
            specificDate: med.schedule.specificDate ? new Date(med.schedule.specificDate) : undefined,
          } : undefined,
          log: med.log?.map(l => ({
            ...l,
            date: new Date(l.date)
          } as MedicationLogEntry)) || [],
          refillInfo: med.refillInfo ? {
            ...med.refillInfo,
            lastRefillDate: med.refillInfo.lastRefillDate ? new Date(med.refillInfo.lastRefillDate) : undefined,
          } as MedicationRefillInfo : undefined,
          photoUrl: med.photoUrl || "",
          personalNotes: med.personalNotes || "",
        }));
        setMedications(medsWithDates);
      } catch (e) {
        console.error("Failed to parse medications from localStorage", e);
        localStorage.removeItem('medications');
      }
    }
  }, []);

  useEffect(() => {
    if (isClient && (medications.length > 0 || localStorage.getItem('medications'))) {
      localStorage.setItem('medications', JSON.stringify(medications));
    }
  }, [medications, isClient]);

  const handleAddOrUpdateMedication = useCallback((medication: Medication) => {
    setMedications(prevMeds => {
      const existingIndex = prevMeds.findIndex(m => m.id === medication.id);
      if (existingIndex > -1) {
        const updatedMeds = [...prevMeds];
        updatedMeds[existingIndex] = {
          ...medication,
          log: updatedMeds[existingIndex].log || [], 
          refillInfo: medication.refillInfo || updatedMeds[existingIndex].refillInfo, 
          photoUrl: medication.photoUrl,
          personalNotes: medication.personalNotes,
        };
        return updatedMeds;
      } else {
        return [{ ...medication, log: medication.log || [], photoUrl: medication.photoUrl, personalNotes: medication.personalNotes }, ...prevMeds];
      }
    });
    setShowFormModal(false);
    setEditingMedication(null);
  }, []);

  const handleEditMedication = useCallback((medication: Medication) => {
    setEditingMedication(medication);
    setShowFormModal(true);
  }, []);

  const handleDeleteMedication = useCallback((id: string) => {
    setMedications(prevMeds => prevMeds.filter(m => m.id !== id));
    toast({ title: "Medication Removed", description: "The medication has been deleted from your list." });
  }, [toast]);

  const handleLogDose = useCallback((medicationId: string, status: MedicationLogEntry['status']) => {
    setMedications(prevMeds =>
      prevMeds.map(med => {
        if (med.id === medicationId) {
          const newLogEntry: MedicationLogEntry = { date: new Date(), status };
          return {
            ...med,
            log: [...(med.log || []), newLogEntry], 
          };
        }
        return med;
      })
    );
    toast({ title: `Dose Logged`, description: `Marked as ${status} for today.` });
  }, [toast]);

  const openAddMedicationModal = useCallback(() => {
    setEditingMedication(null);
    setShowFormModal(true);
  }, [])

  const handleViewReminders = useCallback((medication: Medication) => {
    setSelectedMedicationForReminders(medication);
    setShowRemindersDialog(true);
  }, []);

  const handleViewDrugInfo = useCallback((medication: Medication) => {
    setSelectedMedicationForInfo(medication);
    setDrugInfoLoading(true);
    setFetchedDrugInfo(null);
    setShowDrugInfoDialog(true);

    // Simulate API call
    setTimeout(() => {
      const drugKey = medication.name.toLowerCase().split(" ")[0]; // Simple key for demo
      const info = sampleApiDrugInfo[drugKey] || null;
      setFetchedDrugInfo(info);
      setDrugInfoLoading(false);
    }, 1500);
  }, []);


  if (!isClient) {
    return (
      <PageWrapper title="Loading Medications..." className="flex-1 flex flex-col h-full p-0 sm:p-0">
        <div className="flex-1 flex flex-col h-full items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </PageWrapper>
    );
  }

  if (showAnimation) {
    return <MedicationManagementAnimation onAnimationComplete={() => setShowAnimation(false)} />;
  }

  return (
    <PageWrapper title="Medication Management" className="pb-16">
      <div className="flex justify-between items-center mb-6">
        <p className="text-muted-foreground">Log and manage your prescribed medications, schedules, and adherence.</p>
        <Button onClick={openAddMedicationModal} className="rounded-lg group">
          <PlusCircle className="mr-2 h-5 w-5 transition-transform duration-300 group-hover:rotate-90" /> Add Medication
        </Button>
      </div>

      <Alert variant="default" className="mb-6 border-amber-500/50 bg-amber-500/10">
        <Info className="h-5 w-5 text-amber-600" />
        <AlertTitleComponent className="font-semibold text-amber-700 dark:text-amber-500">Important Note</AlertTitleComponent>
        <AlertDescription className="text-amber-600/90 dark:text-amber-500/90 text-xs">
          This tool is for personal medication tracking and adherence support. It is not a substitute for professional medical advice. Always consult your doctor or pharmacist regarding your medications.
        </AlertDescription>
      </Alert>

      {medications.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground bg-muted/20 rounded-xl shadow-inner">
          <PillIcon className="mx-auto h-16 w-16 mb-4 opacity-50" />
          <p className="text-lg font-medium">No medications logged yet.</p>
          <p className="text-sm">Click "Add Medication" to get started.</p>
        </div>
      ) : (
        <ScrollArea className="h-[calc(100vh-var(--header-height,4rem)-280px)] pr-3 -mr-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {medications.map(med => (
              <MedicationListItem
                key={med.id}
                medication={med}
                onEdit={handleEditMedication}
                onDelete={handleDeleteMedication}
                onLogDose={handleLogDose}
                onViewReminders={handleViewReminders}
                onViewDrugInfo={handleViewDrugInfo}
              />
            ))}
          </div>
        </ScrollArea>
      )}

      <Dialog open={showFormModal} onOpenChange={(open) => {
        setShowFormModal(open);
        if (!open) setEditingMedication(null);
      }}>
        <DialogContent className="sm:max-w-2xl p-0">
          <ScrollArea className="max-h-[80vh]">
            <div className="p-6">
              <MedicationForm
                onAddMedication={handleAddOrUpdateMedication}
                existingMedication={editingMedication}
              />
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <Dialog open={showRemindersDialog} onOpenChange={setShowRemindersDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarClock className="h-5 w-5 text-primary" />
              Upcoming Doses for {selectedMedicationForReminders?.name}
            </DialogTitle>
            <DialogDescription>
              This shows conceptual upcoming scheduled times. Actual reminders need to be set up with your device.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-60 mt-4">
            {upcomingDoses.length > 0 ? (
              <ul className="space-y-2 text-sm">
                {upcomingDoses.map((doseDate, index) => (
                  <li key={index} className="p-2 bg-muted/50 rounded-md border">
                    {format(doseDate, "PPPp")} ({format(doseDate, "EEEE")})
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No upcoming scheduled doses calculable for this medication, or schedule type not yet supported for conceptual view.
                 (e.g. "As Needed" or complex "Other" schedules).
              </p>
            )}
          </ScrollArea>
          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button type="button" variant="outline" className="rounded-md">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDrugInfoDialog} onOpenChange={setShowDrugInfoDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Drug Information: {selectedMedicationForInfo?.name}
            </DialogTitle>
            <DialogDescription>
              General information about the medication. This is for illustrative purposes only.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] mt-4 pr-2">
            {drugInfoLoading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-2 text-muted-foreground">Fetching information...</p>
              </div>
            ) : fetchedDrugInfo ? (
              <div className="space-y-4 text-sm">
                <div>
                  <h4 className="font-semibold text-foreground">Description:</h4>
                  <p className="text-muted-foreground whitespace-pre-wrap">{fetchedDrugInfo.description}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Common Uses:</h4>
                  <ul className="list-disc list-inside ml-4 text-muted-foreground">
                    {fetchedDrugInfo.commonUses.map((use, i) => <li key={i}>{use}</li>)}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">General Advice:</h4>
                  <ul className="list-disc list-inside ml-4 text-muted-foreground">
                     {fetchedDrugInfo.generalAdvice.map((advice, i) => <li key={i}>{advice}</li>)}
                  </ul>
                </div>

                {fetchedDrugInfo.importantInfo && fetchedDrugInfo.importantInfo.length > 0 && (
                  <div className="mt-3 pt-3 border-t">
                    <h3 className="font-semibold text-foreground text-md mb-2">Important Information (Do's & Don'ts):</h3>
                    <div className="space-y-3">
                      {fetchedDrugInfo.importantInfo.map((infoCategory, index) => (
                        <div key={index}>
                          <h4 className="font-medium text-foreground/90">{infoCategory.category}:</h4>
                          <ul className="list-disc list-inside ml-4 text-muted-foreground text-xs space-y-0.5">
                            {infoCategory.advice.map((point, pIndex) => <li key={pIndex}>{point}</li>)}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                 <Alert variant="default" className="mt-4 border-amber-500/50 bg-amber-500/10">
                    <Info className="h-5 w-5 text-amber-600" />
                    <AlertTitleComponent className="font-semibold text-amber-700 dark:text-amber-500">Disclaimer</AlertTitleComponent>
                    <AlertDescription className="text-amber-600/90 dark:text-amber-500/90 text-xs">
                        The information provided is for general knowledge and illustrative purposes only, based on a sample database. It does not substitute professional medical advice. Always consult your doctor or pharmacist for any health concerns or before making decisions about your treatment.
                    </AlertDescription>
                </Alert>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-10">
                No detailed information found in our sample database for "{selectedMedicationForInfo?.name}".
              </p>
            )}
          </ScrollArea>
          <DialogFooter className="mt-6">
            <DialogClose asChild>
              <Button type="button" variant="outline" className="rounded-md">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>


      <div className="mt-12">
        <Card className="shadow-lg rounded-xl border-border/50">
            <CardHeader>
                <CardTitleComponent className="text-xl flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                    Drug Interaction Checker (Basic)
                </CardTitleComponent>
                <CardDescriptionComponent>
                    Check for potential interactions between two drugs. This tool provides basic information and is not a substitute for professional advice.
                </CardDescriptionComponent>
            </CardHeader>
            <CardContent>
                <DrugInteractionChecker />
            </CardContent>
        </Card>
      </div>

    </PageWrapper>
  );
}
