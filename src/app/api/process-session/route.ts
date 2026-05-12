import { NextResponse } from 'next/server';
import { 
  flow1Transcription, 
  flow2TopicExtraction, 
  flow3Structuring, 
  flow4EnhancementAndStorage 
} from '@/ai/meeting-flows';

export async function POST(req: Request) {
  try {
    const { uid, sessionId, audioFilePath } = await req.json();

    if (!uid || !sessionId || !audioFilePath) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    console.log(`[Session ${sessionId}] Starting Orchestration Pipeline...`);

    // Flow 1: Audio -> Raw Transcript
    const rawTranscript = await flow1Transcription(audioFilePath);

    // Flow 2: Raw Transcript -> TopicTree JSON
    const topicTree = await flow2TopicExtraction(rawTranscript);

    // Flow 3: TopicTree + Transcript -> Markdown
    const structuredMarkdown = await flow3Structuring(topicTree, rawTranscript);

    // Flow 4: Markdown -> Enhancements -> Firestore DB
    const finalData = await flow4EnhancementAndStorage(structuredMarkdown, uid, sessionId);

    console.log(`[Session ${sessionId}] Pipeline Completed Successfully.`);

    return NextResponse.json({ 
      success: true, 
      message: 'Lecture processed and stored.',
      notesPreview: structuredMarkdown.substring(0, 200) + "..."
    });

  } catch (error: any) {
    console.error("Orchestration Pipeline Failed:", error);
    
    // Graceful error handling for the frontend
    return NextResponse.json({ 
      error: 'Failed to process lecture session', 
      details: error.message 
    }, { status: 500 });
  }
}
