// src/app/medico/library/page.tsx
"use client";

import { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useProMode } from '@/contexts/pro-mode-context';
import { firestore } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy, Timestamp, addDoc, serverTimestamp, doc, updateDoc, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore';
import { Loader2, Library, BookOpen, FileQuestion, Users, UploadCloud, Bookmark, BookmarkCheck, Lightbulb, Workflow, Layers, UserCircle, ArrowRight, ChevronDown } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { MCQSchema, MedicoFlashcard, EssayQuestion } from '@/ai/schemas/medico-tools-schemas';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import Image from 'next/image';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MarkdownRenderer } from '@/components/markdown/markdown-renderer';
import { LibraryCard, type LibraryCardProps, type BaseLibraryItem as LibraryItemForCard } from '@/components/medico/library/library-card';
import { StructuredAnswerDetails } from '@/components/medico/library/structured-answer-details';


// Define types for library items
type LibraryItemType = 'notes' | 'mcqs' | 'summary' | 'mnemonic' | 'communityNote' | 'communityMnemonic' | 'flowchart' | 'flashcards' | 'examPaper';

interface BaseLibraryItem {
  id: string;
  type: LibraryItemType;
  topic: string;
  createdAt: Timestamp;
  userId?: string;
}

interface MyLibraryItem extends BaseLibraryItem {
  notes?: string;
  summaryPoints?: string[];
  mcqs?: MCQSchema[];
  essays?: EssayQuestion[];
  difficulty?: 'easy' | 'medium' | 'hard';
  examType?: 'university' | 'neet-pg' | 'usmle';
  summary?: string;
  originalFileName?: string;
  mnemonic?: string;
  explanation?: string;
  imageUrl?: string;
  flowchartData?: string;
  flashcards?: MedicoFlashcard[];
  subject?: string;
  system?: string;
}

interface CommunityLibraryItem extends BaseLibraryItem {
  content: string;
  authorId: string;
  authorName: string;
  status: 'pending' | 'approved' | 'rejected';
  subject?: string;
  system?: string;
}

type CombinedLibraryItem = MyLibraryItem | CommunityLibraryItem;

const subjects = ["Anatomy", "Physiology", "Biochemistry", "Pathology", "Pharmacology", "Microbiology", "Forensic Medicine", "Community Medicine", "Ophthalmology", "ENT", "General Medicine", "General Surgery", "Obstetrics & Gynaecology", "Pediatrics", "Other"] as const;
const systems = ["Cardiovascular", "Respiratory", "Gastrointestinal", "Neurological", "Musculoskeletal", "Endocrine", "Genitourinary", "Integumentary", "Hematological", "Immunological", "Other"] as const;

