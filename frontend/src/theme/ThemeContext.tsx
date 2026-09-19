import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: ThemeMode;
  effectiveTheme: 'light' | 'dark';
  setTheme: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const stored = localStorage.getItem('daybook_theme') as ThemeMode;
    return stored || 'system';
  });

  const getSystemTheme = (): 'light' | 'dark' => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  const [effectiveTheme, setEffectiveTheme] = useState<'light' | 'dark'>(() => {
    return theme === 'system' ? getSystemTheme() : theme;
  });

  const applyThemeToDom = (newEffective: 'light' | 'dark') => {
    document.documentElement.setAttribute('data-theme', newEffective);
    if (newEffective === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    const meta = document.getElementById('theme-color-meta');
    if (meta) {
      meta.setAttribute('content', newEffective === 'dark' ? '#0D0E12' : '#F6F2EA');
    }
  };

  const setTheme = (mode: ThemeMode) => {
    const nextEffective = mode === 'system' ? getSystemTheme() : mode;

    // Use View Transitions API if supported
    if (typeof document !== 'undefined' && 'startViewTransition' in document) {
      (document as any).startViewTransition(() => {
        setThemeState(mode);
        setEffectiveTheme(nextEffective);
        applyThemeToDom(nextEffective);
        localStorage.setItem('daybook_theme', mode);
      });
    } else {
      setThemeState(mode);
      setEffectiveTheme(nextEffective);
      applyThemeToDom(nextEffective);
      localStorage.setItem('daybook_theme', mode);
    }
  };

  const toggleTheme = () => {
    const next = effectiveTheme === 'dark' ? 'light' : 'dark';
    setTheme(next);
  };

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        const sys = getSystemTheme();
        setEffectiveTheme(sys);
        applyThemeToDom(sys);
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  useEffect(() => {
    const eff = theme === 'system' ? getSystemTheme() : theme;
    setEffectiveTheme(eff);
    applyThemeToDom(eff);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, effectiveTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
