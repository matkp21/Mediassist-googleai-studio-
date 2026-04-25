"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Heart, 
  Activity, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  Bell, 
  Pill,
  Timer,
  Zap,
  PhoneCall
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface HealthCheck {
  id: string;
  type: 'heart_rate' | 'blood_pressure' | 'medication' | 'spo2';
  value: string;
  status: 'normal' | 'warning' | 'critical' | 'pending';
  lastChecked: string;
}

/**
 * Architectural Mapping: DeepTutor "Proactive Heartbeat" capability.
 * Continuous Patient Monitoring engine for autonomous care coordination.
 * Shifts Care from reactive to proactive using asynchronous health checks & escalations.
 */
export function PatientMonitoringDashboard() {
  const [checks, setChecks] = useState<HealthCheck[]>([
    { id: '1', type: 'heart_rate', value: '72 bpm', status: 'normal', lastChecked: '2 mins ago' },
    { id: '2', type: 'blood_pressure', value: '120/80 mmHg', status: 'normal', lastChecked: '1 hour ago' },
    { id: '3', type: 'medication', value: 'Metoprolol', status: 'pending', lastChecked: 'Next: 09:00 AM' },
    { id: '4', type: 'spo2', value: '92%', status: 'warning', lastChecked: 'Just now' },
  ]);

  const [isHeartbeatActive, setIsHeartbeatActive] = useState(true);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-zinc-900 text-white p-6 rounded-[2.5rem] shadow-2xl overflow-hidden relative">
         <div className="absolute top-0 right-0 p-8 opacity-10">
            <Heart className={cn("h-32 w-32", isHeartbeatActive && "animate-ping")} />
         </div>
         <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
               <Zap className="h-5 w-5 text-yellow-400 fill-yellow-400" />
               <h3 className="text-xl font-black italic tracking-tighter">PROACTIVE HEARTBEAT ACTIVE</h3>
            </div>
            <p className="text-zinc-400 text-xs font-medium max-w-md">
               Monitoring patient telemetry & medication adherence logs. System will auto-escalate if thresholds are breached.
            </p>
         </div>
         <div className="relative z-10 flex flex-col items-end">
            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 mb-2">SYSTEM STABLE</Badge>
            <span className="text-[10px] font-mono text-zinc-500">Node: v1.0.4-HEARTBEAT</span>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         {checks.map((check) => (
           <Card 
             key={check.id} 
             className={cn(
               "rounded-[2rem] border-none shadow-xl transition-all duration-300 hover:scale-[1.03]",
               check.status === 'critical' ? "bg-rose-500/10" : 
               check.status === 'warning' ? "bg-amber-500/10" : "bg-white/50 backdrop-blur-xl"
             )}
           >
             <CardHeader className="pb-2">
               <div className="flex justify-between items-start">
                  <div className={cn(
                    "p-2.5 rounded-2xl",
                    check.status === 'critical' ? "bg-rose-500 text-white" : 
                    check.status === 'warning' ? "bg-amber-500 text-white" : "bg-zinc-100 text-zinc-900"
                  )}>
                     {check.type === 'heart_rate' && <Heart className="h-5 w-5" />}
                     {check.type === 'blood_pressure' && <Activity className="h-5 w-5" />}
                     {check.type === 'medication' && <Pill className="h-5 w-5" />}
                     {check.type === 'spo2' && <Timer className="h-5 w-5" />}
                  </div>
                  {check.status !== 'normal' && (
                    <AlertCircle className={cn(
                      "h-5 w-5",
                      check.status === 'critical' ? "text-rose-600 animate-pulse" : "text-amber-600"
                    )} />
                  )}
               </div>
               <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground mt-4">
                 {check.type.replace('_', ' ')}
               </CardTitle>
             </CardHeader>
             <CardContent>
               <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black">{check.value}</span>
               </div>
               <p className="text-[10px] text-muted-foreground mt-2 flex items-center gap-1">
                 <Clock className="h-3 w-3" /> Last check: {check.lastChecked}
               </p>
             </CardContent>
           </Card>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
         <Card className="lg:col-span-8 bg-zinc-900 text-white rounded-[2.5rem] border-none shadow-2xl p-8">
            <h4 className="text-xl font-bold flex items-center gap-3 mb-6">
               <Activity className="h-6 w-6 text-sky-400" />
               Adherence & Threshold Analysis
            </h4>
            <div className="space-y-6">
               <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold uppercase text-zinc-500">
                     <span>Medication Adherence (7 Days)</span>
                     <span className="text-emerald-400">92% Optimal</span>
                  </div>
                  <Progress value={92} className="h-2 bg-white/5 rounded-full" />
               </div>
               
               <div className="p-6 rounded-[2rem] bg-white/5 border border-white/5">
                  <div className="flex items-center gap-4 mb-4">
                     <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500">
                        <AlertCircle className="h-5 w-5" />
                     </div>
                     <div>
                        <p className="text-sm font-bold">SpO2 Threshold Advisory</p>
                        <p className="text-xs text-zinc-500">Oxygen levels dipped below 93% twice in last 4 hours.</p>
                     </div>
                  </div>
                  <div className="flex gap-3">
                     <Button variant="secondary" size="sm" className="bg-white/10 text-white border-white/10 rounded-full text-[10px] font-bold">
                        INITIATE NURSE CHAT
                     </Button>
                     <Button variant="secondary" size="sm" className="bg-white/10 text-white border-white/10 rounded-full text-[10px] font-bold">
                        REQUEST RE-CHECK
                     </Button>
                  </div>
               </div>
            </div>
         </Card>

         <Card className="lg:col-span-4 bg-white/40 backdrop-blur-3xl border-white rounded-[2.5rem] shadow-xl p-8 text-center flex flex-col items-center justify-center">
            <div className="p-5 rounded-full bg-rose-500/10 text-rose-600 mb-4 animate-bounce">
               <PhoneCall className="h-10 w-10" />
            </div>
            <h4 className="text-xl font-black">Escalation Protocol</h4>
            <p className="text-xs text-muted-foreground mt-2 mb-6">
               The Proactive Heartbeat is monitoring SpO2. If levels reach 90%, it will trigger an automated call to your Emergency Contact.
            </p>
            <Button className="w-full rounded-2xl bg-rose-500 hover:bg-rose-600 py-6 text-sm font-bold shadow-lg shadow-rose-500/20">
               VIEW EMERGENCY PLAN
            </Button>
         </Card>
      </div>
    </div>
  );
}
