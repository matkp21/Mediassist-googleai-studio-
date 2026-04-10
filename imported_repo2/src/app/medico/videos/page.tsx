// src/app/medico/videos/page.tsx
"use client";

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2, Youtube, Video, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getFunctions, httpsCallable } from 'firebase/functions';
import Image from 'next/image';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface Video {
    id: string;
    title: string;
    thumbnail: string;
    channel: string;
}

export default function VideoLibraryPage() {
    const [videos, setVideos] = useState<Video[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const searchYouTubeVideos = useCallback(async (query: string) => {
        setIsLoading(true);
        setVideos([]); // Clear previous results
        try {
            const functions = getFunctions();
            const searchFunction = httpsCallable(functions, 'searchYouTubeVideos');
            const response = await searchFunction({ query });
            const data = response.data as { videos: Video[] };
            setVideos(data.videos);
            if (data.videos.length === 0) {
                toast({ title: "No Videos Found", description: "Try a different search term."});
            }
        } catch (error) {
            console.error("YouTube search error:", error);
            toast({ title: "Search Failed", description: "Could not fetch videos. Please try again later.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);
    
    // Initial fetch for a default topic
    useEffect(() => {
        searchYouTubeVideos('Pharmacology');
    }, [searchYouTubeVideos]);

    const handleSearch = () => {
        if (!searchQuery.trim()) {
            toast({ title: "Search query needed", description: "Please enter a topic to search for.", variant: "destructive" });
            return;
        }
        searchYouTubeVideos(searchQuery);
    };

    return (
        <PageWrapper title="Video Lecture Library" className="max-w-7xl mx-auto">
            <Card className="shadow-lg rounded-xl border-border/50 mb-6">
                <CardHeader>
                    <CardTitle className="text-2xl flex items-center gap-2">
                        <Youtube className="h-7 w-7 text-red-600" />
                        Search for Medical Lectures
                    </CardTitle>
                    <CardDescription>
                        Find relevant video lectures from YouTube, curated for medical students. Enter a topic to begin.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-2">
                        <Input 
                            placeholder="e.g., Cardiac Cycle, Krebs Cycle..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            className="rounded-lg text-base"
                        />
                        <Button onClick={handleSearch} disabled={isLoading} className="rounded-lg">
                            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Alert variant="default" className="mb-6 border-amber-500/50 bg-amber-500/10">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                <AlertTitle className="font-semibold text-amber-700 dark:text-amber-500">External Content</AlertTitle>
                <AlertDescription className="text-amber-600/90 dark:text-amber-500/90 text-xs">
                    This library links to content on YouTube. MediAssistant does not own or endorse this content. Viewer discretion and critical appraisal are advised.
                </AlertDescription>
            </Alert>

            {isLoading ? (
                <div className="text-center py-20 text-muted-foreground">
                    <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
                    <p className="mt-2">Searching for lectures...</p>
                </div>
            ) : videos.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {videos.map(video => (
                        <Card key={video.id} className="shadow-md rounded-xl overflow-hidden hover:shadow-primary/20 transition-all duration-300 group flex flex-col">
                            <a href={`https://www.youtube.com/watch?v=${video.id}`} target="_blank" rel="noopener noreferrer" className="block">
                                <CardHeader className="p-0">
                                    <div className="aspect-video relative">
                                        <Image 
                                            src={video.thumbnail} 
                                            alt={video.title}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform"
                                            data-ai-hint="youtube thumbnail"
                                        />
                                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Video className="h-12 w-12 text-white/80" />
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-3 flex-grow">
                                    <h3 className="font-semibold text-sm line-clamp-2 text-foreground group-hover:text-primary transition-colors">{video.title}</h3>
                                </CardContent>
                                <CardFooter className="p-3 pt-0">
                                    <p className="text-xs text-muted-foreground">{video.channel}</p>
                                </CardFooter>
                            </a>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 text-muted-foreground bg-card p-8 rounded-xl shadow-inner">
                    <Video className="h-16 w-16 mx-auto mb-4 text-primary/60" />
                    <p className="text-lg font-medium">No Videos Found</p>
                    <p className="text-sm">Try a different search term to find lectures.</p>
                </div>
            )}
        </PageWrapper>
    );
}
