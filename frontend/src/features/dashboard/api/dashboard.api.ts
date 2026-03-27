import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../lib/api-client';

/* ---------- Executive & Division Dashboards ---------- */

export function useExecutiveDashboard() {
  return useQuery({
    queryKey: ['dashboard', 'executive'],
    queryFn: async () => {
      const { data } = await apiClient.get('/dashboard/executive');
      return data;
    },
  });
}

export function useDivisionDashboard(divisionId: string | undefined) {
  return useQuery({
    queryKey: ['dashboard', 'division', divisionId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/dashboard/division/${divisionId}`);
      return data;
    },
    enabled: !!divisionId,
  });
}

/* ---------- Analytics / Trend Hooks ---------- */

export function useIncidentTrends() {
  return useQuery({
    queryKey: ['analytics', 'incident-trends'],
    queryFn: async () => {
      const { data } = await apiClient.get('/analytics/incident-trends');
      return data;
    },
  });
}

export function useTrirDartHistory() {
  return useQuery({
    queryKey: ['analytics', 'trir-dart-history'],
    queryFn: async () => {
      const { data } = await apiClient.get('/analytics/trir-dart-history');
      return data;
    },
  });
}

export function useLeadingIndicators() {
  return useQuery({
    queryKey: ['analytics', 'leading-indicators'],
    queryFn: async () => {
      const { data } = await apiClient.get('/analytics/leading-indicators');
      return data;
    },
  });
}

export function useDivisionComparison() {
  return useQuery({
    queryKey: ['analytics', 'division-comparison'],
    queryFn: async () => {
      const { data } = await apiClient.get('/analytics/division-comparison');
      return data;
    },
  });
}

export function useSeverityDistribution() {
  return useQuery({
    queryKey: ['analytics', 'severity-distribution'],
    queryFn: async () => {
      const { data } = await apiClient.get('/analytics/severity-distribution');
      return data;
    },
  });
}

export function useContributingFactors() {
  return useQuery({
    queryKey: ['analytics', 'contributing-factors'],
    queryFn: async () => {
      const { data } = await apiClient.get('/analytics/contributing-factors');
      return data;
    },
  });
}

export function useBodyPartFrequency() {
  return useQuery({
    queryKey: ['analytics', 'body-part-frequency'],
    queryFn: async () => {
      const { data } = await apiClient.get('/analytics/body-part-frequency');
      return data;
    },
  });
}
