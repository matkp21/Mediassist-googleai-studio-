import { genkit, z } from 'genkit';
import { vertexAI } from '@genkit-ai/google-genai';
import { vertexAiRetrieverRef } from '@genkit-ai/vertexai';

// Initialize a scoped AI instance specifically for Vertex AI and RAG
// This ensures that we strictly route these requests to Vertex AI
// allowing Google App Builder/Vertex Search trial credits to be utilized.
export const ragAi = genkit({
  plugins: [vertexAI({ location: 'us-central1' })],
});

// Configure the connection to your GenAI App Builder (Vertex AI Search) datastore
export const medicalKnowledgeRetriever = vertexAiRetrieverRef({
  indexId: 'YOUR_VERTEX_SEARCH_INDEX_ID',
  displayName: 'medical_guidelines_index',
});

// 2. Build the Cost-Efficient RAG Flow
export const clinicalStudyFlow = ragAi.defineFlow(
  {
    name: 'clinicalStudyFlow',
    inputSchema: z.object({ query: z.string() }),
    // Enforcing structured output saves tokens by avoiding conversational "fluff"
    outputSchema: z.object({ 
      answer: z.string(),
      sources: z.array(z.string())
    }),
  },
  async ({ query }) => {
    // 1. Retrieve only the most relevant snippets (Uses App Builder credits via Vertex Search)
    const docs = await ragAi.retrieve({
      retriever: medicalKnowledgeRetriever,
      query: query,
      options: { k: 3 }, // Limit to top 3 results to keep prompt size tiny and concise
    });

    // 2. Generate the final answer using a fast, cheap model
    const response = await ragAi.generate({
      // Using vertexai/gemini-2.5-flash alias (or gemini-2.5-flash) to save on token costs
      model: 'vertexai/gemini-2.5-flash',
      prompt: `
        You are a medical tutor. Answer the student's question using ONLY the provided context.
        Question: ${query}
      `,
      docs, // Genkit automatically injects the retrieved documents into the context
      output: {
        schema: z.object({
          answer: z.string(),
          sources: z.array(z.string())
        })
      }
    });

    return response.output()!;
  }
);
