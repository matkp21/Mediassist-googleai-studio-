import { NextResponse } from 'next/server';
import { runTranscriptionAgent, runMedicalCorrectionAgent } from '@/ai/lecture-agents';
import { db } from '@/lib/firebase-admin';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const audioChunk = formData.get('audio') as Blob;
    const lectureId = formData.get('lectureId') as string;
    const timestamp = parseInt(formData.get('timestamp') as string || Date.now().toString());

    if (!audioChunk || !lectureId) {
      return NextResponse.json({ error: "Missing audio or lectureId" }, { status: 400 });
    }

    // Convert Blob to Buffer for processing
    const arrayBuffer = await audioChunk.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Execute Agent 1: Transcription
    const rawTranscript = await runTranscriptionAgent(buffer);

    // Execute Agent 2: Medical Correction
    const correctedData = await runMedicalCorrectionAgent(rawTranscript);

    if (!correctedData) {
      throw new Error("Medical correction agent failed to return data");
    }

    // Persist to Firestore
    await db.collection('lectures').doc(lectureId)
      .collection('chunks').doc(timestamp.toString()).set({
        timestamp,
        rawTranscript,
        correctedTranscript: correctedData.correctedText,
        keywords: correctedData.detectedKeywords
      });

    return NextResponse.json({ 
      success: true, 
      liveText: correctedData.correctedText,
      keywords: correctedData.detectedKeywords
    });
  } catch (error) {
    console.error("Chunk Processing Error:", error);
    return NextResponse.json({ error: "Pipeline failure" }, { status: 500 });
  }
}
