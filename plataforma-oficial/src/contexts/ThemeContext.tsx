'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type ThemeName = 'light' | 'grey' | 'midnight';

interface ThemeContextType {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  cycleTheme: () => void;
  themeLabel: string;
}

const themeLabels: Record<ThemeName, string> = {
  light: 'Enterprise Light',
  grey: 'Sophisticated Grey',
  midnight: 'Midnight Blue',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>('grey');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('tfm-theme') as ThemeName | null;
    if (saved && ['light', 'grey', 'midnight'].includes(saved)) {
      setThemeState(saved);
    } else {
      setThemeState('grey');
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      document.documentElement.setAttribute('data-theme', theme === 'light' ? '' : theme);
      localStorage.setItem('tfm-theme', theme);
    }
  }, [theme, mounted]);

  const setTheme = (t: ThemeName) => setThemeState(t);

  const cycleTheme = () => {
    const order: ThemeName[] = ['light', 'grey', 'midnight'];
    const idx = order.indexOf(theme);
    setThemeState(order[(idx + 1) % order.length]);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, cycleTheme, themeLabel: themeLabels[theme] }}>
      <div style={{ visibility: mounted ? 'visible' : 'hidden' }}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
