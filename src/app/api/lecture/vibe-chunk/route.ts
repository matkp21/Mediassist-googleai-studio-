import { NextRequest, NextResponse } from 'next/server';
import { ai } from '@/ai/genkit';
import { db } from '@/lib/firebase-admin';

const VIBEVOICE_API_URL = process.env.VIBEVOICE_API_URL || "http://localhost:8000/transcribe";
const MEDICAL_HOTWORDS = ["myocardial infarction", "pheochromocytoma", "ACE inhibitors"];

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audioBlob = formData.get('audio') as Blob;
    const uid = formData.get('uid') as string;
    const sessionId = formData.get('sessionId') as string;
    const timestamp = Date.now();

    if (!audioBlob || !uid || !sessionId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const vibeFormData = new FormData();
    vibeFormData.append('audio', audioBlob, 'chunk.webm');
    vibeFormData.append('hotwords', JSON.stringify(MEDICAL_HOTWORDS));

    let speakerLabeledText = "Transcription delayed. (VibeVoice service unavailable)";
    
    try {
      const vibeResponse = await fetch(VIBEVOICE_API_URL, { 
        method: 'POST', 
        body: vibeFormData,
        signal: AbortSignal.timeout(15000) // 15s timeout
      });
      
      if (vibeResponse.ok) {
        const vibeData = await vibeResponse.json();
        speakerLabeledText = vibeData.data.map(
          (c: any) => `[${c.timestamp}] ${c.speaker}: ${c.text}`
        ).join('\n');
      }
    } catch (e) {
      console.error("VibeVoice service error:", e);
    }

    const aiResponse = await ai.generate({
      prompt: `Extract structured clinical notes from this 6-minute medical lecture chunk. Focus on accuracy and high-yield points:\n\n${speakerLabeledText}`,
    });

    await db.collection('users').doc(uid)
      .collection('lectureSessions').doc(sessionId)
      .collection('chunks').doc(timestamp.toString())
      .set({
        timestamp,
        transcript: speakerLabeledText,
        structuredNotes: aiResponse.text
      });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Chunk processing failed:", error);
    return NextResponse.json({ error: "Chunk processing failed" }, { status: 500 });
  }
}
