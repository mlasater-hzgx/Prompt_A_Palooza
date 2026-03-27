import { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Card,
  Chip,
  CircularProgress,
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
  Typography,
  Alert,
  type SelectChangeEvent,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import { PageContainer } from '../../../components/layout/PageContainer';
import { KpiCard } from '../../../components/data-display/KpiCard';
import { apiClient } from '../../../lib/api-client';
import {
  INCIDENT_TYPES,
  SEVERITY_LEVELS,
  INCIDENT_STATUSES,
} from '../../../config/constants';

/* ---------- Types ---------- */

interface ProjectMetrics {
  totalIncidents: number;
  recordableIncidents: number;
  openCapas: number;
  totalIncidentsTrend?: 'up' | 'down' | 'flat';
  totalIncidentsTrendValue?: string;
  recordableTrend?: 'up' | 'down' | 'flat';
  recordableTrendValue?: string;
  openCapasTrend?: 'up' | 'down' | 'flat';
  openCapasTrendValue?: string;
  projectName?: string;
  availableProjects?: Array<{ projectNumber: string; projectName: string }>;
}

interface ProjectIncident {
  id: string;
  incidentNumber: string;
  title: string;
  incidentType: string;
  severity: string;
  status: string;
  incidentDate: string;
}

/* ---------- Helpers ---------- */

function getLabelForValue(
  items: ReadonlyArray<{ value: string; label: string }>,
  value: string,
): string {
  return items.find((item) => item.value === value)?.label ?? value;
}

function getSeverityChipColor(severity: string): 'error' | 'warning' | 'info' | 'success' | 'default' {
  switch (severity) {
    case 'FATALITY':
    case 'LOST_TIME':
    case 'RESTRICTED_DUTY':
      return 'error';
    case 'MEDICAL_TREATMENT':
      return 'warning';
    case 'FIRST_AID':
      return 'info';
    case 'NEAR_MISS':
      return 'success';
    default:
      return 'default';
  }
}

function getStatusChipColor(status: string): 'success' | 'error' | 'warning' | 'info' | 'default' {
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

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '--';
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return '--';
  }
}

/* ---------- Data hooks ---------- */

function useProjectDashboard(projectNumber: string | undefined) {
  return useQuery({
    queryKey: ['dashboard', 'project', projectNumber],
    queryFn: async () => {
      const { data } = await apiClient.get(`/dashboard/project/${projectNumber}`);
      return data;
    },
    enabled: !!projectNumber,
  });
}

function useProjectIncidents(projectNumber: string | undefined) {
  return useQuery({
    queryKey: ['incidents', { projectNumber }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (projectNumber) params.set('projectNumber', projectNumber);
      params.set('pageSize', '20');
      const { data } = await apiClient.get(`/incidents?${params}`);
      return data;
    },
    enabled: !!projectNumber,
  });
}

/* ---------- Main Component ---------- */

