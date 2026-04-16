import { z } from 'genkit';
import { ai } from '@/ai/genkit';

// Securing the task update tool to prevent cross-tenant data corruption
export const secureStudyPlanUpdateFlow = ai.defineFlow(
  {
    name: 'secureStudyPlanUpdate',
    inputSchema: z.object({ 
      studentId: z.string(), 
      taskId: z.string(), 
      score: z.number() 
    }),
    outputSchema: z.boolean(),
    
    // Strictly enforce that the authenticated user token matches the target studentId
    authPolicy: (auth, input) => {
      if (!auth) {
        throw new Error('Authorization required: Missing bearer token.');
      }
      
      // Assuming the auth object has a uid property (e.g., from Firebase Auth)
      const uid = (auth as any).uid;
      
      if (input.studentId !== uid) {
        // Blocks execution before the LLM is even invoked
        throw new Error('Security Violation: You may only update your own study tasks. Cross-user access denied.');
      }
    }
  },
  async (input) => {
     // Execute internal Firestore updates...
     console.log(`[Secure Update] Updating task ${input.taskId} for student ${input.studentId} with score ${input.score}`);
     return true;
  }
);
