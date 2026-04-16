'use server';
/**
 * @fileOverview Utility function for making direct calls to the Google Gemini API.
 * This is intended as a fallback mechanism.
 */

import { z } from 'zod';

const GeminiApiRequestSchema = z.object({
  contents: z.array(
    z.object({
      parts: z.array(
        z.object({
          text: z.string(),
        })
      ),
    })
  ),
  // Add safetySettings, generationConfig if needed for more control
});

const GeminiApiResponseSchema = z.object({
  candidates: z.array(
    z.object({
      content: z.object({
        parts: z.array(
          z.object({
            text: z.string(),
          })
        ),
        role: z.string().optional(),
      }),
      finishReason: z.string().optional(),
      index: z.number().optional(),
      safetyRatings: z.array(z.any()).optional(), // Simplified for brevity
    })
  ).optional(),
  promptFeedback: z.object({
    safetyRatings: z.array(z.any()).optional(),
  }).optional(),
  // Error structure if the response itself is an error
  error: z.object({
    code: z.number(),
    message: z.string(),
    status: z.string(),
  }).optional(),
});


export async function callGeminiApiDirectly(promptText: string): Promise<string> {
  const apiKey = process.env.GOOGLE_API_KEY;
  const apiEndpoint = process.env.NEXT_PUBLIC_GEMINI_API_ENDPOINT || 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

  if (!apiKey) {
    console.error('Google API key (GOOGLE_API_KEY) is not configured in environment variables.');
    throw new Error('Google API key not configured.');
  }

  const requestBody = {
    contents: [{ parts: [{ text: promptText }] }],
    // We can add safetySettings and generationConfig here if needed to match Genkit's behavior more closely.
    // For simplicity, this basic fallback omits them for now.
    // safetySettings: [...],
    // generationConfig: { temperature: 0.7, ... }
  };

  try {
    const response = await fetch(`${apiEndpoint}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const responseData = await response.json();
    const parsedResponse = GeminiApiResponseSchema.safeParse(responseData);

    if (!response.ok || !parsedResponse.success || parsedResponse.data.error) {
      const errorDetails = parsedResponse.success ? parsedResponse.data.error : (responseData as any).error;
      const errorMessage = errorDetails?.message || response.statusText || 'Unknown Gemini API error';
      console.error(`Direct Gemini API call failed: ${response.status} - ${errorMessage}`, errorDetails);
      throw new Error(`Gemini API error: ${response.status} - ${errorMessage}`);
    }
    
    const textResponse = parsedResponse.data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (textResponse) {
      return textResponse;
    } else {
      console.warn('Direct Gemini API call: No text response found in candidates.', parsedResponse.data);
      return 'Sorry, I received an unexpected response. Please try again.';
    }

  } catch (error) {
    console.error('Error during direct Gemini API call:', error);
    if (error instanceof Error && error.message.startsWith('Gemini API error:')) {
        throw error;
    }
    throw new Error('Failed to communicate with the Gemini API directly.');
  }
}
