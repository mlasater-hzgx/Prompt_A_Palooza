import { ReactNode, useMemo } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { herzogLightTheme, herzogDarkTheme } from './theme';
import { useUiStore } from '../store/ui.store';

interface HerzogThemeProviderProps {
  children: ReactNode;
}

export function HerzogThemeProvider({ children }: HerzogThemeProviderProps) {
  const themeMode = useUiStore((s) => s.themeMode);
  const theme = useMemo(
    () => (themeMode === 'dark' ? herzogDarkTheme : herzogLightTheme),
    [themeMode],
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
