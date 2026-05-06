// src/ai/agents/medico/GuidelinesCompassAgent.ts
"use server";
import { z } from "zod";
import { genkit } from "genkit";
import { gemini25Pro, googleAI } from "@genkit-ai/googleai";
import { firecrawlScraperTool, firecrawlSearchTool, pubmedSearchTool, crawl4aiScraperTool } from "../../tools/researchTools";

const ai = genkit({
  plugins: [googleAI()],
});

export const GuidelinesCompassInputSchema = z.object({
  topic: z.string().min(3),
  organization: z.string().optional().describe("e.g. AHA, NICE, WHO, IDSA"),
});

export type GuidelinesCompassInput = z.infer<typeof GuidelinesCompassInputSchema>;

export const GuidelinesCompassOutputSchema = z.object({
  topic: z.string().describe("The medical condition or topic requested"),
  organizationGuidance: z.array(z.object({
    organization: z.string().describe("The name of the organization (e.g. AHA, NICE)"),
    year: z.string().describe("The year of the guideline publication"),
    summary: z.string().describe("A brief summary of the guideline recommendations"),
    keyRecommendations: z.array(z.string()).describe("A list of key recommendations from the guideline"),
  })),
  clinicalAlgorithm: z.string().describe("A brief textual representation of the management algorithm if applicable"),
});

export type GuidelinesCompassOutput = z.infer<typeof GuidelinesCompassOutputSchema>;

export async function fetchGuidelines(
  input: GuidelinesCompassInput
): Promise<GuidelinesCompassOutput> {
  const { output } = await ai.generate({
    model: gemini25Pro,
    tools: [firecrawlScraperTool, firecrawlSearchTool, pubmedSearchTool, crawl4aiScraperTool],
    output: {
        schema: GuidelinesCompassOutputSchema
    },
    prompt: `You are an expert clinical guidelines assistant equipped with intensive research and web scraping tools (via PubMed and Firecrawl).
    
The user wants to know the latest clinical guidelines for the following topic:
Topic: "${input.topic}"
${input.organization ? `Preferred Organization: "${input.organization}"` : ""}

1. First, search PubMed or authoritative web sources using your firecrawlSearchTool & pubmedSearchTool to gather the latest guidelines.
2. Review the search results and if you find medical URLs that look like original guidelines, use the crawl4aiScraperTool or firecrawlScraperTool to deeply read the actual content.
3. Retrieve and summarize the current best-practice guidelines from major medical institutions (e.g., NICE, AHA, WHO, IDSA, ADA, ACG, etc.).
4. Structure the output as defined by the schema, explicitly citing sources when possible.`,
  });

  if (!output) throw new Error("No output generated");
  return output;
}
