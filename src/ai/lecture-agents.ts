import { ai } from './genkit';
import { z } from 'zod';

// --- Schemas ---
export const CorrectedChunkSchema = z.object({
  correctedText: z.string().describe("Medically accurate transcript chunk."),
  detectedKeywords: z.array(z.string())
});

export const StructuredNotesSchema = z.object({
  markdownContent: z.string(),
  mermaidMindMap: z.string()
});

export const SummaryAndArtifactsSchema = z.object({
  shortSummary: z.string(),
  flashcards: z.array(z.object({ front: z.string(), back: z.string() })),
  mcqs: z.array(z.object({
    question: z.string(),
    options: z.array(z.string()),
    answer: z.string(),
    explanation: z.string()
  }))
});

// --- Agent 1: Transcription Agent (Whisper - Local/API) ---
export async function runTranscriptionAgent(audioBuffer: Buffer): Promise<string> {
  // Mocked for architecture demonstration
  // In a real scenario, this would call Google Speech-to-Text or a hosted Whisper API
  return "The patient presented with miocardial infraction..."; 
}

// --- Agent 2: Medical Correction Agent ---
export async function runMedicalCorrectionAgent(rawText: string) {
  const response = await ai.generate({
    model: 'googleai/gemini-2.0-flash',
    prompt: `Fix phonetic misspellings of medical terminology in this transcript chunk. 
    Maintain original meaning and length.
    Transcript: ${rawText}`,
    output: { schema: CorrectedChunkSchema }
  });
  return response.output();
}

// --- Agent 3: Slide/OCR Integration Agent ---
export async function runSlideAnalysisAgent(imageBase64: string) {
  const response = await ai.generate({
    model: 'googleai/gemini-2.0-flash',
    prompt: `Extract text and analyze any medical diagrams in this lecture slide.`,
    messages: [
      { role: 'user', content: [ { media: { url: `data:image/jpeg;base64,${imageBase64}`, contentType: 'image/jpeg' } } ] }
    ]
  });
  return response.text;
}

// --- Agent 4: Structuring Agent ---
export async function runStructuringAgent(fullTranscript: string, slidesContext: string) {
  const response = await ai.generate({
    model: 'googleai/gemini-2.0-flash',
    prompt: `Convert the following transcript and slide data into highly structured Markdown notes. 
    Also generate a Mermaid.js syntax mind map.
    Transcript: ${fullTranscript}
    Slides: ${slidesContext}`,
    output: { schema: StructuredNotesSchema }
  });
  return response.output();
}

// --- Agent 5: Summary & Assessment Agent ---
export async function runSummaryAgent(structuredNotes: string) {
  const response = await ai.generate({
    model: 'googleai/gemini-2.0-flash',
    prompt: `Based on these structured notes, generate a 5-minute revision summary, 5 flashcards, and 3 MCQs.
    Notes: ${structuredNotes}`,
    output: { schema: SummaryAndArtifactsSchema }
  });
  return response.output();
}
