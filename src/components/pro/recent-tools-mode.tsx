"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Activity, FileText, Brain, Stethoscope, Pill, ArrowRight } from "lucide-react";
import { motion } from 'framer-motion';

const recentTools = [
  { id: 'ddx', name: 'Differential Diagnosis', icon: Activity, desc: 'Analyze symptoms and get ranked differentials.', color: 'text-purple-500', bg: 'bg-purple-500/10' },
  { id: 'discharge', name: 'Quick Discharge Summary', icon: FileText, desc: 'Predictive drafting of discharge notes.', color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { id: 'dictation', name: 'Smart Dictation', icon: Brain, desc: 'Voice-to-text with medical terminology.', color: 'text-green-500', bg: 'bg-green-500/10' },
  { id: 'symptom', name: 'Symptom Analysis', icon: Stethoscope, desc: 'Quick check for common presentations.', color: 'text-orange-500', bg: 'bg-orange-500/10' },
  { id: 'pharma', name: 'Pharmacopeia', icon: Pill, desc: 'Drug interactions and dosing guidelines.', color: 'text-red-500', bg: 'bg-red-500/10' },
];

export function RecentToolsMode() {
  return (
    <div className="space-y-6 slide-in-bottom">
      <div className="flex flex-col items-center justify-center mb-8 text-center">
        <h2 className="text-2xl font-bold mb-2 text-foreground flex items-center gap-2">
          <Clock className="h-6 w-6 text-primary" />
          Recent & Suggested Tools
        </h2>
        <p className="text-muted-foreground max-w-2xl">
          Quickly access your most frequently used clinical tools and AI-powered assistants.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recentTools.map((tool, index) => (
          <motion.div
            key={tool.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
          >
            <Card className="group hover:shadow-md transition-all duration-300 border-border/50 hover:border-primary/30 cursor-pointer h-full flex flex-col">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${tool.bg}`}>
                    <tool.icon className={`h-5 w-5 ${tool.color}`} />
                  </div>
                  <CardTitle className="text-base group-hover:text-primary transition-colors">{tool.name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col justify-between">
                <CardDescription className="text-sm mb-4">
                  {tool.desc}
                </CardDescription>
                <div className="flex justify-end mt-auto">
                  <Button variant="ghost" size="sm" className="group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    Launch <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
