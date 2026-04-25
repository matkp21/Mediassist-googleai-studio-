import { z } from "genkit";
import { ai } from "@/ai/genkit";

/**
 * FEATURE 77 (New): Medication Safety Checker
 * Checks for contraindications and common side effects of drugs.
 */

export const medicationSafetyTool = ai.defineTool(
  {
    name: "checkMedicationSafety",
    description: "Check for contraindications, interactions, and common side effects of medications.",
    inputSchema: z.object({
      medications: z.array(z.string()).describe("List of medications currently being taken or considered"),
      patientConditions: z.array(z.string()).describe("Existing medical conditions of the patient"),
    }),
    outputSchema: z.object({
      risks: z.array(z.object({
        medication: z.string(),
        severity: z.enum(["Low", "Moderate", "High", "Contraindicated"]),
        reason: z.string(),
      })),
      summary: z.string(),
    }),
  },
  async ({ medications, patientConditions }) => {
    const risks: any[] = [];
    
    // Simple logic patterns for simulation
    const medsFlat = medications.map(m => m.toLowerCase());
    const conditionsFlat = patientConditions.map(c => c.toLowerCase());

    if (medsFlat.includes("warfarin") && medsFlat.includes("aspirin")) {
      risks.push({
        medication: "Warfarin + Aspirin",
        severity: "High",
        reason: "Significant increase in bleeding risk due to dual antiplatelet/anticoagulant effect.",
      });
    }

    if (medsFlat.includes("ibuprofen") && (conditionsFlat.includes("kidney disease") || conditionsFlat.includes("ckd"))) {
      risks.push({
        medication: "Ibuprofen",
        severity: "Contraindicated",
        reason: "NSAIDs should be avoided in patients with significant renal impairment.",
      });
    }

    if (medsFlat.includes("metformin") && conditionsFlat.includes("heart failure")) {
      risks.push({
        medication: "Metformin",
        severity: "Moderate",
        reason: "Use caution in patients with unstable heart failure due to risk of lactic acidosis.",
      });
    }

    const summary = risks.length > 0
      ? `Found ${risks.length} potential safety concerns.`
      : "No immediate major contraindications found in the simulated database for this combination.";

    return { risks, summary };
  }
);
