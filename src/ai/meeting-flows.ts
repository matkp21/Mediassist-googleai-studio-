import { ai } from './genkit';
import { TopicTreeSchema, EnhancedSessionSchema } from '../lib/schemas/lecture-schemas';
import { db } from '@/lib/firebase-admin';

// ---------------------------------------------------------
// [Flow 1] — Transcription Agent
// ---------------------------------------------------------
export async function flow1Transcription(audioChunkPath: string): Promise<string> {
  // In production, this triggers your Cloud Function wrapping Google STT or Whisper.
  // It processes the 30-minute block and returns a timestamped transcript.
  console.log(`Sending ${audioChunkPath} to Cloud Function STT...`);
  
  // Mocked response for architecture
  return "[00:00] Today we will discuss the pathophysiology of heart failure. [00:30] Specifically, reduced ejection fraction..."; 
}

// ---------------------------------------------------------
// [Flow 2] — Topic Extraction Agent (MedGemma 4B Placeholder)
// ---------------------------------------------------------
export async function flow2TopicExtraction(rawTranscript: string) {
  // We use a medical-specialized prompt as a placeholder for MedGemma 4B
  const response = await ai.generate({
    model: 'googleai/gemini-2.0-flash', // Fallback model
    prompt: `Analyze the following medical transcript. 
    Extract the core medical concepts, build a hierarchy of sub-concepts, and identify all specific anatomical terms.
    
    Transcript:
    ${rawTranscript}`,
    output: { schema: TopicTreeSchema }
  });
  
  return response.output();
}

// ---------------------------------------------------------
// [Flow 3] — Structuring Agent (Gemini 2.5 Pro Placeholder)
// ---------------------------------------------------------
export async function flow3Structuring(topicTree: any, rawTranscript: string): Promise<string> {
  const response = await ai.generate({
    model: 'googleai/gemini-2.0-flash', // Using 2.0 Flash for efficiency, can be swapped for Pro
    prompt: `You are an expert medical editor. Convert the raw transcript into a structured Markdown document using the provided Topic Tree as your structural guide.
    
    Rules:
    1. Use Markdown headings (##, ###) based on the Topic Tree hierarchy.
    2. Bold all definitions and key medical terminology.
    3. If any medical formulas or calculations are mentioned, put them in markdown code blocks.
    4. Maintain the chronological flow of the transcript.

    Topic Tree: ${JSON.stringify(topicTree)}
    Transcript: ${rawTranscript}`
  });
  
  return response.text;
}

// ---------------------------------------------------------
// [Flow 4] — Enhancement Agent & Firestore Storage
// ---------------------------------------------------------
export async function flow4EnhancementAndStorage(
  structuredMarkdown: string, 
  uid: string, 
  sessionId: string
) {
  const response = await ai.generate({
    model: 'googleai/gemini-2.0-flash',
    prompt: `Review the following structured medical notes.
    1. Extract 3-5 clear Learning Objectives.
    2. Write a concise Key Concept Summary.
    3. Generate a Mermaid.js diagram illustrating the core physiological or clinical pathways.
    4. Create 5 high-yield MCQ-style flashcards based strictly on this text.
    
    Notes:
    ${structuredMarkdown}`,
    output: { schema: EnhancedSessionSchema }
  });

  const enhancements = response.output();

  if (!enhancements) {
    throw new Error("Failed to generate enhancements");
  }

  // Store in Firestore (UID-tied, per-session)
  const sessionRef = db.collection('users').doc(uid).collection('lectureSessions').doc(sessionId);
  
  await sessionRef.set({
    createdAt: new Date(),
    status: 'completed',
    markdownNotes: structuredMarkdown,
    objectives: enhancements.learningObjectives,
    summary: enhancements.keyConceptSummary,
    mermaidDiagram: enhancements.mermaidDiagram,
    flashcards: enhancements.mcqFlashcards
  }, { merge: true });

  return enhancements;
}
