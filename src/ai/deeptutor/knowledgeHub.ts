import { genkit, z } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { defineFirestoreRetriever } from '@genkit-ai/firebase';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps } from 'firebase-admin/app';

// Ensure the Firebase Admin SDK is initialized exactly once in the serverless environment
if (!getApps().length) {
 initializeApp();
}

const firestore = getFirestore();

// Initialize the Genkit instance, binding the Google AI plugin for embedding generation
const ai = genkit({
 plugins: [googleAI()],
});

/**
* Architectural Mapping: DeepTutor Knowledge Hub capability.
* This defines a Genkit Firestore Retriever targeting the 'clinical_guidelines' collection.
* It utilizes the text-embedding-004 model to perform vector similarity searches 
* on ingested medical documents, protocols, and pharmacological data.
*/
export const clinicalGuidelinesRetriever = defineFirestoreRetriever(ai, {
 name: 'clinicalGuidelinesRetriever',
 firestore,
 collection: 'clinical_guidelines',
 contentField: 'documentText',      // The Firestore field containing the raw medical text
 vectorField: 'embedding',          // The Firestore field storing the pre-computed vector
 embedder: ai.embedder('googleai/text-embedding-004'), // High-dimensionality embedder
 distanceMeasure: 'COSINE',         // COSINE similarity is optimal for semantic text analysis
});

/**
* FEATURE 31/32: Incremental Document Upload & KB Creation
* Ingests a new clinical document into the vector store.
*/
export async function ingestDocument(docId: string, text: string, metadata: Record<string, any> = {}) {
  try {
    // Generate embedding using the same model as the retriever
    const embeddingResponse = await ai.embed({
      embedder: ai.embedder('googleai/text-embedding-004'),
      content: text,
    });

    const embedding = embeddingResponse.embedding;

    // Save to Firestore
    await firestore.collection('clinical_guidelines').doc(docId).set({
      documentText: text,
      embedding: embedding,
      ...metadata,
      updatedAt: new Date().toISOString(),
    });

    return { success: true, docId };
  } catch (error) {
    console.error("Document ingestion failed:", error);
    throw new Error("Failed to index clinical document.");
  }
}

/**
* Executes an advanced RAG retrieval against the Firestore Knowledge Hub.
* This function handles the query vectorization and pre-filtering execution.
* 
* @param query - The natural language clinical question (e.g., "Contraindications for ACE inhibitors")
* @param specialty - An optional metadata filter to restrict the search space, reducing hallucinations
*/
export async function retrieveClinicalContext(query: string, specialty?: string) {
 try {
   // Genkit's unified retrieve interface orchestrates the embedding and the Firestore query
   const docs = await ai.retrieve({
     retriever: clinicalGuidelinesRetriever,
     query: query,
     options: {
       limit: 5, // Restrict context window to the top 5 most relevant clinical documents
       // Genkit allows pre-filtering metadata before the vector search executes
       where: specialty ? { specialtyField: specialty } : undefined,
     },
   });

   // Format and sanitize the retrieved documents for safe context injection into the LLM prompt
   return docs.map(doc => ({
     text: doc.content.text,
     metadata: doc.metadata,
     relevanceScore: doc.metadata?.distance
   }));
 } catch (error) {
   console.error("Clinical vector search retrieval failed due to upstream error:", error);
   throw new Error("Critical Failure: Unable to retrieve required clinical guidelines.");
 }
}