export function Component() {
  const { projectNumber: routeProjectNumber } = useParams<{ projectNumber: string }>();
  const navigate = useNavigate();
  const [selectedProject, setSelectedProject] = useState(routeProjectNumber ?? '');

  const activeProject = selectedProject || routeProjectNumber;

  const {
    data: dashData,
    isLoading: dashLoading,
    isError: dashError,
    error: dashErrorObj,
  } = useProjectDashboard(activeProject);

  const {
    data: incidentsData,
    isLoading: incidentsLoading,
  } = useProjectIncidents(activeProject);

  const metrics: ProjectMetrics = dashData?.data ?? dashData ?? {
    totalIncidents: 0,
    recordableIncidents: 0,
    openCapas: 0,
  };

  const recentIncidents: ProjectIncident[] =
    incidentsData?.data ?? incidentsData ?? [];

  const availableProjects = metrics.availableProjects ?? [];

  const handleProjectChange = useCallback(
    (e: SelectChangeEvent) => {
      const newProject = e.target.value;
      setSelectedProject(newProject);
      if (newProject) {
        navigate(`/dashboard/project/${newProject}`, { replace: true });
      }
    },
    [navigate],
  );

  const pageTitle = metrics.projectName
    ? `Project: ${metrics.projectName}`
    : activeProject
      ? `Project: ${activeProject}`
      : 'Project Dashboard';

  // No project selected state
  if (!activeProject) {
    return (
      <PageContainer title="Project Dashboard">
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
            Select a project to view its dashboard
          </Typography>
          {availableProjects.length > 0 && (
            <FormControl sx={{ minWidth: 300 }}>
              <InputLabel>Project</InputLabel>
              <Select
                value={selectedProject}
                label="Project"
                onChange={handleProjectChange}
              >
                {availableProjects.map((p) => (
                  <MenuItem key={p.projectNumber} value={p.projectNumber}>
                    {p.projectNumber} - {p.projectName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </Card>
      </PageContainer>
    );
  }

  // Loading
  if (dashLoading) {
    return (
      <PageContainer title="Project Dashboard">
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress />
        </Box>
      </PageContainer>
    );
  }

  // Error
  if (dashError) {
    return (
      <PageContainer title="Project Dashboard">
        <Alert severity="error">
          Failed to load project dashboard.{' '}
          {dashErrorObj instanceof Error ? dashErrorObj.message : 'Please try again.'}
        </Alert>
      </PageContainer>
    );
  }

  return (
    <PageContainer title={pageTitle}>
      {/* Project Selector */}
      <Box sx={{ mb: 3 }}>
        <FormControl size="small" sx={{ minWidth: 300 }}>
          <InputLabel>Switch Project</InputLabel>
          <Select
            value={activeProject ?? ''}
            label="Switch Project"
            onChange={handleProjectChange}
          >
            {activeProject && !availableProjects.some((p) => p.projectNumber === activeProject) && (
              <MenuItem value={activeProject}>{activeProject}</MenuItem>
            )}
            {availableProjects.map((p) => (
              <MenuItem key={p.projectNumber} value={p.projectNumber}>
                {p.projectNumber} - {p.projectName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <KpiCard
            title="Total Incidents"
            value={metrics.totalIncidents}
            trend={metrics.totalIncidentsTrend}
            trendValue={metrics.totalIncidentsTrendValue}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <KpiCard
            title="Recordable Incidents"
            value={metrics.recordableIncidents}
            trend={metrics.recordableTrend}
            trendValue={metrics.recordableTrendValue}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <KpiCard
            title="Open CAPAs"
            value={metrics.openCapas}
            trend={metrics.openCapasTrend}
            trendValue={metrics.openCapasTrendValue}
          />
        </Grid>
      </Grid>

      {/* Recent Incidents Table */}
      <Card>
        <Box sx={{ p: 2, pb: 0 }}>
          <Typography variant="h6" sx={{ fontFamily: "'Oswald', sans-serif", textTransform: 'uppercase' }}>
            Recent Incidents
          </Typography>
        </Box>
        {incidentsLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>Title</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Severity</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentIncidents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">
                        No incidents found for this project.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  recentIncidents.map((inc) => (
                    <TableRow
                      key={inc.id}
                      hover
                      sx={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/incidents/${inc.id}`)}
                    >
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {inc.incidentNumber}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                          {inc.title}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {inc.incidentType
                          ? getLabelForValue(INCIDENT_TYPES, inc.incidentType)
                          : '--'}
                      </TableCell>
                      <TableCell>
                        {inc.severity ? (
                          <Chip
                            label={getLabelForValue(SEVERITY_LEVELS, inc.severity)}
                            size="small"
                            color={getSeverityChipColor(inc.severity)}
                          />
                        ) : (
                          '--'
                        )}
                      </TableCell>
                      <TableCell>
                        {inc.status ? (
                          <Chip
                            label={getLabelForValue(INCIDENT_STATUSES, inc.status)}
                            size="small"
                            color={getStatusChipColor(inc.status)}
                            variant="outlined"
                          />
                        ) : (
                          '--'
                        )}
                      </TableCell>
                      <TableCell>{formatDate(inc.incidentDate)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>
    </PageContainer>
  );
}
