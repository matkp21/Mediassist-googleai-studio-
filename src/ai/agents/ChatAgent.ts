
'use server';
/**
 * @fileOverview Defines a Genkit flow for handling chat interactions.
 * This flow can respond to general conversation and use tools like symptom analysis.
 *
 * - chatFlow - The main flow for chat.
 * - ChatMessageInput - Input type for user messages.
 * - ChatMessageOutput - Output type for bot responses.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { symptomAnalyzerTool } from '@/ai/tools/symptom-analyzer-tool';
import { callGeminiApiDirectly } from '@/ai/utils/direct-gemini-call';

// Define input schema for a chat message
const ChatMessageInputSchema = z.object({
  message: z.string().describe('The user message in the chat conversation.'),
  // Future: Add conversation history, user ID, etc.
});
export type ChatMessageInput = z.infer<typeof ChatMessageInputSchema>;

// Define output schema for a chat message response
const ChatMessageOutputSchema = z.object({
  response: z.string().describe('The AI assistant s response to the user message.'),
});
export type ChatMessageOutput = z.infer<typeof ChatMessageOutputSchema>;


export async function processChatMessage(input: ChatMessageInput): Promise<ChatMessageOutput> {
  try {
    // Try Genkit flow first
    const genkitResponse = await chatFlow(input);
    return genkitResponse;
  } catch (genkitError: any) {
    console.warn("Genkit chatFlow failed, attempting direct Gemini API call as fallback:", genkitError.message || genkitError);
    try {
      // Construct a simplified prompt for the direct call.
      // This fallback will NOT use tools like symptomAnalyzerTool or the full context of the original chatPrompt.
      const directPrompt = `You are MediAssistant, a helpful and friendly AI medical assistant. The user says: "${input.message}". Respond conversationally and helpfully.`;
      const fallbackResponseText = await callGeminiApiDirectly(directPrompt);
      return { response: fallbackResponseText };
    } catch (fallbackError: any) {
      console.error("Direct Gemini API call (fallback) also failed:", fallbackError.message || fallbackError);
      // Return a generic error if both fail
      return { response: "I'm currently experiencing technical difficulties and cannot process your request. Please try again later." };
    }
  }
}

const chatPrompt = ai.definePrompt({
  name: 'chatPrompt',
  input: { schema: ChatMessageInputSchema },
  output: { schema: ChatMessageOutputSchema },
  tools: [symptomAnalyzerTool],
  prompt: `You are MediAssistant, a helpful and friendly AI medical assistant.
  Your primary goal is to assist users with their medical queries.

  User's message: {{{message}}}

  Instructions:
  1. If the user's message clearly describes medical symptoms they are experiencing (e.g., "I have a fever and a cough", "My symptoms are headache and nausea"), use the 'symptomAnalyzer' tool to analyze these symptoms.
     - When presenting the results from the 'symptomAnalyzer' tool, clearly state that these are potential considerations and not a diagnosis, and advise consulting a medical professional.
     - Format the potential diagnoses from the tool in a clear, readable way (e.g., a list).
  2. If the user's message is a general question, a greeting, or anything not describing specific medical symptoms for analysis, respond conversationally and helpfully without using the tool.
  3. Be empathetic and maintain a professional tone.
  4. If the symptomAnalyzer tool returns no specific diagnoses, inform the user that no specific considerations could be determined based on the input and still advise consulting a doctor.
  `,
  config: {
    temperature: 0.5, // Slightly more creative for conversation but still factual for medical info
  }
});


const chatFlow = ai.defineFlow(
  {
    name: 'chatFlow',
    inputSchema: ChatMessageInputSchema,
    outputSchema: ChatMessageOutputSchema,
  },
  async (input) => {
    const { output, history } = await chatPrompt(input);

    if (!output) {
      // Handle cases where the LLM might not produce structured output as expected,
      // or if tool use leads to an unexpected state.
      // Check if the last history entry indicates an error or no response.
      const lastMessage = history[history.length -1];
      if (lastMessage?.role === 'model' && lastMessage.content.length === 0) {
        // This specific error could be a reason to trigger the fallback if we refine error detection
        throw new Error("Genkit model returned empty content.");
      }
      // General error if no output and not handled above
      throw new Error("Genkit flow did not produce an output.");
    }
    
    return output;
  }
);
