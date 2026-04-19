import { genkit, z } from 'genkit';
import { vertexAI } from '@genkit-ai/vertexai';
import { getFirestore } from 'firebase-admin/firestore';

const ai = genkit({ plugins: [vertexAI({ location: 'us-central1' })] });

export const syllabusDecompositionSkill = ai.defineTool(
  {
    name: 'syllabusDecompositionOrchestrator',
    description: 'Triggers when a student asks to decompose a broad study goal into a structured study schedule with specific modules and due dates (e.g., "Prepare for Pathology exam").',
    inputSchema: z.object({
      userId: z.string().describe("The UID of the user requesting the study plan."),
      studyGoal: z.string().describe("The overarching goal, e.g. 'Pathology Exam Prep'"),
      timeframeDays: z.number().describe("How many days the student has to achieve this goal.")
    }),
    outputSchema: z.object({
        status: z.string().describe("Confirmation message about the decomposed tasks."),
        tasks: z.array(z.string()).describe("The titles of the generated study modules.")
    }),
  },
  async ({ userId, studyGoal, timeframeDays }) => {
    // We use the AI to decompose the high-level goal into actionable study modules
    const prompt = `Decompose the overarching medical study goal "${studyGoal}" into exactly ${Math.min(timeframeDays, 14)} chronological daily study modules. For each module, provide only the title. Return as a JSON array of strings.`;
    
    // We use AI output to structure it
    const response = await ai.generate({
      model: 'vertexai/gemini-2.5-flash',
      prompt: prompt,
      output: {
          schema: z.array(z.string())
      }
    });

    const modules = response.output() || [];
    
    // In actual production, ensure firebase-admin is initialized.
    // For this context, we write to Firestore using dynamic node creation
    
    try {
      const db = getFirestore();
      
      const batch = db.batch();
      
      modules.forEach((mod, index) => {
          // Calculate due date based on index
          const dueDate = new Date();
          dueDate.setDate(dueDate.getDate() + index + 1);

          const taskRef = db.collection(`users/${userId}/tasks`).doc();
          batch.set(taskRef, {
              title: mod,
              isCompleted: false,
              goal: studyGoal,
              dueDate: dueDate,
              status: "Pending",
              requiresAdaptiveReview: false,
              repetitionCount: 0,
              easeFactor: 2.5,
              interval: 0,
              createdAt: new Date()
          });
      });
      
      await batch.commit();

      return {
          status: `Successfully decomposed "${studyGoal}" into ${modules.length} daily modules and queued them to your dashboard.`,
          tasks: modules
      };
    } catch (error) {
       console.error("Firestore persistence error:", error);
       return {
          status: `Generated modules but failed to persist to database. Please check Firebase configs.`,
          tasks: modules
       };
    }
  }
);
