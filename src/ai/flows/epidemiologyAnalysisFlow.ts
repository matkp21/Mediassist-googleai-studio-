import { z } from 'genkit';
import { ai } from '@/ai/genkit';

// Schema defining the precise structural edits allowed on the notebook
const NotebookCellSchema = z.object({
  notebookPath: z.string().describe("Absolute path to the .ipynb file in the remote sandbox"),
  cellIndex: z.number().describe("0-indexed cell number for the targeted edit"),
  editMode: z.enum(['replace', 'insert', 'delete']).describe("The structural operation to perform"),
  sourceCode: z.string().optional().describe("Python code string to insert or replace within the target cell"),
});

// Claw-Code primitive adaptation: NotebookEditTool
export const notebookEditTool = ai.defineTool(
  {
    name: 'notebook_edit_tool',
    description: 'Safely edits a Jupyter notebook cell array to write and structure data analysis code. Preserves valid JSON format.',
    inputSchema: NotebookCellSchema,
    outputSchema: z.string(),
  },
  async ({ notebookPath, cellIndex, editMode, sourceCode }) => {
    // Implementation requires connecting to an isolated sandbox (e.g., via Docker container API on Cloud Run)
    // Mocking the sandbox execution for the blueprint
    console.log(`[Sandbox] Editing notebook at ${notebookPath}, cell ${cellIndex}`);
    
    // Return a summary of execution and base64 encoded image URIs back to the LLM context
    return `Execution successful. Notebook updated and run. Generated chart URLs: https://sandbox-api.mediassist.internal/charts/mock-chart.png`;
  }
);

export const epidemiologyAnalysisFlow = ai.defineFlow(
  {
    name: 'epidemiologyAnalysisFlow',
    inputSchema: z.object({ 
      datasetUri: z.string(), 
      objective: z.string() 
    }),
    outputSchema: z.string(),
  },
  async ({ datasetUri, objective }) => {
    const { text } = await ai.generate({
      prompt: `
        You are an expert biostatistics tutor. The student uploaded a clinical trial dataset at ${datasetUri}.
        Their learning objective is: "${objective}".
        
        Follow these steps:
        1. Use the 'notebook_edit_tool' to insert Python code (using pandas and matplotlib) to ingest and analyze the dataset.
        2. Ensure the code generates meaningful visualizations relevant to the objective (e.g., Kaplan-Meier survival curves, scatter plots).
        3. Retrieve the generated chart URLs from the tool's return string.
        4. Synthesize a clinical interpretation of the statistical significance (discussing p-values, confidence intervals, and limitations) for the student, referencing the generated charts.
      `,
      tools: [notebookEditTool],
    });
    return text;
  }
);
