'use server';

import { z } from 'zod';
import { ai } from '@/ai/genkit';
import { GoogleGenAI } from '@google/genai';

const ProChatbotInputSchema = z.object({
  message: z.string(),
  history: z.array(z.object({
    role: z.enum(['user', 'model']),
    parts: z.array(z.object({ text: z.string() }))
  })).optional()
});

const ProChatbotOutputSchema = z.object({
  response: z.string()
});

export type ProChatbotInput = z.infer<typeof ProChatbotInputSchema>;
export type ProChatbotOutput = z.infer<typeof ProChatbotOutputSchema>;

const googleGenAi = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });

export const runProChatbot = ai.defineFlow(
  {
    name: 'runProChatbot',
    inputSchema: ProChatbotInputSchema,
    outputSchema: ProChatbotOutputSchema,
  },
  async (input) => {
    try {
      // Use the new GoogleGenAI SDK format for sending a message to a chat
      const chat = googleGenAi.chats.create({
        model: "gemini-3.1-pro-preview",
        config: {
          systemInstruction: "You are the Pro Workflow Chatbot for the MediAssistant application. You are a context-aware, dedicated conversational agent designed for multi-step administrative troubleshooting, managing bookings, and coordinating complex clinical workflows. Respond professionally and concisely. You have the ability to remember the context of the conversation.",
          temperature: 0.4
        },
        history: input.history || []
      });

      const response = await chat.sendMessage({ message: input.message });
      return { response: response.text || "I'm sorry, I couldn't formulate a response." };
    } catch (err) {
      console.error('[ProChatbotAgent] Error:', err);
      throw new Error('Failed to communicate with workflow agent.');
    }
  }
);
