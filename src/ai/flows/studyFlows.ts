import { genkit, z } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { collection, addDoc, query, where, getDocs, updateDoc, doc, serverTimestamp, orderBy, limit } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { createTaskTool, listTasksTool } from '../tools/taskTools';
import { pubmedSearchTool } from '../tools/mcpTools';

const ai = genkit({ 
  plugins: [googleAI()],
  model: 'googleai/gemini-2.0-flash'
});

/**
 * Architectural Mapping: Step 1 (Dynamic Syllabus Decomposition).
 * Decomposes a broad study goal into a hierarchical task tree in Firestore.
 */
export const decomposeStudyGoalFlow = ai.defineFlow(
  {
    name: 'decomposeStudyGoal',
    inputSchema: z.object({ userId: z.string(), goal: z.string() }),
    outputSchema: z.object({ planId: z.string(), subTasksCount: z.number() }),
  },
  async ({ userId, goal }) => {
    // 1. Generate Decomposition Plan
    const response = await ai.generate({
      prompt: `You are a medical education planning agent. 
      Analyze the study goal: "${goal}".
      Decompose it into 5-8 logical sub-modules (tasks).
      Assign priority and estimated complexity.`,
      output: {
        format: 'json',
        schema: z.array(z.object({
          title: z.string(),
          description: z.string(),
          priority: z.enum(['low', 'medium', 'high', 'critical']),
        }))
      }
    });

    const subTasks = response.output()!;

    // 2. Create the Parent Plan Node
    const parentTask = await createTaskTool.execute({
      title: `Plan: ${goal}`,
      description: `Comprehensive study plan for ${goal}`,
      status: 'in-progress',
      priority: 'high',
      category: 'study-plan',
      metadata: { userId, originalGoal: goal }
    });

    // 3. Create Child Nodes
    for (const task of subTasks) {
      await createTaskTool.execute({
         title: task.title,
         description: task.description,
         status: 'pending',
         priority: task.priority,
         parentId: parentTask.output.taskId,
         category: 'study-plan',
         metadata: { userId }
      });
    }

    return { planId: parentTask.output.taskId, subTasksCount: subTasks.length };
  }
);

/**
 * Architectural Mapping: Step 2 & 3 (Proactive Coaching & MCP Grounding).
 * Generates a "Daily Study Packet" in the required medical format.
 */
export const generateDailyStudyPacketFlow = ai.defineFlow(
  {
    name: 'generateDailyStudyPacket',
    inputSchema: z.object({ userId: z.string(), taskId: z.string() }),
    outputSchema: z.object({
       topic: z.string(),
       content: z.object({
          definition: z.string(),
          etiology: z.string(),
          clinicalFeatures: z.string(),
          investigations: z.string(),
          management: z.string(),
          flowchart: z.string(),
          highYieldPoints: z.array(z.string()),
          latestUpdates: z.string()
       })
    })
  },
  async ({ userId, taskId }) => {
    // 1. Get task details
    const tasksRef = collection(firestore, 'tasks');
    const taskSnap = await getDocs(query(tasksRef, where('__name__', '==', taskId)));
    const taskData = taskSnap.docs[0].data();

    // 2. Grounding: Fetch Latest Updates via MCP PubMed Tool
    const research = await pubmedSearchTool.execute({ query: taskData.title });
    const latestCitations = research.output.results.map(r => `${r.title} (PMID: ${r.pmid})`).join('\n');

    // 3. Generate Structured Packet
    const response = await ai.generate({
       system: "You are an expert medical study coach. Format all output in the strictly required syllabus structure.",
       prompt: `Prepare a complete knowledge study packet for the topic: ${taskData.title}.
       Description: ${taskData.description}
       
       Include these sections:
       1. Definition
       2. Etiology
       3. Clinical Features
       4. Investigations
       5. Management
       6. Flowchart (Text representation)
       7. High-yield points
       
       Use this latest clinical research summary for the 'Latest Updates' section:
       ${latestCitations}`,
       output: {
          format: 'json',
          schema: z.object({
             topic: z.string(),
             definition: z.string(),
             etiology: z.string(),
             clinicalFeatures: z.string(),
             investigations: z.string(),
             management: z.string(),
             flowchart: z.string(),
             highYieldPoints: z.array(z.string()),
             latestUpdates: z.string()
          })
       }
    });

    const packet = response.output()!;

    // 4. Update task metadata with the packet (to make it persistent)
    const taskRef = doc(firestore, 'tasks', taskId);
    await updateDoc(taskRef, {
       'metadata.studyPacket': packet,
       status: 'in-progress'
    });

    return { topic: packet.topic, content: packet };
  }
);

/**
 * Architectural Mapping: Step 4 (Adaptive Feedback).
 * Updates task status and recalculates spaced repetition based on performance.
 */
export const updateStudyPerformanceFlow = ai.defineFlow(
  {
    name: 'updateStudyPerformance',
    inputSchema: z.object({ userId: z.string(), taskId: z.string(), score: z.number().min(0).max(100) }),
    outputSchema: z.object({ newStatus: z.string(), nextReviewDate: z.string() }),
  },
  async ({ userId, taskId, score }) => {
    const taskRef = doc(firestore, 'tasks', taskId);
    
    let newStatus: 'completed' | 'pending' | 'in-progress' = 'completed';
    let daysToAdd = 7;

    if (score < 60) {
      newStatus = 'pending'; // Needs redo
      daysToAdd = 1;
    } else if (score < 85) {
      newStatus = 'completed';
      daysToAdd = 3;
    }

    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + daysToAdd);

    await updateDoc(taskRef, {
       status: newStatus,
       'metadata.lastScore': score,
       'metadata.nextReviewDate': nextReview.toISOString(),
       updatedAt: serverTimestamp()
    });

    // Pattern: Recalculate Timeline (Simplified)
    console.log(`[STUDY:ADAPTIVE] Task ${taskId} updated to ${newStatus}. Score: ${score}. Next review: ${nextReview.toISOString()}`);

    return { newStatus, nextReviewDate: nextReview.toISOString() };
  }
);
