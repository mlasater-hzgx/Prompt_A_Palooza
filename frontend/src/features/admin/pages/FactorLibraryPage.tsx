import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Button,
  Card,
  Chip,
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
  Switch,
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
import { colors } from '../../../design-system/tokens/colors';

/* ---------- Types ---------- */

interface Factor {
  id: string;
  name: string;
  category: string;
  description: string;
  isActive: boolean;
}

interface FactorFormState {
  name: string;
  category: string;
  description: string;
  isActive: boolean;
}

/* ---------- Constants ---------- */

const CATEGORIES = [
  { value: 'HUMAN', label: 'Human' },
  { value: 'ENVIRONMENTAL', label: 'Environmental' },
  { value: 'EQUIPMENT', label: 'Equipment' },
  { value: 'PROCEDURAL', label: 'Procedural' },
  { value: 'ORGANIZATIONAL', label: 'Organizational' },
] as const;

function getCategoryColor(cat: string): 'primary' | 'success' | 'warning' | 'info' | 'default' {
  switch (cat) {
    case 'HUMAN':
      return 'primary';
    case 'ENVIRONMENTAL':
      return 'success';
    case 'EQUIPMENT':
      return 'warning';
    case 'PROCEDURAL':
      return 'info';
    default:
      return 'default';
  }
}

const EMPTY_FORM: FactorFormState = { name: '', category: '', description: '', isActive: true };

/* ---------- API hooks ---------- */

function useFactors() {
  return useQuery({
    queryKey: ['admin', 'factors'],
    queryFn: async () => {
      const { data } = await apiClient.get('/admin/factors');
      return data;
    },
  });
}

function useCreateFactor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: FactorFormState) => {
      const { data } = await apiClient.post('/admin/factors', body);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'factors'] });
    },
  });
}

function useUpdateFactor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...body }: { id: string } & FactorFormState) => {
      const { data } = await apiClient.put(`/admin/factors/${id}`, body);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'factors'] });
    },
  });
}

function useToggleFactorActive() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { data } = await apiClient.patch(`/admin/factors/${id}/active`, { isActive });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'factors'] });
    },
  });
}

/* ---------- Main Component ---------- */

export function Component() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingFactor, setEditingFactor] = useState<Factor | null>(null);
  const [form, setForm] = useState<FactorFormState>(EMPTY_FORM);

  const { data, isLoading, isError, error } = useFactors();
  const createFactor = useCreateFactor();
  const updateFactor = useUpdateFactor();
  const toggleActive = useToggleFactorActive();

  const factors: Factor[] = data?.data ?? data ?? [];

  const openAdd = useCallback(() => {
    setEditingFactor(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  }, []);

  const openEdit = useCallback((factor: Factor) => {
    setEditingFactor(factor);
    setForm({
      name: factor.name,
      category: factor.category,
      description: factor.description,
      isActive: factor.isActive,
    });
    setDialogOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    setDialogOpen(false);
    setEditingFactor(null);
    setForm(EMPTY_FORM);
  }, []);

  const handleSave = useCallback(() => {
    const onSuccess = () => closeDialog();
    if (editingFactor) {
      updateFactor.mutate({ id: editingFactor.id, ...form }, { onSuccess });
    } else {
      createFactor.mutate(form, { onSuccess });
    }
  }, [editingFactor, form, updateFactor, createFactor, closeDialog]);

  const handleToggleActive = useCallback(
    (factor: Factor) => {
      toggleActive.mutate({ id: factor.id, isActive: !factor.isActive });
    },
    [toggleActive],
  );

  const isSaving = createFactor.isPending || updateFactor.isPending;

  return (
    <PageContainer
      title="Factor Library"
      actions={
        <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd}>
          Add Factor
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
          Failed to load factors. {error instanceof Error ? error.message : 'Please try again.'}
        </Alert>
      )}

      {/* Table */}
      {!isLoading && !isError && (
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Active</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {factors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                      <Typography color="text.secondary">No factors configured</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  factors.map((factor) => (
                    <TableRow key={factor.id} hover>
                      <TableCell>
                        <Typography fontWeight={600}>{factor.name}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={CATEGORIES.find((c) => c.value === factor.category)?.label ?? factor.category}
                          size="small"
                          color={getCategoryColor(factor.category)}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ maxWidth: 300 }} noWrap>
                          {factor.description}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={factor.isActive}
                          onChange={() => handleToggleActive(factor)}
                          size="small"
                          color="success"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Button size="small" onClick={() => openEdit(factor)}>
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
          {editingFactor ? 'Edit Factor' : 'Add Factor'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
            <TextField
              label="Name"
              fullWidth
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            />
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                label="Category"
                value={form.category}
                onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
              >
                {CATEGORIES.map((c) => (
                  <MenuItem key={c.value} value={c.value}>
                    {c.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={isSaving || !form.name || !form.category}>
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
}
