import { useEffect } from 'react';
import { useAuthStore } from '../store/auth.store';
import { apiClient } from '../lib/api-client';
import { isAzureAdConfigured } from '../lib/msalConfig';

export function useAuth() {
  const { user, isAuthenticated, isLoading, setUser, setLoading } = useAuthStore();

  useEffect(() => {
    async function loadUser() {
      try {
        if (!isAzureAdConfigured) {
          // Dev mode: fetch the dev user from /api/users/me
          const { data } = await apiClient.get('/users/me');
          setUser(data.data);
        } else {
          // Production: MSAL handles auth, fetch user profile
          const { data } = await apiClient.get('/users/me');
          setUser(data.data);
        }
      } catch {
        setUser(null);
      }
    }

    if (isLoading) {
      loadUser();
    }
  }, [isLoading, setUser, setLoading]);

  return { user, isAuthenticated, isLoading };
}
