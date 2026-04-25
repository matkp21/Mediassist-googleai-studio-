import { ai } from '../genkit';
import { z } from 'zod';
import { collection, addDoc, query, where, getDocs, updateDoc, doc, serverTimestamp, orderBy } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';

/**
 * CLAW-CODE Inspired: Planning & Task Trees
 * Enables the agent to build and manage persistent, hierarchical task trees.
 */

export const TaskSchema = z.object({
  id: z.string().optional(),
  title: z.string(),
  description: z.string(),
  status: z.enum(['pending', 'in-progress', 'completed', 'blocked']),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  parentId: z.string().optional().describe("ID of the parent task for hierarchical structures"),
  category: z.enum(['study-plan', 'clinical-simulation', 'research-project', 'exam-prep']),
  deadline: z.string().optional(),
  metadata: z.record(z.any()).optional()
});

export const createTaskTool = ai.defineTool({
  name: 'createTask',
  description: 'Creates a new task in the hierarchical task tree. Useful for study plans or clinical case management.',
  inputSchema: TaskSchema.omit({ id: true }),
  outputSchema: z.object({ taskId: z.string(), success: z.boolean() })
}, async (input) => {
  const tasksRef = collection(firestore, 'tasks');
  const docRef = await addDoc(tasksRef, {
    ...input,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return { taskId: docRef.id, success: true };
});

export const updateTaskTool = ai.defineTool({
  name: 'updateTask',
  description: 'Updates an existing task status, priority, or metadata.',
  inputSchema: z.object({
    taskId: z.string(),
    updates: TaskSchema.partial().omit({ id: true })
  }),
  outputSchema: z.object({ success: z.boolean() })
}, async (input) => {
  const taskRef = doc(firestore, 'tasks', input.taskId);
  await updateDoc(taskRef, {
    ...input.updates,
    updatedAt: serverTimestamp()
  });
  return { success: true };
});

export const listTasksTool = ai.defineTool({
  name: 'listTasks',
  description: 'Lists tasks, optionally filtered by parentId or category.',
  inputSchema: z.object({
    parentId: z.string().optional(),
    category: z.string().optional()
  }),
  outputSchema: z.array(TaskSchema)
}, async (input) => {
  const tasksRef = collection(firestore, 'tasks');
  let q = query(tasksRef, orderBy('createdAt', 'desc'));
  
  if (input.parentId) {
    q = query(tasksRef, where('parentId', '==', input.parentId), orderBy('createdAt', 'desc'));
  } else if (input.category) {
    q = query(tasksRef, where('category', '==', input.category), orderBy('createdAt', 'desc'));
  }

  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as z.infer<typeof TaskSchema>));
});

/**
 * PLAN MODE: Inspired by EnterPlanModeTool / ExitPlanModeTool
 */
export const setPlanModeTool = ai.defineTool({
  name: 'setPlanMode',
  description: 'Toggles the AI between "thinking/planning" and "executing". Use "thinking" to generate a detailed multi-step strategy before calling execution tools.',
  inputSchema: z.object({
    mode: z.enum(['thinking', 'executing']),
    objective: z.string().describe("The high-level objective being planned for")
  }),
  outputSchema: z.object({ status: z.string() })
}, async (input) => {
  // In a real implementation, this might update a session state in Firestore
  return { status: `Mode set to ${input.mode} for objective: ${input.objective}` };
});
