"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Loader2, Video, FileText, Wand2, Play, Sparkles } from 'lucide-react';
import { useAiAgent } from '@/hooks/use-ai-agent';
import { Textarea } from '@/components/ui/textarea';
import { MarkdownRenderer } from '@/components/markdown/markdown-renderer';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';

export default function ConceptVideoCreator() {
  const { toast } = useToast();
  const [medicalText, setMedicalText] = useState('');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  const handleGenerate = async () => {
    if (!medicalText.trim()) return;
    setIsLoading(true);
    try {
      const response = await fetch('/api/medico/video-synthesis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ medicalText, aspectRatio }),
      });
      const result = await response.json();
      setData(result);
      toast({ title: "Synthesis Complete", description: "Veo 3 has generated your medical concept video." });
    } catch (err) {
       toast({ title: "Synthesis Failed", description: "Failed to generate video script.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4">
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Video className="text-teal-400" />
            Veo-Med <span className="text-teal-400">Video Synthesis</span>
          </CardTitle>
          <CardDescription>Synthesize photorealistic medical animations via Agentic Veo 3 engine.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea 
            placeholder="Paste dense medical text or surgical notes..."
            value={medicalText}
            onChange={(e) => setMedicalText(e.target.value)}
            className="min-h-[150px] bg-black/40 border-zinc-700 text-white"
          />
          <div className="flex gap-4">
             <div className="flex-1 space-y-1">
                <label className="text-xs text-zinc-500 uppercase font-bold tracking-widest">Aspect Ratio (Veo 3)</label>
                <Select value={aspectRatio} onValueChange={setAspectRatio}>
                  <SelectTrigger className="bg-black/40 border-zinc-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-700 text-white">
                    <SelectItem value="16:9">16:9 Cinematic</SelectItem>
                    <SelectItem value="9:16">9:16 vertical</SelectItem>
                    <SelectItem value="1:1">1:1 Square</SelectItem>
                  </SelectContent>
                </Select>
             </div>
             <Button 
               onClick={handleGenerate} 
               disabled={isLoading || !medicalText.trim()}
               className="h-auto px-8 bg-teal-600 hover:bg-teal-500 text-white font-bold"
             >
               {isLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Synthesizing...</> : <><Wand2 className="w-4 h-4 mr-2" /> Synthesize</>}
             </Button>
          </div>
        </CardContent>
      </Card>

      {data && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
           <div className="p-4 border rounded-lg bg-teal-500/5 border-teal-500/20">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-teal-400">{data.title}</h3>
                    <p className="text-xs text-muted-foreground uppercase tracking-widest">Synthesis complete via Veo 3 Agentic Engine</p>
                  </div>
                  <Badge variant="outline" className="text-teal-400 border-teal-400/50">VEO 3 ACTIVE</Badge>
                </div>

                <div className="aspect-video bg-black rounded-lg overflow-hidden relative group border border-zinc-800">
                   <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/20 transition-colors">
                      <Play className="w-12 h-12 text-white/80 group-hover:text-white transition-transform group-hover:scale-110" />
                   </div>
                   <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 text-[10px] text-white rounded">
                      {data.estimatedDuration || "0:45"}
                   </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-zinc-900 p-4 rounded-md border border-zinc-800">
                  <h4 className="font-semibold mb-2 flex items-center gap-2 text-white"><FileText className="w-4 h-4 text-teal-400" /> Narration Script</h4>
                  <ScrollArea className="h-48 text-zinc-300 text-sm">
                    <MarkdownRenderer content={data.script} />
                  </ScrollArea>
                </div>

                <div className="bg-zinc-900 p-4 rounded-md border border-zinc-800">
                  <h4 className="font-semibold mb-2 flex items-center gap-2 text-white"><Sparkles className="w-4 h-4 text-teal-400" /> Veo 3 Prompts</h4>
                  <ul className="space-y-2">
                    {data.visualPrompts?.map((vp: string, idx: number) => (
                      <li key={idx} className="text-xs text-zinc-400 p-2 bg-black/30 rounded border border-zinc-800 hover:border-teal-500/30 transition-colors italic">
                        "{vp}"
                      </li>
                    ))}
                  </ul>
                </div>
            </div>
        </motion.div>
      )}
    </div>
  );
}
