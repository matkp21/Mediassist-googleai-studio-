import { z } from 'zod';
import { ai } from '@/ai/genkit';

export const pubmedSearchSkill = ai.defineTool(
  {
    name: 'pubmedSearchSkill',
    description: 'Search PubMed for Evidence-Based Medicine (EBM) papers and recent studies to ground clinical knowledge.',
    inputSchema: z.object({
      query: z.string().describe('The clinical question or topic to search on PubMed.'),
      maxResults: z.number().optional().default(3).describe('Maximum number of abstracts to retrieve.')
    }),
    outputSchema: z.string().describe('Summarized EBM findings from PubMed abstracts.'),
  },
  async ({ query, maxResults }) => {
    try {
      // Step 1: Search PubMed for IDs
      const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmode=json&retmax=${maxResults}`;
      const searchRes = await fetch(searchUrl);
      const searchData = await searchRes.json();
      
      const idList = searchData.esearchresult?.idlist || [];
      if (idList.length === 0) {
        return "No recent papers found on PubMed for this query.";
      }

      // Step 2: Fetch summaries
      const summaryUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${idList.join(',')}&retmode=json`;
      const summaryRes = await fetch(summaryUrl);
      const summaryData = await summaryRes.json();

      const results = idList.map((id: string) => {
        const article = summaryData.result[id];
        return `- **${article.title}** (${article.pubdate}): ${article.source} [PMID: ${id}]`;
      });
      
      return `Found Evidence-Based Literature:\n${results.join('\n')}`;
    } catch (e) {
      console.error('PubMed search error:', e);
      return 'Failed to retrieve PubMed EBM data.';
    }
  }
);
