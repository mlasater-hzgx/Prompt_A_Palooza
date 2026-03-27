import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Button,
  Card,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { PageContainer } from '../../../components/layout/PageContainer';
import { apiClient } from '../../../lib/api-client';
import { colors } from '../../../design-system/tokens/colors';

/* ---------- Types ---------- */

interface ConfigEntry {
  id: string;
  key: string;
  value: string;
  description: string;
}

interface EditFormState {
  key: string;
  value: string;
  description: string;
}

/* ---------- Well-known config keys ---------- */

const CONFIG_KEY_INFO: Record<string, string> = {
  trir_industry_benchmark: 'OSHA industry benchmark TRIR value for comparison dashboards',
  dart_industry_benchmark: 'OSHA industry benchmark DART rate for comparison dashboards',
  leading_indicator_near_miss_rate: 'Target near-miss reporting rate per 200,000 hours',
  notification_escalation_hours: 'Hours before escalating unacknowledged incident notifications',
  investigation_due_days: 'Default number of days allowed to complete an investigation',
  capa_default_due_days: 'Default number of days allowed to complete a CAPA',
  osha_reporting_window_hours: 'OSHA-mandated hours for reporting severe incidents',
  password_min_length: 'Minimum password length for local accounts',
  session_timeout_minutes: 'Inactive session timeout in minutes',
};

/* ---------- API hooks ---------- */

function useSystemConfig() {
  return useQuery({
    queryKey: ['admin', 'system-config'],
    queryFn: async () => {
      const { data } = await apiClient.get('/admin/system-config');
      return data;
    },
  });
}

function useUpdateConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...body }: { id: string } & Omit<EditFormState, 'key'>) => {
      const { data } = await apiClient.put(`/admin/system-config/${id}`, body);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'system-config'] });
    },
  });
}

/* ---------- Helpers ---------- */

function formatValue(value: string): string {
  try {
    const parsed: unknown = JSON.parse(value);
    return JSON.stringify(parsed, null, 2);
  } catch {
    return value;
  }
}

function truncateValue(value: string, maxLen = 80): string {
  const clean = value.replace(/\s+/g, ' ').trim();
  if (clean.length <= maxLen) return clean;
  return clean.slice(0, maxLen) + '...';
}

/* ---------- Main Component ---------- */

export function Component() {
  const [editEntry, setEditEntry] = useState<ConfigEntry | null>(null);
  const [editForm, setEditForm] = useState<EditFormState>({ key: '', value: '', description: '' });

  const { data, isLoading, isError, error } = useSystemConfig();
  const updateConfig = useUpdateConfig();

  const entries: ConfigEntry[] = data?.data ?? data ?? [];

  const openEdit = useCallback((entry: ConfigEntry) => {
    setEditEntry(entry);
    setEditForm({
      key: entry.key,
      value: formatValue(entry.value),
      description: entry.description,
    });
  }, []);

  const closeDialog = useCallback(() => {
    setEditEntry(null);
    setEditForm({ key: '', value: '', description: '' });
  }, []);

  const handleSave = useCallback(() => {
    if (!editEntry) return;
    updateConfig.mutate(
      { id: editEntry.id, value: editForm.value, description: editForm.description },
      { onSuccess: () => closeDialog() },
    );
  }, [editEntry, editForm, updateConfig, closeDialog]);

  return (
    <PageContainer title="System Configuration">
      {/* Key Descriptions Panel */}
      <Card sx={{ p: 2, mb: 3, backgroundColor: colors.neutral.offWhite }}>
        <Typography
          variant="subtitle2"
          sx={{ fontFamily: 'Oswald, sans-serif', color: colors.action.navyBlue, mb: 1 }}
        >
          Configuration Keys Reference
        </Typography>
        <Box
          component="dl"
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            gap: 0.5,
            m: 0,
            '& dt': { fontWeight: 600, fontSize: '0.8rem', fontFamily: 'monospace' },
            '& dd': { ml: 0, mb: 1, fontSize: '0.8rem', color: colors.brand.midGray },
          }}
        >
          {Object.entries(CONFIG_KEY_INFO).map(([key, desc]) => (
            <Box key={key}>
              <dt>{key}</dt>
              <dd>{desc}</dd>
            </Box>
          ))}
        </Box>
      </Card>

      {/* Loading / Error */}
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      )}
      {isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load configuration. {error instanceof Error ? error.message : 'Please try again.'}
        </Alert>
      )}

      {/* Table */}
      {!isLoading && !isError && (
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Key</TableCell>
                  <TableCell>Value</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {entries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                      <Typography color="text.secondary">No configuration entries</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  entries.map((entry) => (
                    <TableRow key={entry.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontFamily="monospace" fontWeight={600}>
                          {entry.key}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontFamily="monospace" sx={{ maxWidth: 260 }} noWrap>
                          {truncateValue(entry.value)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ maxWidth: 280 }} noWrap>
                          {entry.description || CONFIG_KEY_INFO[entry.key] || '--'}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Button size="small" onClick={() => openEdit(entry)}>
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={editEntry !== null} onClose={closeDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontFamily: 'Oswald, sans-serif', color: colors.action.navyBlue }}>
          Edit Configuration
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
            <TextField
              label="Key"
              fullWidth
              value={editForm.key}
              slotProps={{ input: { readOnly: true } }}
              sx={{ '& .MuiInputBase-input': { fontFamily: 'monospace' } }}
            />
            <TextField
              label="Value (JSON)"
              fullWidth
              multiline
              rows={6}
              value={editForm.value}
              onChange={(e) => setEditForm((prev) => ({ ...prev, value: e.target.value }))}
              sx={{ '& .MuiInputBase-input': { fontFamily: 'monospace', fontSize: '0.85rem' } }}
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={2}
              value={editForm.description}
              onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={updateConfig.isPending}
          >
            {updateConfig.isPending ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
}
