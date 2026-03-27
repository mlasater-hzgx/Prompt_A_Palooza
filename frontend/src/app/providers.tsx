import { ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../lib/query-client';
import { HerzogThemeProvider } from '../design-system/ThemeProvider';
import { ErrorBoundary } from './error-boundary';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <HerzogThemeProvider>
          {children}
        </HerzogThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
