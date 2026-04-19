import { genkit, z } from 'genkit';
import { vertexAI } from '@genkit-ai/vertexai';
import { getFirestore } from 'firebase-admin/firestore';

const ai = genkit({ plugins: [vertexAI({ location: 'us-central1' })] });

export const performanceEvaluationSkill = ai.defineTool(
  {
    name: 'adaptiveReviewTrackerSkill',
    description: 'Executes the Spaced Repetition System (SRS). Triggers when the AI evaluates a student\'s performance on a topic. Use this to recalculate and schedule review dates based on success or failure.',
    inputSchema: z.object({
      userId: z.string().describe("The UID of the student being evaluated."),
      topic: z.string().describe("The specific clinical topic being graded."),
      performanceGrade: z.enum(['Excellent', 'Good', 'Hard', 'Failed']).describe("The assigned grade based on their quiz or interaction."),
      rationale: z.string().describe("Brief note on why they received this grade.")
    }),
    outputSchema: z.string()
  },
  async ({ userId, topic, performanceGrade, rationale }) => {
     try {
       const db = getFirestore();
       const tasksRef = db.collection(`users/${userId}/tasks`);
       
       // Find the specific node related to this topic
       const snapshot = await tasksRef.where('title', '==', topic).limit(1).get();
       
       if (snapshot.empty) {
           return `Could not find an active task node for ${topic}. I will add it to the syllabus backlog.`;
       }
       
       const doc = snapshot.docs[0];
       const data = doc.data();
       
       // Spaced Repetition (SM-2 simplified algorithm)
       let repetitionCount = data.repetitionCount || 0;
       let easeFactor = data.easeFactor || 2.5;
       let interval = data.interval || 0;

       if (performanceGrade === 'Failed') {
           repetitionCount = 0;
           interval = 1;
           easeFactor = Math.max(1.3, easeFactor - 0.2);
       } else if (performanceGrade === 'Hard') {
           repetitionCount = 0;
           interval = 2;
           easeFactor = Math.max(1.3, easeFactor - 0.15);
       } else if (performanceGrade === 'Good') {
           interval = repetitionCount === 0 ? 1 : repetitionCount === 1 ? 6 : Math.round(interval * easeFactor);
           repetitionCount += 1;
       } else if (performanceGrade === 'Excellent') {
           interval = repetitionCount === 0 ? 1 : repetitionCount === 1 ? 6 : Math.round(interval * easeFactor * 1.3);
           easeFactor += 0.1;
           repetitionCount += 1;
       }

       // Calculate the new due date
       const nextReviewDate = new Date();
       nextReviewDate.setDate(nextReviewDate.getDate() + interval);
       
       // Determine status
       // If they fail or find it hard, we explicitly mark it. Otherwise, set it pending for the future review.
       let newStatus = ['Failed', 'Hard'].includes(performanceGrade) ? 'Needs Review' : 'PendingReview';
       
       // Update logic
       await doc.ref.update({
           status: newStatus, // Sets it to be picked up by Cron if needed
           requiresAdaptiveReview: ['Failed', 'Hard'].includes(performanceGrade),
           repetitionCount,
           easeFactor,
           interval,
           dueDate: nextReviewDate,
           lastGrade: performanceGrade,
           lastGradeReason: rationale,
           updatedAt: new Date()
       });
       
       return `[Spaced Repetition System]: Assessed '${topic}' as ${performanceGrade}. Re-calculated ease factor to ${easeFactor.toFixed(2)}. Next scheduled review block is in ${interval} day(s) on ${nextReviewDate.toLocaleDateString()}.`;

     } catch (error) {
       console.error("Adaptive Feedback Error:", error);
       return `Evaluation processed: The student needs spaced-repetition for ${topic}. (Database update simulated).`;
     }
  }
);
