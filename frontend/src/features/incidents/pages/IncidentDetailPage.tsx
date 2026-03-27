import { useState, useCallback, type SyntheticEvent } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  CircularProgress,
  Alert,
  Divider,
  Skeleton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import {
  Edit as EditIcon,
  CheckCircleOutline as CompleteIcon,
  Search as InvestigateIcon,
  Assignment as CapaIcon,
  Timeline as TimelineIcon,
  PersonOutline as PersonIcon,
  Link as LinkIcon,
  ArrowBack as BackIcon,
} from '@mui/icons-material';
import { PageContainer } from '../../../components/layout/PageContainer';
import {
  useIncident,
  useIncidentInjuredPersons,
  useIncidentTimeline,
  useIncidentCapas,
  useIncidentRecurrence,
  useTransitionIncidentStatus,
} from '../api/incidents.api';
import {
  INCIDENT_TYPES,
  SEVERITY_LEVELS,
  INCIDENT_STATUSES,
  DIVISIONS,
} from '../../../config/constants';
import { colors } from '../../../design-system/tokens/colors';

function getLabelForValue(
  items: ReadonlyArray<{ value: string; label: string }>,
  value: string,
): string {
  return items.find((item) => item.value === value)?.label ?? value;
}

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

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '--';
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

function formatShortDate(dateStr: string | null | undefined): string {
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

interface FieldDisplayProps {
  label: string;
  value: React.ReactNode;
}

function FieldDisplay({ label, value }: FieldDisplayProps) {
  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
        {label}
      </Typography>
      <Typography variant="body1">{value || '--'}</Typography>
    </Box>
  );
}

// --- Tab Panels ---

interface TabPanelProps {
  children: React.ReactNode;
  value: number;
  index: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  if (value !== index) return null;
  return <Box sx={{ pt: 3 }}>{children}</Box>;
}

// --- Summary Tab ---

function SummaryTab({ incident }: { incident: Record<string, unknown> }) {
  return (
    <Grid container spacing={3}>
      {/* Status & Overview Card */}
      <Grid size={12}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
              {Boolean(incident.status) && (
                <Chip
                  label={getLabelForValue(INCIDENT_STATUSES, incident.status as string)}
                  color={getStatusColor(incident.status as string)}
                  variant="filled"
                />
              )}
              {Boolean(incident.severity) && (
                <Chip
                  label={getLabelForValue(SEVERITY_LEVELS, incident.severity as string)}
                  size="small"
                  sx={getSeverityChipStyle(incident.severity as string)}
                />
              )}
              {Boolean(incident.isDraft) && (
                <Chip label="DRAFT" size="small" variant="outlined" color="warning" />
              )}
            </Box>

            {/* Draft progress bar */}
            {Boolean(incident.isDraft) && (
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2" color="text.secondary">
                    Completion Progress
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {(incident.completionPercentage as number) ?? 0}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(incident.completionPercentage as number) ?? 0}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
            )}

            <Typography
              variant="body1"
              sx={{ whiteSpace: 'pre-wrap', color: 'text.primary' }}
            >
              {(incident.description as string) || 'No description provided.'}
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Incident Details Card */}
      <Grid size={{ xs: 12, md: 6 }}>
        <Card sx={{ height: '100%' }}>
          <CardContent>
            <Typography variant="h3" sx={{ mb: 2, fontSize: '0.875rem' }}>
              Incident Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <FieldDisplay
              label="Incident Number"
              value={incident.incidentNumber as string}
            />
            <FieldDisplay
              label="Type"
              value={
                incident.incidentType
                  ? getLabelForValue(INCIDENT_TYPES, incident.incidentType as string)
                  : null
              }
            />
            <FieldDisplay
              label="Date & Time"
              value={formatDate(incident.incidentDate as string)}
            />
            <FieldDisplay
              label="Division"
              value={
                incident.division
                  ? getLabelForValue(DIVISIONS, incident.division as string)
                  : null
              }
            />
            <FieldDisplay label="Shift" value={incident.shift as string} />
          </CardContent>
        </Card>
      </Grid>

      {/* Location Card */}
      <Grid size={{ xs: 12, md: 6 }}>
        <Card sx={{ height: '100%' }}>
          <CardContent>
            <Typography variant="h3" sx={{ mb: 2, fontSize: '0.875rem' }}>
              Location
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <FieldDisplay label="Job Site" value={incident.jobSite as string} />
            <FieldDisplay
              label="Location Description"
              value={incident.locationDescription as string}
            />
            <FieldDisplay
              label="GPS Coordinates"
              value={
                incident.latitude && incident.longitude
                  ? `${incident.latitude}, ${incident.longitude}`
                  : null
              }
            />
            <FieldDisplay
              label="Weather Conditions"
              value={incident.weatherConditions as string}
            />
          </CardContent>
        </Card>
      </Grid>

      {/* Actions Taken Card */}
      <Grid size={12}>
        <Card>
          <CardContent>
            <Typography variant="h3" sx={{ mb: 2, fontSize: '0.875rem' }}>
              Immediate Actions Taken
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
              {(incident.immediateActionsTaken as string) || 'None recorded.'}
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Metadata Card */}
      <Grid size={12}>
        <Card>
          <CardContent>
            <Typography variant="h3" sx={{ mb: 2, fontSize: '0.875rem' }}>
              Record Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <FieldDisplay
                  label="Reported By"
                  value={incident.reportedByName as string}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <FieldDisplay
                  label="Created"
                  value={formatDate(incident.createdAt as string)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <FieldDisplay
                  label="Last Updated"
                  value={formatDate(incident.updatedAt as string)}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}

