import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router';
import {
  Box,
  Button,
  Card,
  Chip,
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
  TablePagination,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { PageContainer } from '../../../components/layout/PageContainer';
import { useCapas, type CapaFilters } from '../api/capa.api';
import { colors } from '../../../design-system/tokens/colors';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CAPA_STATUSES = [
  { value: 'OPEN', label: 'Open' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'VERIFICATION_PENDING', label: 'Verification Pending' },
  { value: 'VERIFIED_EFFECTIVE', label: 'Verified Effective' },
  { value: 'VERIFIED_INEFFECTIVE', label: 'Verified Ineffective' },
  { value: 'OVERDUE', label: 'Overdue' },
] as const;

const CAPA_PRIORITIES = [
  { value: 'CRITICAL', label: 'Critical', chipColor: colors.semantic.error },
  { value: 'HIGH', label: 'High', chipColor: colors.semantic.warning },
  { value: 'MEDIUM', label: 'Medium', chipColor: colors.action.navyBlue },
  { value: 'LOW', label: 'Low', chipColor: colors.brand.midGray },
] as const;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getStatusColor(
  status: string,
): 'success' | 'error' | 'warning' | 'info' | 'default' {
  switch (status) {
    case 'VERIFIED_EFFECTIVE':
      return 'success';
    case 'OVERDUE':
    case 'VERIFIED_INEFFECTIVE':
      return 'error';
    case 'IN_PROGRESS':
    case 'VERIFICATION_PENDING':
      return 'warning';
    case 'COMPLETED':
      return 'info';
    case 'OPEN':
    default:
      return 'default';
  }
}

function getLabelForValue(
  items: ReadonlyArray<{ value: string; label: string }>,
  value: string,
): string {
  return items.find((item) => item.value === value)?.label ?? value;
}

function getPriorityChipStyle(priority: string) {
  const p = CAPA_PRIORITIES.find((x) => x.value === priority);
  return {
    backgroundColor: p?.chipColor ?? colors.brand.midGray,
    color: colors.neutral.white,
  };
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '--';
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function formatCurrency(value: number | string | null | undefined): string {
  if (value == null) return '--';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '--';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(num);
}

function isOverdue(dueDate: string | null | undefined): boolean {
  if (!dueDate) return false;
  return new Date(dueDate) < new Date();
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function Component() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<CapaFilters>({
    page: 1,
    pageSize: 25,
  });

  const { data, isLoading, isError, error } = useCapas(filters);

  const capas = data?.data ?? [];
  const totalCount = data?.meta?.pagination?.totalCount ?? 0;

  const handleFilterChange = useCallback(
    (field: keyof CapaFilters, value: string) => {
      setFilters((prev) => ({
        ...prev,
        [field]: value || undefined,
        page: 1,
      }));
    },
    [],
  );

  const handlePageChange = useCallback((_: unknown, newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage + 1 }));
  }, []);

  const handleRowsPerPageChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFilters((prev) => ({
        ...prev,
        pageSize: parseInt(e.target.value, 10),
        page: 1,
      }));
    },
    [],
  );

  const handleRowClick = useCallback(
    (capaId: string) => {
      navigate(`/capa/${capaId}`);
    },
    [navigate],
  );

  return (
    <PageContainer
      title="Corrective & Preventive Actions"
      actions={
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => navigate('/capa/new')}
        >
          Create CAPA
        </Button>
      }
    >
      {/* Filter Bar */}
      <Card sx={{ p: 2, mb: 3 }}>
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          <FilterIcon sx={{ color: colors.brand.midGray }} />

          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Status</InputLabel>
            <Select
              label="Status"
              value={filters.status ?? ''}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <MenuItem value="">All Statuses</MenuItem>
              {CAPA_STATUSES.map((s) => (
                <MenuItem key={s.value} value={s.value}>
                  {s.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Priority</InputLabel>
            <Select
              label="Priority"
              value={filters.priority ?? ''}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
            >
              <MenuItem value="">All Priorities</MenuItem>
              {CAPA_PRIORITIES.map((p) => (
                <MenuItem key={p.value} value={p.value}>
                  {p.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Card>

      {/* Loading */}
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Error */}
      {isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load CAPAs.{' '}
          {error instanceof Error ? error.message : 'Please try again.'}
        </Alert>
      )}

      {/* Data Table */}
      {!isLoading && !isError && (
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>CAPA #</TableCell>
                  <TableCell>Title</TableCell>
                  <TableCell>Incident #</TableCell>
                  <TableCell>Priority</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Assigned To</TableCell>
                  <TableCell>Due Date</TableCell>
                  <TableCell align="right">Cost</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {capas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                      <Typography color="text.secondary">
                        No CAPAs found. Adjust your filters or create a new
                        CAPA.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  capas.map(
                    (capa: {
                      id: string;
                      capaNumber?: string;
                      title?: string;
                      incidentNumber?: string;
                      priority?: string;
                      status?: string;
                      assignedToName?: string;
                      dueDate?: string;
                      cost?: number | string;
                    }) => {
                      const overdue =
                        capa.status !== 'VERIFIED_EFFECTIVE' &&
                        capa.status !== 'COMPLETED' &&
                        capa.status !== 'VERIFIED_INEFFECTIVE' &&
                        isOverdue(capa.dueDate);

                      return (
                        <TableRow
                          key={capa.id}
                          hover
                          sx={(theme) => ({
                            cursor: 'pointer',
                            backgroundColor: overdue
                              ? theme.palette.mode === 'dark'
                                ? 'rgba(171, 45, 36, 0.15)'
                                : colors.semantic.errorLight
                              : undefined,
                          })}
                          onClick={() => handleRowClick(capa.id)}
                        >
                          <TableCell>
                            <Typography variant="body2" fontWeight={600}>
                              {capa.capaNumber ?? '--'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography
                              variant="body1"
                              noWrap
                              sx={{ maxWidth: 240 }}
                            >
                              {capa.title ?? 'Untitled'}
                            </Typography>
                          </TableCell>
                          <TableCell>{capa.incidentNumber ?? '--'}</TableCell>
                          <TableCell>
                            {capa.priority ? (
                              <Chip
                                label={getLabelForValue(
                                  CAPA_PRIORITIES,
                                  capa.priority,
                                )}
                                size="small"
                                sx={getPriorityChipStyle(capa.priority)}
                              />
                            ) : (
                              '--'
                            )}
                          </TableCell>
                          <TableCell>
                            {capa.status ? (
                              <Chip
                                label={getLabelForValue(
                                  CAPA_STATUSES,
                                  capa.status,
                                )}
                                size="small"
                                color={getStatusColor(capa.status)}
                                variant="outlined"
                              />
                            ) : (
                              '--'
                            )}
                          </TableCell>
                          <TableCell>
                            {capa.assignedToName ?? '--'}
                          </TableCell>
                          <TableCell>
                            <Typography
                              variant="body2"
                              sx={{
                                color: overdue
                                  ? colors.semantic.error
                                  : 'text.primary',
                                fontWeight: overdue ? 700 : 400,
                              }}
                            >
                              {formatDate(capa.dueDate)}
                              {overdue && ' (Overdue)'}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            {formatCurrency(capa.cost)}
                          </TableCell>
                        </TableRow>
                      );
                    },
                  )
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={totalCount}
            page={(filters.page ?? 1) - 1}
            rowsPerPage={filters.pageSize ?? 25}
            rowsPerPageOptions={[10, 25, 50, 100]}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
          />
        </Card>
      )}
    </PageContainer>
  );
}
