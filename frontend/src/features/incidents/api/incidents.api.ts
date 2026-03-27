import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../lib/api-client';

export interface IncidentFilters {
  page?: number;
  pageSize?: number;
  incidentType?: string;
  severity?: string;
  status?: string;
  division?: string;
  search?: string;
  isDraft?: string;
}

export function useIncidents(filters: IncidentFilters = {}) {
  return useQuery({
    queryKey: ['incidents', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== undefined && v !== '') params.set(k, String(v));
      });
      const { data } = await apiClient.get(`/incidents?${params}`);
      return data;
    },
  });
}

export function useIncident(id: string) {
  return useQuery({
    queryKey: ['incident', id],
    queryFn: async () => {
      const { data } = await apiClient.get(`/incidents/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateIncident() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: Record<string, unknown>) => {
      const { data } = await apiClient.post('/incidents', body);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['incidents'] });
    },
  });
}

export function useUpdateIncident() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...body }: Record<string, unknown> & { id: string }) => {
      const { data } = await apiClient.put(`/incidents/${id}`, body);
      return data;
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['incidents'] });
      qc.invalidateQueries({ queryKey: ['incident', variables.id] });
    },
  });
}

export function useTransitionIncidentStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data } = await apiClient.patch(`/incidents/${id}/status`, { status });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['incidents'] });
    },
  });
}

export function useIncidentInjuredPersons(incidentId: string) {
  return useQuery({
    queryKey: ['incident', incidentId, 'injured-persons'],
    queryFn: async () => {
      const { data } = await apiClient.get(`/incidents/${incidentId}/injured-persons`);
      return data;
    },
    enabled: !!incidentId,
  });
}

export function useIncidentTimeline(incidentId: string) {
  return useQuery({
    queryKey: ['incident', incidentId, 'timeline'],
    queryFn: async () => {
      const { data } = await apiClient.get(`/incidents/${incidentId}/timeline`);
      return data;
    },
    enabled: !!incidentId,
  });
}

export function useIncidentCapas(incidentId: string) {
  return useQuery({
    queryKey: ['incident', incidentId, 'capas'],
    queryFn: async () => {
      const { data } = await apiClient.get(`/incidents/${incidentId}/capas`);
      return data;
    },
    enabled: !!incidentId,
  });
}

export function useIncidentRecurrence(incidentId: string) {
  return useQuery({
    queryKey: ['incident', incidentId, 'recurrence'],
    queryFn: async () => {
      const { data } = await apiClient.get(`/incidents/${incidentId}/recurrence`);
      return data;
    },
    enabled: !!incidentId,
  });
}
