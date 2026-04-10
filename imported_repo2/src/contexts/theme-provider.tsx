
"use client";

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

type Theme = 'light' | 'dark' | 'system';
type ResolvedTheme = 'light' | 'dark';

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'mediassistant-theme',
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === 'undefined') return defaultTheme;
    try {
      const storedTheme = window.localStorage.getItem(storageKey) as Theme | null;
      return storedTheme || defaultTheme;
    } catch (e) {
      console.warn(`Failed to read theme from localStorage ('${storageKey}')`, e);
      return defaultTheme;
    }
  });

  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('light');

  const applyTheme = useCallback((selectedTheme: Theme) => {
    let currentTheme: ResolvedTheme;
    if (selectedTheme === 'system') {
      currentTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } else {
      currentTheme = selectedTheme;
    }
    
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(currentTheme);
    setResolvedTheme(currentTheme);
  }, []);

  useEffect(() => {
    applyTheme(theme);
  }, [theme, applyTheme]);

  useEffect(() => {
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme('system');
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme, applyTheme]);

  const setTheme = (newTheme: Theme) => {
    try {
      window.localStorage.setItem(storageKey, newTheme);
    } catch (e) {
      console.warn(`Failed to save theme to localStorage ('${storageKey}')`, e);
    }
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
