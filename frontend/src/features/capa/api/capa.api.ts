import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../lib/api-client';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CapaFilters {
  page?: number;
  pageSize?: number;
  status?: string;
  priority?: string;
  search?: string;
}

export interface CapaCreateInput {
  title: string;
  description?: string;
  actionType: string;
  category: string;
  priority: string;
  assignedToId?: string;
  incidentId: string;
}

export interface CompleteCapaInput {
  capaId: string;
  completionNotes: string;
  completionEvidence?: string[];
}

export interface VerifyCapaInput {
  capaId: string;
  verificationResult: string;
  verificationNotes?: string;
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export function useCapas(filters: CapaFilters = {}) {
  return useQuery({
    queryKey: ['capas', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== undefined && v !== '') params.set(k, String(v));
      });
      const { data } = await apiClient.get(`/capas?${params}`);
      return data;
    },
  });
}

export function useCapa(id: string) {
  return useQuery({
    queryKey: ['capa', id],
    queryFn: async () => {
      const { data } = await apiClient.get(`/capas/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useCapaStats() {
  return useQuery({
    queryKey: ['capas', 'stats'],
    queryFn: async () => {
      const { data } = await apiClient.get('/capas/stats');
      return data;
    },
  });
}

export function useOverdueCapas() {
  return useQuery({
    queryKey: ['capas', 'overdue'],
    queryFn: async () => {
      const { data } = await apiClient.get('/capas/overdue');
      return data;
    },
  });
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export function useCreateCapa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: CapaCreateInput) => {
      const { data } = await apiClient.post('/capas', body);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['capas'] });
      qc.invalidateQueries({ queryKey: ['incidents'] });
    },
  });
}

export function useStartCapa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (capaId: string) => {
      const { data } = await apiClient.post(`/capas/${capaId}/start`);
      return data;
    },
    onSuccess: (_data, capaId) => {
      qc.invalidateQueries({ queryKey: ['capas'] });
      qc.invalidateQueries({ queryKey: ['capa', capaId] });
    },
  });
}

export function useCompleteCapa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ capaId, ...body }: CompleteCapaInput) => {
      const { data } = await apiClient.post(`/capas/${capaId}/complete`, body);
      return data;
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['capas'] });
      qc.invalidateQueries({ queryKey: ['capa', variables.capaId] });
    },
  });
}

export function useVerifyCapa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ capaId, ...body }: VerifyCapaInput) => {
      const { data } = await apiClient.post(`/capas/${capaId}/verify`, body);
      return data;
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['capas'] });
      qc.invalidateQueries({ queryKey: ['capa', variables.capaId] });
    },
  });
}
