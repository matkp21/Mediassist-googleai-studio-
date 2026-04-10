// src/components/chat/chat-interface.tsx
"use client";

import { useState, useEffect, useRef, type ReactNode } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { HeartPulse, Mic, MicOff, Volume2, VolumeX, ArrowDownCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { processChatMessage, type ChatMessageInput } from '@/ai/agents/ChatAgent';
import { generateStudyNotes, type StudyNotesGeneratorInput, type StudyNotesGeneratorOutput } from '@/ai/agents/medico/StudyNotesAgent';
import { generateMCQs, type MedicoMCQGeneratorInput, type MedicoMCQGeneratorOutput, type MCQSchema as SingleMCQ } from '@/ai/agents/medico/MCQGeneratorAgent';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { TypewriterText } from './typewriter-text';
import { useProMode } from '@/contexts/pro-mode-context';
import { ChatMessage, type Message } from './chat-message';
import { ChatCommands } from './chat-commands';
import { ChatThinkingIndicator } from './chat-thinking-indicator';


export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const viewportRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { userRole } = useProMode();

  const [isListening, setIsListening] = useState(false);
  const [isVoiceOutputEnabled, setIsVoiceOutputEnabled] = useState(false);
  const [hasMicPermission, setHasMicPermission] = useState<boolean | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);


  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
          const transcript = event.results[event.results.length - 1][0].transcript.trim();
          setInputValue(transcript);
          setIsListening(false);
        };

        recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.error('Speech recognition error:', event.error);
          toast({ variant: 'destructive', title: 'Voice Input Error', description: `Could not recognize speech: ${event.error}` });
          setIsListening(false);
        };

        recognitionRef.current.onend = () => {};
      }
    } else {
      console.warn("Speech Recognition API not supported in this browser.");
    }
  }, [toast]);

  const speakText = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && text) {
      speechSynthesis.cancel(); 
      const utterance = new SpeechSynthesisUtterance(text);
      speechSynthesis.speak(utterance);
    } else if (!text) {
      console.warn("SpeakText: No text to speak.");
    } else {
      console.warn("Speech Synthesis API not supported or no text provided.");
    }
  };

  useEffect(() => {
    if (messages.length === 0 && !isLoading) {
      let welcomeText = "Welcome to MediAssistant Chat! I'm here to assist with your queries. How can I help you today?";
      if (userRole === 'medico') {
        welcomeText += "\nAs a medico user, you can try commands like `/notes <topic>` or `/mcq <topic> <number_of_questions>`."
      }
      const welcomeMessage: Message = {
        id: `welcome-bot-${Date.now()}`,
        content: <TypewriterText text={welcomeText} speed={50} />,
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
      if (isVoiceOutputEnabled) speakText(welcomeText);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userRole]); 

  const toggleListening = async () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      if (hasMicPermission === null) {
        try {
          await navigator.mediaDevices.getUserMedia({ audio: true });
          setHasMicPermission(true);
          toast({ title: "Microphone access granted." });
          recognitionRef.current?.start();
          setIsListening(true);
        } catch (err) {
          setHasMicPermission(false);
          toast({ variant: "destructive", title: "Microphone Access Denied", description: "Please enable microphone permissions." });
        }
      } else if (hasMicPermission) {
        recognitionRef.current?.start();
        setIsListening(true);
      } else {
        toast({ variant: "destructive", title: "Microphone Access Required", description: "Enable it in browser settings." });
      }
    }
  };

  const formatMCQResponse = (mcqData: MedicoMCQGeneratorOutput): ReactNode => (
    <div className="space-y-3">
      <h4 className="font-semibold text-base">MCQs for: {mcqData.topicGenerated}</h4>
      {mcqData.mcqs.map((mcq: SingleMCQ, index: number) => (
        <Card key={index} className="p-3 bg-card/70 shadow-sm"><p className="font-medium mb-1">Q{index + 1}: {mcq.question}</p>
          <ul className="list-disc list-inside ml-4 text-sm space-y-0.5">{mcq.options.map((opt, i) => <li key={i} className={opt.isCorrect ? "text-green-600 dark:text-green-400 font-semibold" : ""}>{String.fromCharCode(65 + i)}. {opt.text}</li>)}</ul>
          {mcq.explanation && <p className="text-xs mt-1.5 text-muted-foreground italic">Explanation: {mcq.explanation}</p>}
        </Card>
      ))}
    </div>
  );

  const formatStudyNotesResponse = (notesData: StudyNotesGeneratorOutput, topic: string): ReactNode => (
    <div className="space-y-3"><h4 className="font-semibold text-base">Study Notes for: {topic}</h4>
      <div className="text-sm whitespace-pre-wrap bg-card/70 p-3 rounded-md shadow-sm prose prose-sm dark:prose-invert max-w-none">{notesData.notes}</div>
      {notesData.summaryPoints && notesData.summaryPoints.length > 0 && (
        <div className="mt-2"><h5 className="font-medium text-sm mb-1">Key Summary Points:</h5><ul className="list-disc list-inside ml-4 text-sm space-y-0.5">{notesData.summaryPoints.map((p, i) => <li key={i}>{p}</li>)}</ul></div>
      )}
    </div>
  );

  const handleSendMessage = async (messageContent?: string) => {
    const currentMessage = (typeof messageContent === 'string' ? messageContent : inputValue).trim();
    if (currentMessage === '') return;

    const userMessage: Message = { id: Date.now().toString(), content: currentMessage, sender: 'user', timestamp: new Date() };
    setMessages((prev) => [...prev, userMessage]);
    if (typeof messageContent !== 'string') setInputValue('');
    setIsLoading(true);

    let botResponseContent: ReactNode | string = "Sorry, I couldn't process that.";
    let isCommandResp = false, isErrorRespFlag = false;

    try {
      if (userRole === 'medico' && currentMessage.startsWith('/')) {
        isCommandResp = true;
        const [command, ...args] = currentMessage.split(' ');
        const fullArgs = args.join(' ').trim();
        if (command === '/notes') {
          if (!fullArgs) throw new Error("Please provide a topic. Usage: /notes <topic>");
          const result = await generateStudyNotes({ topic: fullArgs, answerLength: '10-mark' });
          botResponseContent = formatStudyNotesResponse(result, fullArgs);
          if (isVoiceOutputEnabled) speakText(`Generated notes for ${fullArgs}.`);
        } else if (command === '/mcq') {
          const match = fullArgs.match(/^(.*?)(?:\s+(\d+))?$/);
          const topic = match?.[1]?.trim();
          const count = match?.[2] ? parseInt(match[2], 10) : 5;
          if (!topic) throw new Error("Please provide a topic. Usage: /mcq <topic> [count]");
          if (isNaN(count) || count < 1 || count > 10) throw new Error("Invalid question count (1-10).");
          const result = await generateMCQs({ topic, count, difficulty: 'medium', examType: 'university' });
          botResponseContent = formatMCQResponse(result);
          if (isVoiceOutputEnabled) speakText(`Generated ${result.mcqs.length} MCQs for ${topic}.`);
        } else {
          throw new Error(`Unknown command: ${command}. Try /notes or /mcq.`);
        }
      } else {
        const result = await processChatMessage({ message: userMessage.content as string });
        botResponseContent = result.response;
        if (isVoiceOutputEnabled) speakText(botResponseContent);
      }
    } catch (error) {
      isErrorRespFlag = true;
      botResponseContent = error instanceof Error ? error.message : "An unknown error occurred.";
    } finally {
      const botMessage: Message = {
        id: (Date.now() + Math.random()).toString(),
        content: typeof botResponseContent === 'string' ? <TypewriterText text={botResponseContent} speed={50} /> : botResponseContent,
        sender: 'bot', timestamp: new Date(), isCommandResponse: isCommandResp, isErrorResponse: isErrorRespFlag
      };
      setMessages((prev) => [...prev, botMessage]);
      setIsLoading(false);
    }
  };

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => viewportRef.current?.scrollTo({ top: viewportRef.current.scrollHeight, behavior });
  useEffect(() => scrollToBottom('auto'), [messages]);
  const handleScroll = () => {
    if (!viewportRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = viewportRef.current;
    setShowScrollToBottom(scrollHeight - scrollTop > clientHeight + 50);
  };

  return (
    <Card className="chat-glow-container flex-1 flex flex-col shadow-lg rounded-xl h-full relative bg-gradient-to-br from-card via-card to-secondary/10 dark:from-card dark:via-card dark:to-secondary/5">
      <CardContent className="flex-1 p-0 flex flex-col overflow-hidden">
        <ScrollArea className="flex-grow p-4" viewportRef={viewportRef} onScroll={handleScroll}>
          <div className="space-y-4">{messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)}
            {isLoading && <ChatThinkingIndicator />}
          </div>
        </ScrollArea>
        {showScrollToBottom && <Button variant="outline" size="icon" className="absolute bottom-20 right-4 h-10 w-10 rounded-full bg-background/70 backdrop-blur-sm shadow-lg hover:bg-primary/20 z-10" onClick={() => scrollToBottom()} aria-label="Scroll to bottom"><ArrowDownCircle className="h-5 w-5 text-primary" /></Button>}
      </CardContent>
      <div className="border-t p-4 bg-background/80 backdrop-blur-sm">
        <ChatCommands onSendMessage={handleSendMessage} />
        <div className="flex items-center gap-2 mt-2">
          <Button variant="ghost" size="icon" onClick={toggleListening} disabled={hasMicPermission === false || !(typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window))} aria-label={isListening ? "Stop voice input" : "Start voice input"} className="hover:bg-primary/10">{isListening ? <MicOff className="h-5 w-5 text-destructive" /> : <Mic className="h-5 w-5 text-primary" />}</Button>
          <Textarea value={inputValue} onChange={(e) => setInputValue(e.target.value)} className="w-full resize-none pr-3 rounded-xl border-border/70 focus:border-primary input-focus-glow" rows={1} placeholder={isListening ? "Listening..." : "Type your message or /command..."} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }}} disabled={isLoading || isListening} aria-label="Message input" />
          <Button onClick={() => handleSendMessage()} size="icon" aria-label="Send message" disabled={isLoading || inputValue.trim() === ''} className="rounded-full">{isLoading ? <HeartPulse className="h-5 w-5 animate-ecg-beat text-primary-foreground" /> : <HeartPulse className="h-5 w-5" />}</Button>
          <Button variant="ghost" size="icon" onClick={() => setIsVoiceOutputEnabled(p => !p)} aria-label={isVoiceOutputEnabled ? "Disable voice output" : "Enable voice output"} disabled={!(typeof window !== 'undefined' && 'speechSynthesis' in window)} className="hover:bg-primary/10">{isVoiceOutputEnabled ? <Volume2 className="h-5 w-5 text-primary" /> : <VolumeX className="h-5 w-5 text-muted-foreground" />}</Button>
        </div>
      </div>
    </Card>
  );
}
