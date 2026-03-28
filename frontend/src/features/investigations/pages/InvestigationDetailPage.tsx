import { useState, useCallback, useEffect, type SyntheticEvent } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Skeleton,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import {
  ArrowBack as BackIcon,
  RateReview as ReviewIcon,
  Science as RcaIcon,
  Edit as EditIcon,
  Send as SubmitIcon,
} from '@mui/icons-material';
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from '@mui/material';
import { PageContainer } from '../../../components/layout/PageContainer';
import { apiClient } from '../../../lib/api-client';
import { useInvestigation, useUpdateInvestigation, useSubmitReview } from '../api/investigations.api';
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

function getLabelForValue(
  items: ReadonlyArray<{ value: string; label: string }>,
  value: string,
): string {
  return items.find((item) => item.value === value)?.label ?? value;
}

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
    return dateStr;
  }
}

// ---------------------------------------------------------------------------
// Shared sub-components
// ---------------------------------------------------------------------------

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

interface TabPanelProps {
  children: React.ReactNode;
  value: number;
  index: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  if (value !== index) return null;
  return <Box sx={{ pt: 3 }}>{children}</Box>;
}

// ---------------------------------------------------------------------------
// Summary Tab
// ---------------------------------------------------------------------------

function SummaryTab({ investigation }: { investigation: Record<string, unknown> }) {
  return (
    <Grid container spacing={3}>
      {/* Status Card */}
      <Grid size={12}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
              {Boolean(investigation.status) && (
                <Chip
                  label={getLabelForValue(
                    INVESTIGATION_STATUSES,
                    investigation.status as string,
                  )}
                  color={getStatusColor(investigation.status as string)}
                  variant="filled"
                />
              )}
            </Box>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
              {(investigation.investigationSummary as string) ||
                'No summary has been entered yet.'}
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Investigation Details */}
      <Grid size={{ xs: 12, md: 6 }}>
        <Card sx={{ height: '100%' }}>
          <CardContent>
            <Typography variant="h3" sx={{ mb: 2, fontSize: '0.875rem' }}>
              Investigation Details
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <FieldDisplay
              label="Lead Investigator"
              value={(investigation.leadInvestigator as { name: string } | null)?.name}
            />
            <FieldDisplay
              label="Investigation Team"
              value={
                Array.isArray(investigation.investigationTeam) &&
                (investigation.investigationTeam as string[]).length > 0
                  ? (investigation.investigationTeam as string[]).join(', ')
                  : null
              }
            />
            <FieldDisplay
              label="Division"
              value={
                (investigation.incident as { division?: string } | null)?.division
                  ? getLabelForValue(DIVISIONS, (investigation.incident as { division: string }).division)
                  : null
              }
            />
          </CardContent>
        </Card>
      </Grid>

      {/* Dates */}
      <Grid size={{ xs: 12, md: 6 }}>
        <Card sx={{ height: '100%' }}>
          <CardContent>
            <Typography variant="h3" sx={{ mb: 2, fontSize: '0.875rem' }}>
              Timeline
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <FieldDisplay
              label="Started"
              value={formatDate(investigation.startedDate as string)}
            />
            <FieldDisplay
              label="Target Completion"
              value={formatDate(investigation.targetCompletionDate as string)}
            />
            <FieldDisplay
              label="Completed"
              value={formatDate(investigation.completedDate as string)}
            />
            <FieldDisplay
              label="Reviewed"
              value={formatDate(investigation.reviewedDate as string)}
            />
          </CardContent>
        </Card>
      </Grid>

      {/* Recommendations */}
      <Grid size={12}>
        <Card>
          <CardContent>
            <Typography variant="h3" sx={{ mb: 2, fontSize: '0.875rem' }}>
              Recommendations
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
              {(investigation.recommendations as string) ||
                'No recommendations entered.'}
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Review Info (if reviewed) */}
      {Boolean(investigation.reviewAction) && (
        <Grid size={12}>
          <Card>
            <CardContent>
              <Typography variant="h3" sx={{ mb: 2, fontSize: '0.875rem' }}>
                Review
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <FieldDisplay
                    label="Review Action"
                    value={
                      <Chip
                        label={investigation.reviewAction as string}
                        size="small"
                        color={
                          investigation.reviewAction === 'APPROVED'
                            ? 'success'
                            : 'warning'
                        }
                      />
                    }
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <FieldDisplay
                    label="Reviewed By"
                    value={(investigation.reviewedBy as { name: string } | null)?.name}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <FieldDisplay
                    label="Review Date"
                    value={formatDate(investigation.reviewedDate as string)}
                  />
                </Grid>
              </Grid>
              {Boolean(investigation.reviewComments) && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    Comments
                  </Typography>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                    {investigation.reviewComments as string}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      )}
    </Grid>
  );
}

