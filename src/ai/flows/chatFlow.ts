import { z } from "genkit";
import { ai } from "@/ai/genkit";
import { ChatInputSchema } from "@/lib/schemas/medi-schemas";

import * as admin from 'firebase-admin';
import { db } from "@/lib/firebase-admin";

import * as tools from "@/ai/tools";

export const chatFlow = ai.defineFlow(
  {
    name: "chatFlow",
    inputSchema: ChatInputSchema,
    outputSchema: z.object({
      response: z.string(),
      sessionId: z.string(),
      toolsUsed: z.array(z.string()),
    }),
  },
  async (input, { context }) => {
    const uid = (context as any)?.auth?.uid || (input as any).uid || 'guest-user';
    
    // Load session history
    const sessionRef = db.collection("sessions").doc(input.sessionId);
    const sessionSnap = await sessionRef.get();
    const history = sessionSnap.exists ? (sessionSnap.data()?.messages ?? []) : [];

    // Map input tool names to actual tool objects
    const toolMap: Record<string, any> = {
      "calculateBMI": tools.bmiCalculator,
      "calculateGFR": tools.gfrCalculator,
      "calculatePediatricDosage": tools.pediatricDosageCalculator,
      "analyzeVitalSigns": tools.vitalSignsAnalyzer,
      "academicPaperSearch": tools.paperSearchTool,
      "ragRetrieval": tools.ragTool,
      "webSearch": tools.webSearchTool,
      "checkMedicationSafety": tools.medicationSafetyTool,
    };

    const activeTools = input.tools
      .map(name => toolMap[name])
      .filter(Boolean);

    const response = await ai.generate({
      model: 'googleai/gemini-3.0-flash',
      tools: activeTools,
      system: `You are MediAssistant, a professional clinical companion. 
      Use tools when necessary to provide accurate medical calculations and literature search.
      Current user ID: ${uid}`,
      messages: [
        ...history.map((m: any) => ({ role: m.role, content: [{ text: m.content }] })),
        { role: "user", content: [{ text: input.message }] },
      ],
    });

    const assistantText = response.text;

    await sessionRef.set({
      uid,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      messages: admin.firestore.FieldValue.arrayUnion(
        { role: "user", content: input.message, timestamp: Date.now() },
        { role: "assistant", content: assistantText, timestamp: Date.now() }
      ),
    }, { merge: true });

    return { response: assistantText, sessionId: input.sessionId, toolsUsed: input.tools };
  }
);
