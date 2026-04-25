import { z } from "genkit";
import { ai } from "@/ai/genkit";

/**
 * FEATURE 75 (New): Clinical Calculators
 * Provides validated medical formulas for BMI, GFR, and Medication Dosages.
 */

export const bmiCalculator = ai.defineTool(
  {
    name: "calculateBMI",
    description: "Calculate Body Mass Index (BMI) and categorize it.",
    inputSchema: z.object({
      weightKg: z.number().describe("Weight in kilograms"),
      heightCm: z.number().describe("Height in centimeters"),
    }),
    outputSchema: z.object({
      bmi: z.number(),
      category: z.string(),
      healthRisk: z.string(),
    }),
  },
  async ({ weightKg, heightCm }) => {
    const heightM = heightCm / 100;
    const bmi = Number((weightKg / (heightM * heightM)).toFixed(1));
    
    let category = "Normal";
    let healthRisk = "Low";

    if (bmi < 18.5) {
      category = "Underweight";
      healthRisk = "Increased";
    } else if (bmi >= 25 && bmi < 30) {
      category = "Overweight";
      healthRisk = "Increased";
    } else if (bmi >= 30) {
      category = "Obese";
      healthRisk = "High";
    }

    return { bmi, category, healthRisk };
  }
);

export const gfrCalculator = ai.defineTool(
  {
    name: "calculateGFR",
    description: "Calculate Glomerular Filtration Rate (GFR) using the Cockcroft-Gault formula.",
    inputSchema: z.object({
      age: z.number(),
      weightKg: z.number(),
      creatinineMgDl: z.number(),
      gender: z.enum(["male", "female"]),
    }),
    outputSchema: z.object({
      gfr: z.number(),
      stage: z.string(),
    }),
  },
  async ({ age, weightKg, creatinineMgDl, gender }) => {
    // Cockcroft-Gault formula
    let gfr = ((140 - age) * weightKg) / (72 * creatinineMgDl);
    if (gender === "female") gfr *= 0.85;
    
    gfr = Math.round(gfr);
    
    let stage = "Stage 1: Normal or high GFR";
    if (gfr < 15) stage = "Stage 5: Kidney failure";
    else if (gfr < 30) stage = "Stage 4: Severe GFR decrease";
    else if (gfr < 60) stage = "Stage 3: Moderate GFR decrease";
    else if (gfr < 90) stage = "Stage 2: Mild GFR decrease";

    return { gfr, stage };
  }
);

export const pediatricDosageCalculator = ai.defineTool(
  {
    name: "calculatePediatricDosage",
    description: "Calculate pediatric dosage based on weight and standard concentration.",
    inputSchema: z.object({
      weightKg: z.number(),
      mgPerKg: z.number().describe("Standard dose in mg/kg"),
      concentrationMgPerMl: z.number().describe("Available concentration in mg/ml"),
    }),
    outputSchema: z.object({
      totalMg: z.number(),
      totalMl: z.number(),
      safetyWarning: z.string(),
    }),
  },
  async ({ weightKg, mgPerKg, concentrationMgPerMl }) => {
    const totalMg = weightKg * mgPerKg;
    const totalMl = totalMg / concentrationMgPerMl;

    return {
      totalMg: Number(totalMg.toFixed(2)),
      totalMl: Number(totalMl.toFixed(2)),
      safetyWarning: "Always verify pediatric calculations with a second provider before administration.",
    };
  }
);

export const apothecaryDoseCalculator = ai.defineTool(
  {
    name: "calculateApothecaryDose",
    description: "Convert apothecary units to metric and calculate dosage.",
    inputSchema: z.object({
      grains: z.number().describe("Dose in grains (gr)"),
      concentrationMg: z.number().describe("Milligrams per tablet/capsule"),
    }),
    outputSchema: z.object({
      metricMg: z.number(),
      numTablets: z.number(),
    }),
  },
  async ({ grains, concentrationMg }) => {
    // 1 grain is approximately 64.8 mg
    const metricMg = grains * 64.8;
    const numTablets = metricMg / concentrationMg;

    return {
      metricMg: Number(metricMg.toFixed(2)),
      numTablets: Number(numTablets.toFixed(1)),
    };
  }
);

export const parklandFormula = ai.defineTool(
  {
    name: "calculateParklandFormula",
    description: "Calculate fluid resuscitation for burn patients in the first 24 hours.",
    inputSchema: z.object({
      weightKg: z.number(),
      tbsaPercentage: z.number().describe("Total Body Surface Area percentage affected"),
    }),
    outputSchema: z.object({
      totalFluidsMl: z.number(),
      firstEightHoursMl: z.number(),
      nextSixteenHoursMl: z.number(),
    }),
  },
  async ({ weightKg, tbsaPercentage }) => {
    // Parkland Formula: 4mL * weight(kg) * TBSA(%)
    const totalFluidsMl = 4 * weightKg * tbsaPercentage;
    const firstEightHoursMl = totalFluidsMl / 2;
    const nextSixteenHoursMl = totalFluidsMl / 2;

    return {
      totalFluidsMl,
      firstEightHoursMl,
      nextSixteenHoursMl,
    };
  }
);
