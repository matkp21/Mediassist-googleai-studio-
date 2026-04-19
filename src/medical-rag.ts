import { genkit, z } from 'genkit';
import { vertexAI } from '@genkit-ai/vertexai';
import { vertexAiRetrieverRef } from '@genkit-ai/vertexai'; // Adjusted from /vectorsearch to standard export based on typical genkit v1 layout

// 1. TURN ON GENKIT & VERTEX AI
// This connects your code to your Google Cloud account using your trial credits.
export const ragAi = genkit({
  plugins: [vertexAI({ location: 'us-central1' })],
});

// 2. CONNECT TO YOUR MEDICAL DOCUMENTS
// Replace 'YOUR_DATA_STORE_ID' with the ID you got from Google Cloud in Step 1.
export const medicalRetriever = vertexAiRetrieverRef({
  indexId: 'YOUR_DATA_STORE_ID', 
});

// 3. CREATE THE RAG WORKFLOW (FLOW)
// A "Flow" is a secure, server-side function that takes a question and returns an answer.
export const medicalStudyTutor = ragAi.defineFlow(
  {
    name: 'medicalStudyTutor',
    // We expect the user to ask a question as a string of text
    inputSchema: z.object({ question: z.string() }),
    // We will return the answer as a string of text
    outputSchema: z.string(),
  },
  async ({ question }) => {
    
    // STEP A: SEARCH THE DOCUMENTS
    // The code looks at the student's question, goes to your Vertex AI database, 
    // and pulls out the 3 most relevant paragraphs from your uploaded PDFs.
    const searchResults = await ragAi.retrieve({
      retriever: medicalRetriever,
      query: question,
      options: { k: 3 }, 
    });

    // STEP B: GENERATE THE ANSWER
    // We pass the question AND the documents we just found to the AI.
    const response = await ragAi.generate({
      model: 'vertexai/gemini-2.5-flash', // We use the fast, cheap "Flash" model
      prompt: `
        You are a helpful medical study tutor. 
        Answer the student's question using ONLY the provided medical context.
        If the answer is not in the context, do not guess. Simply say: "I don't have enough information in my study materials to answer that."
        
        Student's Question: ${question}
      `,
      // Genkit automatically injects the paragraphs from Step A into the AI's brain here
      docs: searchResults, 
    });

    // Return the final answer to the user
    return response.text;
  }
);
