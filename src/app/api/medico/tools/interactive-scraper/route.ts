import { NextResponse } from 'next/server';
import { interactiveMedicalScraper } from '@/ai/tools/webScraperTools';

export async function POST(req: Request) {
  try {
    const { url, searchTerm } = await req.json();
    const result = await interactiveMedicalScraper.execute({ url, searchTerm });
    return NextResponse.json({ result: result.output });
  } catch (error: any) {
    console.error("[API:InteractiveScraper] Tool failed:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