// ---------------------------------------------------------------------------
// Root Cause Tab (link to RCA page)
// ---------------------------------------------------------------------------

function RootCauseTab({ investigationId }: { investigationId: string }) {
  const navigate = useNavigate();

  return (
    <Card>
      <CardContent sx={{ textAlign: 'center', py: 6 }}>
        <RcaIcon
          sx={{ fontSize: 48, color: colors.action.navyBlue, mb: 2 }}
        />
        <Typography variant="h6" sx={{ mb: 1 }}>
          Root Cause Analysis
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Use the 5-Why and Fishbone methods to identify root causes for this
          investigation.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<RcaIcon />}
          onClick={() => navigate(`/investigations/${investigationId}/rca`)}
        >
          Open Root Cause Analysis
        </Button>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// CAPAs Tab
// ---------------------------------------------------------------------------

function CapasTab({ investigation }: { investigation: Record<string, unknown> }) {
  const navigate = useNavigate();
  const capas = (investigation.capas as Array<Record<string, unknown>>) ?? [];

  if (capas.length === 0) {
    return (
      <Card>
        <CardContent sx={{ textAlign: 'center', py: 6 }}>
          <Typography color="text.secondary">
            No CAPAs have been linked to this investigation.
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
              <TableCell>CAPA #</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Due Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {capas.map((capa) => (
              <TableRow
                key={capa.id as string}
                hover
                sx={{ cursor: 'pointer' }}
                onClick={() => navigate(`/capa/${capa.id}`)}
              >
                <TableCell>
                  <Typography variant="body2" fontWeight={600}>
                    {(capa.capaNumber as string) ?? '--'}
                  </Typography>
                </TableCell>
                <TableCell>{(capa.title as string) ?? '--'}</TableCell>
                <TableCell>{(capa.actionType as string) ?? '--'}</TableCell>
                <TableCell>
                  {capa.status ? (
                    <Chip
                      label={capa.status as string}
                      size="small"
                      variant="outlined"
                      color="info"
                    />
                  ) : (
                    '--'
                  )}
                </TableCell>
                <TableCell>{(capa.priority as string) ?? '--'}</TableCell>
                <TableCell>{formatDate(capa.dueDate as string)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Review Dialog
// ---------------------------------------------------------------------------

interface ReviewDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (action: string, comments: string) => void;
  isPending: boolean;
}

function ReviewDialog({ open, onClose, onSubmit, isPending }: ReviewDialogProps) {
  const [action, setAction] = useState<'APPROVED' | 'RETURNED'>('APPROVED');
  const [comments, setComments] = useState('');

  const handleSubmit = () => {
    onSubmit(action, comments);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Complete Review</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', gap: 1, mb: 3, mt: 1 }}>
          <Button
            variant={action === 'APPROVED' ? 'contained' : 'outlined'}
            color="success"
            onClick={() => setAction('APPROVED')}
          >
            Approve
          </Button>
          <Button
            variant={action === 'RETURNED' ? 'contained' : 'outlined'}
            color="warning"
            onClick={() => setAction('RETURNED')}
          >
            Return for Revision
          </Button>
        </Box>
        <TextField
          label="Review Comments"
          multiline
          rows={4}
          fullWidth
          value={comments}
          onChange={(e) => setComments(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isPending}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={isPending}
        >
          {isPending ? 'Submitting...' : 'Submit Review'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Edit Dialog
// ---------------------------------------------------------------------------

interface EditDialogProps {
  open: boolean;
  onClose: () => void;
  investigation: Record<string, unknown>;
  investigationId: string;
}

function EditDialog({ open, onClose, investigation, investigationId }: EditDialogProps) {
  const updateInvestigation = useUpdateInvestigation();
  const [users, setUsers] = useState<Array<{ id: string; name: string }>>([]);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [form, setForm] = useState({
    investigationSummary: '',
    leadInvestigatorId: '',
    rootCauseMethod: '',
    rootCauseSummary: '',
    recommendations: '',
  });

  // Load users once
  useEffect(() => {
    apiClient.get('/users?pageSize=50').then(({ data }) => {
      setUsers((data?.data ?? []) as Array<{ id: string; name: string }>);
    }).catch(() => {});
  }, []);

  // Sync form when dialog opens
  useEffect(() => {
    if (open) {
      const lead = investigation.leadInvestigator as { id: string } | null;
      setForm({
        investigationSummary: (investigation.investigationSummary as string) ?? '',
        leadInvestigatorId: lead?.id ?? '',
        rootCauseMethod: (investigation.rootCauseMethod as string) ?? '',
        rootCauseSummary: (investigation.rootCauseSummary as string) ?? '',
        recommendations: (investigation.recommendations as string) ?? '',
      });
      setSaveError(null);
    }
  }, [open, investigation]);

  const handleSave = async () => {
    try {
      setSaveError(null);
      const payload: Record<string, unknown> = { ...form };
      if (!payload.leadInvestigatorId) delete payload.leadInvestigatorId;
      if (!payload.rootCauseMethod) delete payload.rootCauseMethod;
      await updateInvestigation.mutateAsync({ id: investigationId, ...payload });
      onClose();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save. Please try again.');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontFamily: 'Oswald, sans-serif', color: colors.action.navyBlue }}>
        Edit Investigation
      </DialogTitle>
      <DialogContent>
        {saveError && (
          <Alert severity="error" sx={{ mb: 2, mt: 1 }}>{saveError}</Alert>
        )}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
          <FormControl fullWidth>
            <InputLabel>Lead Investigator</InputLabel>
            <Select
              label="Lead Investigator"
              value={form.leadInvestigatorId}
              onChange={(e) => setForm((prev) => ({ ...prev, leadInvestigatorId: e.target.value }))}
            >
              <MenuItem value="">Unassigned</MenuItem>
              {users.map((u) => (
                <MenuItem key={u.id} value={u.id}>{u.name}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Investigation Summary"
            multiline
            rows={4}
            fullWidth
            value={form.investigationSummary}
            onChange={(e) => setForm((prev) => ({ ...prev, investigationSummary: e.target.value }))}
            placeholder="Describe the investigation findings..."
          />

          <FormControl fullWidth>
            <InputLabel>Root Cause Method</InputLabel>
            <Select
              label="Root Cause Method"
              value={form.rootCauseMethod}
              onChange={(e) => setForm((prev) => ({ ...prev, rootCauseMethod: e.target.value }))}
            >
              <MenuItem value="">Not Selected</MenuItem>
              <MenuItem value="FIVE_WHY">5-Why Analysis</MenuItem>
              <MenuItem value="FISHBONE">Fishbone / Ishikawa</MenuItem>
              <MenuItem value="BOTH">Both</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Root Cause Summary"
            multiline
            rows={3}
            fullWidth
            value={form.rootCauseSummary}
            onChange={(e) => setForm((prev) => ({ ...prev, rootCauseSummary: e.target.value }))}
            placeholder="Summarize the identified root cause(s)..."
          />

          <TextField
            label="Recommendations"
            multiline
            rows={3}
            fullWidth
            value={form.recommendations}
            onChange={(e) => setForm((prev) => ({ ...prev, recommendations: e.target.value }))}
            placeholder="Enter corrective action recommendations..."
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={updateInvestigation.isPending}>Cancel</Button>
        <Button variant="contained" onClick={handleSave} disabled={updateInvestigation.isPending}>
          {updateInvestigation.isPending ? 'Saving...' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function Component() {
  const { investigationId } = useParams<{ investigationId: string }>();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const { data, isLoading, isError, error } = useInvestigation(
    investigationId ?? '',
  );
  const submitReview = useSubmitReview();
  const updateInvestigation = useUpdateInvestigation();

  const investigation: Record<string, unknown> = data?.data ?? data ?? {};

  const handleTabChange = useCallback(
    (_: SyntheticEvent, newValue: number) => {
      setTabValue(newValue);
    },
    [],
  );

  const handleReviewSubmit = useCallback(
    async (reviewAction: string, reviewComments: string) => {
      if (!investigationId) return;
      await submitReview.mutateAsync({
        investigationId,
        reviewAction,
        reviewComments,
      });
      setReviewDialogOpen(false);
    },
    [investigationId, submitReview],
  );

  // Loading
  if (isLoading) {
    return (
      <PageContainer title="Investigation Detail">
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Skeleton variant="rectangular" height={48} />
          <Skeleton variant="rectangular" height={200} />
          <Skeleton variant="rectangular" height={300} />
        </Box>
      </PageContainer>
    );
  }

  // Error
  if (isError) {
    return (
      <PageContainer title="Investigation Detail">
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load investigation.{' '}
          {error instanceof Error ? error.message : 'Please try again.'}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<BackIcon />}
          onClick={() => navigate('/investigations')}
        >
          Back to Investigations
        </Button>
      </PageContainer>
    );
  }

  const pageTitle = investigation.incidentNumber
    ? `Investigation - ${investigation.incidentNumber}`
    : 'Investigation Detail';

  const isPendingReview = investigation.status === 'PENDING_REVIEW';

  return (
    <PageContainer
      title={pageTitle}
      actions={
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            startIcon={<BackIcon />}
            onClick={() => navigate('/investigations')}
          >
            Back
          </Button>

          {(investigation.status === 'IN_PROGRESS' || investigation.status === 'NOT_STARTED') && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<EditIcon />}
              onClick={() => setEditDialogOpen(true)}
            >
              Edit
            </Button>
          )}

          {investigation.status === 'IN_PROGRESS' && (
            <Button
              variant="contained"
              color="secondary"
              startIcon={<SubmitIcon />}
              disabled={updateInvestigation.isPending}
              onClick={async () => {
                if (investigationId) {
                  await updateInvestigation.mutateAsync({
                    id: investigationId,
                    status: 'PENDING_REVIEW',
                  });
                }
              }}
            >
              Submit for Review
            </Button>
          )}

          {isPendingReview && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<ReviewIcon />}
              onClick={() => setReviewDialogOpen(true)}
            >
              Complete Review
            </Button>
          )}
        </Box>
      }
    >
      {/* Review mutation error */}
      {submitReview.isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to submit review. Please try again.
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
          <Tab label="Root Cause" />
          <Tab label="CAPAs" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <SummaryTab investigation={investigation} />
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <RootCauseTab investigationId={investigationId ?? ''} />
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <CapasTab investigation={investigation} />
      </TabPanel>

      {/* Edit Dialog */}
      <EditDialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        investigation={investigation}
        investigationId={investigationId ?? ''}
      />

      {/* Review Dialog */}
      <ReviewDialog
        open={reviewDialogOpen}
        onClose={() => setReviewDialogOpen(false)}
        onSubmit={handleReviewSubmit}
        isPending={submitReview.isPending}
      />
    </PageContainer>
  );
}
