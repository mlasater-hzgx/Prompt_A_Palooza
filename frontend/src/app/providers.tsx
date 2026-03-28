import { ReactNode, useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../lib/query-client';
import { HerzogThemeProvider } from '../design-system/ThemeProvider';
import { ErrorBoundary } from './error-boundary';
import { apiClient } from '../lib/api-client';
import { useAuthStore } from '../store/auth.store';
import { useUiStore } from '../store/ui.store';

interface ProvidersProps {
  children: ReactNode;
}

function AuthLoader({ children }: { children: ReactNode }) {
  const { setUser } = useAuthStore();

  useEffect(() => {
    async function loadUser() {
      try {
        const { data } = await apiClient.get('/users/me');
        setUser(data.data);
      } catch {
        setUser(null);
      }
    }
    loadUser();
  }, [setUser]);

  return <>{children}</>;
}

function ThemeSync({ children }: { children: ReactNode }) {
  const themeMode = useUiStore((s) => s.themeMode);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', themeMode);
  }, [themeMode]);

  return <>{children}</>;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeSync>
          <HerzogThemeProvider>
            <AuthLoader>
              {children}
            </AuthLoader>
          </HerzogThemeProvider>
        </ThemeSync>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
