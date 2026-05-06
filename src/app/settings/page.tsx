"use client";

import React, { useState, useEffect } from 'react';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { ChevronRight, Bell, Shield, User, Palette, Info, Check, Sun, Moon, Link as LinkIcon, Smartphone, Crown, Star } from 'lucide-react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { useProMode } from '@/contexts/pro-mode-context';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { user, isProMode, setIsProMode } = useProMode();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const [notifications, setNotifications] = useState(true);
  const [telemetry, setTelemetry] = useState(false);
  const [gamification, setGamification] = useState(true);
  const [activeAccent, setActiveAccent] = useState('#007AFF');

  const IOS_COLORS = [
    { name: 'Blue', value: '#007AFF' },
    { name: 'Teal', value: '#30B0C7' },
    { name: 'Green', value: '#34C759' },
    { name: 'Yellow', value: '#FFD60A' },
    { name: 'Orange', value: '#FF9F0A' },
    { name: 'Pink', value: '#FF375F' },
  ];

  if (!mounted) return null;

  return (
    <PageWrapper title="Settings" className="bg-[var(--s0)] max-w-2xl mx-auto px-4 py-8">
      <div className="flex flex-col gap-8 pb-12">
        <h1 className="text-3xl font-bold tracking-tight px-2">Settings</h1>

        {/* Account Section */}
        <div className="bg-[var(--gb)] backdrop-blur-3xl border border-[var(--gbr)] rounded-[20px] shadow-[var(--sh)] overflow-hidden">
          <div className="flex items-center gap-4 p-4">
            <div className="w-[60px] h-[60px] rounded-full bg-[conic-gradient(from_0deg,#4b8ff7,#a07df0,#32c97e,#f7bc26,#f56080,#4b8ff7)] flex items-center justify-center p-[2px]">
              <div className="w-full h-full rounded-full bg-[var(--s2)] border-2 border-[var(--s0)] overflow-hidden">
                <img src={`https://ui-avatars.com/api/?name=${user?.email ? user.email.charAt(0) : 'M'}&background=0f172a&color=fff`} className="w-full h-full object-cover" alt="Avatar"/>
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-[20px] font-semibold text-[var(--lb)] leading-tight">{user?.email ? user.email.split('@')[0] : 'Mathew K.'}</h2>
                {isProMode && <div className="px-1.5 py-0.5 rounded text-[10px] bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold uppercase tracking-wider flex items-center gap-1"><Crown size={10} /> PRO</div>}
              </div>
              <p className="text-[14px] text-[var(--sec)]">{user?.email || 'mathewkp21@gmail.com'}</p>
            </div>
            <ChevronRight className="text-[var(--ter)] w-5 h-5" />
          </div>
        </div>

        {/* Pro Mode Toggle */}
        <div>
          <h3 className="text-[13px] font-semibold text-purple-500 uppercase tracking-wider px-4 mb-2 flex items-center gap-1"><Crown size={14} /> MediAssistant Pro</h3>
          <div className="bg-gradient-to-r from-purple-500/5 to-indigo-500/5 backdrop-blur-3xl border border-purple-500/20 rounded-[20px] shadow-[var(--sh)] overflow-hidden">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3.5">
                <div className="w-[36px] h-[36px] rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center text-white"><Crown className="w-[20px] h-[20px]"/></div>
                <div>
                  <span className="block text-[17px] font-bold text-[var(--lb)]">Pro Mode Features</span>
                  <span className="block text-[13px] text-[var(--sec)]">Unlock Deep Solve, Clinical Co-Writer & DiagnoBot</span>
                </div>
              </div>
              <button 
                onClick={() => setIsProMode(!isProMode)}
                className={cn("w-[50px] h-[30px] rounded-full p-[2px] transition-colors relative", isProMode ? "bg-[#34C759]" : "bg-[var(--sep3)]")}
              >
                <div className={cn("w-[26px] h-[26px] rounded-full bg-white shadow-sm transition-transform duration-300", isProMode ? "translate-x-[20px]" : "translate-x-0")} />
              </button>
            </div>
          </div>
        </div>

        {/* Appearance */}
        <div>
          <h3 className="text-[13px] font-semibold text-[var(--ter)] uppercase tracking-wider px-4 mb-2">Appearance</h3>
          <div className="bg-[var(--gb)] backdrop-blur-3xl border border-[var(--gbr)] rounded-[20px] shadow-[var(--sh)] overflow-hidden">
            <div className="p-4 border-b border-[var(--sep)]">
              <div className="flex items-center justify-between gap-4">
                <button 
                  onClick={() => setTheme('light')}
                  className={cn("flex-1 bg-[var(--s1)] border-2 rounded-xl p-4 flex flex-col items-center gap-3 transition-colors relative", theme === 'light' ? "border-[#007AFF]" : "border-[var(--sep2)] hover:border-[var(--sep3)]")}
                >
                  <Sun className={cn("w-8 h-8", theme === 'light' ? "text-[#007AFF]" : "text-[var(--sec)]")} />
                  <span className="font-medium text-[14px]">Light UI</span>
                  {theme === 'light' && <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#007AFF] flex items-center justify-center"><Check className="w-3 h-3 text-white"/></div>}
                </button>
                <button 
                  onClick={() => setTheme('dark')}
                  className={cn("flex-1 bg-[var(--s1)] border-2 rounded-xl p-4 flex flex-col items-center gap-3 transition-colors relative", theme === 'dark' ? "border-[#0A84FF]" : "border-[var(--sep2)] hover:border-[var(--sep3)]")}
                >
                  <Moon className={cn("w-8 h-8", theme === 'dark' ? "text-[#0A84FF]" : "text-[var(--sec)]")} />
                  <span className="font-medium text-[14px]">Dark UI</span>
                  {theme === 'dark' && <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#0A84FF] flex items-center justify-center"><Check className="w-3 h-3 text-white"/></div>}
                </button>
              </div>
            </div>
            <div className="p-4 flex items-center justify-between">
              <span className="text-[17px] font-medium text-[var(--lb)]">Accent Color</span>
              <div className="flex gap-2">
                {IOS_COLORS.map(c => (
                  <button 
                    key={c.name} 
                    onClick={() => setActiveAccent(c.value)}
                    className="w-[30px] h-[30px] rounded-full flex items-center justify-center transition-all"
                    style={{ backgroundColor: c.value, boxShadow: activeAccent === c.value ? `0 0 0 2px var(--s1), 0 0 0 4px ${c.value}` : 'none' }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Notifications & Privacy */}
        <div>
          <h3 className="text-[13px] font-semibold text-[var(--ter)] uppercase tracking-wider px-4 mb-2">Preferences</h3>
          <div className="bg-[var(--gb)] backdrop-blur-3xl border border-[var(--gbr)] rounded-[20px] shadow-[var(--sh)] overflow-hidden">
            <div className="flex items-center justify-between p-3.5 px-4 border-b border-[var(--sep)]">
              <div className="flex items-center gap-3.5">
                <div className="w-[30px] h-[30px] rounded-lg bg-[#FF3B30] flex items-center justify-center text-white"><Bell className="w-[18px] h-[18px]"/></div>
                <span className="text-[17px] font-medium text-[var(--lb)]">Notifications</span>
              </div>
              <button 
                onClick={() => setNotifications(!notifications)}
                className={cn("w-[50px] h-[30px] rounded-full p-[2px] transition-colors relative", notifications ? "bg-[#34C759]" : "bg-[var(--sep3)]")}
              >
                <div className={cn("w-[26px] h-[26px] rounded-full bg-white shadow-sm transition-transform duration-300", notifications ? "translate-x-[20px]" : "translate-x-0")} />
              </button>
            </div>
            <div className="flex items-center justify-between p-3.5 px-4 border-b border-[var(--sep)]">
              <div className="flex items-center gap-3.5">
                <div className="w-[30px] h-[30px] rounded-lg bg-[#FF9F0A] flex items-center justify-center text-white"><Star className="w-[18px] h-[18px]"/></div>
                <span className="text-[17px] font-medium text-[var(--lb)]">Gamification</span>
              </div>
              <button 
                onClick={() => setGamification(!gamification)}
                className={cn("w-[50px] h-[30px] rounded-full p-[2px] transition-colors relative", gamification ? "bg-[#34C759]" : "bg-[var(--sep3)]")}
              >
                <div className={cn("w-[26px] h-[26px] rounded-full bg-white shadow-sm transition-transform duration-300", gamification ? "translate-x-[20px]" : "translate-x-0")} />
              </button>
            </div>
            <div className="flex items-center justify-between p-3.5 px-4">
              <div className="flex items-center gap-3.5">
                <div className="w-[30px] h-[30px] rounded-lg bg-[#007AFF] flex items-center justify-center text-white"><Shield className="w-[18px] h-[18px]"/></div>
                <span className="text-[17px] font-medium text-[var(--lb)]">Data Telemetry</span>
              </div>
              <button 
                onClick={() => setTelemetry(!telemetry)}
                className={cn("w-[50px] h-[30px] rounded-full p-[2px] transition-colors relative", telemetry ? "bg-[#34C759]" : "bg-[var(--sep3)]")}
              >
                <div className={cn("w-[26px] h-[26px] rounded-full bg-white shadow-sm transition-transform duration-300", telemetry ? "translate-x-[20px]" : "translate-x-0")} />
              </button>
            </div>
          </div>
        </div>

        {/* About */}
        <div>
          <h3 className="text-[13px] font-semibold text-[var(--ter)] uppercase tracking-wider px-4 mb-2">About</h3>
          <div className="bg-[var(--gb)] backdrop-blur-3xl border border-[var(--gbr)] rounded-[20px] shadow-[var(--sh)] overflow-hidden">
            <div className="flex items-center justify-between p-3.5 px-4 border-b border-[var(--sep)]">
              <span className="text-[17px] font-medium text-[var(--lb)]">Version</span>
              <span className="text-[17px] text-[var(--sec)]">3.0.0 (Liquid Glass)</span>
            </div>
            <div className="flex items-center justify-between p-3.5 px-4 border-b border-[var(--sep)]">
              <span className="text-[17px] font-medium text-[var(--lb)]">AI Engine</span>
              <span className="text-[17px] text-[var(--sec)]">Gemini 1.5 Pro</span>
            </div>
            <div className="flex items-center justify-between p-3.5 px-4 border-b border-[var(--sep)]">
              <span className="text-[17px] font-medium text-[var(--lb)]">Core Framework</span>
              <span className="text-[17px] text-[var(--sec)]">Next.js 14 App Router</span>
            </div>
            <div className="flex items-center justify-between p-3.5 px-4 border-b border-[var(--sep)]">
              <span className="text-[17px] font-medium text-[var(--lb)]">Styling</span>
              <span className="text-[17px] text-[var(--sec)]">Tailwind CSS + Shadcn</span>
            </div>
            <div className="flex items-center justify-between p-3.5 px-4">
              <span className="text-[17px] font-medium text-[var(--lb)]">Icons</span>
              <span className="text-[17px] text-[var(--sec)]">Lucide React</span>
            </div>
          </div>
        </div>

      </div>
    </PageWrapper>
  );
}
