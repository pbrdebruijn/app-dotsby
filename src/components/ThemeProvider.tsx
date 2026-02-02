import React, { useEffect } from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';
import { useColorScheme } from 'nativewind';
import { useAppStore } from '../stores/appStore';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const systemColorScheme = useSystemColorScheme();
  const appearanceMode = useAppStore((s) => s.appearanceMode);
  const { setColorScheme } = useColorScheme();

  useEffect(() => {
    if (appearanceMode === 'system') {
      setColorScheme(systemColorScheme ?? 'light');
    } else {
      setColorScheme(appearanceMode);
    }
  }, [appearanceMode, systemColorScheme, setColorScheme]);

  return <>{children}</>;
}

export function useIsDark(): boolean {
  const systemColorScheme = useSystemColorScheme();
  const appearanceMode = useAppStore((s) => s.appearanceMode);

  if (appearanceMode === 'system') {
    return systemColorScheme === 'dark';
  }
  return appearanceMode === 'dark';
}
