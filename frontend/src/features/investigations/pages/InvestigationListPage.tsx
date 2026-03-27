import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router';
import {
  Box,
  Card,
  Chip,
  FormControl,
  FormControlLabel,
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
  TablePagination,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import { FilterList as FilterIcon } from '@mui/icons-material';
import { PageContainer } from '../../../components/layout/PageContainer';
import {
  useInvestigations,
  type InvestigationFilters,
} from '../api/investigations.api';
import { DIVISIONS } from '../../../config/constants';
import { colors } from '../../../design-system/tokens/colors';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const INVESTIGATION_STATUSES = [
  { value: 'NOT_STARTED', label: 'Not Started' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'PENDING_REVIEW', label: 'Pending Review' },
  { value: 'COMPLETE', label: 'Complete' },
] as const;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getStatusColor(
  status: string,
): 'success' | 'error' | 'warning' | 'info' | 'default' {
  switch (status) {
    case 'COMPLETE':
      return 'success';
    case 'IN_PROGRESS':
      return 'warning';
    case 'PENDING_REVIEW':
      return 'info';
    case 'NOT_STARTED':
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

function isOverdue(targetDate: string | null | undefined): boolean {
  if (!targetDate) return false;
  return new Date(targetDate) < new Date();
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function Component() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<InvestigationFilters>({
    page: 1,
    pageSize: 25,
  });

  const { data, isLoading, isError, error } = useInvestigations(filters);

  const investigations = data?.data ?? [];
  const meta = data?.meta ?? { total: 0, page: 1, pageSize: 25 };

  const handleFilterChange = useCallback(
    (field: keyof InvestigationFilters, value: string | boolean) => {
      setFilters((prev) => ({
        ...prev,
        [field]: value === '' ? undefined : value,
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
    (investigationId: string) => {
      navigate(`/investigations/${investigationId}`);
    },
    [navigate],
  );

  return (
    <PageContainer title="Investigations">
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

          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Status</InputLabel>
            <Select
              label="Status"
              value={filters.status ?? ''}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <MenuItem value="">All Statuses</MenuItem>
              {INVESTIGATION_STATUSES.map((s) => (
                <MenuItem key={s.value} value={s.value}>
                  {s.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Division</InputLabel>
            <Select
              label="Division"
              value={filters.division ?? ''}
              onChange={(e) => handleFilterChange('division', e.target.value)}
            >
              <MenuItem value="">All Divisions</MenuItem>
              {DIVISIONS.map((d) => (
                <MenuItem key={d.value} value={d.value}>
                  {d.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControlLabel
            control={
              <Switch
                checked={filters.overdue ?? false}
                onChange={(e) => handleFilterChange('overdue', e.target.checked)}
                color="error"
              />
            }
            label="Overdue Only"
          />
        </Box>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Error State */}
      {isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load investigations.{' '}
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
                  <TableCell>Incident #</TableCell>
                  <TableCell>Title</TableCell>
                  <TableCell>Lead Investigator</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Target Date</TableCell>
                  <TableCell>Division</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {investigations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                      <Typography color="text.secondary">
                        No investigations found. Adjust your filters or start an
                        investigation from an incident.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  investigations.map(
                    (investigation: {
                      id: string;
                      incidentNumber?: string;
                      incidentTitle?: string;
                      leadInvestigatorName?: string;
                      status?: string;
                      targetCompletionDate?: string;
                      division?: string;
                    }) => {
                      const overdue =
                        investigation.status !== 'COMPLETE' &&
                        isOverdue(investigation.targetCompletionDate);

                      return (
                        <TableRow
                          key={investigation.id}
                          hover
                          sx={{ cursor: 'pointer' }}
                          onClick={() => handleRowClick(investigation.id)}
                        >
                          <TableCell>
                            <Typography variant="body2" fontWeight={600}>
                              {investigation.incidentNumber ?? '--'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography
                              variant="body1"
                              noWrap
                              sx={{ maxWidth: 280 }}
                            >
                              {investigation.incidentTitle ?? 'Untitled'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {investigation.leadInvestigatorName ?? '--'}
                          </TableCell>
                          <TableCell>
                            {investigation.status ? (
                              <Chip
                                label={getLabelForValue(
                                  INVESTIGATION_STATUSES,
                                  investigation.status,
                                )}
                                size="small"
                                color={getStatusColor(investigation.status)}
                                variant="outlined"
                              />
                            ) : (
                              '--'
                            )}
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
                              {formatDate(investigation.targetCompletionDate)}
                              {overdue && ' (Overdue)'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {investigation.division
                              ? getLabelForValue(
                                  DIVISIONS,
                                  investigation.division,
                                )
                              : '--'}
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
            count={meta.total}
            page={(meta.page ?? 1) - 1}
            rowsPerPage={meta.pageSize ?? 25}
            rowsPerPageOptions={[10, 25, 50, 100]}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
          />
        </Card>
      )}
    </PageContainer>
  );
}
