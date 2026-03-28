import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router';
import {
  Box,
  Button,
  Card,
  Chip,
  FormControl,
  InputLabel,
  LinearProgress,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Typography,
  CircularProgress,
  Alert,
  InputAdornment,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { PageContainer } from '../../../components/layout/PageContainer';
import { useIncidents, type IncidentFilters } from '../api/incidents.api';
import {
  INCIDENT_TYPES,
  SEVERITY_LEVELS,
  INCIDENT_STATUSES,
  DIVISIONS,
} from '../../../config/constants';
import { colors } from '../../../design-system/tokens/colors';

function getStatusColor(status: string): 'success' | 'error' | 'warning' | 'info' | 'default' {
  switch (status) {
    case 'CLOSED':
      return 'success';
    case 'REOPENED':
      return 'error';
    case 'UNDER_INVESTIGATION':
    case 'CAPA_IN_PROGRESS':
      return 'warning';
    case 'REPORTED':
    case 'INVESTIGATION_COMPLETE':
    case 'CAPA_ASSIGNED':
      return 'info';
    default:
      return 'default';
  }
}

function getSeverityChipStyle(severity: string) {
  const level = SEVERITY_LEVELS.find((s) => s.value === severity);
  const bgColor = level?.color ?? colors.brand.midGray;
  return {
    backgroundColor: bgColor,
    color: colors.neutral.white,
  };
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

export function Component() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<IncidentFilters>({
    page: 1,
    pageSize: 25,
  });
  const [searchInput, setSearchInput] = useState('');

  const { data, isLoading, isError, error } = useIncidents(filters);

  const incidents = data?.data ?? [];
  const totalCount = data?.meta?.pagination?.totalCount ?? 0;

  const handleFilterChange = useCallback(
    (field: keyof IncidentFilters, value: string) => {
      setFilters((prev) => ({ ...prev, [field]: value || undefined, page: 1 }));
    },
    [],
  );

  const handleSearch = useCallback(() => {
    setFilters((prev) => ({ ...prev, search: searchInput || undefined, page: 1 }));
  }, [searchInput]);

  const handleSearchKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') handleSearch();
    },
    [handleSearch],
  );

  const handlePageChange = useCallback((_: unknown, newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage + 1 }));
  }, []);

  const handleRowsPerPageChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFilters((prev) => ({ ...prev, pageSize: parseInt(e.target.value, 10), page: 1 }));
    },
    [],
  );

  const handleRowClick = useCallback(
    (incidentId: string) => {
      navigate(`/incidents/${incidentId}`);
    },
    [navigate],
  );

  return (
    <PageContainer
      title="Incidents"
      actions={
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => navigate('/incidents/new')}
        >
          Report Incident
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

          <TextField
            size="small"
            placeholder="Search incidents..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            onBlur={handleSearch}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
            sx={{ minWidth: 220 }}
          />

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Type</InputLabel>
            <Select
              label="Type"
              value={filters.incidentType ?? ''}
              onChange={(e) => handleFilterChange('incidentType', e.target.value)}
            >
              <MenuItem value="">All Types</MenuItem>
              {INCIDENT_TYPES.map((t) => (
                <MenuItem key={t.value} value={t.value}>
                  {t.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Severity</InputLabel>
            <Select
              label="Severity"
              value={filters.severity ?? ''}
              onChange={(e) => handleFilterChange('severity', e.target.value)}
            >
              <MenuItem value="">All Severities</MenuItem>
              {SEVERITY_LEVELS.map((s) => (
                <MenuItem key={s.value} value={s.value}>
                  {s.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select
              label="Status"
              value={filters.status ?? ''}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <MenuItem value="">All Statuses</MenuItem>
              {INCIDENT_STATUSES.map((s) => (
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
          Failed to load incidents.{' '}
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
                  <TableCell>Type</TableCell>
                  <TableCell>Severity</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Division</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Completion</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {incidents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                      <Typography color="text.secondary">
                        No incidents found. Adjust your filters or report a new incident.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  incidents.map(
                    (incident: {
                      id: string;
                      incidentNumber?: string;
                      title?: string;
                      incidentType?: string;
                      severity?: string;
                      status?: string;
                      division?: string;
                      incidentDate?: string;
                      isDraft?: boolean;
                      completionPercentage?: number;
                    }) => (
                      <TableRow
                        key={incident.id}
                        hover
                        sx={{ cursor: 'pointer' }}
                        onClick={() => handleRowClick(incident.id)}
                      >
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            {incident.incidentNumber ?? '--'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body1" noWrap sx={{ maxWidth: 280 }}>
                            {incident.title ?? 'Untitled Incident'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {incident.incidentType
                            ? getLabelForValue(INCIDENT_TYPES, incident.incidentType)
                            : '--'}
                        </TableCell>
                        <TableCell>
                          {incident.severity ? (
                            <Chip
                              label={getLabelForValue(SEVERITY_LEVELS, incident.severity)}
                              size="small"
                              sx={getSeverityChipStyle(incident.severity)}
                            />
                          ) : (
                            '--'
                          )}
                        </TableCell>
                        <TableCell>
                          {incident.status ? (
                            <Chip
                              label={getLabelForValue(INCIDENT_STATUSES, incident.status)}
                              size="small"
                              color={getStatusColor(incident.status)}
                              variant="outlined"
                            />
                          ) : (
                            '--'
                          )}
                        </TableCell>
                        <TableCell>
                          {incident.division
                            ? getLabelForValue(DIVISIONS, incident.division)
                            : '--'}
                        </TableCell>
                        <TableCell>{formatDate(incident.incidentDate)}</TableCell>
                        <TableCell sx={{ minWidth: 120 }}>
                          {incident.isDraft ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <LinearProgress
                                variant="determinate"
                                value={incident.completionPercentage ?? 0}
                                sx={{ flexGrow: 1, height: 6, borderRadius: 3 }}
                              />
                              <Typography variant="body2" color="text.secondary">
                                {incident.completionPercentage ?? 0}%
                              </Typography>
                            </Box>
                          ) : (
                            <Chip
                              label="Complete"
                              size="small"
                              color="success"
                              variant="outlined"
                            />
                          )}
                        </TableCell>
                      </TableRow>
                    ),
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
