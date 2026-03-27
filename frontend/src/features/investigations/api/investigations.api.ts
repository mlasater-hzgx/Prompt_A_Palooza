import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../lib/api-client';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface InvestigationFilters {
  page?: number;
  pageSize?: number;
  status?: string;
  overdue?: boolean;
  division?: string;
  search?: string;
}

export interface FiveWhyInput {
  investigationId: string;
  sequence: number;
  question: string;
  answer: string;
  evidence?: string;
}

export interface FishboneFactorInput {
  investigationId: string;
  category: string;
  description: string;
  isContributing?: boolean;
  evidence?: string;
}

export interface ReviewInput {
  investigationId: string;
  reviewAction: string;
  reviewComments?: string;
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export function useInvestigations(filters: InvestigationFilters = {}) {
  return useQuery({
    queryKey: ['investigations', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== undefined && v !== '') params.set(k, String(v));
      });
      const { data } = await apiClient.get(`/investigations?${params}`);
      return data;
    },
  });
}

export function useInvestigation(id: string) {
  return useQuery({
    queryKey: ['investigation', id],
    queryFn: async () => {
      const { data } = await apiClient.get(`/investigations/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export function useCreateInvestigation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: Record<string, unknown>) => {
      const { data } = await apiClient.post('/investigations', body);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['investigations'] });
      qc.invalidateQueries({ queryKey: ['incidents'] });
    },
  });
}

export function useUpdateInvestigation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...body }: Record<string, unknown> & { id: string }) => {
      const { data } = await apiClient.put(`/investigations/${id}`, body);
      return data;
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['investigations'] });
      qc.invalidateQueries({ queryKey: ['investigation', variables.id] });
    },
  });
}

export function useSubmitReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ investigationId, ...body }: ReviewInput) => {
      const { data } = await apiClient.post(
        `/investigations/${investigationId}/review`,
        body,
      );
      return data;
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['investigations'] });
      qc.invalidateQueries({ queryKey: ['investigation', variables.investigationId] });
    },
  });
}

// ---------------------------------------------------------------------------
// 5-Why Mutations
// ---------------------------------------------------------------------------

export function useAddFiveWhy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ investigationId, ...body }: FiveWhyInput) => {
      const { data } = await apiClient.post(
        `/investigations/${investigationId}/five-whys`,
        body,
      );
      return data;
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['investigation', variables.investigationId] });
    },
  });
}

export function useDeleteFiveWhy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ investigationId, entryId }: { investigationId: string; entryId: string }) => {
      const { data } = await apiClient.delete(
        `/investigations/${investigationId}/five-whys/${entryId}`,
      );
      return data;
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['investigation', variables.investigationId] });
    },
  });
}

// ---------------------------------------------------------------------------
// Fishbone Mutations
// ---------------------------------------------------------------------------

export function useAddFishboneFactor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ investigationId, ...body }: FishboneFactorInput) => {
      const { data } = await apiClient.post(
        `/investigations/${investigationId}/fishbone-factors`,
        body,
      );
      return data;
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['investigation', variables.investigationId] });
    },
  });
}

export function useDeleteFishboneFactor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      investigationId,
      factorId,
    }: {
      investigationId: string;
      factorId: string;
    }) => {
      const { data } = await apiClient.delete(
        `/investigations/${investigationId}/fishbone-factors/${factorId}`,
      );
      return data;
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['investigation', variables.investigationId] });
    },
  });
}
