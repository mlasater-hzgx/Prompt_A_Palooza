import { ReactElement } from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../../src/lib/query-client';
import { HerzogThemeProvider } from '../../src/design-system/ThemeProvider';

function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <HerzogThemeProvider>
        {children}
      </HerzogThemeProvider>
    </QueryClientProvider>
  );
}

export function renderWithProviders(ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
  return render(ui, { wrapper: Providers, ...options });
}
