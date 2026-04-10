
// src/components/layout/client-layout-wrapper.tsx
"use client"; // This component handles all client-side logic and providers

import type { ReactNode } from 'react';
import React, { useEffect } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { Toaster } from "@/components/ui/toaster";
import { ProModeProvider } from '@/contexts/pro-mode-context';
import { ThemeProvider } from '@/contexts/theme-provider';

export function ClientLayoutWrapper({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then(registration => {
            console.log('Service Worker registered with scope:', registration.scope);
          })
          .catch(error => {
            console.error('Service Worker registration failed:', error);
          });
      });
    }
  }, []);

  return (
    <ThemeProvider defaultTheme="dark" storageKey="mediassistant-theme">
      <ProModeProvider>
        {/* AppLayout now safely sits inside client-side providers */}
        <AppLayout>{children}</AppLayout>
        <Toaster />
      </ProModeProvider>
    </ThemeProvider>
  );
}
