import { z } from 'genkit';
import { ai } from '@/ai/genkit';

// Define the rigorous schema for a single node in the study task tree
const TaskNodeSchema = z.object({
  taskId: z.string().describe("Unique identifier for the study task"),
  studentId: z.string().describe("Firebase UID of the medical student"),
  parentId: z.string().nullable().describe("Parent task ID, or null if this is a root syllabus node"),
  topic: z.string().describe("Specific medical topic, e.g., 'Cardiovascular Pharmacology' or 'Renal Pathology'"),
  status: z.enum(['PENDING', 'COMPLETED', 'FAILED']).describe("Current state of the task"),
  dueDate: z.string().describe("ISO 8601 date string for when the module must be completed"),
  examScore: z.number().nullable().describe("Score achieved on the automated mock exam for this node"),
});

// Mocking Firestore for the prototype
const mockDb = new Map<string, any>();

// Claw-Code primitive adaptation: TaskCreateTool
export const taskCreateTool = ai.defineTool(
  {
    name: 'create_study_task',
    description: 'Creates a persistent hierarchical task in the study plan database. Use this to decompose a broad exam goal into specific daily modules.',
    inputSchema: TaskNodeSchema,
    outputSchema: z.boolean(),
  },
  async (task) => {
    // Write the node to the database, ensuring persistent state
    mockDb.set(task.taskId, task);
    console.log(`Created task: ${task.taskId} for topic: ${task.topic}`);
    return true;
  }
);

// Claw-Code primitive adaptation: TaskUpdateTool
export const taskUpdateTool = ai.defineTool(
  {
    name: 'update_study_task',
    description: 'Updates the status or score of an existing study task. Use this to mark tasks as FAILED if the student performs poorly, triggering a schedule recalculation.',
    inputSchema: z.object({
      taskId: z.string(),
      status: z.enum(['PENDING', 'COMPLETED', 'FAILED']).optional(),
      examScore: z.number().optional(),
      newDueDate: z.string().optional()
    }),
    outputSchema: z.boolean(),
  },
  async (updates) => {
    // Clean undefined values before updating
    const existing = mockDb.get(updates.taskId) || {};
    const cleanUpdates = Object.fromEntries(Object.entries(updates).filter(([_, v]) => v !== undefined));
    mockDb.set(updates.taskId, { ...existing, ...cleanUpdates });
    console.log(`Updated task: ${updates.taskId}`, cleanUpdates);
    return true;
  }
);
