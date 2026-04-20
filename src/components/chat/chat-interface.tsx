// src/components/chat/chat-interface.tsx
"use client";

import { useState, useEffect, useRef, type ReactNode } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { HeartPulse, Mic, MicOff, Volume2, VolumeX, ArrowDownCircle, Network, Zap, Settings2, Image as ImageIcon, Video, Search, BrainCircuit } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { generateStudyNotes, type StudyNotesGeneratorOutput } from '@/ai/agents/medico/StudyNotesAgent';
import { generateMCQs, type MedicoMCQGeneratorOutput, type MCQSchema as SingleMCQ } from '@/ai/agents/medico/MCQGeneratorAgent';
import { useToast } from '@/hooks/use-toast';
import { TypewriterText } from './typewriter-text';
import { useProMode } from '@/contexts/pro-mode-context';
import { ChatMessage, type Message } from './chat-message';
import { ChatCommands } from './chat-commands';
import { ChatThinkingIndicator } from './chat-thinking-indicator';
import { executeGeminiAction, generateTTS, type ChatOptions } from '@/lib/gemini-client';

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const viewportRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { userRole, user } = useProMode();

  const [isListening, setIsListening] = useState(false);
  const [isVoiceOutputEnabled, setIsVoiceOutputEnabled] = useState(false);
  const [hasMicPermission, setHasMicPermission] = useState<boolean | null>(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const recognitionRef = useRef<any>(null);
  
  // New Gemini Advance specific feature flags
  const [activeModel, setActiveModel] = useState<'general' | 'fast' | 'complex'>('general');
  const [useSearchGrounding, setUseSearchGrounding] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachedFiles, setAttachedFiles] = useState<Array<{name: string, mimeType: string, data: string}>>([]);
  const [nextSteps, setNextSteps] = useState<string[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[event.results.length - 1][0].transcript.trim();
          setInputValue(transcript);
          setIsListening(false);
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          toast({ variant: 'destructive', title: 'Voice Input Error', description: `Could not recognize speech: ${event.error}` });
          setIsListening(false);
        };
      }
    }
  }, [toast]);

  const speakText = async (text: string) => {
    if (!text) return;
    const base64Audio = await generateTTS(text);
    if (base64Audio) {
      const binary = atob(base64Audio);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: 'audio/mp3' });
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.play();
    } else {
        toast({ title: 'TTS Error', description: 'Failed to generate audio playback.', variant: 'destructive' })
    }
  };

  useEffect(() => {
    if (messages.length === 0 && !isLoading) {
      let welcomeText = "Welcome to Medi! I'm your Resident Genius Mentor, ready to assist with your clinical cases or general queries.";
      if (userRole === 'medico') {
        welcomeText = "I'm Medi, your resident on call. Powered by advanced AI and semantic search, I can synthesize topics, act as a clinical tutor, or process your files.\nTry commands like `/notes <topic>` or `/mcq <topic> 5`.";
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
  }, [userRole, messages.length, isLoading, isVoiceOutputEnabled, speakText]); 

  const toggleListening = async () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      if (hasMicPermission === null) {
        try {
          await navigator.mediaDevices.getUserMedia({ audio: true });
          setHasMicPermission(true);
          recognitionRef.current?.start();
          setIsListening(true);
        } catch (err) {
          setHasMicPermission(false);
        }
      } else if (hasMicPermission) {
        recognitionRef.current?.start();
        setIsListening(true);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const result = reader.result as string;
            // The result looks like "data:image/png;base64,....."
            // We need to extract the base64 part for Gemini inlineData
            const dataParts = result.split(',');
            if (dataParts.length === 2) {
                setAttachedFiles(prev => [...prev, {
                    name: file.name,
                    mimeType: file.type,
                    data: dataParts[1]
                }]);
            }
        };
        reader.readAsDataURL(file);
    });
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
    if (currentMessage === '' && attachedFiles.length === 0) return;

    let displayMessage = currentMessage;
    if (attachedFiles.length > 0) {
        displayMessage = `[Attached \${attachedFiles.length} file(s)] ` + currentMessage;
    }

    const userMessage: Message = { id: Date.now().toString(), content: displayMessage, sender: 'user', timestamp: new Date() };
    setMessages((prev) => [...prev, userMessage]);
    
    if (typeof messageContent !== 'string') setInputValue('');
    
    // Save attachments to local scope before clearing
    const currentAttachments = [...attachedFiles];
    setAttachedFiles([]); 
    setIsLoading(true);

    let botResponseContent: ReactNode | string = "Sorry, I couldn't process that.";
    let isCommandResp = false, isErrorRespFlag = false;

    // Process specific nextStep commands seamlessly via Genkit
    const isActionChip = messageContent.toString().includes("⚡ ") || (typeof messageContent === 'string' && messageContent.startsWith("Take MCQ") || messageContent.startsWith("Give me a Mnemonic") || messageContent.startsWith("Generate Flowchart"));
    const finalPromptText = isActionChip ? `Action Chip Triggered: ${messageContent}` : currentMessage;

    try {
      if (!isActionChip && userRole === 'medico' && currentMessage.startsWith('/')) {
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
          const result = await generateMCQs({ topic, count, difficulty: 'medium', examType: 'university' });
          botResponseContent = formatMCQResponse(result);
          if (isVoiceOutputEnabled) speakText(`Generated ${result.mcqs.length} MCQs for ${topic}.`);
        } else {
          throw new Error(`Unknown command: ${command}. Try /notes or /mcq.`);
        }
      } else {
        if (userRole === 'medico' && currentAttachments.length === 0) {
            // OPTIMIZATION: Genkit Backend Stream for Medico Mode!
            const currentUserId = user?.uid || "anonymous"; 
            const response = await fetch('/api/medico-chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    prompt: finalPromptText, 
                    history: messages.map(m => ({ role: m.sender === 'user' ? 'user' : 'model', content: [{ text: typeof m.content === 'string' ? m.content : ''}] })),
                    userId: currentUserId 
                })
            });

            if (!response.body) throw new Error("Stream body missing");

            const reader = response.body.getReader();
            const decoder = new TextDecoder("utf-8");
            let accumulatedText = "";
            let streamNextSteps: string[] = [];

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                
                const chunkStr = decoder.decode(value, { stream: true });
                // We try to parse the stream payload if it's formatted as standard text lines
                const lines = chunkStr.split('\n').filter(l => l.trim() !== '');
                for (const line of lines) {
                    try {
                        const parsed = JSON.parse(line);
                        if (parsed.message?.reply) {
                            accumulatedText = parsed.message.reply;
                        } else if (parsed.text) {
                            accumulatedText += parsed.text;
                        }
                        if (parsed.message?.nextSteps) {
                            streamNextSteps = parsed.message.nextSteps;
                        }
                    } catch (e) {
                         // Fallback for raw text streams
                         accumulatedText += chunkStr;
                    }
                }
            }

            botResponseContent = accumulatedText || "Simulation complete.";
            setNextSteps(streamNextSteps);
            if (isVoiceOutputEnabled) speakText(botResponseContent as string);

        } else {
            // Advanced Multi-turn Gemini Chat Call!
            const resultText = await executeGeminiAction(finalPromptText, { 
                modelType: currentAttachments.length > 0 ? 'vision' : activeModel, 
                useSearch: useSearchGrounding 
            }, currentAttachments);
            botResponseContent = resultText;
            setNextSteps([]); // Reset next steps
            if (isVoiceOutputEnabled) speakText(botResponseContent);
        }
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
            
            {/* The Next Step Action Chips */}
            {nextSteps && nextSteps.length > 0 && !isLoading && (
              <div className="flex flex-wrap gap-2 mt-4 fade-in">
                {nextSteps.map(step => (
                  <button 
                    key={step} 
                    onClick={() => handleSendMessage(step)}
                    className="bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 transition-colors px-3 py-1.5 rounded-full text-xs font-medium flex items-center shadow-sm"
                  >
                    ⚡ {step}
                  </button>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
        {showScrollToBottom && <Button variant="outline" size="icon" className="absolute bottom-20 right-4 h-10 w-10 rounded-full bg-background/70 backdrop-blur-sm shadow-lg hover:bg-primary/20 z-10" onClick={() => scrollToBottom()} aria-label="Scroll to bottom"><ArrowDownCircle className="h-5 w-5 text-primary" /></Button>}
      </CardContent>
      <div className="border-t bg-background/80 backdrop-blur-sm rounded-b-xl">
        <ChatCommands onSendMessage={handleSendMessage} />
        <div className="flex bg-muted/20 px-3 py-1.5 items-center gap-1 overflow-x-auto whitespace-nowrap text-xs text-muted-foreground border-b border-border/40 transition-colors">
           <Button variant="ghost" size="sm" onClick={() => setActiveModel('general')} className={`h-7 px-2 ${activeModel === 'general' ? 'bg-primary/10 text-primary' : ''}`}><Network className="w-3.5 h-3.5 mr-1.5"/> General</Button>
           <Button variant="ghost" size="sm" onClick={() => setActiveModel('fast')} className={`h-7 px-2 ${activeModel === 'fast' ? 'bg-primary/10 text-primary' : ''}`}><Zap className="w-3.5 h-3.5 mr-1.5"/> Flash Lite</Button>
           <Button variant="ghost" size="sm" onClick={() => setActiveModel('complex')} className={`h-7 px-2 ${activeModel === 'complex' ? 'bg-primary/10 text-primary' : ''}`}><BrainCircuit className="w-3.5 h-3.5 mr-1.5"/> High Thinking</Button>
           <div className="h-3.5 w-px bg-border/60 mx-1"></div>
           <Button variant="ghost" size="sm" onClick={() => setUseSearchGrounding(!useSearchGrounding)} className={`h-7 px-2 ${useSearchGrounding ? 'bg-primary/10 text-primary' : ''}`}><Search className="w-3.5 h-3.5 mr-1.5"/> Web Grounding</Button>
           <div className="h-3.5 w-px bg-border/60 mx-1"></div>
           <input type="file" multiple accept="image/*,video/*" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
           <Button variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()} className="h-7 px-2"><ImageIcon className="w-3.5 h-3.5 mr-1.5"/> Attach Image/Video</Button>
           {attachedFiles.length > 0 && <span className="text-primary font-semibold ml-2 text-[11px]">{attachedFiles.length} item(s)</span>}
        </div>
        <div className="flex items-center gap-2 p-3">
          <Button variant="ghost" size="icon" onClick={toggleListening} disabled={hasMicPermission === false || !(typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window))} aria-label={isListening ? "Stop voice input" : "Start voice input"} className="hover:bg-primary/10 shrink-0">{isListening ? <MicOff className="h-5 w-5 text-destructive" /> : <Mic className="h-5 w-5 text-primary" />}</Button>
          <Textarea value={inputValue} onChange={(e) => setInputValue(e.target.value)} className="w-full resize-none pr-3 rounded-xl border-border/70 focus:border-primary input-focus-glow" rows={1} placeholder={isListening ? "Listening..." : userRole === 'medico' ? "Ask Medi (Resident Genius) or type /command..." : "Type your message..."} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }}} disabled={isLoading || isListening} aria-label="Message input" />
          <Button onClick={() => handleSendMessage()} size="icon" aria-label="Send message" disabled={isLoading || (inputValue.trim() === '' && attachedFiles.length === 0)} className="rounded-full shrink-0">{isLoading ? <HeartPulse className="h-5 w-5 animate-ecg-beat text-primary-foreground" /> : <HeartPulse className="h-5 w-5" />}</Button>
          <Button variant="ghost" size="icon" onClick={() => setIsVoiceOutputEnabled(p => !p)} aria-label={isVoiceOutputEnabled ? "Disable voice output" : "Enable voice output"} className="hover:bg-primary/10 shrink-0">{isVoiceOutputEnabled ? <Volume2 className="h-5 w-5 text-primary" /> : <VolumeX className="h-5 w-5 text-muted-foreground" />}</Button>
        </div>
      </div>
    </Card>
  );
}
