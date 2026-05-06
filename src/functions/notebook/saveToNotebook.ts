import { genkit, z } from "genkit";
import { googleAI } from "@genkit-ai/googleai";
import { getFirestore } from "firebase-admin/firestore";

const ai = genkit({ plugins: [googleAI()] });

export const saveToNotebookFlow = ai.defineFlow(
  {
    name: "saveToNotebook",
    inputSchema: z.object({
      uid: z.string(),
      notebookId: z.string(),
      type: z.enum(["chat", "research", "snippet", "edit"]),
      title: z.string(),
      content: z.string(),
      metadata: z.record(z.any()).optional(),
    }),
    outputSchema: z.object({ success: z.boolean(), recordId: z.string() }),
  },
  async (input) => {
    const db = getFirestore();
    const ref = await db.collection("users").doc(input.uid)
      .collection("notebooks").doc(input.notebookId)
      .collection("records").add({
        ...input,
        createdAt: Date.now(),
      });
    return { success: true, recordId: ref.id };
  }
);