// --- Injured Persons Tab ---

function InjuredPersonsTab({ incidentId }: { incidentId: string }) {
  const { data, isLoading, isError } = useIncidentInjuredPersons(incidentId);
  const persons = data?.data ?? [];

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Alert severity="error">Failed to load injured persons data.</Alert>
    );
  }

  if (persons.length === 0) {
    return (
      <Card>
        <CardContent sx={{ textAlign: 'center', py: 6 }}>
          <PersonIcon sx={{ fontSize: 48, color: colors.brand.smoke, mb: 1 }} />
          <Typography color="text.secondary">
            No injured persons recorded for this incident.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Employee ID</TableCell>
              <TableCell>Injury Type</TableCell>
              <TableCell>Body Part</TableCell>
              <TableCell>Treatment</TableCell>
              <TableCell>Days Away</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {persons.map(
              (person: {
                id: string;
                name?: string;
                employeeId?: string;
                injuryType?: string;
                bodyPart?: string;
                treatmentType?: string;
                daysAway?: number;
              }) => (
                <TableRow key={person.id}>
                  <TableCell>{person.name ?? '--'}</TableCell>
                  <TableCell>{person.employeeId ?? '--'}</TableCell>
                  <TableCell>{person.injuryType ?? '--'}</TableCell>
                  <TableCell>{person.bodyPart ?? '--'}</TableCell>
                  <TableCell>{person.treatmentType ?? '--'}</TableCell>
                  <TableCell>{person.daysAway ?? '--'}</TableCell>
                </TableRow>
              ),
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
}

// --- Investigation Tab ---

function InvestigationTab({ incident }: { incident: Record<string, unknown> }) {
  const navigate = useNavigate();
  const investigationId = incident.investigationId as string | undefined;

  if (investigationId) {
    return (
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="h3" sx={{ fontSize: '0.875rem', mb: 1 }}>
                Linked Investigation
              </Typography>
              <Typography variant="body1">
                Investigation ID: {investigationId}
              </Typography>
            </Box>
            <Button
              variant="contained"
              color="primary"
              startIcon={<InvestigateIcon />}
              onClick={() => navigate(`/investigations/${investigationId}`)}
            >
              View Investigation
            </Button>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent sx={{ textAlign: 'center', py: 6 }}>
        <InvestigateIcon sx={{ fontSize: 48, color: colors.brand.smoke, mb: 1 }} />
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          No investigation has been started for this incident.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<InvestigateIcon />}
          onClick={() => navigate(`/investigations?incidentId=${incident.id}`)}
        >
          Start Investigation
        </Button>
      </CardContent>
    </Card>
  );
}

// --- CAPAs Tab ---

function CapasTab({ incidentId }: { incidentId: string }) {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useIncidentCapas(incidentId);
  const capas = data?.data ?? [];

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return <Alert severity="error">Failed to load CAPAs.</Alert>;
  }

  if (capas.length === 0) {
    return (
      <Card>
        <CardContent sx={{ textAlign: 'center', py: 6 }}>
          <CapaIcon sx={{ fontSize: 48, color: colors.brand.smoke, mb: 1 }} />
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            No corrective actions have been assigned for this incident.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<CapaIcon />}
            onClick={() => navigate(`/capa/new?incidentId=${incidentId}`)}
          >
            Create CAPA
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>CAPA #</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Assigned To</TableCell>
              <TableCell>Due Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {capas.map(
              (capa: {
                id: string;
                capaNumber?: string;
                title?: string;
                capaType?: string;
                status?: string;
                assignedToName?: string;
                dueDate?: string;
              }) => (
                <TableRow
                  key={capa.id}
                  hover
                  sx={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/capa/${capa.id}`)}
                >
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {capa.capaNumber ?? '--'}
                    </Typography>
                  </TableCell>
                  <TableCell>{capa.title ?? '--'}</TableCell>
                  <TableCell>{capa.capaType ?? '--'}</TableCell>
                  <TableCell>
                    {capa.status ? (
                      <Chip label={capa.status} size="small" variant="outlined" color="info" />
                    ) : (
                      '--'
                    )}
                  </TableCell>
                  <TableCell>{capa.assignedToName ?? '--'}</TableCell>
                  <TableCell>{formatShortDate(capa.dueDate)}</TableCell>
                </TableRow>
              ),
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
}

// --- Recurrence Tab ---

function RecurrenceTab({ incidentId }: { incidentId: string }) {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useIncidentRecurrence(incidentId);
  const linked = data?.data ?? [];

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return <Alert severity="error">Failed to load recurrence data.</Alert>;
  }

  if (linked.length === 0) {
    return (
      <Card>
        <CardContent sx={{ textAlign: 'center', py: 6 }}>
          <LinkIcon sx={{ fontSize: 48, color: colors.brand.smoke, mb: 1 }} />
          <Typography color="text.secondary">
            No linked or recurring incidents found.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Incident #</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Severity</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Similarity</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {linked.map(
              (item: {
                id: string;
                incidentNumber?: string;
                title?: string;
                incidentType?: string;
                severity?: string;
                incidentDate?: string;
                similarityScore?: number;
              }) => (
                <TableRow
                  key={item.id}
                  hover
                  sx={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/incidents/${item.id}`)}
                >
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {item.incidentNumber ?? '--'}
                    </Typography>
                  </TableCell>
                  <TableCell>{item.title ?? '--'}</TableCell>
                  <TableCell>
                    {item.incidentType
                      ? getLabelForValue(INCIDENT_TYPES, item.incidentType)
                      : '--'}
                  </TableCell>
                  <TableCell>
                    {item.severity ? (
                      <Chip
                        label={getLabelForValue(SEVERITY_LEVELS, item.severity)}
                        size="small"
                        sx={getSeverityChipStyle(item.severity)}
                      />
                    ) : (
                      '--'
                    )}
                  </TableCell>
                  <TableCell>{formatShortDate(item.incidentDate)}</TableCell>
                  <TableCell>
                    {item.similarityScore != null ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={item.similarityScore * 100}
                          sx={{ flexGrow: 1, height: 6, borderRadius: 3, maxWidth: 80 }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          {Math.round(item.similarityScore * 100)}%
                        </Typography>
                      </Box>
                    ) : (
                      '--'
                    )}
                  </TableCell>
                </TableRow>
              ),
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
}

// --- Timeline Tab ---

function TimelineTab({ incidentId }: { incidentId: string }) {
  const { data, isLoading, isError } = useIncidentTimeline(incidentId);
  const entries = data?.data ?? [];

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return <Alert severity="error">Failed to load timeline.</Alert>;
  }

  if (entries.length === 0) {
    return (
      <Card>
        <CardContent sx={{ textAlign: 'center', py: 6 }}>
          <TimelineIcon sx={{ fontSize: 48, color: colors.brand.smoke, mb: 1 }} />
          <Typography color="text.secondary">No timeline entries yet.</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <List disablePadding>
          {entries.map(
            (
              entry: {
                id: string;
                action?: string;
                description?: string;
                performedByName?: string;
                createdAt?: string;
              },
              index: number,
            ) => (
              <ListItem
                key={entry.id}
                alignItems="flex-start"
                divider={index < entries.length - 1}
                sx={{ px: 0 }}
              >
                <ListItemIcon sx={{ mt: 1.5, minWidth: 40 }}>
                  <TimelineIcon fontSize="small" sx={{ color: colors.action.navyBlue }} />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <Typography variant="body1" fontWeight={600}>
                        {entry.action ?? 'Action'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(entry.createdAt)}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Box sx={{ mt: 0.5 }}>
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                        {entry.description}
                      </Typography>
                      {entry.performedByName && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          by {entry.performedByName}
                        </Typography>
                      )}
                    </Box>
                  }
                />
              </ListItem>
            ),
          )}
        </List>
      </CardContent>
    </Card>
  );
}

// === Main Component ===

export function Component() {
  const { incidentId } = useParams<{ incidentId: string }>();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);

  const { data, isLoading, isError, error } = useIncident(incidentId ?? '');
  const transitionStatus = useTransitionIncidentStatus();

  const incident = data?.data ?? data ?? {};

  const handleTabChange = useCallback((_: SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  }, []);

  const handleStatusTransition = useCallback(
    async (newStatus: string) => {
      if (!incidentId) return;
      await transitionStatus.mutateAsync({ id: incidentId, status: newStatus });
    },
    [incidentId, transitionStatus],
  );

  // Loading State
  if (isLoading) {
    return (
      <PageContainer title="Incident Detail">
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Skeleton variant="rectangular" height={48} />
          <Skeleton variant="rectangular" height={200} />
          <Skeleton variant="rectangular" height={300} />
        </Box>
      </PageContainer>
    );
  }

  // Error State
  if (isError) {
    return (
      <PageContainer title="Incident Detail">
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load incident.{' '}
          {error instanceof Error ? error.message : 'Please try again.'}
        </Alert>
        <Button variant="outlined" startIcon={<BackIcon />} onClick={() => navigate('/incidents')}>
          Back to Incidents
        </Button>
      </PageContainer>
    );
  }

  const pageTitle = incident.incidentNumber
    ? `Incident ${incident.incidentNumber}`
    : 'Incident Detail';

  return (
    <PageContainer
      title={pageTitle}
      actions={
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            startIcon={<BackIcon />}
            onClick={() => navigate('/incidents')}
          >
            Back
          </Button>

          {incident.isDraft && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<CompleteIcon />}
              onClick={() => navigate(`/incidents/${incidentId}/complete`)}
            >
              Complete Details
            </Button>
          )}

          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => navigate(`/incidents/${incidentId}/edit`)}
          >
            Edit
          </Button>

          {incident.status === 'REPORTED' && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<InvestigateIcon />}
              disabled={transitionStatus.isPending}
              onClick={() => handleStatusTransition('UNDER_INVESTIGATION')}
            >
              Begin Investigation
            </Button>
          )}

          {incident.status !== 'CLOSED' && incident.status !== 'REPORTED' && (
            <Button
              variant="contained"
              color="success"
              startIcon={<CompleteIcon />}
              disabled={transitionStatus.isPending}
              onClick={() => handleStatusTransition('CLOSED')}
            >
              Close Incident
            </Button>
          )}
        </Box>
      }
    >
      {/* Status Transition Error */}
      {transitionStatus.isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to update incident status. Please try again.
        </Alert>
      )}

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Summary" />
          <Tab label="Injured Persons" />
          <Tab label="Investigation" />
          <Tab label="CAPAs" />
          <Tab label="Recurrence" />
          <Tab label="Timeline" />
        </Tabs>
      </Box>

      {/* Tab Panels */}
      <TabPanel value={tabValue} index={0}>
        <SummaryTab incident={incident} />
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <InjuredPersonsTab incidentId={incidentId ?? ''} />
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <InvestigationTab incident={incident} />
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        <CapasTab incidentId={incidentId ?? ''} />
      </TabPanel>

      <TabPanel value={tabValue} index={4}>
        <RecurrenceTab incidentId={incidentId ?? ''} />
      </TabPanel>

      <TabPanel value={tabValue} index={5}>
        <TimelineTab incidentId={incidentId ?? ''} />
      </TabPanel>
    </PageContainer>
  );
}
