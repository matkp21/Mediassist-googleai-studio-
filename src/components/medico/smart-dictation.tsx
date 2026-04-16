// src/components/medico/smart-dictation.tsx
"use client";

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Mic, MicOff, Settings, Wand2, Loader2, FileText, Info, BrainCircuit, Save, Trash2, Play, Pause, Square } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { structureNote } from '@/ai/agents/medico/NoteStructurerAgent';
import { useProMode } from '@/contexts/pro-mode-context';
import { firestore, storage } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { formatDistanceToNow } from 'date-fns';


interface SavedDictation {
  id: string;
  title: string;
  text: string;
  audioUrl: string;
  createdAt: Date;
}

export default function SmartDictation() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<'general' | 'soap'>('general');
  const [hasMicPermission, setHasMicPermission] = useState<boolean | null>(null);
  const [savedDictations, setSavedDictations] = useState<SavedDictation[]>([]);
  const [currentAudio, setCurrentAudio] = useState<{ id: string; url: string } | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const { user } = useProMode();
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognitionImpl = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognitionImpl) {
        const recognitionInstance = new SpeechRecognitionImpl();
        recognitionInstance.continuous = true;
        recognitionInstance.interimResults = true;
        recognitionInstance.lang = 'en-US';
        recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
          let interimTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
             interimTranscript += event.results[i][0].transcript;
          }
          setTranscript(interimTranscript);
        };
        recognitionInstance.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.error('Speech recognition error:', event.error);
          toast({ variant: 'destructive', title: 'Voice Input Error', description: `Could not recognize speech: ${event.error}` });
          setIsRecording(false);
        };
        recognitionInstance.onend = () => {
          setIsRecording(false);
        };
        recognitionRef.current = recognitionInstance;
      }
    } else {
      console.warn("Speech Recognition API not supported in this browser.");
    }
  }, [toast]);
  
  // Fetch saved dictations from Firestore
  useEffect(() => {
    if (user) {
      setIsLoading(true);
      const q = query(collection(firestore, `users/${user.uid}/dictations`), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const notes = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt.toDate(),
        } as SavedDictation));
        setSavedDictations(notes);
        setIsLoading(false);
      }, (error) => {
        console.error("Error fetching dictations:", error);
        toast({title: "Error", description: "Could not fetch saved dictations.", variant: "destructive"});
        setIsLoading(false);
      });
      return () => unsubscribe();
    }
  }, [user, toast]);

  const startRecording = async () => {
    if (!recognitionRef.current) {
        toast({title: "Dictation Not Supported", description: "Speech recognition is not available in your browser.", variant: "destructive"});
        return;
    }
    
    setTranscript('');
    audioChunksRef.current = [];
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setHasMicPermission(true);
      
      // Start Speech Recognition
      recognitionRef.current.start();

      // Start Media Recorder
      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      mediaRecorderRef.current.start();
      
      setIsRecording(true);
      toast({ title: "Recording Started" });

    } catch (err) {
      setHasMicPermission(false);
      toast({ variant: "destructive", title: "Microphone Access Denied", description: "Please enable microphone permissions for dictation and recording." });
    }
  };
  
  const stopRecording = () => {
    if (recognitionRef.current) recognitionRef.current.stop();
    if (mediaRecorderRef.current) mediaRecorderRef.current.stop();
    setIsRecording(false);
    toast({ title: "Recording Stopped" });
  };
  
  const handleSaveNote = async () => {
    if (!transcript.trim() && audioChunksRef.current.length === 0) {
      toast({ title: "No Content", description: "There is nothing to save.", variant: "destructive" });
      return;
    }
    if (!user) {
      toast({ title: "Login Required", description: "You must be logged in to save.", variant: "destructive" });
      return;
    }
    
    setIsSaving(true);
    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
    const dictationTitle = transcript.split(' ').slice(0, 5).join(' ') + '...';
    
    try {
      // 1. Upload audio to Storage
      const audioStorageRef = ref(storage, `dictations/${user.uid}/${Date.now()}.webm`);
      await uploadBytes(audioStorageRef, audioBlob);
      const audioUrl = await getDownloadURL(audioStorageRef);

      // 2. Save text and audio URL to Firestore
      await addDoc(collection(firestore, `users/${user.uid}/dictations`), {
        title: dictationTitle || "Untitled Dictation",
        text: transcript,
        audioUrl,
        createdAt: serverTimestamp(),
      });
      
      // 3. Reset state
      setTranscript('');
      audioChunksRef.current = [];
      toast({ title: "Dictation Saved!", description: "Your note and audio have been saved to your library." });
    } catch (error) {
       console.error("Save error:", error);
       toast({ title: "Save Failed", description: "Could not save your dictation.", variant: "destructive" });
    } finally {
        setIsSaving(false);
    }
  };

  const handlePlayAudio = (id: string, url: string) => {
    if (currentAudio?.id === id && isPlaying) {
        audioRef.current?.pause();
        setIsPlaying(false);
    } else {
        setCurrentAudio({id, url});
        if(audioRef.current) {
            audioRef.current.src = url;
            audioRef.current.play().catch(e => console.error("Audio play error", e));
            setIsPlaying(true);
        }
    }
  };

  const handleDeleteDictation = async (id: string) => {
    if (!user) return;
    try {
        await deleteDoc(doc(firestore, `users/${user.uid}/dictations`, id));
        toast({title: "Dictation Deleted"});
        // Note: This does not delete the file from Storage to keep it simple.
        // A production app would use a Cloud Function for that.
    } catch (error) {
        toast({title: "Delete Failed", description: "Could not delete the dictation.", variant: "destructive"});
    }
  }

  return (
    <div className="space-y-6">
      <audio ref={audioRef} onEnded={() => setIsPlaying(false)} onPause={() => setIsPlaying(false)} />
      <Card className="shadow-md rounded-xl border-teal-500/30 bg-gradient-to-br from-card via-card to-teal-500/5">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Mic className="h-6 w-6 text-teal-600" />
            Smart Dictation & Audio Notes
          </CardTitle>
          <CardDescription>Record your voice to create text notes with audio playback.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={isRecording ? stopRecording : startRecording} className={cn("w-full rounded-lg py-3 text-base group", isRecording && "bg-red-600 hover:bg-red-700")}>
            {isRecording ? <Square className="mr-2 h-5 w-5" /> : <Mic className="mr-2 h-5 w-5" />}
            {isRecording ? 'Stop Recording' : 'Start Recording & Dictation'}
          </Button>
          {hasMicPermission === false && (
             <Alert variant="destructive" className="rounded-lg">
                <AlertTitle>Microphone Access Denied</AlertTitle>
                <AlertDescription className="text-xs">Please enable microphone permissions in your browser settings.</AlertDescription>
             </Alert>
          )}

          <div>
            <Label htmlFor="dictation-output" className="font-semibold">Live Transcript</Label>
            <Textarea
              id="dictation-output"
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder={isRecording ? "Listening..." : "Your live transcript will appear here. You can also type or edit."}
              className="min-h-[150px] mt-1 rounded-lg bg-background"
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end pt-4 border-t">
            <Button className="rounded-lg" onClick={handleSaveNote} disabled={isSaving || isRecording || !transcript.trim()}>
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4"/>}
                Save Note
            </Button>
        </CardFooter>
      </Card>
      
      <Card className="mt-6 shadow-md rounded-xl">
        <CardHeader><CardTitle>Saved Dictations</CardTitle></CardHeader>
        <CardContent>
            <ScrollArea className="h-[40vh] border rounded-lg">
                {isLoading && <div className="p-4 text-center"><Loader2 className="h-6 w-6 animate-spin inline-block"/></div>}
                {!isLoading && savedDictations.length === 0 && <p className="p-4 text-center text-muted-foreground text-sm">No saved dictations found.</p>}
                <div className="p-2 space-y-2">
                    {savedDictations.map(note => (
                        <Card key={note.id} className="p-3">
                           <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-semibold text-sm">{note.title}</p>
                                    <p className="text-xs text-muted-foreground">{formatDistanceToNow(note.createdAt, { addSuffix: true })}</p>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Button size="iconSm" variant="outline" onClick={() => handlePlayAudio(note.id, note.audioUrl)}>
                                        {currentAudio?.id === note.id && isPlaying ? <Pause className="h-4 w-4"/> : <Play className="h-4 w-4"/>}
                                    </Button>
                                    <Button size="iconSm" variant="ghost" className="text-destructive hover:bg-destructive/10" onClick={() => handleDeleteDictation(note.id)}>
                                        <Trash2 className="h-4 w-4"/>
                                    </Button>
                                </div>
                           </div>
                           <p className="text-sm mt-2 p-2 bg-muted/50 rounded-md whitespace-pre-wrap">{note.text}</p>
                        </Card>
                    ))}
                </div>
            </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
