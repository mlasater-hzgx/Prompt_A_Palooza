import { ReactNode } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { herzogTheme } from './theme';

interface HerzogThemeProviderProps {
  children: ReactNode;
}

export function HerzogThemeProvider({ children }: HerzogThemeProviderProps) {
  return (
    <ThemeProvider theme={herzogTheme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
