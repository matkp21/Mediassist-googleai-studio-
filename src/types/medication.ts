// src/types/medication.ts

export type MedicationFormType = "Tablet" | "Capsule" | "Liquid" | "Inhaler" | "Injection" | "Cream" | "Ointment" | "Drops" | "Patch" | "Other";
export type MedicationRouteType = "Oral" | "Topical" | "Inhaled" | "Subcutaneous" | "Intramuscular" | "Intravenous" | "Rectal" | "Vaginal" | "Otic" | "Nasal" | "Ophthalmic" | "Other";

export const medicationFrequencyTypes = [
  "Once daily",
  "Twice daily",
  "Three times daily",
  "Four times daily",
  "Every X hours",
  "As needed (PRN)",
  "Specific days of week",
  "Specific date (one-time)",
  "Other (custom)"
] as const;
export type MedicationFrequencyType = typeof medicationFrequencyTypes[number];

export const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
export type DayOfWeek = typeof daysOfWeek[number];

export interface MedicationSchedule {
  type: MedicationFrequencyType;
  times?: string[]; // e.g., ["08:00", "20:00"] for "Twice daily"
  intervalHours?: number; // for "Every X hours"
  daysOfWeek?: DayOfWeek[]; // for "Specific days of week"
  specificDate?: Date; // for "Specific date (one-time)"
  customInstructions?: string; // for "Other (custom)" or general notes
}

export interface MedicationLogEntry {
  date: Date;
  status: 'taken' | 'skipped' | 'snoozed'; // 'snoozed' implies it was due but delayed
  notes?: string; // Optional notes for a specific log entry
}

export interface MedicationRefillInfo {
  lastRefillDate?: Date;
  quantityDispensed?: number;
  pharmacy?: string;
  daysSupply?: number; // Optional, to help calculate next refill
}

export interface Medication {
  id: string;
  name: string;
  dosageStrength: string; // e.g., "500 mg", "10 units"
  form: MedicationFormType;
  route: MedicationRouteType;
  reason?: string; // Optional
  prescribingDoctor?: string; // Optional
  prescriptionDate: Date;
  duration?: string; // e.g., "7 days", "Ongoing"
  quantityPerPrescription?: number; // Optional
  instructions?: string; // Optional, e.g., "Take with food"
  personalNotes?: string; // User's personal notes about the medication
  photoUrl?: string; // URL to an image of the medication (can be data URI for local)

  schedule?: MedicationSchedule;
  log?: MedicationLogEntry[]; // Array to store adherence log
  refillInfo?: MedicationRefillInfo; // Information about refills
}
