import { useState, useCallback, type SyntheticEvent } from 'react';
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  IconButton,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tooltip,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import {
  Link as LinkIcon,
  Hub as ClusterIcon,
  Close as DismissIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PageContainer } from '../../../components/layout/PageContainer';
import { apiClient } from '../../../lib/api-client';
import { colors } from '../../../design-system/tokens/colors';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface RecurrenceLink {
  id: string;
  incidentId: string;
  incidentNumber?: string;
  incidentTitle?: string;
  relatedIncidentId: string;
  relatedIncidentNumber?: string;
  relatedIncidentTitle?: string;
  similarityType: string;
  detectedBy: string;
  isDismissed: boolean;
  notes?: string;
  createdAt: string;
}

interface RecurrenceCluster {
  id: string;
  name?: string;
  incidentCount: number;
  commonAttributes: string[];
  incidents: Array<{
    id: string;
    incidentNumber?: string;
    title?: string;
  }>;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SIMILARITY_TYPES: Record<string, { label: string; color: string }> = {
  SAME_LOCATION: { label: 'Same Location', color: colors.dataViz[0]! },
  SAME_TYPE: { label: 'Same Type', color: colors.dataViz[1]! },
  SAME_ROOT_CAUSE: { label: 'Same Root Cause', color: colors.dataViz[2]! },
  SAME_EQUIPMENT: { label: 'Same Equipment', color: colors.dataViz[3]! },
  SAME_PERSON: { label: 'Same Person', color: colors.dataViz[4]! },
};

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

function useRecurrenceLinks() {
  return useQuery({
    queryKey: ['recurrence', 'links'],
    queryFn: async () => {
      const { data } = await apiClient.get('/recurrence/links');
      return data;
    },
  });
}

function useRecurrenceClusters() {
  return useQuery({
    queryKey: ['recurrence', 'clusters'],
    queryFn: async () => {
      const { data } = await apiClient.get('/recurrence/clusters');
      return data;
    },
  });
}

function useDismissLink() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (linkId: string) => {
      const { data } = await apiClient.delete(`/recurrence/${linkId}`);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['recurrence'] });
    },
  });
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

interface TabPanelProps {
  children: React.ReactNode;
  value: number;
  index: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  if (value !== index) return null;
  return <Box sx={{ pt: 3 }}>{children}</Box>;
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

// ---------------------------------------------------------------------------
// Incident Links Tab
// ---------------------------------------------------------------------------

function LinksTab() {
  const navigate = useNavigate();
  const { data, isLoading, isError, error } = useRecurrenceLinks();
  const dismissLink = useDismissLink();

  const links: RecurrenceLink[] = data?.data ?? [];
  const activeLinks = links.filter((l) => !l.isDismissed);

  const handleDismiss = async (linkId: string) => {
    await dismissLink.mutateAsync(linkId);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Alert severity="error">
        Failed to load recurrence links.{' '}
        {error instanceof Error ? error.message : 'Please try again.'}
      </Alert>
    );
  }

