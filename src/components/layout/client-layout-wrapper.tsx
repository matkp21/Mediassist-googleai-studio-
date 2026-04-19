
// src/components/layout/client-layout-wrapper.tsx
"use client"; // This component handles all client-side logic and providers

import type { ReactNode } from 'react';
import React, { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { Toaster } from "@/components/ui/toaster";
import { ProModeProvider } from '@/contexts/pro-mode-context';
import { ThemeProvider } from '@/contexts/theme-provider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export function ClientLayoutWrapper({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // 1. Safely instantiate QueryClient inside the component
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        // With SSR, we usually want to set some default staleTime
        // above 0 to avoid refetching immediately on the client
        staleTime: 60 * 1000, 
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="mediassistant-theme">
        <ProModeProvider>
          {/* AppLayout now safely sits inside client-side providers */}
          <AppLayout>{children}</AppLayout>
          <Toaster />
        </ProModeProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
