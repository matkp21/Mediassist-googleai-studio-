import { z } from 'genkit';
import { ai } from '@/ai/genkit';

// A standard Genkit tool definition acting as a primitive
export const getPatientDataManifest = ai.defineTool(
  {
    name: 'get_patient_data_manifest',
    description: "Gets a manifest of all available FHIR resources and their codes for a patient by querying the patient's entire record. Use this to discover available data.",
    inputSchema: z.object({ 
      patient_id: z.string().describe("The unique identifier for the simulated patient") 
    }),
    outputSchema: z.string(),
  },
  async ({ patient_id }) => {
    // Simulated database fetch to a FHIR-compliant endpoint
    // In production, this interacts with Google Cloud Healthcare API
    return JSON.stringify({
      patient_id,
      resources: ["Condition", "Observation", "MedicationRequest", "Immunization"]
    });
  }
);

// The Orchestration Flow adapting the model for deterministic Tool Use
export const medGemmaAgentFlow = ai.defineFlow(
  {
    name: 'medGemmaAgentFlow',
    inputSchema: z.object({ 
      prompt: z.string(),
      sessionId: z.string()
    }),
    outputSchema: z.string(),
  },
  async (input) => {
    // The strict system prompt forcing JSON-formatted tool calls
    const systemPrompt = `
      You are an autonomous medical logic agent within the MediAssist platform. 
      You have access to the following tools:
      1. get_patient_data_manifest(patient_id: string)

      If you decide to invoke a function to gather more data before answering the user, you MUST output ONLY a single JSON object in the exact format:
      {"name": "function_name", "parameters": {"arg1": "value1"}}
      
      Do not include any other markdown, conversational text, or reasoning before the JSON object if you are making a tool call. If you have enough information, reply normally to the user.
    `;

    // Initial generation call to the model
    const { text } = await ai.generate({
      prompt: `${systemPrompt}\n\nUser Query: ${input.prompt}`,
    });

    // Custom Middleware Parsing: Detect if the model attempted a tool call
    try {
      // Attempt to parse the raw text as JSON
      const parsedOutput = JSON.parse(text.trim());
      
      if (parsedOutput.name === 'get_patient_data_manifest') {
         // Execute the internal tool
         const result = await getPatientDataManifest(parsedOutput.parameters);
         
         // Return the tool execution result back to the LLM for final clinical synthesis
         const finalResponse = await ai.generate({
            prompt: `
              Original Query: ${input.prompt}
              The tool execution returned the following data: ${result}. 
              Based on this data, synthesize a comprehensive clinical summary for the medical student.
            `,
         });
         return finalResponse.text;
      }
    } catch (e) {
      // If JSON parsing fails, assume the LLM generated a standard conversational response
      // This acts as a fallback mechanism
      return text;
    }
    return text;
  }
);
