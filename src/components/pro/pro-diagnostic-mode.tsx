"use client";

import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SymptomAnalysisMode } from '@/components/homepage/symptom-analysis-mode';
import { DifferentialDiagnosisAssistant } from '@/components/pro/differential-diagnosis-assistant';
import { motion } from 'framer-motion';

export function ProDiagnosticMode() {
  const [selectedTool, setSelectedTool] = useState('ddx');

  return (
    <div className="space-y-6 slide-in-bottom">
      <div className="flex flex-col items-center justify-center mb-8">
        <h2 className="text-2xl font-bold mb-4 text-foreground">Diagnostic Tools</h2>
        <Select value={selectedTool} onValueChange={setSelectedTool}>
          <SelectTrigger className="w-[320px] text-base font-medium bg-card border-primary/20 hover:border-primary/50 transition-colors">
            <SelectValue placeholder="Select Diagnostic Tool" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ddx" className="cursor-pointer">Differential Diagnosis Assistant</SelectItem>
            <SelectItem value="symptom" className="cursor-pointer">Symptom Analysis</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <motion.div
        key={selectedTool}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {selectedTool === 'ddx' && <DifferentialDiagnosisAssistant />}
        {selectedTool === 'symptom' && <SymptomAnalysisMode />}
      </motion.div>
    </div>
  );
}
