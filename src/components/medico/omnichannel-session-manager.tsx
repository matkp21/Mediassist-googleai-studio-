'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MonitorSmartphone, Laptop, Smartphone, Tablet, Share2, Download, History, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

export default function OmnichannelSessionManager() {
  const [activeDevices] = useState([
    { name: 'MacBook Pro', type: 'Desktop', status: 'Active Now', icon: Laptop },
    { name: 'iPhone 15 Pro', type: 'Mobile', status: 'Ready to Sync', icon: Smartphone },
    { name: 'iPad Air', type: 'Tablet', status: 'Last seen 2h ago', icon: Tablet }
  ]);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-sky-500/10 rounded-3xl flex items-center justify-center border border-sky-500/20">
          <MonitorSmartphone className="h-8 w-8 text-sky-400" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-white">Omnichannel Sync</h2>
          <p className="text-zinc-500">Transition seamlessly across your clinical and study environments.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {activeDevices.map((device, idx) => (
          <Card key={idx} className="bg-zinc-900/50 border-white/5 rounded-[2rem] hover:bg-zinc-900 transition-colors">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto w-12 h-12 bg-zinc-800 rounded-2xl flex items-center justify-center mb-2">
                <device.icon className="h-6 w-6 text-zinc-400" />
              </div>
              <CardTitle className="text-sm font-bold text-white">{device.name}</CardTitle>
              <CardDescription className="text-[10px] uppercase font-bold text-zinc-600 tracking-wider">
                {device.status}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="ghost" size="sm" className="w-full text-[10px] uppercase font-bold text-sky-400 hover:bg-sky-500/10 gap-2">
                Beam Session <ExternalLink className="h-3 w-3" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-zinc-900/50 border-white/5 rounded-[3rem] overflow-hidden">
        <CardHeader className="bg-zinc-900/80 border-b border-white/5 p-8 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl">Reasoning Chain Export</CardTitle>
            <CardDescription className="text-zinc-500">Download immutable clinical logic logs for your portfolio or audit.</CardDescription>
          </div>
          <div className="flex gap-2">
             <Button variant="outline" className="rounded-xl gap-2 border-white/10 bg-zinc-800/50">
               <History className="h-4 w-4" /> History
             </Button>
             <Button className="rounded-xl gap-2 bg-sky-600 hover:bg-sky-700">
               <Download className="h-4 w-4" /> Export All
             </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-white/5">
            {[
              { id: 'REC-001', topic: 'Acute Coronary Syndrome Triage', tokens: '14.2k', date: 'Apr 24, 2026' },
              { id: 'REC-002', topic: 'Endocrinology Exam Prep', tokens: '8.5k', date: 'Apr 23, 2026' },
              { id: 'REC-003', topic: 'Pharmacology Memory Session', tokens: '2.1k', date: 'Apr 22, 2026' }
            ].map((session) => (
              <div key={session.id} className="p-6 flex items-center justify-between hover:bg-white/[0.02] transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-500 group-hover:bg-sky-500/20 group-hover:text-sky-400 transition-colors">
                    {session.id.split('-')[1]}
                  </div>
                  <div>
                    <p className="font-bold text-zinc-200">{session.topic}</p>
                    <p className="text-[10px] text-zinc-600 uppercase font-bold tracking-widest">{session.date} • {session.tokens} tokens</p>
                  </div>
                </div>
                <Button variant="ghost" className="rounded-xl h-10 w-10 p-0 hover:bg-zinc-800">
                  <Share2 className="h-4 w-4 text-zinc-500" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
