import { defineTool } from 'genkit';
import { z } from 'zod';
import FirecrawlApp from '@mendable/firecrawl-js';

export const firecrawlScraperTool = defineTool(
  {
    name: 'firecrawlScraper',
    description: 'Scrapes a given URL and converts it to clean, LLM-ready markdown. Use this to read the full content of medical guidelines or research papers.',
    schema: z.object({ url: z.string().url() }),
  },
  async ({ url }) => {
    const apiKey = process.env.NEXT_PUBLIC_FIRECRAWL_API_KEY || process.env.FIRECRAWL_API_KEY || 'fc-89a835337a13487993f64f1488ec35d3';
    
    try {
      const app = new FirecrawlApp({ apiKey });
      const scrapeResult = await app.scrapeUrl(url, { formats: ['markdown'] });
      
      if (!scrapeResult.success) {
        return `Error scraping the URL: ${scrapeResult.error}`;
      }
      return scrapeResult.markdown || "Error: Could not extract markdown from this URL.";
    } catch (e) {
      return `Error scraping the URL: ${e}`;
    }
  }
);

export const firecrawlSearchTool = defineTool(
  {
    name: 'firecrawlSearch',
    description: 'Searches the web for clinical guidelines, research papers, and recent medical updates using Firecrawl.',
    schema: z.object({ query: z.string() }),
  },
  async ({ query }) => {
    const apiKey = process.env.NEXT_PUBLIC_FIRECRAWL_API_KEY || process.env.FIRECRAWL_API_KEY || 'fc-89a835337a13487993f64f1488ec35d3';
    
    try {
      const app = new FirecrawlApp({ apiKey });
      const searchResult = await app.search(query);
      
      if (!searchResult.success) {
        return `Error searching the web: ${searchResult.error}`;
      }
      
      const results = searchResult.data.map(item => {
        return `Title: ${item.title}\nURL: ${item.url}\nDescription: ${item.description || ''}`;
      });
      return results.join('\n\n');
    } catch (e) {
      return `Error searching the web: ${e}`;
    }
  }
);

export const firecrawlCrawlTool = defineTool(
  {
    name: 'firecrawlCrawl',
    description: 'Crawls a given base URL/domain to extract all its sub-pages as markdown. Use this to ingest entire guideline directories or documentation.',
    schema: z.object({ url: z.string().url(), maxDepth: z.number().optional() }),
  },
  async ({ url, maxDepth }) => {
    const apiKey = process.env.NEXT_PUBLIC_FIRECRAWL_API_KEY || process.env.FIRECRAWL_API_KEY || 'fc-89a835337a13487993f64f1488ec35d3';
    
    try {
      const app = new FirecrawlApp({ apiKey });
      const crawlResponse = await app.crawlUrl(url, {
        limit: 10,
        maxDepth: maxDepth || 2,
        scrapeOptions: { formats: ['markdown'] }
      });
      
      if (!crawlResponse.success) {
        return `Error crawling URL: ${crawlResponse.error}`;
      }
      return `Successfully crawled ${crawlResponse.data.length} pages. (For large collections, ingest them into RAG storage instead of full text readout)`;
    } catch (e) {
      return `Error crawling URL: ${e}`;
    }
  }
);

export const crawl4aiScraperTool = defineTool(
  {
    name: 'crawl4aiScraper',
    description: 'Extracts clean Markdown text from any webpage URL.',
    schema: z.object({ url: z.string().url() }),
  },
  async ({ url }) => {
    // Replace with your actual Google Cloud Run URL once deployed
    const CRAWL4AI_ENDPOINT = process.env.CRAWL4AI_API_URL || "https://crawl4ai-service-[HASH].a.run.app/crawl";
    
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
      return markdown || "No markdown extracted from Crawl4AI.";
    } catch (error) {
      return `Failed to scrape. Error: ${error}`;
    }
  }
);

export const pubmedSearchTool = defineTool(
  {
    name: 'pubmedSearch',
    description: 'Searches the PubMed database for medical research papers.',
    schema: z.object({ query: z.string() }),
  },
  async ({ query }) => {
    try {
      const searchRes = await fetch(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmode=json&retmax=3`);
      const searchData = await searchRes.json();
      const ids = searchData.esearchresult?.idlist;
      if (!ids || ids.length === 0) return "No results found on PubMed.";
      
      const summaryRes = await fetch(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${ids.join(',')}&retmode=json`);
      const summaryData = await summaryRes.json();
      
      const results = ids.map((id: string) => {
        const item = summaryData.result[id];
        return `Title: ${item.title}\nAuthors: ${item.authors?.map((a:any)=>a.name).join(', ')}\nPubDate: ${item.pubdate}\nJournal: ${item.source}\nPMID: ${id}`;
      });
      return results.join('\n\n');
    } catch(e) {
      return `Error searching PubMed: ${e}`;
    }
  }
);
