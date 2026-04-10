// src/components/pro/smart-dictation.tsx
"use client";

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Mic, MicOff, Settings, Wand2, Loader2, FileText, AlertTriangle, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface DictationSegment {
  timestamp: Date;
  text: string;
}

export function SmartDictation() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [finalizedTranscript, setFinalizedTranscript] = useState<DictationSegment[]>([]);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('general');
  const [hasMicPermission, setHasMicPermission] = useState<boolean | null>(null);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
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
            if (event.results[i].isFinal) {
              const finalText = event.results[i][0].transcript.trim();
              setFinalizedTranscript(prev => [...prev, { timestamp: new Date(), text: `${finalText}.` }]);
              setTranscript(''); // Clear interim
              // Simulate AI suggestion based on final text
              // In a real app, this would call an AI service.
              // For demo, let's just show a placeholder suggestion.
              if (finalText.toLowerCase().includes("chest pain")) {
                setAiSuggestions(prev => [...new Set([...prev, "Consider ECG and Troponin levels.", "Assess cardiac risk factors."])]);
              } else if (finalText.toLowerCase().includes("fever")) {
                 setAiSuggestions(prev => [...new Set([...prev, "Check temperature regularly.", "Consider blood cultures if sepsis suspected."])]);
              }

            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }
          setTranscript(interimTranscript);
        };

        recognitionInstance.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.error('Speech recognition error:', event.error);
          toast({
            variant: 'destructive',
            title: 'Voice Input Error',
            description: `Could not recognize speech: ${event.error}`,
          });
          setIsListening(false);
        };
        
        recognitionInstance.onend = () => {
          // If it stops unexpectedly and was meant to be listening, try to restart (with a delay)
          // This is a basic auto-restart, might need more robust handling in a production app
          if (isListening && recognitionRef.current) {
            // recognitionRef.current.start();
          } else {
            setIsListening(false);
          }
        };
        recognitionRef.current = recognitionInstance;
      }
    } else {
      console.warn("Speech Recognition API not supported in this browser.");
    }
  }, [toast]); // Removed isListening from deps to avoid re-creating recognition on state change

  const toggleListening = async () => {
    if (!recognitionRef.current) {
        toast({title: "Dictation Not Supported", description: "Speech recognition is not available in your browser.", variant: "destructive"});
        return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      toast({ title: "Dictation Stopped" });
    } else {
      if (hasMicPermission === null || hasMicPermission === false) {
        try {
          await navigator.mediaDevices.getUserMedia({ audio: true });
          setHasMicPermission(true);
          toast({ title: "Microphone access granted."});
          recognitionRef.current.start();
          setIsListening(true);
        } catch (err) {
          setHasMicPermission(false);
          toast({
            variant: "destructive",
            title: "Microphone Access Denied",
            description: "Please enable microphone permissions for dictation.",
          });
          console.error("Mic permission error:", err);
          return;
        }
      } else {
         recognitionRef.current.start();
         setIsListening(true);
         toast({ title: "Dictation Started" });
      }
    }
  };

  const handleApplySuggestion = (suggestion: string) => {
    setFinalizedTranscript(prev => [...prev, { timestamp: new Date(), text: `${suggestion}` }]);
    setAiSuggestions(prev => prev.filter(s => s !== suggestion));
  };
  
  const getSoapTemplate = (): DictationSegment[] => [
    { timestamp: new Date(), text: "S (Subjective): \n\n" },
    { timestamp: new Date(), text: "O (Objective): \n\n" },
    { timestamp: new Date(), text: "A (Assessment): \n\n" },
    { timestamp: new Date(), text: "P (Plan): \n\n" },
  ];

  const applyTemplate = () => {
    if (selectedTemplate === 'soap') {
        setFinalizedTranscript(getSoapTemplate());
    } else {
        setFinalizedTranscript([]); // Clear for general
    }
    setTranscript('');
    setAiSuggestions([]);
  };

  const combinedTranscript = finalizedTranscript.map(seg => seg.text).join(' ') + transcript;

  return (
    <div className="space-y-6">
      <Alert variant="default" className="border-orange-500/50 bg-orange-500/10">
        <Info className="h-5 w-5 text-orange-600" />
        <AlertTitle className="font-semibold text-orange-700 dark:text-orange-500">Conceptual Dictation Tool</AlertTitle>
        <AlertDescription className="text-orange-600/90 dark:text-orange-500/90 text-xs">
          This interface demonstrates a smart dictation tool. Actual AI-powered structuring and advanced medical terminology understanding would require significant backend processing. Basic client-side speech-to-text is used for this demo.
        </AlertDescription>
      </Alert>

      <Card className="shadow-md rounded-xl border-teal-500/30 bg-gradient-to-br from-card via-card to-teal-500/5">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Mic className="h-6 w-6 text-teal-600" />
            Smart Dictation &amp; Note Assistant
          </CardTitle>
          <CardDescription>Dictate your clinical notes. The AI will assist with structuring and suggestions.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
             <Button onClick={toggleListening} disabled={hasMicPermission === false && typeof window !== 'undefined' && !('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)} className={cn("w-full sm:w-auto rounded-lg py-3 text-base group", isListening && "bg-red-600 hover:bg-red-700")}>
              {isListening ? <MicOff className="mr-2 h-5 w-5" /> : <Mic className="mr-2 h-5 w-5" />}
              {isListening ? 'Stop Dictation' : 'Start Dictation'}
            </Button>
            <div className="flex-grow w-full sm:w-auto">
                <Label htmlFor="note-template" className="sr-only">Note Template</Label>
                <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                    <SelectTrigger id="note-template" className="w-full rounded-lg">
                        <SelectValue placeholder="Select note template" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="general">General Note</SelectItem>
                        <SelectItem value="soap">SOAP Note</SelectItem>
                        {/* Add more templates here */}
                    </SelectContent>
                </Select>
            </div>
            <Button onClick={applyTemplate} variant="outline" className="w-full sm:w-auto rounded-lg text-sm">
                <FileText className="mr-2 h-4 w-4"/>Apply Template
            </Button>
          </div>
          {hasMicPermission === false && (
             <Alert variant="destructive" className="rounded-lg">
                <AlertTriangle className="h-4 w-4"/>
                <AlertTitle>Microphone Access Denied</AlertTitle>
                <AlertDescription className="text-xs">Please enable microphone permissions in your browser settings to use dictation.</AlertDescription>
             </Alert>
          )}
           {typeof window !== 'undefined' && !('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) && hasMicPermission === null && (
             <Alert variant="destructive" className="rounded-lg">
                <AlertTriangle className="h-4 w-4"/>
                <AlertTitle>Dictation Not Supported</AlertTitle>
                <AlertDescription className="text-xs">Your browser does not support speech recognition. Try Chrome or Edge.</AlertDescription>
             </Alert>
            )}

          <div>
            <Label htmlFor="dictation-output" className="font-semibold">Dictated Notes</Label>
            <ScrollArea className="h-[250px] mt-1 border rounded-lg p-3 bg-background">
              <Textarea
                id="dictation-output"
                value={combinedTranscript}
                readOnly={!isListening} // Allow editing if not actively listening to interim results
                onChange={(e) => {
                    // This allows manual edits to the latest finalized segment or the interim transcript
                    if (!isListening) {
                        const newText = e.target.value;
                        const lastFinalizedIndex = finalizedTranscript.length -1;
                        if (lastFinalizedIndex >= 0) {
                            const allButLast = finalizedTranscript.slice(0, lastFinalizedIndex).map(s => s.text).join(' ');
                            const potentiallyEditedLastSegment = newText.substring(allButLast.length).trimStart();
                            
                            const updatedFinalized = [...finalizedTranscript.slice(0, lastFinalizedIndex)];
                            if (potentiallyEditedLastSegment) {
                                updatedFinalized.push({timestamp: finalizedTranscript[lastFinalizedIndex].timestamp, text: potentiallyEditedLastSegment});
                            }
                            setFinalizedTranscript(updatedFinalized);
                        } else {
                             // If no finalized segments, it means we are editing the interim or an empty slate
                             setTranscript(newText); // Or handle as a new finalized segment if appropriate
                        }
                    }
                }}
                placeholder={isListening ? "Listening..." : "Your dictated notes will appear here. You can also type."}
                className="min-h-full resize-none border-none focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none text-sm"
              />
            </ScrollArea>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-start gap-4 pt-4 border-t">
            <div>
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-1.5 text-teal-700 dark:text-teal-400">
                    <Wand2 className="h-4 w-4"/>AI Suggestions
                </h4>
                {isLoadingAi && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground"/>}
                {!isLoadingAi && aiSuggestions.length === 0 && <p className="text-xs text-muted-foreground">No AI suggestions at the moment. Keep dictating!</p>}
                <div className="flex flex-wrap gap-2">
                    {aiSuggestions.map((suggestion, index) => (
                    <Button key={index} variant="outline" size="sm" onClick={() => handleApplySuggestion(suggestion)} className="text-xs rounded-full border-teal-500/70 text-teal-600 hover:bg-teal-500/10">
                        {suggestion}
                    </Button>
                    ))}
                </div>
            </div>
            <Button className="w-full sm:w-auto rounded-lg" onClick={() => toast({title: "Note Saved (Demo)", description: "Your clinical note has been saved."})}>
                <FileText className="mr-2 h-4 w-4"/>Save Note
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
