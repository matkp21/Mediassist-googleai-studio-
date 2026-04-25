import { z } from "genkit";
import { ai } from "@/ai/genkit";

/**
 * FEATURE 76 (New): Vital Signs Analysis
 * Analyzes basic vital signs and provides a triage/alert level.
 */

export const vitalSignsAnalyzer = ai.defineTool(
  {
    name: "analyzeVitalSigns",
    description: "Analyze blood pressure, heart rate, and temperature for clinical alerts.",
    inputSchema: z.object({
      systolicBP: z.number(),
      diastolicBP: z.number(),
      heartRate: z.number(),
      temperatureF: z.number(),
      oxygenSaturation: z.number().optional(),
    }),
    outputSchema: z.object({
      triageLevel: z.enum(["Stable", "Urgent", "Emergent"]),
      alerts: z.array(z.string()),
      interpretation: z.string(),
    }),
  },
  async ({ systolicBP, diastolicBP, heartRate, temperatureF, oxygenSaturation }) => {
    const alerts: string[] = [];
    let severity = 0; // 0: Stable, 1: Urgent, 2: Emergent

    // Blood Pressure
    if (systolicBP > 180 || diastolicBP > 120) {
      alerts.push("Hypertensive Crisis suspected.");
      severity = Math.max(severity, 2);
    } else if (systolicBP > 140 || diastolicBP > 90) {
      alerts.push("Hypertension noted.");
      severity = Math.max(severity, 1);
    } else if (systolicBP < 90) {
      alerts.push("Hypotension noted.");
      severity = Math.max(severity, 1);
    }

    // Heart Rate
    if (heartRate > 100) {
      alerts.push("Tachycardia noted.");
      severity = Math.max(severity, 1);
      if (heartRate > 150) severity = 2;
    } else if (heartRate < 60) {
      alerts.push("Bradycardia noted.");
      severity = Math.max(severity, 1);
    }

    // Temperature
    if (temperatureF > 100.4) {
      alerts.push("Febrile state.");
      severity = Math.max(severity, 1);
    } else if (temperatureF < 95) {
      alerts.push("Hypothermia suspected.");
      severity = Math.max(severity, 2);
    }

    // Oxygen Saturation
    if (oxygenSaturation !== undefined && oxygenSaturation < 92) {
      alerts.push("Hypoxia (low blood oxygen).");
      severity = 2;
    }

    const triageLevel = severity === 2 ? "Emergent" : (severity === 1 ? "Urgent" : "Stable");
    const interpretation = alerts.length > 0 
      ? `Vital signs indicate ${alerts.join(", ")}.` 
      : "Vital signs are within normal limits.";

    return { triageLevel: triageLevel as "Stable" | "Urgent" | "Emergent", alerts, interpretation };
  }
);
