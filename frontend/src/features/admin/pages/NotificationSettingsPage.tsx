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
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { PageContainer } from '../../../components/layout/PageContainer';
import { apiClient } from '../../../lib/api-client';
import { INCIDENT_TYPES } from '../../../config/constants';
import { colors } from '../../../design-system/tokens/colors';

/* ---------- Types ---------- */

interface NotificationRule {
  id: string;
  railroadClient: string;
  incidentType: string;
  windowMinutes: number;
}

interface RuleFormState {
  railroadClient: string;
  incidentType: string;
  windowMinutes: number;
}

/* ---------- Constants ---------- */

const RAILROAD_CLIENTS = [
  { value: 'BNSF', label: 'BNSF Railway' },
  { value: 'UP', label: 'Union Pacific' },
  { value: 'NS', label: 'Norfolk Southern' },
  { value: 'CSX', label: 'CSX Transportation' },
  { value: 'CN', label: 'Canadian National' },
  { value: 'CP', label: 'Canadian Pacific' },
  { value: 'KCS', label: 'Kansas City Southern' },
  { value: 'OTHER', label: 'Other' },
] as const;

const EMPTY_FORM: RuleFormState = {
  railroadClient: '',
  incidentType: '',
  windowMinutes: 60,
};

/* ---------- API hooks ---------- */

function useNotificationRules() {
  return useQuery({
    queryKey: ['admin', 'notification-rules'],
    queryFn: async () => {
      const { data } = await apiClient.get('/config/notification-rules');
      return data;
    },
  });
}

function useCreateNotificationRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: RuleFormState) => {
      const { data } = await apiClient.put('/config/notification-rules', body);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'notification-rules'] });
    },
  });
}

function useUpdateNotificationRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...body }: { id: string } & RuleFormState) => {
      const { data } = await apiClient.put('/config/notification-rules', body);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'notification-rules'] });
    },
  });
}

/* ---------- Helpers ---------- */

function formatWindow(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) return `${hrs}h`;
  return `${hrs}h ${mins}m`;
}

/* ---------- Main Component ---------- */

export function Component() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<NotificationRule | null>(null);
  const [form, setForm] = useState<RuleFormState>(EMPTY_FORM);

  const { data, isLoading, isError, error } = useNotificationRules();
  const createRule = useCreateNotificationRule();
  const updateRule = useUpdateNotificationRule();

  const rules: NotificationRule[] = data?.data ?? data ?? [];

  const openAdd = useCallback(() => {
    setEditingRule(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  }, []);

  const openEdit = useCallback((rule: NotificationRule) => {
    setEditingRule(rule);
    setForm({
      railroadClient: rule.railroadClient,
      incidentType: rule.incidentType,
      windowMinutes: rule.windowMinutes,
    });
    setDialogOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    setDialogOpen(false);
    setEditingRule(null);
    setForm(EMPTY_FORM);
  }, []);

  const handleSave = useCallback(() => {
    const onSuccess = () => closeDialog();
    if (editingRule) {
      updateRule.mutate({ id: editingRule.id, ...form }, { onSuccess });
    } else {
      createRule.mutate(form, { onSuccess });
    }
  }, [editingRule, form, updateRule, createRule, closeDialog]);

  const isSaving = createRule.isPending || updateRule.isPending;

  return (
    <PageContainer
      title="Notification Settings"
      actions={
        <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd}>
          Add Rule
        </Button>
      }
    >
      {/* Loading / Error */}
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      )}
      {isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load notification rules.{' '}
          {error instanceof Error ? error.message : 'Please try again.'}
        </Alert>
      )}

      {/* Table */}
      {!isLoading && !isError && (
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Railroad Client</TableCell>
                  <TableCell>Incident Type</TableCell>
                  <TableCell>Notification Window</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rules.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                      <Typography color="text.secondary">No notification rules configured</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  rules.map((rule) => (
                    <TableRow key={rule.id} hover>
                      <TableCell>
                        <Typography fontWeight={600}>
                          {RAILROAD_CLIENTS.find((r) => r.value === rule.railroadClient)?.label ??
                            rule.railroadClient}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {INCIDENT_TYPES.find((t) => t.value === rule.incidentType)?.label ??
                          rule.incidentType}
                      </TableCell>
                      <TableCell>{formatWindow(rule.windowMinutes)}</TableCell>
                      <TableCell align="right">
                        <Button size="small" onClick={() => openEdit(rule)}>
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

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontFamily: 'Oswald, sans-serif', color: colors.action.navyBlue }}>
          {editingRule ? 'Edit Notification Rule' : 'Add Notification Rule'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Railroad Client</InputLabel>
              <Select
                label="Railroad Client"
                value={form.railroadClient}
                onChange={(e) => setForm((prev) => ({ ...prev, railroadClient: e.target.value }))}
              >
                {RAILROAD_CLIENTS.map((r) => (
                  <MenuItem key={r.value} value={r.value}>
                    {r.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Incident Type</InputLabel>
              <Select
                label="Incident Type"
                value={form.incidentType}
                onChange={(e) => setForm((prev) => ({ ...prev, incidentType: e.target.value }))}
              >
                {INCIDENT_TYPES.map((t) => (
                  <MenuItem key={t.value} value={t.value}>
                    {t.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Notification Window (minutes)"
              type="number"
              fullWidth
              value={form.windowMinutes}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, windowMinutes: Number(e.target.value) }))
              }
              slotProps={{ htmlInput: { min: 1 } }}
              helperText="Time window in minutes for sending the notification after an incident is reported"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={isSaving || !form.railroadClient || !form.incidentType || form.windowMinutes <= 0}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
}
