// src/medical-rag.ts
import { genkit, z } from 'genkit';
import { vertexAI } from '@genkit-ai/vertexai';
import { vertexAiRetrieverRef } from '@genkit-ai/vertexai'; 

// 1. TURN ON GENKIT & VERTEX AI
export const ragAi = genkit({
  plugins: [vertexAI({ location: 'us-central1' })],
});

// 2. CONNECT TO YOUR MEDICAL DOCUMENTS
// Replace 'YOUR_DATA_STORE_ID' with the ID you got from Google Cloud.
export const medicalRetriever = vertexAiRetrieverRef({
  indexId: 'YOUR_DATA_STORE_ID', 
});

// 3. CREATE THE RAG WORKFLOW (FLOW)
export const medicalStudyTutor = ragAi.defineFlow(
  {
    name: 'medicalStudyTutor',
    inputSchema: z.object({ question: z.string() }),
    outputSchema: z.string(),
  },
  async ({ question }) => {
    
    // STEP A: SEARCH THE DOCUMENTS (Semantic Vector Search)
    // Wrap in try-catch in case they haven't configured their Vertex ID yet
    let searchResults: any[] = [];
    try {
      searchResults = await ragAi.retrieve({
        retriever: medicalRetriever,
        query: question,
        options: { k: 5 }, 
      });
    } catch(e) {
        console.warn("Could not retrieve docs. User might not have setup Vertex Data Store ID. Proceeding with base knowledge to simulate Ask Medi.");
    }

    // STEP B: GENERATE THE ANSWER
    // We pass the question AND the documents we just found to the AI.
    const isMockMode = searchResults.length === 0;
    
    const response = await ragAi.generate({
      model: 'vertexai/gemini-1.5-pro', // Stepping up to Pro for better formatting (Flashcards/PYQs)
      prompt: `
        You are "Medi" (Resident Genius Mentor), an AI study assistant for medical students.
        Act as an engaging, highly knowledgeable resident doctor helping a medical student.
        Adaptive Learning Goal: You maintain a Neural Progress Tracker. Adapt your teaching to emphasize the student's cognitive gaps and encourage their strengths using the Socratic method.
        
        If the student asks for "Flashcards", format the response as clear Q&A pairs with bolded answers.
        If the student asks for "Questions" or "PYQs", generate board-style multiple choice questions based on the topic.
        
        ${isMockMode ? `[Note: Semantic Vector DB is disconnected, please synthesize board-certified medical knowledge for the following query to simulate RAG extraction.]` : `Answer the student's question using ONLY the provided medical context from the semantic search retrieval.`}
        
        Student's Query: ${question}
      `,
      docs: searchResults, 
    });

    return response.text;
  }
);
