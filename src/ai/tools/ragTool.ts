import { z } from "genkit";
import { ai } from "@/ai/genkit";
import { db } from "@/lib/firebase-admin";

export const ragTool = ai.defineTool(
  {
    name: "ragRetrieval",
    description: "Search personal medical knowledge bases for relevant information.",
    inputSchema: z.object({
      query: z.string().describe("The medical question or topic to search for"),
      kbIds: z.array(z.string()).describe("Knowledge base IDs to search"),
      topK: z.number().default(5),
    }),
    outputSchema: z.array(z.object({
      text: z.string(),
      source: z.string(),
      fileName: z.string(),
      relevanceScore: z.number(),
    })),
  },
  async ({ query, kbIds, topK }) => {
    const results: any[] = [];

    for (const kbId of kbIds) {
      // In this studion environment, we'll use a simple keyword search in Firestore
      // as a placeholder for real vector search if not fully configured.
      const chunksSnap = await db.collection("knowledgeBases").doc(kbId)
        .collection("chunks")
        .limit(topK)
        .get();

      chunksSnap.forEach((snap) => {
        const data = snap.data();
        // Simple case-insensitive search simulation
        if (data.text.toLowerCase().includes(query.toLowerCase().split(" ")[0])) {
          results.push({
            text: data.text,
            source: kbId,
            fileName: data.fileName || "Unknown",
            relevanceScore: 0.9,
          });
        }
      });
    }

    return results.slice(0, topK);
  }
);
