import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import {
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Alert,
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
  TextField,
  Typography,
} from '@mui/material';
import {
  Add as CreateIcon,
  Edit as UpdateIcon,
  SwapHoriz as StatusIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { PageContainer } from '../../../components/layout/PageContainer';
import { apiClient } from '../../../lib/api-client';
import { colors } from '../../../design-system/tokens/colors';

interface AuditLogEntry {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  changes: Record<string, unknown> | null;
  userId: string;
  incidentId: string | null;
  createdAt: string;
  user: { id: string; name: string; email: string; role: string };
  incident: { id: string; incidentNumber: string; title: string } | null;
}

const ACTION_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  CREATED: { label: 'Created', color: colors.semantic.success, icon: <CreateIcon sx={{ fontSize: 16 }} /> },
  UPDATED: { label: 'Updated', color: colors.semantic.info, icon: <UpdateIcon sx={{ fontSize: 16 }} /> },
  STATUS_CHANGED: { label: 'Status Changed', color: colors.semantic.warning, icon: <StatusIcon sx={{ fontSize: 16 }} /> },
  DELETED: { label: 'Deleted', color: colors.semantic.error, icon: <DeleteIcon sx={{ fontSize: 16 }} /> },
};

const ENTITY_COLORS: Record<string, string> = {
  Incident: colors.dataViz[0]!,
  Investigation: colors.dataViz[1]!,
  Capa: colors.dataViz[2]!,
  InjuredPerson: colors.dataViz[3]!,
  WitnessStatement: colors.dataViz[4]!,
  FiveWhyAnalysis: colors.dataViz[5]!,
  FishboneFactor: colors.dataViz[6]!,
  ContributingFactor: colors.dataViz[7]!,
  RecurrenceLink: colors.dataViz[0]!,
  User: colors.dataViz[1]!,
  Config: colors.dataViz[2]!,
};

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

function formatEntityType(type: string): string {
  return type.replace(/([A-Z])/g, ' $1').trim();
}

function useAuditLogs(filters: {
  page: number;
  pageSize: number;
  entityType?: string;
  action?: string;
  startDate?: string;
  endDate?: string;
}) {
  return useQuery({
    queryKey: ['audit-logs', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set('page', String(filters.page + 1));
      params.set('pageSize', String(filters.pageSize));
      if (filters.entityType) params.set('entityType', filters.entityType);
      if (filters.action) params.set('action', filters.action);
      if (filters.startDate) params.set('startDate', filters.startDate);
      if (filters.endDate) params.set('endDate', filters.endDate);
      const { data } = await apiClient.get(`/audit-logs?${params}`);
      return data;
    },
  });
}

function useEntityTypes() {
  return useQuery({
    queryKey: ['audit-logs', 'entity-types'],
    queryFn: async () => {
      const { data } = await apiClient.get('/audit-logs/entity-types');
      return data;
    },
  });
}

