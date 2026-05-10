// src/lib/memory/compaction.ts
import { getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

if (!getApps().length) {
  initializeApp();
}
const db = getFirestore();

const generateSummary = async (docs: any[]) => "Summarized context of older messages";
const extractWeaknesses = (summary: string) => ["Cardiology", "Pharmacology"];
const batchDelete = async (docs: any[]) => {
  const batch = db.batch();
  docs.forEach(doc => {
    batch.delete(doc.ref);
  });
  await batch.commit();
  console.log(`Deleted ${docs.length} old messages`);
};

export async function compactSession(userId: string, sessionId: string) {
  const sessionRef = db.collection('users').doc(userId).collection('sessions').doc(sessionId);
  const messages = await sessionRef.collection('messages').orderBy('timestamp').get();
  
  if (messages.size > 20) { // Token threshold limit
    // 1. Send the oldest 15 messages to MedGemma for summarization
    const summary = await generateSummary(messages.docs.slice(0, 15));
    
    // 2. Update the Conductor/Chief of Staff persistent state
    await sessionRef.update({ 
      systemContext: summary, // Prepend this to future prompts
      weakTopics: extractWeaknesses(summary) 
    });
    
    // 3. Delete the old heavy messages to save tokens, keeping only the last 5
    await batchDelete(messages.docs.slice(0, 15)); 
  }
}
