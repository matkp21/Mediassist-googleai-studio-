"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Globe, FileDown, Loader2, Sparkles, AlertCircle, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { MarkdownRenderer } from '../markdown/markdown-renderer';

/**
 * Architectural Mapping: Inspired by firecrawl.
 * Advanced UI for Interactive Medical Scraping.
 * Converts complex medical portals into clean, token-efficient markdown for LLM ingestion.
 */
export function AdvancedResearchScraper() {
  const [url, setUrl] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [markdown, setMarkdown] = useState<string | null>(null);
  const { toast } = useToast();

  const handleScrape = async () => {
    if (!url.trim()) {
      toast({ title: "URL Required", description: "Please enter a clinical guideline URL.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    setMarkdown(null);

    try {
      // Simulation of interactive_medical_scraper tool call
      const response = await fetch('/api/medico/tools/interactive-scraper', {
        method: 'POST',
        body: JSON.stringify({ url, searchTerm }),
      });
      
      const data = await response.json();
      
      if (data.error) throw new Error(data.error);

      setMarkdown(data.result);
      toast({ title: "Portal Deep-Scraped", description: "Converted dynamic clinical content to LLM-ready markdown." });
    } catch (error) {
      console.error("Scrape failed:", error);
      toast({ 
        title: "Internal Interface Blocked", 
        description: "Failed to scrape portal. Ensure FIRECRAWL_API_KEY is configured in AI Studio secrets.", 
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-6">
      <header className="flex items-center gap-4 mb-8">
         <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-600">
            <Globe className="h-8 w-8" />
         </div>
         <div>
            <h1 className="text-3xl font-bold tracking-tight">Advanced Research Scraper</h1>
            <p className="text-muted-foreground italic">Inspired by Firecrawl: LLM-Ready Portal Extraction.</p>
         </div>
      </header>

      <Card className="rounded-[2.5rem] border-none shadow-2xl bg-white/50 backdrop-blur-3xl p-2 relative overflow-hidden">
         <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 flex items-center bg-white dark:bg-zinc-950 rounded-[2rem] border border-slate-200 dark:border-white/10 px-6 py-2">
               <Globe className="h-5 w-5 text-slate-400 mr-4" />
               <Input 
                 value={url}
                 onChange={e => setUrl(e.target.value)}
                 placeholder="Paste clinical portal URL (e.g., NICE, CDC, UpToDate)..." 
                 className="border-none bg-transparent shadow-none focus-visible:ring-0 text-md h-12"
               />
            </div>
            <div className="md:w-64 flex items-center bg-white dark:bg-zinc-950 rounded-[2rem] border border-slate-200 dark:border-white/10 px-6 py-2">
               <Search className="h-5 w-5 text-slate-400 mr-4" />
               <Input 
                 value={searchTerm}
                 onChange={e => setSearchTerm(e.target.value)}
                 placeholder="Auto-Search site..." 
                 className="border-none bg-transparent shadow-none focus-visible:ring-0 text-md h-12"
               />
            </div>
            <Button 
               onClick={handleScrape} 
               disabled={isLoading}
               className="rounded-[2rem] bg-indigo-600 hover:bg-indigo-700 text-white px-10 h-16 shadow-xl shadow-indigo-600/20"
            >
               {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : <><Sparkles className="mr-2 h-5 w-5" /> EXTRAPOLATE PORTAL</>}
            </Button>
         </div>
      </Card>

      <AnimatePresence>
        {markdown ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
             <div className="flex justify-between items-center px-4">
                <div className="flex items-center gap-4">
                   <div className="flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 text-emerald-600 rounded-full text-[10px] font-black tracking-widest uppercase">
                      <Sparkles className="h-3 w-3" /> Token-Efficient Markdown
                   </div>
                   <div className="text-xs text-muted-foreground flex items-center gap-1 font-medium">
                      Source: <span className="text-slate-900 dark:text-white underline truncate max-w-[200px]">{url}</span>
                   </div>
                </div>
                <Button variant="ghost" size="sm" className="rounded-full text-indigo-600 font-bold gap-2">
                   <FileDown className="h-4 w-4" /> DOWNLOAD FOR RAG
                </Button>
             </div>

             <Card className="rounded-[3rem] border-white dark:border-white/5 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-3xl shadow-2xl p-4">
                <ScrollArea className="h-[60vh] rounded-[2rem]">
                   <div className="p-8 prose prose-sm dark:prose-invert max-w-none">
                      <MarkdownRenderer content={markdown} />
                   </div>
                </ScrollArea>
             </Card>

             <Card className="rounded-[2.5rem] bg-indigo-900 text-white p-8">
                <div className="flex items-center gap-6">
                   <div className="p-4 rounded-3xl bg-white/10">
                      <AlertCircle className="h-8 w-8 text-indigo-300" />
                   </div>
                   <div>
                      <h4 className="text-xl font-bold">Research Interaction Agent Available</h4>
                      <p className="text-sm text-indigo-200 mt-1 max-w-2xl">
                         This guideline has been converted. You can now use the <strong>Brain-3 Supervisor</strong> to ask specific questions about his content without re-scraping.
                      </p>
                   </div>
                   <Button className="ml-auto rounded-2xl bg-white text-indigo-900 hover:bg-indigo-50 font-bold px-8">
                      START CHAT
                   </Button>
                </div>
             </Card>
          </motion.div>
        ) : (
          !isLoading && (
            <div className="py-20 text-center space-y-4">
               <div className="inline-block p-10 bg-indigo-50 dark:bg-indigo-950/20 rounded-full text-indigo-200">
                  <Globe className="h-20 w-20" />
               </div>
               <h3 className="text-xl font-bold">Clinical Guideline Portal Ingest</h3>
               <p className="text-muted-foreground max-w-md mx-auto">
                  Provide a clinical URL to perform deep-scrapping. The system will autonomously click search boxes and wait for data to render before conversion.
               </p>
            </div>
          )
        )}
      </AnimatePresence>

      {isLoading && (
         <div className="py-20 text-center space-y-6">
            <div className="flex justify-center">
               <div className="relative">
                  <Loader2 className="h-24 w-24 text-indigo-600 animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                     <Globe className="h-10 w-10 text-indigo-600/50" />
                  </div>
               </div>
            </div>
            <div>
               <h3 className="text-2xl font-bold">Deep Scraping Interaction...</h3>
               <p className="text-muted-foreground animate-pulse mt-2">Bypassing dynamic JS gates & converting to markdown blocks.</p>
            </div>
            <div className="max-w-xs mx-auto p-4 rounded-2xl bg-white/50 border border-slate-100 flex items-center gap-3">
               <div className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
               <span className="text-[10px] font-mono text-slate-400">FIRECRAWL ENGINE: scraping...</span>
            </div>
         </div>
      )}
    </div>
  );
}

// Utility component for ScrollArea
import { ScrollArea } from "@/components/ui/scroll-area";
