"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Activity, 
  ShieldAlert, 
  Zap, 
  Terminal, 
  Network, 
  Database,
  BrainCircuit,
  History,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

// ─── Data & Types ─────────────────────────────────────────────────────────────

interface ErrorClassDef {
  id: string;
  label: string;
  strategy: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  source: string;
  repo: string;
}

const ERROR_TAXONOMY: ErrorClassDef[] = [
  { id: "MODEL_NOT_SUPPLIED",    label: "Model Not Supplied",     strategy: "FIX_MODEL_IMPORT",           severity: "high",   source: "Genkit bug",           repo: "Firebase Community #175636" },
  { id: "TOKEN_LIMIT_EXCEEDED",  label: "Token Limit Exceeded",   strategy: "RETRY_WITH_SMALLER_CONTEXT", severity: "medium", source: "Context window",       repo: "Google AI Forum #91608" },
  { id: "MODEL_OVERLOADED",      label: "Model Overloaded",       strategy: "SWITCH_FALLBACK_MODEL",      severity: "medium", source: "500 Internal Error",   repo: "Google AI Forum #93095" },
  { id: "QUOTA_EXCEEDED",        label: "Quota Exceeded",          strategy: "RETRY_WITH_BACKOFF",         severity: "high",   source: "429 Rate Limit",       repo: "LaoZhang AI Blog 2026" },
  { id: "AUTH_FAILURE",          label: "Auth / App Check Fail",  strategy: "REFRESH_AUTH_TOKEN",         severity: "critical", source: "401 Unauthenticated", repo: "Firebase AI Logic FAQ" },
  { id: "SCHEMA_VALIDATION",     label: "Zod Schema Failure",     strategy: "SCHEMA_REPAIR_WITH_AI",      severity: "medium", source: "AI output malformed",  repo: "Internal (Zod strict)" },
  { id: "BRAIN_MODULE_CRASH",    label: "Brain Module Crash",     strategy: "HALT_AND_ALERT",             severity: "critical", source: "Unhandled exception", repo: "OpenHands runtime" },
];

const CIRCUIT_BREAKERS = [
  { name: "gemini-2.5-pro",  state: "CLOSED", failures: 0, threshold: 3 },
  { name: "medgemma-4b",     state: "CLOSED", failures: 0, threshold: 5 },
  { name: "pubmed-mcp",      state: "HALF_OPEN", failures: 3, threshold: 4 },
  { name: "openfda-mcp",     state: "CLOSED", failures: 1, threshold: 4 },
];

const MOCK_HISTORICAL = [
  { id: "e1", t: "10:04", cls: "TOKEN_LIMIT_EXCEEDED", recovered: true },
  { id: "e2", t: "11:22", cls: "MODEL_OVERLOADED",     recovered: true },
  { id: "e3", t: "12:05", cls: "QUOTA_EXCEEDED",       recovered: false },
];

// ─── Components ───────────────────────────────────────────────────────────────

const SevBadge = ({ sev }: { sev: ErrorClassDef['severity'] }) => {
    const colors = {
        low: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
        medium: "bg-amber-500/10 text-amber-500 border-amber-500/20",
        high: "bg-orange-500/10 text-orange-500 border-orange-500/20",
        critical: "bg-red-500/10 text-red-500 border-red-500/20"
    };
    return <Badge variant="outline" className={colors[sev]}>{sev.toUpperCase()}</Badge>;
};

