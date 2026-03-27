import Dexie, { type EntityTable } from 'dexie';

interface SyncQueueEntry {
  id?: number;
  entity: 'incident' | 'investigation' | 'capa' | 'witness_statement';
  operation: 'create' | 'update' | 'delete';
  entityId?: string;
  payload: string; // JSON stringified
  timestamp: number;
  retryCount: number;
  lastError?: string;
}

interface CachedIncident {
  id: string;
  data: string; // JSON stringified full incident
  updatedAt: number;
}

interface DraftIncident {
  localId: string;
  data: string; // JSON stringified form data
  createdAt: number;
  updatedAt: number;
}

class IncidentDB extends Dexie {
  syncQueue!: EntityTable<SyncQueueEntry, 'id'>;
  cachedIncidents!: EntityTable<CachedIncident, 'id'>;
  draftIncidents!: EntityTable<DraftIncident, 'localId'>;

  constructor() {
    super('IncidentInvestigation');
    this.version(1).stores({
      syncQueue: '++id, entity, timestamp',
      cachedIncidents: 'id, updatedAt',
      draftIncidents: 'localId, updatedAt',
    });
  }
}

export const db = new IncidentDB();
