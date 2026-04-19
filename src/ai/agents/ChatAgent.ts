
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

import { hybridOrchestratorFlow } from '@/ai/flows/hybridOrchestratorFlow';

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
    // Try hybrid orchestrator flow first
    const orchestrationOutput = await hybridOrchestratorFlow(input.message);
    return { response: orchestrationOutput };
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

// Unused flows removed to use the centralized hybridOrchestratorFlow
