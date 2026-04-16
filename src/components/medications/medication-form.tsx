// src/components/medications/medication-form.tsx
"use client";

import { useState, type ChangeEvent } from 'react';
import { useForm, type SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Pill, CalendarClock, Repeat, ImagePlus, StickyNote, AlertTriangle } from 'lucide-react';
import type { Medication, MedicationFormType, MedicationRouteType, MedicationFrequencyType, DayOfWeek } from '@/types/medication';
import { medicationFrequencyTypes, daysOfWeek } from '@/types/medication';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import Image from 'next/image';
import { Alert, AlertDescription } from '@/components/ui/alert';

const medicationFormSchema = z.object({
  name: z.string().min(2, { message: "Medication name must be at least 2 characters." }).max(100),
  dosageStrength: z.string().min(1, { message: "Dosage/Strength is required." }).max(50),
  form: z.enum(["Tablet", "Capsule", "Liquid", "Inhaler", "Injection", "Cream", "Ointment", "Drops", "Patch", "Other"], { required_error: "Medication form is required." }),
  route: z.enum(["Oral", "Topical", "Inhaled", "Subcutaneous", "Intramuscular", "Intravenous", "Rectal", "Vaginal", "Otic", "Nasal", "Ophthalmic", "Other"], { required_error: "Route of administration is required." }),
  prescriptionDate: z.date({ required_error: "Prescription date is required." }),
  reason: z.string().max(200).optional(),
  prescribingDoctor: z.string().max(100).optional(),
  duration: z.string().max(50).optional(),
  quantityPerPrescription: z.coerce.number().int().positive().optional(),
  instructions: z.string().max(500).optional(),
  personalNotes: z.string().max(1000).optional(),
  photoUrl: z.string().url({ message: "Please enter a valid URL for the photo." }).optional().or(z.literal('')),

  // Schedule fields
  scheduleType: z.enum(medicationFrequencyTypes).optional(),
  scheduleTimes: z.array(z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:MM)")).optional(),
  scheduleIntervalHours: z.coerce.number().int().min(1).max(24).optional(),
  scheduleDaysOfWeek: z.array(z.enum(daysOfWeek)).optional(),
  scheduleSpecificDate: z.date().optional(),
  scheduleCustomInstructions: z.string().max(200).optional(),
});

type MedicationFormValues = z.infer<typeof medicationFormSchema>;

interface MedicationFormProps {
  onAddMedication: (medication: Medication) => void;
  existingMedication?: Medication | null;
}

const medicationFormsList: MedicationFormType[] = ["Tablet", "Capsule", "Liquid", "Inhaler", "Injection", "Cream", "Ointment", "Drops", "Patch", "Other"];
const medicationRoutesList: MedicationRouteType[] = ["Oral", "Topical", "Inhaled", "Subcutaneous", "Intramuscular", "Intravenous", "Rectal", "Vaginal", "Otic", "Nasal", "Ophthalmic", "Other"];


