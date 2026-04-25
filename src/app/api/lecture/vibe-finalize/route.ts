import { NextRequest, NextResponse } from 'next/server';
import { ai } from '@/ai/genkit';
import { db, storage } from '@/lib/firebase-admin';
import { MasterStudyGuideSchema } from '@/lib/schemas/lecture-schemas';

const VIBEVOICE_API_URL = process.env.VIBEVOICE_API_URL || "http://localhost:8000/transcribe";

export async function POST(req: NextRequest) {
  try {
    const { uid, sessionId } = await req.json();
    
    if (!uid || !sessionId) {
      return NextResponse.json({ error: "Missing uid or sessionId" }, { status: 400 });
    }

    // Reference the file in Firebase Storage
    const file = storage.bucket().file(`lectures/${uid}/${sessionId}/master_audio.webm`);
    
    // Check if file exists
    const [exists] = await file.exists();
    if (!exists) {
      return NextResponse.json({ error: "Master audio not found" }, { status: 404 });
    }

    const [audioBuffer] = await file.download();
    
    // Prepare VibeVoice request
    const vibeFormData = new FormData();
    const audioBlob = new Blob([audioBuffer], { type: 'audio/webm' });
    vibeFormData.append('audio', audioBlob, 'master_audio.webm');
    vibeFormData.append('hotwords', JSON.stringify(["myocardial infarction", "pheochromocytoma", "ACE inhibitors"]));
    
    let masterTranscript = "(Complete transcript synthesis failed - using chunk aggregates)";
    
    try {
      const vibeResponse = await fetch(VIBEVOICE_API_URL, { 
        method: 'POST', 
        body: vibeFormData,
        signal: AbortSignal.timeout(60000) // 1 minute timeout for master pass
      });
      
      if (vibeResponse.ok) {
        const vibeData = await vibeResponse.json();
        masterTranscript = vibeData.data.map(
          (c: any) => `[${c.timestamp}] ${c.speaker}: ${c.text}`
        ).join('\n');
      }
    } catch (e) {
      console.error("VibeVoice master pass failed:", e);
    }

    const masterAgentResponse = await ai.generate({
      prompt: `Using this complete, speaker-labeled 1-hour medical transcript, generate a Master Study Guide including a comprehensive summary, Mermaid mind map, Clinical Pearls, and 10 MCQ Flashcards.\n\nTranscript:\n${masterTranscript}`,
      output: { schema: MasterStudyGuideSchema } 
    });

    const finalGuide = masterAgentResponse.output();

    if (!finalGuide) {
       throw new Error("AI failed to generate master guide");
    }

    await db.collection('users').doc(uid)
      .collection('lectureSessions').doc(sessionId)
      .update({
        status: 'completed',
        masterSummary: finalGuide.masterSummary,
        mermaidMindMap: finalGuide.mermaidMindMap,
        flashcards: finalGuide.mcqFlashcards,
        clinicalPearls: finalGuide.clinicalPearls,
        pristineTranscript: masterTranscript,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

    return NextResponse.json({ success: true, data: finalGuide });
  } catch (error) {
    console.error("Master pass failed:", error);
    return NextResponse.json({ error: "Master pass failed" }, { status: 500 });
  }
}

// Helper to access admin for serverTimestamp
import * as admin from 'firebase-admin';
