import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Appearance } from 'react-native';
import { colors } from '../constants/theme';
import { getItem, setItem, storageKeys } from '../services/storage/local';

type ThemeMode = 'light' | 'dark';

type ThemeContextType = {
  mode: ThemeMode;
  palette: (typeof colors)['light'];
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: React.PropsWithChildren) {
  const [mode, setMode] = useState<ThemeMode>('light');

  useEffect(() => {
    let mounted = true;
    (async () => {
      const savedMode = await getItem<ThemeMode>(storageKeys.theme);
      if (savedMode && mounted) {
        setMode(savedMode);
        return;
      }
      const systemScheme = Appearance.getColorScheme();
      if (mounted) {
        setMode(systemScheme === 'dark' ? 'dark' : 'light');
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const toggleTheme = async () => {
    setMode((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      void setItem(storageKeys.theme, next);
      return next;
    });
  };

  const value = useMemo(
    () => ({
      mode,
      palette: colors[mode],
      toggleTheme,
    }),
    [mode]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
