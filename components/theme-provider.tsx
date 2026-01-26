'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  mounted: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'crystal-xi-theme',
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  // Get the actual theme based on system preference if theme is 'system'
  const getResolvedTheme = (currentTheme: Theme): 'light' | 'dark' => {
    if (currentTheme === 'system') {
      if (typeof window !== 'undefined') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      return 'light';
    }
    return currentTheme;
  };

  useEffect(() => {
    setMounted(true);
    
    // Load saved theme from localStorage
    const savedTheme = localStorage.getItem(storageKey) as Theme | null;
    if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
      setThemeState(savedTheme);
      setResolvedTheme(getResolvedTheme(savedTheme));
    } else {
      setResolvedTheme(getResolvedTheme(defaultTheme));
    }
  }, [storageKey, defaultTheme]);

  useEffect(() => {
    if (!mounted) return;

    const resolved = getResolvedTheme(theme);
    setResolvedTheme(resolved);
    
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', resolved);
    
    // Save to localStorage
    localStorage.setItem(storageKey, theme);
  }, [theme, mounted, storageKey]);

  // Listen for system theme changes
  useEffect(() => {
    if (!mounted || theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      setResolvedTheme(e.matches ? 'dark' : 'light');
      document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [mounted, theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const value = {
    theme,
    resolvedTheme,
    setTheme,
    mounted,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