export function Component() {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [entityType, setEntityType] = useState('');
  const [action, setAction] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const { data, isLoading, isError, error } = useAuditLogs({
    page,
    pageSize,
    entityType: entityType || undefined,
    action: action || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  });
  const { data: entityTypesData } = useEntityTypes();

  const logs: AuditLogEntry[] = data?.data ?? [];
  const totalCount = data?.meta?.pagination?.totalCount ?? 0;
  const entityTypes: string[] = entityTypesData?.data ?? [];

  const handleClearFilters = useCallback(() => {
    setEntityType('');
    setAction('');
    setStartDate('');
    setEndDate('');
    setPage(0);
  }, []);

  return (
    <PageContainer title="Transaction Log">
      {/* Filters */}
      <Card sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Entity Type</InputLabel>
            <Select
              label="Entity Type"
              value={entityType}
              onChange={(e) => { setEntityType(e.target.value); setPage(0); }}
            >
              <MenuItem value="">All</MenuItem>
              {entityTypes.map((t) => (
                <MenuItem key={t} value={t}>{formatEntityType(t)}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Action</InputLabel>
            <Select
              label="Action"
              value={action}
              onChange={(e) => { setAction(e.target.value); setPage(0); }}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="CREATED">Created</MenuItem>
              <MenuItem value="UPDATED">Updated</MenuItem>
              <MenuItem value="STATUS_CHANGED">Status Changed</MenuItem>
              <MenuItem value="DELETED">Deleted</MenuItem>
            </Select>
          </FormControl>

          <TextField
            size="small"
            type="date"
            label="From"
            value={startDate}
            onChange={(e) => { setStartDate(e.target.value); setPage(0); }}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{ minWidth: 150 }}
          />

          <TextField
            size="small"
            type="date"
            label="To"
            value={endDate}
            onChange={(e) => { setEndDate(e.target.value); setPage(0); }}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{ minWidth: 150 }}
          />

          {(entityType || action || startDate || endDate) && (
            <Button variant="text" onClick={handleClearFilters}>
              Clear Filters
            </Button>
          )}
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
          Failed to load audit logs. {error instanceof Error ? error.message : 'Please try again.'}
        </Alert>
      )}

      {/* Table */}
      {!isLoading && !isError && (
        <Card>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Timestamp</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>Action</TableCell>
                  <TableCell>Entity</TableCell>
                  <TableCell>Incident</TableCell>
                  <TableCell>Details</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                      <ViewIcon sx={{ fontSize: 48, color: colors.brand.smoke, mb: 1, display: 'block', mx: 'auto' }} />
                      <Typography color="text.secondary">No audit log entries found.</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => {
                    const actionCfg = ACTION_CONFIG[log.action] ?? { label: log.action, color: colors.brand.midGray, icon: <ViewIcon sx={{ fontSize: 16 }} /> };
                    const entityColor = ENTITY_COLORS[log.entityType] ?? colors.brand.midGray;

                    return (
                      <TableRow key={log.id} hover>
                        <TableCell sx={{ whiteSpace: 'nowrap', fontSize: '0.78rem' }}>
                          {formatDate(log.createdAt)}
                        </TableCell>
                        <TableCell>
                          <Typography sx={{ fontSize: '0.82rem', fontWeight: 500 }}>
                            {log.user.name}
                          </Typography>
                          <Typography sx={{ fontSize: '0.7rem', color: colors.brand.smoke }}>
                            {log.user.role.replace(/_/g, ' ')}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={actionCfg.icon as React.ReactElement}
                            label={actionCfg.label}
                            size="small"
                            sx={{
                              bgcolor: `${actionCfg.color}18`,
                              color: actionCfg.color,
                              fontWeight: 600,
                              fontSize: '0.7rem',
                              '& .MuiChip-icon': { color: actionCfg.color },
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={formatEntityType(log.entityType)}
                            size="small"
                            sx={{
                              bgcolor: `${entityColor}18`,
                              color: entityColor,
                              fontWeight: 600,
                              fontSize: '0.7rem',
                            }}
                          />
                          <Typography sx={{ fontSize: '0.68rem', color: colors.brand.smoke, mt: 0.25 }}>
                            {log.entityId.slice(0, 8)}...
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {log.incident ? (
                            <Typography
                              sx={{
                                fontSize: '0.82rem',
                                color: colors.action.navyBlue,
                                cursor: 'pointer',
                                fontWeight: 500,
                                '&:hover': { textDecoration: 'underline' },
                              }}
                              onClick={() => navigate(`/incidents/${log.incident!.id}`)}
                            >
                              {log.incident.incidentNumber}
                            </Typography>
                          ) : (
                            <Typography sx={{ fontSize: '0.78rem', color: colors.brand.smoke }}>--</Typography>
                          )}
                        </TableCell>
                        <TableCell sx={{ maxWidth: 250 }}>
                          {log.changes ? (
                            <Typography
                              sx={{
                                fontSize: '0.72rem',
                                color: colors.brand.darkGray,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                maxWidth: 250,
                              }}
                              title={JSON.stringify(log.changes, null, 2)}
                            >
                              {Object.keys(log.changes).join(', ')}
                            </Typography>
                          ) : (
                            <Typography sx={{ fontSize: '0.72rem', color: colors.brand.smoke }}>--</Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={totalCount}
            page={page}
            onPageChange={(_, p) => setPage(p)}
            rowsPerPage={pageSize}
            onRowsPerPageChange={(e) => { setPageSize(parseInt(e.target.value)); setPage(0); }}
            rowsPerPageOptions={[10, 25, 50, 100]}
          />
        </Card>
      )}
    </PageContainer>
  );
}
