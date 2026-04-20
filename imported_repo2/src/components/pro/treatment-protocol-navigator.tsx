// src/components/pro/treatment-protocol-navigator.tsx
"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ClipboardCheck, Search, BookOpen, Lightbulb, ChevronRight, ArrowLeft } from 'lucide-react';
import { retrieveGuidelines, type GuidelineRetrievalInput, type GuidelineRetrievalOutput, type GuidelineItem } from '@/ai/agents/GuidelineRetrievalAgent';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

export function TreatmentProtocolNavigator() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<GuidelineRetrievalOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [selectedProtocol, setSelectedProtocol] = useState<GuidelineItem | null>(null);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      toast({ title: "Search term required", description: "Please enter a condition or topic.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    setSearchResults(null);
    setSelectedProtocol(null);

    try {
      const input: GuidelineRetrievalInput = { query: searchTerm };
      const result = await retrieveGuidelines(input);
      setSearchResults(result);
      if (!result.results || result.results.length === 0) {
        toast({ title: "No guidelines found", description: `Could not find guidelines for "${searchTerm}".`, variant: "default" });
      } else {
         toast({ title: "Guidelines Retrieved", description: `Found ${result.results.length} guideline(s) for "${searchTerm}".` });
      }
    } catch (error) {
      console.error("Guideline retrieval error:", error);
      toast({ title: "Search Failed", description: (error as Error).message || "Unknown error", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSelectProtocol = (protocol: GuidelineItem) => {
    setSelectedProtocol(protocol);
  };

  const handleBackToList = () => {
    setSelectedProtocol(null);
  };

  return (
    <div className="space-y-6">
       <Alert variant="default" className="border-green-500/50 bg-green-500/10">
        <Lightbulb className="h-5 w-5 text-green-600" />
        <AlertTitle className="font-semibold text-green-700 dark:text-green-500">Evidence-Based Guidance</AlertTitle>
        <AlertDescription className="text-green-600/90 dark:text-green-500/90 text-xs">
          Access AI-summarized treatment guidelines and protocols. Always cross-reference with full official documents and apply clinical judgment.
        </AlertDescription>
      </Alert>

      <Card className="shadow-md rounded-xl border-green-500/30 bg-gradient-to-br from-card via-card to-green-500/5">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <ClipboardCheck className="h-6 w-6 text-green-600" />
            Treatment Protocol Navigator
          </CardTitle>
          <CardDescription>Search for evidence-based treatment guidelines and protocols.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Input
              type="search"
              placeholder="Search by condition, e.g., Hypertension, Sepsis..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="rounded-lg flex-grow border-border/70 focus:border-primary"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              aria-label="Search for treatment protocols"
            />
            <Button onClick={handleSearch} disabled={isLoading} className="rounded-lg">
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
              <span className="sr-only sm:not-sr-only sm:ml-2">Search</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-3 text-muted-foreground">Searching for guidelines...</p>
        </div>
      )}

      {!isLoading && selectedProtocol ? (
         <Card className="mt-6 shadow-lg rounded-xl border-primary/30">
            <CardHeader>
                <Button variant="outline" size="sm" onClick={handleBackToList} className="mb-3 text-xs rounded-md self-start group">
                 <ArrowLeft className="mr-1.5 h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5"/> Back to Results
                </Button>
                <CardTitle className="text-xl flex items-center gap-2 text-primary">
                    <BookOpen className="h-6 w-6" />
                    {selectedProtocol.title}
                </CardTitle>
                {selectedProtocol.source && <CardDescription className="text-sm pt-1">Source: {selectedProtocol.source}</CardDescription>}
            </CardHeader>
            <CardContent>
                 <ScrollArea className="h-[50vh] p-1 border bg-background rounded-lg">
                    <div className="p-4 whitespace-pre-wrap text-sm prose prose-sm dark:prose-invert max-w-none">
                        <h4 className="font-semibold text-base mb-2">Summary:</h4>
                        {selectedProtocol.summary}
                    </div>
                </ScrollArea>
            </CardContent>
             <CardFooter>
                <p className="text-xs text-muted-foreground italic">This is an AI-generated summary. Always refer to the full official guideline for complete information.</p>
            </CardFooter>
        </Card>
      ) : !isLoading && searchResults && searchResults.results.length > 0 ? (
         <Card className="mt-6 shadow-md rounded-xl">
            <CardHeader>
                <CardTitle className="text-lg">Search Results for "{searchTerm}"</CardTitle>
                <CardDescription>{searchResults.results.length} guideline(s) found. Select one to view details.</CardDescription>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[50vh] p-1">
                    <div className="space-y-3">
                        {searchResults.results.map((item) => (
                            <div 
                                key={item.title + (item.source || '')}
                                className="p-4 bg-muted/50 rounded-lg hover:bg-muted/80 cursor-pointer transition-colors border border-border/50 hover:border-primary/50"
                                onClick={() => handleSelectProtocol(item)}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleSelectProtocol(item)}
                                aria-label={`View details for ${item.title}`}
                            >
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h4 className="font-semibold text-md text-primary group-hover:underline">{item.title}</h4>
                                        {item.source && <p className="text-xs text-muted-foreground mt-0.5">Source: {item.source}</p>}
                                        <p className="text-xs text-foreground/80 line-clamp-2 mt-1">{item.summary}</p>
                                    </div>
                                    <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0 ml-2"/>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
      ) : !isLoading && searchTerm && (!searchResults || searchResults.results.length === 0) ? (
        <div className="text-center py-10 text-muted-foreground bg-card p-6 rounded-xl shadow-md">
          <BookOpen className="h-12 w-12 mx-auto mb-3 text-primary/50" />
          <p className="font-semibold">No guidelines found for "{searchTerm}".</p>
          <p className="text-sm">Try refining your search term or check the spelling.</p>
        </div>
      ): null}
    </div>
  );
}
