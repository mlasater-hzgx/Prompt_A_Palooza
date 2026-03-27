import { db } from './db';
import { apiClient } from '../lib/api-client';
import { useSyncStore } from '../store/sync.store';

export async function addToSyncQueue(
  entity: 'incident' | 'investigation' | 'capa' | 'witness_statement',
  operation: 'create' | 'update' | 'delete',
  payload: unknown,
  entityId?: string,
) {
  await db.syncQueue.add({
    entity,
    operation,
    entityId,
    payload: JSON.stringify(payload),
    timestamp: Date.now(),
    retryCount: 0,
  });

  const count = await db.syncQueue.count();
  useSyncStore.getState().setPendingCount(count);
}

export async function processSyncQueue() {
  const store = useSyncStore.getState();
  if (store.isSyncing) return;

  store.setSyncing(true);

  try {
    const entries = await db.syncQueue.orderBy('timestamp').toArray();

    for (const entry of entries) {
      try {
        const payload = JSON.parse(entry.payload) as unknown;
        const entityPath = entry.entity === 'witness_statement' ? 'witness-statements' : `${entry.entity}s`;

        switch (entry.operation) {
          case 'create':
            await apiClient.post(`/${entityPath}`, payload);
            break;
          case 'update':
            if (entry.entityId) {
              await apiClient.put(`/${entityPath}/${entry.entityId}`, payload);
            }
            break;
          case 'delete':
            if (entry.entityId) {
              await apiClient.delete(`/${entityPath}/${entry.entityId}`);
            }
            break;
        }

        await db.syncQueue.delete(entry.id!);
      } catch (err) {
        // Increment retry count, stop after 5 retries
        const retryCount = entry.retryCount + 1;
        if (retryCount >= 5) {
          await db.syncQueue.update(entry.id!, {
            retryCount,
            lastError: err instanceof Error ? err.message : 'Unknown error',
          });
        } else {
          await db.syncQueue.update(entry.id!, { retryCount });
        }
      }
    }
  } finally {
    const count = await db.syncQueue.count();
    store.setPendingCount(count);
    store.setSyncing(false);
    store.setLastSync(new Date());
  }
}

// Listen for online events to trigger sync
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    void processSyncQueue();
  });
}
