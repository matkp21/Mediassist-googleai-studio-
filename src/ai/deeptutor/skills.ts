import { z } from "genkit";

/**
 * FEATURE 48: Bot Skill Learning
 * Registry and validator for TutorBot skills.
 */

export const SkillSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  tools: z.array(z.string()), // IDs of registered Genkit tools
  promptAugmentation: z.string().optional(),
});

export type BotSkill = z.infer<typeof SkillSchema>;

export const BOT_SKILLS_REGISTRY: Record<string, BotSkill> = {
  pediatrics: {
    id: "ped",
    name: "Pediatric Specialist",
    description: "Deep knowledge of pediatric dosages and developmental stages.",
    tools: ["calculateDosage", "checkGrowthCurves"],
    promptAugmentation: "You are now a Pediatric expert. Focus on family-centered care and age-appropriate clinical logic.",
  },
  radiology: {
    id: "rad",
    name: "Radiology Assistant",
    description: "Ability to interpret DICOM metadata and imaging protocols.",
    tools: ["analyzeImageMetadata", "suggestImagingStudy"],
    promptAugmentation: "You are a Radiology consultant. Prioritize ALARA principles and radiological findings.",
  }
};

export function learnSkill(botId: string, skillId: string) {
  // Logic to persist the skill attachment in Firestore
  console.log(`Bot ${botId} is learning skill: ${skillId}`);
  const skill = BOT_SKILLS_REGISTRY[skillId];
  if (!skill) throw new Error("Skill not found in registry.");
  return skill;
}
