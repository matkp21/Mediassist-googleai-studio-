import { defineTool } from '@genkit-ai/ai';
import { z } from 'zod';

// Replace with your actual Google Cloud Run URL
const CRAWL4AI_ENDPOINT = process.env.CRAWL4AI_API_URL || "https://crawl4ai-service-xxxxx-uc.a.run.app/crawl";

export const webScraperTool = defineTool(
  {
    name: 'webScraper',
    description: 'Extracts clean Markdown text from any webpage URL using Crawl4AI.',
    schema: z.object({
      url: z.string().url(),
    }),
  },
  async ({ url }) => {
    try {
      const response = await fetch(CRAWL4AI_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });

      if (!response.ok) throw new Error(`API returned ${response.status}`);

      const data = await response.json();
      
      // Prevent massive context window overflow
      let markdown = data.markdown;
      if (markdown && markdown.length > 25000) {
         markdown = markdown.substring(0, 25000) + "\n\n...[Truncated]";
      }
      return markdown || "No markdown extracted.";
    } catch (error: any) {
      return `Failed to scrape. Error: ${error.message}`;
    }
  }
);
