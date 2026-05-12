import { NextResponse } from 'next/server';
import { runStructuringAgent, runSummaryAgent } from '@/ai/lecture-agents';
import { db } from '@/lib/firebase-admin';

export async function POST(req: Request) {
  try {
    const { lectureId } = await req.json();

    if (!lectureId) {
      return NextResponse.json({ error: "Missing lectureId" }, { status: 400 });
    }

    // 1. Retrieve all chunks and sort chronologically
    const chunksSnapshot = await db.collection('lectures').doc(lectureId).collection('chunks').orderBy('timestamp').get();
    const fullTranscript = chunksSnapshot.docs.map(doc => doc.data().correctedTranscript).join('\n\n');

    // 2. Retrieve all slide analyses
    const slidesSnapshot = await db.collection('lectures').doc(lectureId).collection('slides').orderBy('timestamp').get();
    const slidesContext = slidesSnapshot.docs.map(doc => {
      const data = doc.data();
      return `Slide [${data.timestamp}]: ${data.ocrText}\nAnalysis: ${data.diagramAnalysis || 'None'}`;
    }).join('\n\n');

    // 3. Execute Agent 4 (Structuring)
    const structuredNotes = await runStructuringAgent(fullTranscript, slidesContext);

    if (!structuredNotes) {
      throw new Error("Structuring agent failed");
    }

    // 4. Execute Agent 5 (Summary & Artifacts)
    const summaryData = await runSummaryAgent(structuredNotes.markdownContent);

    if (!summaryData) {
      throw new Error("Summary agent failed");
    }

    // 5. Save Final Outputs to Firestore
    await db.collection('lectures').doc(lectureId).update({
      status: 'completed',
      'outputs.markdownNotes': structuredNotes.markdownContent,
      'outputs.mermaidMindMap': structuredNotes.mermaidMindMap,
      'outputs.finalSummary': summaryData.shortSummary,
      updatedAt: new Date()
    });

    // Save Assessments
    const batch = db.batch();
    
    summaryData.mcqs.forEach((mcq, i) => {
      const ref = db.collection('lectures').doc(lectureId).collection('assessments').doc(`mcq_${i}`);
      batch.set(ref, { 
        type: 'mcq', 
        content: mcq 
      });
    });

    summaryData.flashcards.forEach((card, i) => {
      const ref = db.collection('lectures').doc(lectureId).collection('assessments').doc(`flashcard_${i}`);
      batch.set(ref, { 
        type: 'flashcard', 
        content: card 
      });
    });

    await batch.commit();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Finalization Error:", error);
    return NextResponse.json({ error: "Finalization failure" }, { status: 500 });
  }
}
