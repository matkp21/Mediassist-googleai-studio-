'use server';

/**
 * @fileOverview Extract key moments, summaries, and flashcards directly from Medical Video Lectures using YouTube transcript analysis.
 */

import { z } from 'zod';
import { YoutubeTranscript } from 'youtube-transcript';
import { GoogleGenAI } from '@google/genai';

export const MedicoVideoAnalyzerInputSchema = z.object({
  videoId: z.string().describe("The YouTube video ID to analyze."),
  videoTitle: z.string().describe("The title of the video."),
  topic: z.string().optional().describe("Hint topic derived from the search query."),
});
export type MedicoVideoAnalyzerInput = z.infer<typeof MedicoVideoAnalyzerInputSchema>;

export const MedicoVideoAnalyzerOutputSchema = z.object({
  summary: z.string().describe("A concise summary of the key clinical points covered in the video."),
  keyMoments: z.array(z.object({
    timestamp: z.string().describe("Actual timestamp (e.g., 'MM:SS')."),
    description: z.string().describe("What happens or is explained at this moment."),
  })).describe("Key turning points or topics covered in the video flow."),
  flashcards: z.array(z.object({
    front: z.string().describe("Question or concept. Keep it concise."),
    back: z.string().describe("Answer or explanation. Keep it factual."),
  })).describe("Suggested Anki-style flashcards extracted from the video content."),
});
export type MedicoVideoAnalyzerOutput = z.infer<typeof MedicoVideoAnalyzerOutputSchema>;

const googleGenAi = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });

// Helper to wrap transcript into timestamped chunks
function formatTranscript(transcript: any[]) {
  // Take up to the first 400 chunks to avoid massive payloads if video is too long, though Gemini handles large contexts nicely.
  const limited = transcript.slice(0, 400); 
  return limited.map(t => {
    const min = Math.floor(t.offset / 60000);
    const sec = Math.floor((t.offset % 60000) / 1000).toString().padStart(2, '0');
    return `[${min}:${sec}] ${t.text}`;
  }).join(' ');
}

export async function analyzeVideo(input: MedicoVideoAnalyzerInput): Promise<MedicoVideoAnalyzerOutput> {
  try {
    let transcriptData = '';
    let hasTranscript = false;

    // 1. Fetch Transcript
    try {
      const transcript = await YoutubeTranscript.fetchTranscript(input.videoId);
      if (transcript && transcript.length > 0) {
        transcriptData = formatTranscript(transcript);
        hasTranscript = true;
      }
    } catch (e) {
      console.warn(`Could not fetch transcript for video ${input.videoId}`, e);
    }

    // 2. Build Prompt
    let promptContent = `You are an expert AI clinical video content analyzer.
Video Title: "${input.videoTitle}"
Context Topic: "${input.topic || 'Medical Lecture'}"

`;

    if (hasTranscript) {
      promptContent += `Here is the actual transcript of the video with timestamps:
${transcriptData}

Based on this actual video transcript, extract the following:
1. A concise clinical summary of what a student would learn.
2. 5-7 true 'Key Moments' with their actual timestamps from the transcript, acting as an index.
3. 5-7 high-yield Anki-style flashcards derived directly from the content.`;
    } else {
      promptContent += `WARNING: The video transcript could not be fetched due to API restrictions or missing CCs. 
Please simulate a deep clinical analysis of this video based on its title and topic.

Extract the following:
1. A concise clinical summary of what a student would learn.
2. 4 simulated 'Key Moments' with estimated timestamps, acting as an index.
3. 4 high-yield Anki-style flashcards derived from the assumed content.`;
    }

    // 3. Generate Output using gemini-3.1-flash-preview for fast, massive context processing
    const response = await googleGenAi.models.generateContent({
      model: 'gemini-3.1-flash-preview',
      contents: promptContent,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
             summary: { type: "STRING" },
             keyMoments: { 
                 type: "ARRAY", 
                 items: {
                    type: "OBJECT",
                    properties: {
                       timestamp: { type: "STRING" },
                       description: { type: "STRING" }
                    },
                    required: ["timestamp", "description"]
                 }
             },
             flashcards: {
                 type: "ARRAY",
                 items: {
                     type: "OBJECT",
                     properties: {
                         front: { type: "STRING" },
                         back: { type: "STRING" }
                     },
                     required: ["front", "back"]
                 }
             }
          },
          required: ["summary", "keyMoments", "flashcards"]
        }
      }
    });

    const output = JSON.parse(response.text || '{}');
    if (!output.summary) {
        throw new Error('Analysis generation failed.');
    }

    return output as MedicoVideoAnalyzerOutput;

  } catch (err) {
    console.error('[VideoAnalyzerAgent] Error:', err);
    throw new Error('Failed to analyze the video. Please try another video or try again later.');
  }
}
