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
import { Add as AddIcon, UploadFile as UploadIcon } from '@mui/icons-material';
import { PageContainer } from '../../../components/layout/PageContainer';
import { apiClient } from '../../../lib/api-client';
import { DIVISIONS } from '../../../config/constants';
import { colors } from '../../../design-system/tokens/colors';

/* ---------- Types ---------- */

interface HoursEntry {
  id: string;
  division: string;
  year: number;
  month: number;
  hours: number;
}

interface EntryFormState {
  division: string;
  year: number;
  month: number;
  hours: number;
}

/* ---------- Constants ---------- */

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
] as const;

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 6 }, (_, i) => currentYear - i);

const EMPTY_FORM: EntryFormState = {
  division: '',
  year: currentYear,
  month: 1,
  hours: 0,
};

/* ---------- API hooks ---------- */

function useHoursWorked(year: number) {
  return useQuery({
    queryKey: ['admin', 'hours-worked', year],
    queryFn: async () => {
      const { data } = await apiClient.get(`/admin/hours-worked?year=${year}`);
      return data;
    },
  });
}

function useCreateHoursEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: EntryFormState) => {
      const { data } = await apiClient.post('/admin/hours-worked', body);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'hours-worked'] });
    },
  });
}

function useUpdateHoursEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...body }: { id: string } & EntryFormState) => {
      const { data } = await apiClient.put(`/admin/hours-worked/${id}`, body);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'hours-worked'] });
    },
  });
}

/* ---------- Main Component ---------- */

export function Component() {
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<HoursEntry | null>(null);
  const [form, setForm] = useState<EntryFormState>(EMPTY_FORM);

  const { data, isLoading, isError, error } = useHoursWorked(selectedYear);
  const createEntry = useCreateHoursEntry();
  const updateEntry = useUpdateHoursEntry();

  const entries: HoursEntry[] = data?.data ?? data ?? [];

  const openAdd = useCallback(() => {
    setEditingEntry(null);
    setForm({ ...EMPTY_FORM, year: selectedYear });
    setDialogOpen(true);
  }, [selectedYear]);

  const openEdit = useCallback((entry: HoursEntry) => {
    setEditingEntry(entry);
    setForm({
      division: entry.division,
      year: entry.year,
      month: entry.month,
      hours: entry.hours,
    });
    setDialogOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    setDialogOpen(false);
    setEditingEntry(null);
    setForm(EMPTY_FORM);
  }, []);

  const handleSave = useCallback(() => {
    const onSuccess = () => closeDialog();
    if (editingEntry) {
      updateEntry.mutate({ id: editingEntry.id, ...form }, { onSuccess });
    } else {
      createEntry.mutate(form, { onSuccess });
    }
  }, [editingEntry, form, updateEntry, createEntry, closeDialog]);

  const handleCsvImport = useCallback(() => {
    // Placeholder for CSV import functionality
    alert('CSV import functionality will be available in a future release.');
  }, []);

  const isSaving = createEntry.isPending || updateEntry.isPending;

  const formatHours = (hours: number): string => {
    return hours.toLocaleString('en-US');
  };

  return (
    <PageContainer
      title="Hours Worked"
      actions={
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<UploadIcon />} onClick={handleCsvImport}>
            Import CSV
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd}>
            Add Entry
          </Button>
        </Box>
      }
    >
      {/* Year Selector */}
      <Card sx={{ p: 2, mb: 3 }}>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Year</InputLabel>
          <Select
            label="Year"
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
          >
            {YEARS.map((y) => (
              <MenuItem key={y} value={y}>
                {y}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Card>

      {/* Loading / Error */}
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      )}
      {isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load hours. {error instanceof Error ? error.message : 'Please try again.'}
        </Alert>
      )}

      {/* Table */}
      {!isLoading && !isError && (
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Division</TableCell>
                  <TableCell>Month</TableCell>
                  <TableCell align="right">Hours</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {entries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                      <Typography color="text.secondary">
                        No hours recorded for {selectedYear}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  entries.map((entry) => (
                    <TableRow key={entry.id} hover>
                      <TableCell>
                        <Typography fontWeight={600}>
                          {DIVISIONS.find((d) => d.value === entry.division)?.label ?? entry.division}
                        </Typography>
                      </TableCell>
                      <TableCell>{MONTHS[entry.month - 1] ?? entry.month}</TableCell>
                      <TableCell align="right">
                        <Typography fontWeight={500}>{formatHours(entry.hours)}</Typography>
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

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontFamily: 'Oswald, sans-serif', color: colors.action.navyBlue }}>
          {editingEntry ? 'Edit Hours Entry' : 'Add Hours Entry'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Division</InputLabel>
              <Select
                label="Division"
                value={form.division}
                onChange={(e) => setForm((prev) => ({ ...prev, division: e.target.value }))}
              >
                {DIVISIONS.map((d) => (
                  <MenuItem key={d.value} value={d.value}>
                    {d.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Year</InputLabel>
              <Select
                label="Year"
                value={form.year}
                onChange={(e) => setForm((prev) => ({ ...prev, year: Number(e.target.value) }))}
              >
                {YEARS.map((y) => (
                  <MenuItem key={y} value={y}>
                    {y}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Month</InputLabel>
              <Select
                label="Month"
                value={form.month}
                onChange={(e) => setForm((prev) => ({ ...prev, month: Number(e.target.value) }))}
              >
                {MONTHS.map((m, i) => (
                  <MenuItem key={m} value={i + 1}>
                    {m}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Hours"
              type="number"
              fullWidth
              value={form.hours}
              onChange={(e) => setForm((prev) => ({ ...prev, hours: Number(e.target.value) }))}
              slotProps={{ htmlInput: { min: 0 } }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={isSaving || !form.division || form.hours <= 0}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
}
