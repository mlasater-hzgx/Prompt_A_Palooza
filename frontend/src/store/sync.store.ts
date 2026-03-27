import { create } from 'zustand';

interface SyncState {
  pendingCount: number;
  isSyncing: boolean;
  lastSyncAt: Date | null;
  setPendingCount: (count: number) => void;
  setSyncing: (syncing: boolean) => void;
  setLastSync: (date: Date) => void;
}

export const useSyncStore = create<SyncState>((set) => ({
  pendingCount: 0,
  isSyncing: false,
  lastSyncAt: null,
  setPendingCount: (count) => set({ pendingCount: count }),
  setSyncing: (isSyncing) => set({ isSyncing }),
  setLastSync: (lastSyncAt) => set({ lastSyncAt }),
}));
