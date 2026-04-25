'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileCode, Play, Trash2, Edit3, Plus, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Recipe {
  id: string;
  name: string;
  description: string;
  lastRun: string;
  category: 'Diagnostic' | 'Study' | 'Research';
}

export default function ClinicalRecipesManager() {
  const [recipes, setRecipes] = useState<Recipe[]>([
    { id: '1', name: 'Sepsis Triage Protocol', description: 'Multi-agent sweep of vitals, labs, and comorbidities to score qSOFA.', lastRun: '2 hours ago', category: 'Diagnostic' },
    { id: '2', name: 'Pharmacology Sprint', description: 'Automatic generation of MCQs, Mnemonics, and Podcasts for a drug class.', lastRun: 'Yesterday', category: 'Study' },
    { id: '3', name: 'EBM Dossier Creator', description: 'Cross-references PubMed, WHO, and local protocols for a specific topic.', lastRun: 'Disabled', category: 'Research' }
  ]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-zinc-900/50 p-6 rounded-[2rem] border border-white/5">
        <div>
          <h2 className="text-2xl font-bold text-white">Clinical & Study Recipes</h2>
          <p className="text-zinc-500 text-sm">Automate complex multi-agent workflows with portable YAML recipes.</p>
        </div>
        <Button className="bg-sky-600 hover:bg-sky-700 rounded-xl gap-2">
          <Plus className="h-4 w-4" /> Create Recipe
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {recipes.map((recipe) => (
            <motion.div
              key={recipe.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <Card className="bg-zinc-900/40 border-white/5 rounded-[2rem] overflow-hidden hover:border-sky-500/30 transition-all flex flex-col h-full">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline" className="text-[10px] uppercase border-zinc-700 text-zinc-500">
                      {recipe.category}
                    </Badge>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-zinc-800 rounded-lg">
                        <Edit3 className="h-3 w-3 text-zinc-500" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-red-500/10 hover:text-red-500 rounded-lg">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <CardTitle className="text-lg text-white">{recipe.name}</CardTitle>
                  <CardDescription className="text-zinc-500 line-clamp-2 text-xs">
                    {recipe.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="mt-auto pt-4 flex flex-col gap-4">
                  <div className="flex items-center gap-2 text-[10px] text-zinc-600 uppercase font-bold tracking-wider">
                    <CheckCircle2 className="h-3 w-3 text-emerald-500" /> Last run: {recipe.lastRun}
                  </div>
                  <Button className="w-full bg-zinc-800 hover:bg-sky-600 text-white rounded-xl gap-2 transition-all group">
                    <Play className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" /> Execute Protocol
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