export default function StudyLibraryPage() {
  const { user, loading: authLoading } = useProMode();
  const { toast } = useToast();
  const router = useRouter();
  
  const [myLibraryItems, setMyLibraryItems] = useState<MyLibraryItem[]>([]);
  const [communityItems, setCommunityItems] = useState<CommunityLibraryItem[]>([]);
  const [bookmarkedItemIds, setBookmarkedItemIds] = useState<string[]>([]);
  const [activeItem, setActiveItem] = useState<CombinedLibraryItem | null>(null);
  
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [uploadTopic, setUploadTopic] = useState('');
  const [uploadType, setUploadType] = useState<'communityNote' | 'communityMnemonic'>('communityNote');
  const [uploadContent, setUploadContent] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedSystem, setSelectedSystem] = useState<string>('');


  const fetchUserData = useCallback(async (uid: string) => {
    setIsDataLoading(true);
    try {
      // Fetch personal library
      const libraryQuery = query(collection(firestore, `users/${uid}/studyLibrary`), orderBy('createdAt', 'desc'));
      const librarySnapshot = await getDocs(libraryQuery);
      const personalItems = librarySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MyLibraryItem));
      setMyLibraryItems(personalItems);

      // Fetch community items
      const communityQuery = query(collection(firestore, 'communityLibrary'), where('status', '==', 'approved'), orderBy('createdAt', 'desc'));
      const communitySnapshot = await getDocs(communityQuery);
      const approvedCommunityItems = communitySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CommunityLibraryItem));
      setCommunityItems(approvedCommunityItems);
      
      // Fetch bookmarks
      const userDocRef = doc(firestore, `users/${uid}`);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        setBookmarkedItemIds(userDocSnap.data().bookmarkedItems || []);
      }
    } catch (error) {
      console.error("Error fetching library data:", error);
      toast({ title: "Error", description: "Could not fetch library content.", variant: "destructive" });
    } finally {
      setIsDataLoading(false);
    }
  }, [toast]);


  useEffect(() => {
    if (user) {
      fetchUserData(user.uid);
    } else if (!authLoading) {
      // If auth is done loading and there's no user, we are not loading data.
      setIsDataLoading(false);
    }
  }, [user, authLoading, fetchUserData]);

  const handleToggleBookmark = async (itemId: string) => {
    if (!user) return;
    const userDocRef = doc(firestore, `users/${user.uid}`);
    const isCurrentlyBookmarked = bookmarkedItemIds.includes(itemId);

    try {
      if (isCurrentlyBookmarked) {
        await updateDoc(userDocRef, { bookmarkedItems: arrayRemove(itemId) });
        setBookmarkedItemIds(prev => prev.filter(id => id !== itemId));
        toast({ title: "Bookmark Removed" });
      } else {
        await updateDoc(userDocRef, { bookmarkedItems: arrayUnion(itemId) });
        setBookmarkedItemIds(prev => [...prev, itemId]);
        toast({ title: "Bookmarked!" });
      }
    } catch (error) {
      console.error("Error updating bookmarks:", error);
      toast({ title: "Error", description: "Could not update bookmark.", variant: "destructive" });
    }
  };
  
  const filterItems = useCallback((items: CombinedLibraryItem[]) => {
    if (!selectedSubject && !selectedSystem) {
      return items;
    }
    return items.filter(item => {
        // Properties can be on the root for both MyLibraryItem and CommunityLibraryItem
        const subjectMatch = !selectedSubject || (item.hasOwnProperty('subject') && (item as MyLibraryItem).subject === selectedSubject);
        const systemMatch = !selectedSystem || (item.hasOwnProperty('system') && (item as MyLibraryItem).system === selectedSystem);
        return subjectMatch && systemMatch;
    });
  }, [selectedSubject, selectedSystem]);


  const bookmarkedItems = useMemo(() => {
    const allItems = [...myLibraryItems, ...communityItems];
    return allItems.filter(item => bookmarkedItemIds.includes(item.id));
  }, [myLibraryItems, communityItems, bookmarkedItemIds]);

  const handleUploadSubmit = async () => {
    if (!uploadTopic.trim() || !uploadContent.trim()) {
        toast({ title: "Missing Information", description: "Please provide a topic and content to upload.", variant: "destructive" });
        return;
    }
    if (!user) {
        toast({ title: "Authentication Required", description: "You must be logged in to upload content.", variant: "destructive" });
        return;
    }
    setIsUploading(true);
    try {
        await addDoc(collection(firestore, 'communityLibrary'), {
            type: uploadType,
            topic: uploadTopic,
            content: uploadContent,
            authorId: user.uid,
            authorName: user.displayName || user.email || "Anonymous Medico",
            status: 'pending', // All uploads start as pending for moderation
            createdAt: serverTimestamp(),
        });
        toast({ title: "Upload Successful!", description: "Your content has been submitted for review. Thank you for contributing!" });
        setIsUploadDialogOpen(false);
        setUploadTopic('');
        setUploadType('communityNote');
        setUploadContent('');
    } catch (error) {
        console.error("Error uploading content:", error);
        toast({ title: "Upload Failed", description: "Could not submit your content. Please try again.", variant: "destructive" });
    } finally {
        setIsUploading(false);
    }
  };

  const handleActionFromDialog = (tool: 'mcq' | 'flashcards' | 'notes') => {
    if (!activeItem) return;
    const url = `/medico/${tool}?topic=${encodeURIComponent(activeItem.topic)}`;
    router.push(url);
    setActiveItem(null); // Close the dialog
  };
  
  const renderItemDetails = (item: CombinedLibraryItem) => {
    const myItem = item as MyLibraryItem;
    const commItem = item as CommunityLibraryItem;

    switch(item.type) {
        case 'notes': case 'summary':
            return (
                <>
                  {myItem.summaryPoints && myItem.summaryPoints.length > 0 && (
                  <div className="mb-4">
                      <h4 className="font-semibold text-md mb-2 text-primary">Key Points:</h4>
                      <ul className="list-disc list-inside ml-4 space-y-1 text-sm bg-secondary/50 p-3 rounded-md">
                          {myItem.summaryPoints.map((point, index) => <li key={index}>{point}</li>)}
                      </ul>
                  </div>
                  )}
                  <MarkdownRenderer content={myItem.notes || myItem.summary || ''} />
                </>
            );
        case 'mcqs':
            return (
                <div className="space-y-4">
                {myItem.mcqs?.map((mcq, index) => (
                  <Card key={index} className="p-3 bg-card/80 shadow-sm rounded-lg">
                    <p className="font-semibold mb-2 text-foreground text-sm">Q{index + 1}: {mcq.question}</p>
                    <ul className="space-y-1.5 text-xs">
                      {mcq.options.map((opt, optIndex) => (
                        <li key={optIndex} className={cn("p-2 border rounded-md transition-colors", opt.isCorrect ? "border-green-500 bg-green-500/10 text-green-700 dark:text-green-400 font-medium" : "border-border")}>
                          {String.fromCharCode(65 + optIndex)}. {opt.text}
                        </li>
                      ))}
                    </ul>
                    {mcq.explanation && (
                      <div className="text-xs mt-2 text-muted-foreground italic border-t pt-2">
                        <MarkdownRenderer content={`**Explanation:** ${mcq.explanation}`} />
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            );
        case 'examPaper':
            return (
                <div className="space-y-4">
                {myItem.mcqs?.map((mcq, index) => (
                  <Card key={index} className="p-3 bg-card/80 shadow-sm rounded-lg">
                    <p className="font-semibold mb-2 text-foreground text-sm">MCQ Q{index + 1}: {mcq.question}</p>
                    <ul className="space-y-1.5 text-xs">
                      {mcq.options.map((opt, optIndex) => (
                        <li key={optIndex} className={cn("p-2 border rounded-md transition-colors", opt.isCorrect ? "border-green-500 bg-green-500/10 text-green-700 dark:text-green-400 font-medium" : "border-border")}>
                          {String.fromCharCode(65 + optIndex)}. {opt.text}
                        </li>
                      ))}
                    </ul>
                  </Card>
                ))}
                {myItem.essays?.map((essay, index) => (
                  <Card key={`essay-${index}`} className="p-3 bg-card/80 shadow-sm rounded-lg">
                    <p className="font-semibold mb-2 text-foreground text-sm">Essay Q{index + 1}: {essay.question}</p>
                    <div className="text-xs mt-2 text-muted-foreground italic border-t pt-2">
                       <StructuredAnswerDetails answer={essay.answer10M} />
                    </div>
                  </Card>
                ))}
              </div>
            );
        case 'mnemonic':
            return (
                 <div className="space-y-3">
                    <p className="text-lg font-bold text-foreground whitespace-pre-wrap">{myItem.mnemonic}</p>
                    {myItem.explanation && <MarkdownRenderer content={myItem.explanation} />}
                    {myItem.imageUrl && <Image src={myItem.imageUrl} alt="Mnemonic visual" width={200} height={200} className="rounded-md border"/>}
                </div>
            )
        case 'flowchart':
            return <pre className="p-4 whitespace-pre-wrap text-sm bg-muted rounded-md"><code>{myItem.flowchartData}</code></pre>
        case 'flashcards':
             return (
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                     {myItem.flashcards?.map((fc, index) => (
                         <Card key={index} className="p-3 bg-card/80 shadow-sm rounded-lg">
                             <p className="font-semibold mb-1 text-primary">Front:</p>
                             <p className="text-sm mb-2">{fc.front}</p>
                             <p className="font-semibold mb-1 text-primary border-t pt-2">Back:</p>
                             <p className="text-sm">{fc.back}</p>
                         </Card>
                     ))}
                 </div>
             )
        case 'communityNote': case 'communityMnemonic':
            return <MarkdownRenderer content={commItem.content} />;
        default: return <p>No details to display.</p>
    }
  }
  
  const renderTabContent = (items: CombinedLibraryItem[], tabName: string) => {
    if (isDataLoading) {
        return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }

    const filteredItems = filterItems(items);

    if (filteredItems.length === 0) {
        const hasFilters = selectedSubject || selectedSystem;
        return <p className="text-center text-muted-foreground p-8">{hasFilters ? `No items match your filters in ${tabName}.` : `${tabName} is empty.`}</p>;
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredItems.map(item => (
                <LibraryCard 
                    key={item.id} 
                    item={item as LibraryItemForCard}
                    isBookmarked={bookmarkedItemIds.includes(item.id)}
                    onToggleBookmark={() => handleToggleBookmark(item.id)}
                    onViewItem={setActiveItem}
                />
            ))}
        </div>
    );
  };


  if (authLoading || (isDataLoading && user)) {
    return <div className="flex justify-center items-center min-h-[calc(100vh-200px)]"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }
  
  if (!user) {
    return (
      <div className="text-center p-8 flex flex-col items-center justify-center min-h-[calc(100vh-250px)]">
        <Library className="h-16 w-16 mb-4 text-primary/60" />
        <h2 className="text-xl font-semibold text-foreground mb-2">Access Your Study Library</h2>
        <p className="text-muted-foreground mb-6 max-w-sm">
          Please log in to access your personal collection of saved notes, MCQs, and community-contributed study materials.
        </p>
        <Button asChild className="rounded-lg">
          <Link href="/login">
            <UserCircle className="mr-2 h-4 w-4" />
            Log In or Sign Up
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6">
      <Card className="shadow-lg rounded-xl border-border/50">
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div>
            <CardTitle className="text-2xl flex items-center gap-2 text-primary"><Library className="h-7 w-7" />Knowledge Hub</CardTitle>
            <CardDescription>Your personal and community-driven study library.</CardDescription>
            </div>
             <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
            <DialogTrigger asChild>
                 <Button className="mt-4 sm:mt-0 rounded-lg group">
                    <UploadCloud className="mr-2 h-4 w-4 transition-transform group-hover:-translate-y-0.5"/>
                    Contribute
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Contribute to the Community Library</DialogTitle>
                    <DialogDescription>Share your notes or mnemonics with other students. Submissions are reviewed before publishing.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-2">
                    <div><Label htmlFor="upload-topic">Topic</Label><Input id="upload-topic" value={uploadTopic} onChange={(e) => setUploadTopic(e.target.value)} placeholder="e.g., Brachial Plexus"/></div>
                    <div><Label htmlFor="upload-type">Content Type</Label>
                        <Select value={uploadType} onValueChange={(v) => setUploadType(v as 'communityNote' | 'communityMnemonic')}>
                            <SelectTrigger id="upload-type"><SelectValue /></SelectTrigger>
                            <SelectContent><SelectItem value="communityNote">Note</SelectItem><SelectItem value="communityMnemonic">Mnemonic</SelectItem></SelectContent>
                        </Select>
                    </div>
                    <div><Label htmlFor="upload-content">Content</Label><Textarea id="upload-content" value={uploadContent} onChange={(e) => setUploadContent(e.target.value)} placeholder={`Enter your content here...`} className="min-h-[150px]"/></div>
                </div>
                <CardFooter className="p-0 pt-4">
                    <Button onClick={handleUploadSubmit} disabled={isUploading} className="w-full">
                        {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <UploadCloud className="mr-2 h-4 w-4"/>}
                        Submit for Review
                    </Button>
                </CardFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-2 mb-4 p-2 border bg-muted/50 rounded-lg">
             <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger className="flex-1"><SelectValue placeholder="Filter by Subject..." /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="">All Subjects</SelectItem>
                    {subjects.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
             </Select>
              <Select value={selectedSystem} onValueChange={setSelectedSystem}>
                <SelectTrigger className="flex-1"><SelectValue placeholder="Filter by System..." /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="">All Systems</SelectItem>
                    {systems.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
             </Select>
             <Button variant="ghost" onClick={() => { setSelectedSubject(''); setSelectedSystem(''); }} className="text-xs">Clear Filters</Button>
          </div>
          <Tabs defaultValue="my-library" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="my-library"><BookOpen className="mr-2 h-4 w-4"/>My Library</TabsTrigger>
              <TabsTrigger value="community"><Users className="mr-2 h-4 w-4"/>Community</TabsTrigger>
              <TabsTrigger value="bookmarked"><BookmarkCheck className="mr-2 h-4 w-4"/>Bookmarked</TabsTrigger>
            </TabsList>
            <TabsContent value="my-library" className="mt-4">{renderTabContent(myLibraryItems, "Your personal library")}</TabsContent>
            <TabsContent value="community" className="mt-4">{renderTabContent(communityItems, "The community library")}</TabsContent>
            <TabsContent value="bookmarked" className="mt-4">{renderTabContent(bookmarkedItems, "Your bookmarked items")}</TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={!!activeItem} onOpenChange={(isOpen) => !isOpen && setActiveItem(null)}>
        <DialogContent className="sm:max-w-2xl md:max-w-3xl max-h-[90vh] flex flex-col p-0">
          {activeItem && (
            <>
              <DialogHeader className="p-6 pb-2">
                <DialogTitle>{activeItem.topic}</DialogTitle>
                <DialogDescription>Type: {activeItem.type}</DialogDescription>
              </DialogHeader>
              <ScrollArea className="flex-grow p-6 pt-0">{renderItemDetails(activeItem)}</ScrollArea>
              <DialogFooter className="p-4 border-t flex-wrap justify-start gap-2 bg-muted/50">
                  <h4 className="font-semibold text-sm w-full text-foreground">Launch a tool with this topic:</h4>
                  <Button size="sm" variant="outline" onClick={() => handleActionFromDialog('notes')}>Generate Notes</Button>
                  <Button size="sm" variant="outline" onClick={() => handleActionFromDialog('mcq')}>Generate MCQs</Button>
                  <Button size="sm" variant="outline" onClick={() => handleActionFromDialog('flashcards')}>Create Flashcards</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