export function MedicationForm({ onAddMedication, existingMedication }: MedicationFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(existingMedication?.photoUrl || null);

  const form = useForm<MedicationFormValues>({
    resolver: zodResolver(medicationFormSchema),
    defaultValues: {
      name: existingMedication?.name || "",
      dosageStrength: existingMedication?.dosageStrength || "",
      form: existingMedication?.form || undefined,
      route: existingMedication?.route || undefined,
      prescriptionDate: existingMedication?.prescriptionDate || new Date(),
      reason: existingMedication?.reason || "",
      prescribingDoctor: existingMedication?.prescribingDoctor || "",
      duration: existingMedication?.duration || "",
      quantityPerPrescription: existingMedication?.quantityPerPrescription || undefined,
      instructions: existingMedication?.instructions || "",
      personalNotes: existingMedication?.personalNotes || "",
      photoUrl: existingMedication?.photoUrl || "",

      scheduleType: existingMedication?.schedule?.type || undefined,
      scheduleTimes: existingMedication?.schedule?.times || [],
      scheduleIntervalHours: existingMedication?.schedule?.intervalHours || undefined,
      scheduleDaysOfWeek: existingMedication?.schedule?.daysOfWeek || [],
      scheduleSpecificDate: existingMedication?.schedule?.specificDate || undefined,
      scheduleCustomInstructions: existingMedication?.schedule?.customInstructions || "",
    },
  });

  const watchScheduleType = form.watch("scheduleType");

  const handleImageFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({ title: "Invalid File", description: "Please select an image file.", variant: "destructive" });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUri = reader.result as string;
        setImagePreview(dataUri);
        form.setValue('photoUrl', dataUri);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit: SubmitHandler<MedicationFormValues> = async (data) => {
    setIsSubmitting(true);
    const newMedication: Medication = {
      id: existingMedication?.id || Date.now().toString(),
      name: data.name,
      dosageStrength: data.dosageStrength,
      form: data.form as MedicationFormType,
      route: data.route as MedicationRouteType,
      prescriptionDate: data.prescriptionDate,
      reason: data.reason,
      prescribingDoctor: data.prescribingDoctor,
      duration: data.duration,
      quantityPerPrescription: data.quantityPerPrescription,
      instructions: data.instructions,
      personalNotes: data.personalNotes,
      photoUrl: imagePreview || undefined,

      schedule: data.scheduleType ? {
        type: data.scheduleType,
        times: data.scheduleType === "Once daily" || data.scheduleType === "Twice daily" || data.scheduleType === "Three times daily" || data.scheduleType === "Four times daily" || data.scheduleType === "Specific days of week" ? data.scheduleTimes : undefined,
        intervalHours: data.scheduleType === "Every X hours" ? data.scheduleIntervalHours : undefined,
        daysOfWeek: data.scheduleType === "Specific days of week" ? data.scheduleDaysOfWeek : undefined,
        specificDate: data.scheduleType === "Specific date (one-time)" ? data.scheduleSpecificDate : undefined,
        customInstructions: data.scheduleType === "Other (custom)" ? data.scheduleCustomInstructions : data.scheduleCustomInstructions,
      } : undefined,
      log: existingMedication?.log || [],
      refillInfo: existingMedication?.refillInfo
    };

    onAddMedication(newMedication);

    toast({
      title: existingMedication ? "Medication Updated!" : "Medication Added!",
      description: `${data.name} has been ${existingMedication ? 'updated' : 'added to your list'}.`,
    });
    form.reset({ prescriptionDate: new Date(), form: undefined, route: undefined, scheduleType: undefined, scheduleTimes: [], scheduleDaysOfWeek: [], personalNotes: "", photoUrl: "" }); 
    setImagePreview(null);
    setIsSubmitting(false);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-4 border rounded-xl shadow-lg bg-card">
        <CardHeader className="p-0 mb-2">
          <CardTitle className="text-xl flex items-center gap-2 text-primary">
            <Pill className="h-6 w-6" />
            {existingMedication ? "Edit Medication" : "Add New Medication"}
          </CardTitle>
        </CardHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Medication Name</FormLabel><FormControl><Input placeholder="e.g., Amoxicillin" {...field} className="rounded-lg" /></FormControl><FormMessage /></FormItem>)} />
          <FormField control={form.control} name="dosageStrength" render={({ field }) => (<FormItem><FormLabel>Dosage & Strength</FormLabel><FormControl><Input placeholder="e.g., 500 mg, 10 units" {...field} className="rounded-lg" /></FormControl><FormMessage /></FormItem>)} />
          <FormField control={form.control} name="form" render={({ field }) => (<FormItem><FormLabel>Form</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger className="rounded-lg"><SelectValue placeholder="Select form" /></SelectTrigger></FormControl><SelectContent>{medicationFormsList.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
          <FormField control={form.control} name="route" render={({ field }) => (<FormItem><FormLabel>Route</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger className="rounded-lg"><SelectValue placeholder="Select route" /></SelectTrigger></FormControl><SelectContent>{medicationRoutesList.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
          <FormField control={form.control} name="prescriptionDate" render={({ field }) => (<FormItem className="flex flex-col"><FormLabel className="mb-1">Prescription Date</FormLabel><DatePicker date={field.value} setDate={field.onChange} buttonClassName="rounded-lg" /><FormMessage /></FormItem>)} />
          <FormField control={form.control} name="duration" render={({ field }) => (<FormItem><FormLabel>Duration (Optional)</FormLabel><FormControl><Input placeholder="e.g., 7 days, Ongoing" {...field} className="rounded-lg" /></FormControl><FormMessage /></FormItem>)} />
          <FormField control={form.control} name="reason" render={({ field }) => (<FormItem className="md:col-span-2"><FormLabel>Reason/Condition (Optional)</FormLabel><FormControl><Input placeholder="e.g., For bacterial infection" {...field} className="rounded-lg" /></FormControl><FormMessage /></FormItem>)} />
          <FormField control={form.control} name="prescribingDoctor" render={({ field }) => (<FormItem><FormLabel>Prescribing Doctor (Optional)</FormLabel><FormControl><Input placeholder="e.g., Dr. Smith" {...field} className="rounded-lg" /></FormControl><FormMessage /></FormItem>)} />
          <FormField control={form.control} name="quantityPerPrescription" render={({ field }) => (<FormItem><FormLabel>Quantity per Rx (Optional)</FormLabel><FormControl><Input type="number" placeholder="e.g., 30" {...field} className="rounded-lg" /></FormControl><FormMessage /></FormItem>)} />
        </div>

        <div className="space-y-2 pt-4 border-t">
            <h3 className="text-lg font-medium flex items-center gap-2"><ImagePlus className="h-5 w-5 text-primary" /> Medication Photo (Optional)</h3>
            <FormField
                control={form.control}
                name="photoUrl"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Upload Photo or Enter URL</FormLabel>
                    <FormControl>
                    <>
                        <Input
                            type="file"
                            accept="image/*"
                            onChange={handleImageFileChange}
                            className="rounded-lg text-sm file:mr-2 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary/20 file:text-primary hover:file:bg-primary/30"
                        />
                         <Input
                            placeholder="Or paste image URL here (e.g., https://...)"
                            onChange={(e) => {
                                field.onChange(e.target.value);
                                if(!e.target.value.startsWith('data:image')) {
                                    setImagePreview(e.target.value || null);
                                }
                            }}
                            value={field.value?.startsWith('data:image') ? '' : field.value || ''}
                            className="rounded-lg mt-1"
                        />
                    </>
                    </FormControl>
                    {imagePreview && (
                    <div className="mt-2 border rounded-lg p-2 inline-block bg-muted/50">
                        <Image src={imagePreview} alt="Medication preview" width={100} height={100} className="rounded object-contain" data-ai-hint="medication pill" />
                        <Button variant="link" size="xs" type="button" onClick={() => { setImagePreview(null); form.setValue('photoUrl', ''); }} className="text-destructive text-xs mt-1">Remove</Button>
                    </div>
                    )}
                    <FormMessage />
                </FormItem>
                )}
            />
        </div>

        <FormField control={form.control} name="instructions" render={({ field }) => (<FormItem className="md:col-span-2"><FormLabel>Instructions (Optional)</FormLabel><FormControl><Textarea placeholder="e.g., Take with food, avoid alcohol..." {...field} className="rounded-lg min-h-[80px]" /></FormControl><FormMessage /></FormItem>)} />
        
         <div className="space-y-2 pt-4 border-t">
            <h3 className="text-lg font-medium flex items-center gap-2"><StickyNote className="h-5 w-5 text-primary" /> Personal Notes (Optional)</h3>
            <FormField
                control={form.control}
                name="personalNotes"
                render={({ field }) => (
                <FormItem>
                    <FormLabel className="sr-only">Personal Notes</FormLabel>
                    <FormControl>
                    <Textarea
                        placeholder="e.g., Makes me drowsy, Remember to ask Dr about X..."
                        {...field}
                        className="rounded-lg min-h-[80px]"
                    />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
        </div>

        <div className="space-y-4 pt-4 border-t">
          <h3 className="text-lg font-medium flex items-center gap-2"><CalendarClock className="h-5 w-5 text-primary" /> Medication Schedule</h3>
          <FormField
            control={form.control}
            name="scheduleType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Frequency</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl><SelectTrigger className="rounded-lg"><SelectValue placeholder="Select frequency" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {medicationFrequencyTypes.map(freq => <SelectItem key={freq} value={freq}>{freq}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {(watchScheduleType === "Once daily" || watchScheduleType === "Twice daily" || watchScheduleType === "Three times daily" || watchScheduleType === "Four times daily" || watchScheduleType === "Specific days of week") && (
            <FormField
              control={form.control}
              name="scheduleTimes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Specific Times (HH:MM)</FormLabel>
                  <FormControl><Input type="time" {...field} onChange={e => field.onChange([e.target.value])} value={field.value?.[0] || ""} className="rounded-lg" /></FormControl>
                  <FormDescription>For multiple times, add more fields or use custom instructions. Current UI supports one time slot for simplicity.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {watchScheduleType === "Every X hours" && (
            <FormField
              control={form.control}
              name="scheduleIntervalHours"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Interval (Hours)</FormLabel>
                  <FormControl><Input type="number" min="1" max="24" placeholder="e.g., 6" {...field} className="rounded-lg" /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {watchScheduleType === "Specific days of week" && (
            <FormItem>
              <FormLabel>Specific Days</FormLabel>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-1">
                {daysOfWeek.map((day) => (
                  <FormField
                    key={day}
                    control={form.control}
                    name="scheduleDaysOfWeek"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(day)}
                            onCheckedChange={(checked) => {
                              return checked
                                ? field.onChange([...(field.value || []), day])
                                : field.onChange(field.value?.filter((value) => value !== day));
                            }}
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal">{day}</FormLabel>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
          {watchScheduleType === "Specific date (one-time)" && (
            <FormField control={form.control} name="scheduleSpecificDate" render={({ field }) => (<FormItem className="flex flex-col"><FormLabel className="mb-1">Specific Date</FormLabel><DatePicker date={field.value} setDate={field.onChange} buttonClassName="rounded-lg" /><FormMessage /></FormItem>)} />
          )}

          <FormField
            control={form.control}
            name="scheduleCustomInstructions"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Schedule Notes (Optional)</FormLabel>
                <FormControl><Textarea placeholder="e.g., Take 30 mins before breakfast, Alternate nostrils daily" {...field} className="rounded-lg min-h-[60px]" /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" className="w-full sm:w-auto rounded-lg py-3 text-base group" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : (existingMedication ? 'Update Medication' : 'Add Medication')}
          {!isSubmitting && <PlusCircle className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:rotate-90" />}
        </Button>
      </form>
    </Form>
  );
}
