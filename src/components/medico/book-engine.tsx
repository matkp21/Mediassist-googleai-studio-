"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Loader2, Book, Sparkles, Wand2, ArrowRight, Layers } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

export default function BookEngine() {
  const { toast } = useToast();
  const [intent, setIntent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [bookData, setBookData] = useState<any>(null);

  const handleCreate = async () => {
    if (!intent.trim()) return;
    setIsLoading(true);
    try {
      const response = await fetch('/api/medico/book-engine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intent }),
      });
      const result = await response.json();
      setBookData(result);
      toast({ title: "Book Generated", description: `"${result.title}" is ready in your library.` });
    } catch (err) {
      toast({ title: "Generation Failed", description: "Failed to assemble the living book.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4">
      <div className="text-center space-y-2 mb-8">
         <h1 className="text-4xl font-extrabold text-white tracking-tight flex items-center justify-center gap-3">
           <Book className="text-teal-400 w-10 h-10" />
           Medical <span className="text-teal-400">Book Engine</span>
         </h1>
         <p className="text-zinc-500 max-w-lg mx-auto">Convert study goals into personalized, interactive medical textbooks via the 5-stage synthesis pipeline.</p>
      </div>

      <Card className="bg-zinc-900 border-zinc-800 shadow-2xl overflow-hidden border-t-teal-500 border-t-2">
        <CardContent className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Book Intent & Scope</label>
            <Input 
              placeholder="e.g. Comprehensive Guide to Valvular Heart Disease for MBBS Final Year"
              value={intent}
              onChange={(e) => setIntent(e.target.value)}
              className="py-6 bg-black/40 border-zinc-700 text-white text-lg placeholder:text-zinc-600"
            />
          </div>
          
          <Button 
            onClick={handleCreate} 
            disabled={isLoading || !intent.trim()}
            className="w-full py-8 bg-teal-600 hover:bg-teal-500 font-bold text-xl shadow-xl transition-all hover:scale-[1.01]"
          >
            {isLoading ? (
              <><Loader2 className="w-6 h-6 mr-2 animate-spin" /> Assembling Book via Agentic Pipeline...</>
            ) : (
              <><Sparkles className="w-6 h-6 mr-2" /> Initialise Book Synthesis</>
            )}
          </Button>

          <div className="grid grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className={`h-1 rounded-full transition-colors ${isLoading ? 'bg-teal-500 animate-pulse' : 'bg-zinc-800'}`} style={{ animationDelay: `${i * 0.2}s` }} />
            ))}
          </div>
          <div className="flex justify-between px-2 text-[10px] text-zinc-600 font-bold uppercase tracking-tighter">
             <span>Ideation</span>
             <span>Source Map</span>
             <span>Spine</span>
             <span>Blocks</span>
             <span>Final Comp</span>
          </div>
        </CardContent>
      </Card>

      {bookData && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mt-12">
           <Card className="bg-gradient-to-br from-zinc-900 to-black border-zinc-800 overflow-hidden group hover:border-teal-500/50 transition-colors">
              <div className="aspect-[4/3] relative bg-zinc-800/20 overflow-hidden border-b border-zinc-800 flex items-center justify-center">
                 <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
                 <div className="relative text-center p-8 space-y-4">
                    <div className="w-20 h-28 mx-auto bg-teal-600 rounded shadow-2xl flex flex-col justify-between p-2">
                       <div className="h-1 w-full bg-white/20 rounded" />
                       <div className="h-1 w-2/3 bg-white/20 rounded" />
                       <div className="h-1 w-full bg-white/20 rounded" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">{bookData.title}</h3>
                    <p className="text-zinc-500 text-sm italic">{bookData.description}</p>
                 </div>
              </div>
              <CardFooter className="p-4 flex justify-between items-center">
                 <div className="flex gap-4">
                    <div className="text-center">
                       <p className="text-xs text-zinc-500 uppercase font-bold">Chapters</p>
                       <p className="text-teal-400 font-bold">8</p>
                    </div>
                    <div className="text-center border-l border-zinc-800 pl-4">
                       <p className="text-xs text-zinc-500 uppercase font-bold">Pages</p>
                       <p className="text-teal-400 font-bold">32</p>
                    </div>
                 </div>
                 <Button className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300">
                    Open Reader <ArrowRight className="ml-2 w-4 h-4" />
                 </Button>
              </CardFooter>
           </Card>
        </motion.div>
      )}
    </div>
  );
}