  if (activeLinks.length === 0) {
    return (
      <Card>
        <CardContent sx={{ textAlign: 'center', py: 6 }}>
          <LinkIcon
            sx={{ fontSize: 48, color: colors.brand.smoke, mb: 1 }}
          />
          <Typography color="text.secondary">
            No active recurrence links detected.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {dismissLink.isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to dismiss link. Please try again.
        </Alert>
      )}

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Incident A</TableCell>
                <TableCell>Incident B</TableCell>
                <TableCell>Similarity Type</TableCell>
                <TableCell>Detected By</TableCell>
                <TableCell>Date</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {activeLinks.map((link) => {
                const sim = SIMILARITY_TYPES[link.similarityType];
                return (
                  <TableRow key={link.id} hover>
                    <TableCell>
                      <Box
                        sx={{
                          cursor: 'pointer',
                          '&:hover': { textDecoration: 'underline' },
                        }}
                        onClick={() =>
                          navigate(`/incidents/${link.incidentId}`)
                        }
                      >
                        <Typography variant="body2" fontWeight={600}>
                          {link.incidentNumber ?? link.incidentId.slice(0, 8)}
                        </Typography>
                        {link.incidentTitle && (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            noWrap
                            sx={{ display: 'block', maxWidth: 180 }}
                          >
                            {link.incidentTitle}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{
                          cursor: 'pointer',
                          '&:hover': { textDecoration: 'underline' },
                        }}
                        onClick={() =>
                          navigate(
                            `/incidents/${link.relatedIncidentId}`,
                          )
                        }
                      >
                        <Typography variant="body2" fontWeight={600}>
                          {link.relatedIncidentNumber ??
                            link.relatedIncidentId.slice(0, 8)}
                        </Typography>
                        {link.relatedIncidentTitle && (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            noWrap
                            sx={{ display: 'block', maxWidth: 180 }}
                          >
                            {link.relatedIncidentTitle}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={sim?.label ?? link.similarityType}
                        size="small"
                        sx={{
                          backgroundColor: sim?.color ?? colors.brand.midGray,
                          color: colors.neutral.white,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={link.detectedBy}
                        size="small"
                        variant="outlined"
                        color={
                          link.detectedBy === 'SYSTEM' ? 'info' : 'default'
                        }
                      />
                    </TableCell>
                    <TableCell>{formatDate(link.createdAt)}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="Dismiss this link">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDismiss(link.id)}
                          disabled={dismissLink.isPending}
                        >
                          <DismissIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </>
  );
}

// ---------------------------------------------------------------------------
// Clusters Tab
// ---------------------------------------------------------------------------

function ClustersTab() {
  const navigate = useNavigate();
  const { data, isLoading, isError, error } = useRecurrenceClusters();
  const clusters: RecurrenceCluster[] = data?.data ?? [];

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Alert severity="error">
        Failed to load clusters.{' '}
        {error instanceof Error ? error.message : 'Please try again.'}
      </Alert>
    );
  }

  if (clusters.length === 0) {
    return (
      <Card>
        <CardContent sx={{ textAlign: 'center', py: 6 }}>
          <ClusterIcon
            sx={{ fontSize: 48, color: colors.brand.smoke, mb: 1 }}
          />
          <Typography color="text.secondary">
            No incident clusters detected yet. The system will group incidents
            with common patterns automatically.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Grid container spacing={3}>
      {clusters.map((cluster) => (
        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={cluster.id}>
          <Card
            sx={{
              height: '100%',
              borderLeft: `4px solid ${colors.action.navyBlue}`,
            }}
          >
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 2,
                }}
              >
                <Typography variant="h6" sx={{ fontSize: '0.95rem' }}>
                  {cluster.name ?? `Cluster ${cluster.id.slice(0, 6)}`}
                </Typography>
                <Chip
                  label={`${cluster.incidentCount} incidents`}
                  size="small"
                  sx={{
                    backgroundColor: colors.brand.herzogGold,
                    color: colors.brand.richBlack,
                    fontWeight: 600,
                  }}
                />
              </Box>

              {cluster.commonAttributes.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 0.5 }}
                  >
                    Common Attributes
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {cluster.commonAttributes.map((attr) => (
                      <Chip
                        key={attr}
                        label={attr}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Box>
              )}

              {cluster.incidents.length > 0 && (
                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 0.5 }}
                  >
                    Incidents
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 0.5,
                    }}
                  >
                    {cluster.incidents.map((incident) => (
                      <Typography
                        key={incident.id}
                        variant="body2"
                        sx={{
                          cursor: 'pointer',
                          '&:hover': {
                            color: colors.action.navyBlue,
                            textDecoration: 'underline',
                          },
                        }}
                        onClick={() =>
                          navigate(`/incidents/${incident.id}`)
                        }
                      >
                        {incident.incidentNumber ?? incident.id.slice(0, 8)}
                        {incident.title ? ` - ${incident.title}` : ''}
                      </Typography>
                    ))}
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function Component() {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = useCallback(
    (_: SyntheticEvent, newValue: number) => {
      setTabValue(newValue);
    },
    [],
  );

  return (
    <PageContainer title="Recurrence Detection">
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab
            label="Incident Links"
            icon={<LinkIcon />}
            iconPosition="start"
          />
          <Tab
            label="Clusters"
            icon={<ClusterIcon />}
            iconPosition="start"
          />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <LinksTab />
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <ClustersTab />
      </TabPanel>
    </PageContainer>
  );
}
