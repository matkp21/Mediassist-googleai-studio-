'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { ShieldAlert, Fingerprint, Lock, ShieldCheck, Activity, Terminal, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function InteractiveToolPrompts() {
  const [safetyEnabled, setSafetyEnabled] = useState(true);
  const [localFirst, setLocalFirst] = useState(false);
  
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-zinc-900/40 p-8 rounded-[3rem] border border-white/5 flex flex-col md:flex-row gap-8 items-center">
        <div className="shrink-0 p-6 bg-red-500/10 rounded-[2.5rem] border border-red-500/20">
          <ShieldAlert className="h-12 w-12 text-red-500" />
        </div>
        <div className="flex-1 space-y-2">
          <h2 className="text-3xl font-bold text-white tracking-tight">Clinical Safety Controls</h2>
          <p className="text-zinc-500">Manage Human-In-The-Loop (HITL) approval gates and local-first data resilience.</p>
        </div>
        <div className="flex flex-col gap-2 w-full md:w-auto">
          <Badge className="bg-red-500/10 text-red-400 border-red-500/20 py-2 px-4 rounded-full justify-center gap-2">
            <Activity className="h-3 w-3" /> System Risk: Low
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-zinc-900/50 border-white/5 rounded-[2.5rem] overflow-hidden">
          <CardHeader className="pb-4">
             <div className="flex justify-between items-center mb-2">
               <CardTitle className="text-lg">HITL Approval Gate</CardTitle>
               <Switch checked={safetyEnabled} onCheckedChange={setSafetyEnabled} />
             </div>
             <CardDescription className="text-xs text-zinc-500">
               Automatically pause execution and require explicit physician sign-off for actions like prescriptions or EHR writes.
             </CardDescription>
          </CardHeader>
          <CardContent className="bg-zinc-950/50 p-6">
            <div className="space-y-4">
               <div className="flex items-center justify-between text-xs">
                 <span className="text-zinc-400 flex items-center gap-2"><Lock className="h-3 w-3" /> Prescriptions</span>
                 <Badge className="bg-zinc-800 text-zinc-500">Always Required</Badge>
               </div>
               <div className="flex items-center justify-between text-xs">
                 <span className="text-zinc-400 flex items-center gap-2"><Fingerprint className="h-3 w-3" /> Diagnostic Commit</span>
                 <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">Required</Badge>
               </div>
               <div className="flex items-center justify-between text-xs">
                 <span className="text-zinc-400 flex items-center gap-2"><Terminal className="h-3 w-3" /> Internal Query</span>
                 <Badge className="bg-zinc-800 text-zinc-500">Optional</Badge>
               </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-white/5 rounded-[2.5rem] overflow-hidden border-indigo-500/20">
          <CardHeader className="pb-4">
             <div className="flex justify-between items-center mb-2">
               <CardTitle className="text-lg">Local-First Sandbox</CardTitle>
               <Switch checked={localFirst} onCheckedChange={setLocalFirst} />
             </div>
             <CardDescription className="text-xs text-zinc-500">
               Force data processing to stay on the clinician's machine. Agent threads will run via local runtime.
             </CardDescription>
          </CardHeader>
          <CardContent className="bg-zinc-950/50 p-6 flex flex-col items-center justify-center min-h-[140px] text-center">
             {localFirst ? (
               <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="space-y-3">
                 <ShieldCheck className="h-10 w-10 text-indigo-400 mx-auto" />
                 <p className="text-[10px] uppercase font-black text-indigo-400 tracking-widest">Enclave Mode Active</p>
               </motion.div>
             ) : (
               <div className="space-y-3 opacity-30">
                 <AlertTriangle className="h-10 w-10 text-zinc-600 mx-auto" />
                 <p className="text-[10px] uppercase font-black text-zinc-600 tracking-widest">Standard Cloud Routing</p>
               </div>
             )}
          </CardContent>
        </Card>
      </div>

      <div className="bg-zinc-900/30 p-10 rounded-[3.5rem] border border-white/5 space-y-6">
        <h3 className="text-2xl font-bold text-center">Verified Identity Sync</h3>
        <p className="text-zinc-500 text-center text-sm max-w-xl mx-auto">
          All agentic actions are appended with your unique Clinician ID. Revoking identity instantly terminates all active autonomous sessions.
        </p>
        <div className="flex justify-center flex-wrap gap-4">
           {['Physician ID: DR-4921', 'Facility: City Hospital', 'Status: Verified'].map((info, i) => (
             <div key={i} className="px-6 py-3 rounded-2xl bg-zinc-800/50 border border-white/5 text-xs font-mono text-zinc-400">
               {info}
             </div>
           ))}
        </div>
        <div className="pt-4 flex justify-center">
          <Button variant="outline" className="rounded-xl border-red-500/20 hover:bg-red-500/10 text-red-500 font-bold px-8">
            Emergency System Kill-Switch
          </Button>
        </div>
      </div>
    </div>
  );
}
