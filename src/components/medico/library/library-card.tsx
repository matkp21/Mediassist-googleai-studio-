// src/components/medico/library/library-card.tsx
"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { Library, FileQuestion, BookOpen, Lightbulb, Workflow, Layers, BookmarkCheck, Bookmark, ChevronDown } from 'lucide-react';

type LibraryItemType = 'notes' | 'mcqs' | 'summary' | 'mnemonic' | 'communityNote' | 'communityMnemonic' | 'flowchart' | 'flashcards' | 'examPaper';

export interface BaseLibraryItem {
  id: string;
  type: LibraryItemType;
  topic: string;
  createdAt: any; // Allow Timestamp or Date
  authorName?: string;
  authorIsVerified?: boolean; // New verified contributor system
}

export interface LibraryCardProps {
  item: BaseLibraryItem;
  isBookmarked: boolean;
  onToggleBookmark: (itemId: string, itemType: LibraryItemType) => void;
  onViewItem: (item: BaseLibraryItem) => void;
}

const LibraryCardComponent: React.FC<LibraryCardProps> = ({ item, isBookmarked, onToggleBookmark, onViewItem }) => {
    const router = useRouter();

    const handleAction = (tool: 'mcq' | 'flashcards' | 'notes') => {
        const url = `/medico/${tool}?topic=${encodeURIComponent(item.topic)}`;
        router.push(url);
    };

    const getIcon = (type: LibraryItemType) => {
        switch (type) {
            case 'mcqs': case 'examPaper': return FileQuestion;
            case 'notes': case 'summary': case 'communityNote': return BookOpen;
            case 'mnemonic': case 'communityMnemonic': return Lightbulb;
            case 'flowchart': return Workflow;
            case 'flashcards': return Layers;
            default: return Library;
        }
    };
    const ItemIcon = getIcon(item.type);

    return (
        <div className="relative group/card h-full">
            <div className="absolute -inset-1 bg-gradient-to-r from-teal-500/0 via-teal-500/20 to-emerald-500/0 rounded-xl blur-lg opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 -z-10" />
            <Card className="h-full shadow-md rounded-xl overflow-hidden hover:shadow-primary/20 transition-all duration-300 group bg-card/60 backdrop-blur-sm border-border/40 flex flex-col">
                <CardHeader className="p-4 pb-2">
                <div className="flex justify-between items-start">
                    <div className="text-primary mb-2 flex-shrink-0">
                      {ItemIcon && <ItemIcon className="h-6 w-6" />}
                    </div>
                    <Button variant="ghost" size="iconSm" onClick={(e) => { e.stopPropagation(); onToggleBookmark(item.id, item.type); }} className="text-muted-foreground hover:text-primary">
                        {isBookmarked ? <BookmarkCheck className="h-5 w-5 text-primary"/> : <Bookmark className="h-5 w-5"/>}
                    </Button>
                </div>
                <CardTitle className="text-md line-clamp-2 font-semibold h-12">{item.topic}</CardTitle>
                <CardDescription className="text-xs">
                    Type: <span className="capitalize">{item.type.replace('community', '')}</span> | {item.createdAt ? format(item.createdAt.toDate(), 'dd MMM yyyy') : 'Date N/A'}
                    {item.authorName && (
                        <span className="block mt-1 text-primary flex items-center gap-1">
                          By: {item.authorName}
                          {item.authorIsVerified && (
                             <span title="Verified Contributor" className="bg-sky-500 rounded-full w-3 h-3 flex items-center justify-center p-0.5">
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                             </span>
                          )}
                        </span>
                    )}
                </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-2 flex-grow flex items-end justify-end">
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="text-xs">
                            Actions <ChevronDown className="ml-2 h-3 w-3" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onViewItem(item)} className="cursor-pointer">View Details</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel>Launch Tool</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleAction('notes')} className="cursor-pointer">Generate Notes</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAction('mcq')} className="cursor-pointer">Generate MCQs</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAction('flashcards')} className="cursor-pointer">Create Flashcards</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardContent>
            </Card>
        </div>
    );
};

export const LibraryCard = React.memo(LibraryCardComponent);
