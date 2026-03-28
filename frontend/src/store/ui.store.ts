import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type ThemeMode = 'light' | 'dark';

interface UiState {
  sidebarCollapsed: boolean;
  sidebarMobileOpen: boolean;
  themeMode: ThemeMode;
  toggleSidebar: () => void;
  setSidebarMobileOpen: (open: boolean) => void;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      sidebarMobileOpen: false,
      themeMode: 'light' as ThemeMode,
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarMobileOpen: (open) => set({ sidebarMobileOpen: open }),
      toggleTheme: () => set((state) => ({ themeMode: state.themeMode === 'light' ? 'dark' : 'light' })),
      setThemeMode: (mode) => set({ themeMode: mode }),
    }),
    {
      name: 'ui-store',
      partialize: (state) => ({ sidebarCollapsed: state.sidebarCollapsed, themeMode: state.themeMode }),
    }
  )
);
