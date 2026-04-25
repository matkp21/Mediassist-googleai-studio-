"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  FileUp, 
  FileText, 
  Loader2, 
  Download, 
  Copy, 
  CheckCircle,
  FileSearch,
  Table as TableIcon,
  Sigma
} from 'lucide-react';
import { runMarkItDownIngestion } from '@/ai/agents/ingestion/MarkItDownAgent';
import { MarkdownRenderer } from '../markdown/markdown-renderer';
import { useToast } from '@/hooks/use-toast';

export default function MarkItDownIngest() {
  const [file, setFile] = useState<File | null>(null);
  const [markdown, setMarkdown] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleIngest = async () => {
    if (!file) return;
    setIsLoading(true);
    setMarkdown(null);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      try {
        const result = await runMarkItDownIngestion({
          fileName: file.name,
          dataUrl,
          mimeType: file.type
        });
        setMarkdown(result.markdown);
        toast({ title: "Ingestion Complete", description: "Successfully structuralized the clinical document." });
      } catch (err) {
        toast({ title: "Ingestion Failed", description: "The AI was unable to parse this file securely.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const copyToClipboard = () => {
    if (markdown) {
      navigator.clipboard.writeText(markdown);
      toast({ title: "Copied!", description: "Markdown copied to clipboard." });
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-5xl">
       <header className="mb-10 text-center">
          <Badge className="bg-sky-500/10 text-sky-600 border-none mb-4 px-4 py-1">Advanced Ingestion Agent</Badge>
          <h1 className="text-4xl font-bold tracking-tight mb-2">MarkItDown Medical Ingest</h1>
          <p className="text-muted-foreground text-lg">Convert messy clinical reports, scan images, or handwritten notes into clean, hierarchical Markdown.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="rounded-[2rem] border-border/50 shadow-xl overflow-hidden bg-white/50 backdrop-blur-3xl">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileUp className="h-5 w-5 text-sky-600" /> Upload Document
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="border-2 border-dashed border-sky-200 dark:border-white/10 rounded-2xl p-10 text-center flex flex-col items-center justify-center space-y-4 bg-sky-50/30 dark:bg-zinc-900/30">
                        <div className="bg-white dark:bg-zinc-800 p-4 rounded-full shadow-md">
                            <FileSearch className="h-8 w-8 text-sky-500" />
                        </div>
                        <div className="space-y-1">
                            <p className="font-bold text-slate-900 dark:text-white">Choose a file to structure</p>
                            <p className="text-xs text-slate-500">PDF, PNG, JPG accepted (Max 10MB)</p>
                        </div>
                        <input 
                            type="file" 
                            id="file-upload" 
                            className="hidden" 
                            onChange={handleFileChange}
                            accept=".pdf,image/*"
                         />
                        <Button asChild variant="outline" className="rounded-xl border-sky-100 hover:bg-sky-50">
                            <label htmlFor="file-upload" className="cursor-pointer">Select File</label>
                        </Button>
                        {file && (
                            <Badge variant="secondary" className="mt-2 bg-emerald-500/10 text-emerald-600 border-none px-3">
                                <FileText className="h-3 w-3 mr-1" /> {file.name}
                            </Badge>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-border/50">
                            <TableIcon className="h-4 w-4 text-sky-500 mb-2" />
                            <p className="text-[10px] uppercase font-bold text-zinc-500">Table Mapping</p>
                            <p className="text-xs font-medium">Automatic Cell Extraction</p>
                        </div>
                        <div className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-border/50">
                            <Sigma className="h-4 w-4 text-indigo-500 mb-2" />
                            <p className="text-[10px] uppercase font-bold text-zinc-500">Math Parsing</p>
                            <p className="text-xs font-medium">LaTeX Formula Precision</p>
                        </div>
                    </div>

                    <Button 
                        onClick={handleIngest} 
                        disabled={!file || isLoading}
                        className="w-full h-14 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-lg shadow-lg shadow-sky-500/20"
                    >
                        {isLoading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <CheckCircle className="h-5 w-5 mr-2" />}
                        Run MarkItDown Extraction
                    </Button>
                </CardContent>
            </Card>

            <Card className="rounded-[2rem] border-border/50 shadow-xl overflow-hidden bg-slate-900 text-slate-100 min-h-[400px] flex flex-col">
                <CardHeader className="border-b border-white/5 flex flex-row items-center justify-between">
                    <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                        <FileText className="h-4 w-4 text-sky-400" /> Output Terminal
                    </CardTitle>
                    {markdown && (
                        <div className="flex gap-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/10" onClick={copyToClipboard}>
                                <Copy className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </CardHeader>
                <CardContent className="p-0 flex-1 relative">
                    <ScrollArea className="absolute inset-0 p-6">
                        {markdown ? (
                           <div className="prose prose-invert prose-sm max-w-full">
                               <MarkdownRenderer content={markdown} />
                           </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-4 py-20">
                                {isLoading ? (
                                    <>
                                        <div className="relative">
                                            <Loader2 className="h-12 w-12 animate-spin text-sky-500" />
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <FileText className="h-5 w-5" />
                                            </div>
                                        </div>
                                        <p className="text-xs font-mono animate-pulse">STRUCTURALIZING CLINICAL DATA...</p>
                                    </>
                                ) : (
                                    <>
                                        <FileSearch className="h-12 w-12 opacity-10" />
                                        <p className="text-sm">Extracted markdown will appear here.</p>
                                    </>
                                )}
                            </div>
                        )}
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