export function ErrorBrainDashboard() {
    const [view, setView] = useState<'overview' | 'logs' | 'config'>('overview');
    const [stats, setStats] = useState({ recovered: 124, intercepted: 142, health: 98 });

    return (
        <div className="flex flex-col gap-8 p-4 md:p-8 max-w-7xl mx-auto min-h-screen animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
                        <span className="text-[10px] font-bold tracking-[0.2em] text-emerald-500 uppercase">SENTINEL ACTIVE</span>
                    </div>
                    <h1 className="text-4xl font-serif italic tracking-tight">Brain-3 Dashboard</h1>
                    <p className="text-muted-foreground">Monitoring hierarchical agent health & self-healing loops</p>
                </div>
                
                <div className="flex gap-4">
                    <div className="px-6 py-4 bg-muted/40 rounded-2xl border border-border/60 backdrop-blur-sm">
                        <div className="text-2xl font-bold font-mono">{stats.intercepted}</div>
                        <div className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase">Intercepts</div>
                    </div>
                    <div className="px-6 py-4 bg-muted/40 rounded-2xl border border-border/60 backdrop-blur-sm">
                        <div className="text-2xl font-bold font-mono text-emerald-500">{stats.recovered}</div>
                        <div className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase">Recovered</div>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-2 p-1 bg-muted/30 w-fit rounded-xl border border-border/40">
                <Button variant={view === 'overview' ? 'secondary' : 'ghost'} size="sm" onClick={() => setView('overview')} className="rounded-lg gap-2">
                    <Activity className="w-4 h-4" /> Overview
                </Button>
                <Button variant={view === 'logs' ? 'secondary' : 'ghost'} size="sm" onClick={() => setView('logs')} className="rounded-lg gap-2">
                    <Terminal className="w-4 h-4" /> Error Taxonomy
                </Button>
                <Button variant={view === 'config' ? 'secondary' : 'ghost'} size="sm" onClick={() => setView('config')} className="rounded-lg gap-2">
                    <Zap className="w-4 h-4" /> Circuit Breakers
                </Button>
            </div>

            {/* Main Content */}
            <AnimatePresence mode="wait">
                {view === 'overview' && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {/* Health Status Card */}
                        <Card className="bg-background/40 backdrop-blur-md border-border/60 shadow-xl overflow-hidden relative group">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500/50 via-emerald-400 to-emerald-500/50" />
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <div className="p-2 bg-emerald-500/10 rounded-lg">
                                        <ShieldAlert className="w-5 h-5 text-emerald-500" />
                                    </div>
                                    <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500">EXCELLENT</Badge>
                                </div>
                                <CardTitle className="mt-4">Crash Sentinel (Brain-3)</CardTitle>
                                <CardDescription>Meta-logic guard monitoring Brain-1 and Brain-2</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Self-Healing Success Rate</span>
                                        <span className="font-mono">{stats.health}%</span>
                                    </div>
                                    <div className="w-full bg-muted/50 h-2 rounded-full overflow-hidden">
                                        <div className="bg-emerald-500 h-full w-[98%] transition-all duration-1000" />
                                    </div>
                                    <div className="flex gap-2 pt-2">
                                        <Badge variant="outline" className="text-[9px] uppercase tracking-tighter">Burst Protect On</Badge>
                                        <Badge variant="outline" className="text-[9px] uppercase tracking-tighter">Auto-Retry On</Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Hierarchy Card */}
                        <Card className="bg-background/40 backdrop-blur-md border-border/60 shadow-xl lg:col-span-2">
                             <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BrainCircuit className="w-5 h-5 text-indigo-500" />
                                    Agent Hierarchy
                                </CardTitle>
                                <CardDescription>Structural failure boundaries for mediassistant sub-agents</CardDescription>
                             </CardHeader>
                             <CardContent>
                                 <div className="flex flex-col md:flex-row items-center justify-between gap-8 py-4">
                                     <div className="flex flex-col items-center gap-3">
                                         <div className="w-20 h-20 bg-emerald-500/10 border-2 border-emerald-500/50 rounded-2xl flex items-center justify-center relative">
                                             <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full border-4 border-background flex items-center justify-center text-[10px] text-white font-bold">1</div>
                                             <ShieldAlert className="w-8 h-8 text-emerald-500" />
                                         </div>
                                         <span className="text-[10px] font-bold uppercase text-muted-foreground">Supervisor</span>
                                     </div>

                                     <div className="hidden md:block w-full h-[2px] bg-gradient-to-r from-emerald-500/20 via-indigo-500/20 to-indigo-500/40 relative">
                                        <div className="absolute -top-1.5 left-1/2 -ml-1.5 w-3 h-3 rounded-full bg-muted border-2 border-indigo-500/50" />
                                     </div>

                                     <div className="flex gap-4">
                                         {['Triage', 'Case', 'Research', 'Pharma'].map((agent, i) => (
                                             <div key={agent} className="flex flex-col items-center gap-2">
                                                 <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/30 rounded-xl flex items-center justify-center">
                                                     <div className="text-[10px] font-bold">{agent[0]}</div>
                                                 </div>
                                                 <span className="text-[9px] font-bold uppercase text-muted-foreground">{agent}</span>
                                             </div>
                                         ))}
                                     </div>
                                 </div>
                             </CardContent>
                        </Card>

                        {/* Recent Activity */}
                        <Card className="lg:col-span-3 bg-background/40 backdrop-blur-md border-border/60 overflow-hidden">
                             <CardHeader className="flex flex-row items-center justify-between">
                                 <div className="space-y-1">
                                    <CardTitle className="flex items-center gap-2">
                                        <History className="w-5 h-5 text-amber-500" />
                                        Live Intercept Stream
                                    </CardTitle>
                                    <CardDescription>Real-time telemetry from Brain-3</CardDescription>
                                 </div>
                                 <Button variant="outline" size="sm" className="h-8 rounded-lg text-[10px] uppercase font-bold tracking-widest">Clear Logs</Button>
                             </CardHeader>
                             <CardContent className="p-0 border-t border-border/40">
                                 <ScrollArea className="h-[240px]">
                                     <div className="divide-y divide-border/40">
                                         {MOCK_HISTORICAL.map((log) => (
                                             <div key={log.id} className="flex items-center justify-between p-4 bg-muted/10 hover:bg-muted/30 transition-colors">
                                                 <div className="flex items-center gap-4">
                                                     <div className="text-[10px] font-mono text-muted-foreground">{log.t}</div>
                                                     <div className="flex flex-col">
                                                         <span className="text-xs font-bold font-mono tracking-tight">{log.cls}</span>
                                                         <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Self-healing strategy triggered</span>
                                                     </div>
                                                 </div>
                                                 <div className="flex items-center gap-3">
                                                     {log.recovered ? (
                                                         <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/10 text-emerald-500 rounded-md border border-emerald-500/20 text-[9px] font-bold">
                                                             <CheckCircle2 className="w-3 h-3" /> RECOVERED
                                                         </div>
                                                     ) : (
                                                         <div className="flex items-center gap-1.5 px-2 py-0.5 bg-red-500/10 text-red-500 rounded-md border border-red-500/20 text-[9px] font-bold">
                                                             <AlertCircle className="w-3 h-3" /> FATAL
                                                         </div>
                                                     )}
                                                 </div>
                                             </div>
                                         ))}
                                     </div>
                                 </ScrollArea>
                             </CardContent>
                        </Card>
                    </motion.div>
                )}

                {view === 'logs' && (
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="grid grid-cols-1 gap-4"
                    >
                        {ERROR_TAXONOMY.map((error) => (
                            <Card key={error.id} className="bg-background/40 backdrop-blur-md border-border/60 hover:border-indigo-500/40 transition-all cursor-pointer group">
                                <CardContent className="p-6">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-3">
                                                <h3 className="font-bold text-lg">{error.label}</h3>
                                                <SevBadge sev={error.severity} />
                                            </div>
                                            <p className="text-xs text-muted-foreground leading-relaxed max-w-2xl">
                                                Triggered by: <span className="text-foreground italic">{error.source}</span>. 
                                                Inspired by structural patterns in <span className="text-indigo-400 font-mono">{error.repo}</span>.
                                            </p>
                                        </div>
                                        <div className="flex flex-col items-end gap-2 shrink-0">
                                            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Sentinel Strategy</div>
                                            <Badge variant="secondary" className="bg-indigo-500/10 text-indigo-500 border-indigo-500/20 font-mono text-[11px]">
                                                {error.strategy}
                                            </Badge>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </motion.div>
                )}

                {view === 'config' && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-6"
                    >
                        {CIRCUIT_BREAKERS.map((cb) => (
                            <Card key={cb.name} className="bg-background/40 border-border/60 overflow-hidden group">
                                <div className={`h-1 w-full ${cb.state === 'CLOSED' ? 'bg-emerald-500' : cb.state === 'HALF_OPEN' ? 'bg-amber-500' : 'bg-red-500'}`} />
                                <CardHeader>
                                    <div className="flex justify-between items-center">
                                        <CardTitle className="text-sm font-mono tracking-tighter">{cb.name.toUpperCase()}</CardTitle>
                                        <Badge variant="outline" className={cb.state === 'CLOSED' ? 'text-emerald-500 border-emerald-500/20' : 'text-amber-500 border-amber-500/20'}>
                                            {cb.state}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                     <div className="flex justify-between text-xs text-muted-foreground">
                                         <span>Fault Tolerance</span>
                                         <span>{cb.failures} / {cb.threshold}</span>
                                     </div>
                                     <div className="w-full bg-muted h-1 rounded-full overflow-hidden">
                                         <div 
                                            className={cb.state === 'CLOSED' ? 'bg-emerald-500' : 'bg-amber-500'} 
                                            style={{ width: `${(cb.failures / cb.threshold) * 100}%` }} 
                                         />
                                     </div>
                                </CardContent>
                            </Card>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
