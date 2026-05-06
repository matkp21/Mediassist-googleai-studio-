import { generate } from '@genkit-ai/ai';

import { ai } from '@/ai/genkit';
import { ProWorkflowChatinputSchema, ProWorkflowChatOutputSchema, type ProWorkflowChatinput, type ProWorkflowChatOutput } from '@/ai/schemas/pro-schemas';

export const ProWorkflowChatbotAgent = ai.defineAction(
  {
    name: 'ProWorkflowChatbotAgent',
    inputSchema: ProWorkflowChatinputSchema,
    outputSchema: ProWorkflowChatOutputSchema,
  },
  async (input: ProWorkflowChatinput): Promise<ProWorkflowChatOutput> => {
    const prompt = `You are an expert context-aware administrative clinical workflow chatbot. 
Respond to the doctor's query, keep it extremely concise. 
If there's context, incorporate it into your administrative troubleshooting or coordination logic.

User Query: ${input.message}
Context: ${input.context || 'None'}
`;

    const response = await generate({
      model: 'googleai/gemini-3.0-flash',
      prompt: prompt,
      output: {
        schema: ProWorkflowChatOutputSchema,
      },
    });

    return response.output();
  }
);
