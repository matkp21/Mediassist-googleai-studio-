import { defineTool } from '@genkit-ai/ai';
import { z } from 'zod';

export const pubMedSearchSkill = defineTool(
  {
    name: 'pubMedSearchSkill',
    description: 'Queries the NIH PubMed database for peer-reviewed medical literature. Use this to find evidence-based clinical guidelines or recent studies for complex cases.',
    schema: z.object({
      query: z.string().describe("The medical search term (e.g., 'Acute Pancreatitis Management Guidelines')"),
      maxResults: z.number().min(1).max(5).default(3).describe("Number of abstracts to retrieve"),
    }),
  },
  async ({ query, maxResults }) => {
    try {
      console.log(`[Skill Execution] PubMed Search: ${query}`);
      
      // Step 1: Search PubMed to get Article IDs
      const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmode=json&retmax=${maxResults}`;
      const searchRes = await fetch(searchUrl);
      const searchData = await searchRes.json();
      
      const ids = searchData.esearchresult.idlist.join(',');
      if (!ids) return "No peer-reviewed articles found for this query.";

      // Step 2: Fetch the actual abstracts for those IDs
      const summaryUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${ids}&retmode=json`;
      const summaryRes = await fetch(summaryUrl);
      const summaryData = await summaryRes.json();

      // Step 3: Format into a clean, deterministic output for the AI
      let resultStr = `--- PubMed Results for: ${query} ---\n`;
      for (const id of searchData.esearchresult.idlist) {
        const article = summaryData.result[id];
        resultStr += `\nTitle: ${article.title}\nJournal: ${article.fulljournalname}\nDate: ${article.pubdate}\n`;
      }
      return resultStr;
      
    } catch (error: any) {
      return `PubMed Skill Execution Failed: ${error.message}`;
    }
  }
);
