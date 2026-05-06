import { z } from "genkit";
import { ai } from "@/ai/genkit";


export const paperSearchTool = ai.defineTool(
  {
    name: "academicPaperSearch",
    description: "Search PubMed for peer-reviewed medical literature.",
    inputSchema: z.object({
      query: z.string(),
      maxResults: z.number().default(5),
      minYear: z.number().optional(),
    }),
    outputSchema: z.array(z.object({
      pmid: z.string().optional(),
      title: z.string(),
      authors: z.array(z.string()),
      journal: z.string(),
      year: z.string(),
      abstract: z.string(),
      url: z.string(),
      clinicalRelevance: z.string().optional(),
    })),
  },
  async ({ query, maxResults, minYear }) => {
    let pubmedQuery = query;
    if (minYear) pubmedQuery += ` AND ${minYear}:3000[dp]`;

    const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(pubmedQuery)}&retmax=${maxResults}&retmode=json&sort=relevance`;
    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();
    const pmids: string[] = searchData.esearchresult?.idlist ?? [];

    if (!pmids.length) return [];

    const summaryUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${pmids.join(",")}&retmode=json`;
    const summaryRes = await fetch(summaryUrl);
    const summaryData = await summaryRes.json();

    const papers = pmids.map((id) => {
      const article = summaryData.result?.[id] ?? {};
      return {
        pmid: id,
        title: article.title ?? "Unknown",
        authors: article.authors?.map((a: any) => a.name) ?? [],
        journal: article.fulljournalname ?? "",
        year: article.pubdate ?? "",
        abstract: "Check PubMed for full abstract.",
        url: `https://pubmed.ncbi.nlm.nih.gov/${id}/`,
      };
    });

    const withRelevance = await Promise.all(
      papers.slice(0, 3).map(async (paper) => {
        const resp = await ai.generate({
          model: 'googleai/gemini-3.0-flash',
          prompt: `In 1 sentence, what is the clinical takeaway from this study?\nTitle: ${paper.title}`,
          config: { temperature: 0.2 },
        });
        return { ...paper, clinicalRelevance: resp.text };
      })
    );

    return [...withRelevance, ...papers.slice(3)];
  }
);
