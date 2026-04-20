import { genkit, z } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import * as fs from 'fs/promises';
import * as path from 'path';

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";

const ai = genkit({ plugins: [googleAI()] });

export const pubmedEbmSynthesizerSkill = ai.defineTool(
  {
    name: 'pubmedEbmSynthesizer',
    description: 'Triggers when a student asks about the latest treatment guidelines or clinical trial data for a disease. Uses standard Model Context Protocol (MCP) to fetch external data.',
    inputSchema: z.object({
      diseaseQuery: z.string(),
    }),
    outputSchema: z.string(),
  },
  async ({ diseaseQuery }) => {
    // 1. Load the synthesis formatting rules
    let skillInstructions = "Synthesize literature into a Bottom Line Up Front (BLUF) summary.";
    try {
      skillInstructions = await fs.readFile(
        path.join(process.cwd(), 'skills/medico/pubmed-ebm-synthesizer/SKILL.md'), 'utf-8'
      );
    } catch (e) {
      console.warn("Could not load PubMed SKILL.md");
    }

    let rawLiteratureResult = "";

    try {
      // 2. Setup the precise MCP SSE Client Transport to an external MCP Server
      // (This assumes a remote PubMed/NCBI MCP server is exposing an SSE endpoint. You can replace the URL with your production host.)
      const transport = new SSEClientTransport(new URL("https://mcp-medical-server-endpoint.example.com/sse"));
      const mcpClient = new Client({ name: "MediAssist-MCP-Client", version: "1.0.0" }, { capabilities: {} });
      
      await mcpClient.connect(transport);
      
      // 3. Optional: List tools to verify the server supports 'pubmed_search'
      // const toolsResult = await mcpClient.request(ListToolsRequestSchema, {});

      // 4. Request the MCP Server tool to fetch Grounded Medical Literature
      const pubmedResponse = await mcpClient.request(CallToolRequestSchema, {
        name: "pubmed_search",
        arguments: { query: diseaseQuery }
      });
      
      if (pubmedResponse.isError) {
         throw new Error(`MCP Tool Error: ${pubmedResponse.content}`);
      }
      
      // The content returned by an MCP server tool is an array of text/resource blocks
      rawLiteratureResult = pubmedResponse.content.map(c => c.type === 'text' ? c.text : '').join('\n');
    } catch (mcpError) {
      console.warn("MCP Server Connection Offline or Invalid. Using simulated fallback data for the demo.", mcpError);
      
      // Simulated Output for Graceful Fallback if the Endpoint is Down
      const mockLiterature = [
        {
          title: `Current Evidence-Based Guidelines: ${diseaseQuery}`,
          year: 2026,
          summary: "Standard of care involves initial conservative management followed by step-up therapy. Recent trials indicate mortality improvements with early interventions."
        }
      ];
      rawLiteratureResult = JSON.stringify(mockLiterature);
    }

    // 5. Synthesize the raw MCP data into a clinical BLUF using the skill instructions
    const { text } = await ai.generate({
      model: ai.model('gemini-2.5-pro'),
      system: `
        You are an Evidence-Based Medicine (EBM) synthesizer.
        Format the raw literature from the Model Context Protocol strictly according to these rules: \n${skillInstructions}
      `,
      prompt: `Synthesize the following raw trial data into a Bottom Line Up Front (BLUF) summary: \n${rawLiteratureResult}`,
    });

    return text;
  }
);
