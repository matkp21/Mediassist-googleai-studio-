import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { defineFirestoreRetriever } from '@genkit-ai/firebase';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps } from 'firebase-admin/app';

if (!getApps().length) {
 initializeApp();
}

const firestore = getFirestore();
const ai = genkit({ plugins: [googleAI()] });

/**
 * Architectural Mapping: Feature 6 (Deep Research).
 * Defines a Genkit Firestore Retriever targeting the user's Knowledge Hub.
 * Utilized by the MCQ Generator and Smart Note Summarizer.
 */
export const studyLibraryRetriever = defineFirestoreRetriever(ai, {
 name: 'studyLibraryRetriever',
 firestore,
 collection: 'knowledge_hub_notes',
 contentField: 'noteContent',      
 vectorField: 'embedding',          
 embedder: ai.embedder('googleai/text-embedding-004'), 
 distanceMeasure: 'COSINE',         
});

/**
 * Helper to retrieve grounded study context for a student.
 */
export async function retrieveStudyContext(studentId: string, topicQuery: string) {
 try {
   const docs = await ai.retrieve({
     retriever: studyLibraryRetriever,
     query: topicQuery,
     options: {
       limit: 5, 
       // Strict isolation: only retrieve notes belonging to the current student
       where: { studentId: studentId }, 
     },
   });

   return docs.map(doc => ({
     text: doc.content.text,
     topic: doc.metadata?.topicTag || 'Uncategorized',
   }));
 } catch (error) {
   console.error("Knowledge Hub retrieval failed, falling back to basic query:", error);
   
   // Fallback: Basic keyword search if vector index is not ready
   const hubRef = firestore.collection('knowledge_hub_notes');
   const q = hubRef.where('studentId', '==', studentId).limit(5);
   const snap = await q.get();
   
   return snap.docs.map(doc => ({
     text: doc.data().noteContent,
     topic: doc.data().topicTag || 'Uncategorized'
   }));
 }
}
