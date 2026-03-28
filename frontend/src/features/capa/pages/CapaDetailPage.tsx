import { useState, useCallback } from 'react';
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
  FormControl,
  FormControlLabel,
  InputLabel,
  Radio,
  RadioGroup,
  Skeleton,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import {
  ArrowBack as BackIcon,
  PlayArrow as StartIcon,
  CheckCircle as CompleteIcon,
  Verified as VerifyIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { MenuItem, Select } from '@mui/material';
import { PageContainer } from '../../../components/layout/PageContainer';
import { apiClient } from '../../../lib/api-client';
import { useCapa, useStartCapa, useCompleteCapa, useVerifyCapa } from '../api/capa.api';
import { colors } from '../../../design-system/tokens/colors';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CAPA_LIFECYCLE_STEPS = [
  'Open',
  'In Progress',
  'Completed',
  'Verification Pending',
  'Verified',
] as const;

const STATUS_TO_STEP: Record<string, number> = {
  OPEN: 0,
  IN_PROGRESS: 1,
  COMPLETED: 2,
  VERIFICATION_PENDING: 3,
  VERIFIED_EFFECTIVE: 4,
  VERIFIED_INEFFECTIVE: 4,
  OVERDUE: 1, // treat overdue as in-progress step
};

const CAPA_STATUSES: ReadonlyArray<{ value: string; label: string }> = [
  { value: 'OPEN', label: 'Open' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'VERIFICATION_PENDING', label: 'Verification Pending' },
  { value: 'VERIFIED_EFFECTIVE', label: 'Verified Effective' },
  { value: 'VERIFIED_INEFFECTIVE', label: 'Verified Ineffective' },
  { value: 'OVERDUE', label: 'Overdue' },
];

const CAPA_PRIORITIES: ReadonlyArray<{ value: string; label: string }> = [
  { value: 'CRITICAL', label: 'Critical' },
  { value: 'HIGH', label: 'High' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'LOW', label: 'Low' },
];

const CAPA_CATEGORIES: ReadonlyArray<{ value: string; label: string }> = [
  { value: 'TRAINING', label: 'Training' },
  { value: 'PROCEDURE_CHANGE', label: 'Procedure Change' },
  { value: 'ENGINEERING_CONTROL', label: 'Engineering Control' },
  { value: 'PPE', label: 'PPE' },
  { value: 'EQUIPMENT_MODIFICATION', label: 'Equipment Modification' },
  { value: 'DISCIPLINARY', label: 'Disciplinary' },
  { value: 'POLICY_CHANGE', label: 'Policy Change' },
  { value: 'OTHER', label: 'Other' },
];

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

function formatCurrency(value: number | string | null | undefined): string {
  if (value == null) return '--';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '--';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(num);
}

// ---------------------------------------------------------------------------
// Sub-components
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

// ---------------------------------------------------------------------------
// Complete Dialog
// ---------------------------------------------------------------------------

interface CompleteDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (notes: string) => void;
  isPending: boolean;
}

function CompleteDialog({ open, onClose, onSubmit, isPending }: CompleteDialogProps) {
  const [notes, setNotes] = useState('');

  const handleSubmit = () => {
    onSubmit(notes);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Complete CAPA</DialogTitle>
      <DialogContent>
        <TextField
          label="Completion Notes"
          multiline
          rows={4}
          fullWidth
          required
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Describe what was done to complete this CAPA..."
          sx={{ mt: 1 }}
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
          disabled={!notes.trim() || isPending}
        >
          {isPending ? 'Completing...' : 'Mark Complete'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Verify Dialog
// ---------------------------------------------------------------------------

interface VerifyDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (result: string, notes: string) => void;
  isPending: boolean;
}

function VerifyDialog({ open, onClose, onSubmit, isPending }: VerifyDialogProps) {
  const [result, setResult] = useState('EFFECTIVE');
  const [notes, setNotes] = useState('');

  const handleSubmit = () => {
    onSubmit(result, notes);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Verify CAPA</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <FormControl>
            <InputLabel id="verify-result-label" shrink={false} sx={{ display: 'none' }} />
            <RadioGroup
              value={result}
              onChange={(e) => setResult(e.target.value)}
            >
              <FormControlLabel
                value="EFFECTIVE"
                control={<Radio />}
                label="Effective - CAPA resolved the issue"
              />
              <FormControlLabel
                value="PARTIALLY_EFFECTIVE"
                control={<Radio />}
                label="Partially Effective - Additional action may be needed"
              />
              <FormControlLabel
                value="INEFFECTIVE"
                control={<Radio />}
                label="Ineffective - CAPA did not resolve the issue"
              />
            </RadioGroup>
          </FormControl>
          <TextField
            label="Verification Notes"
            multiline
            rows={3}
            fullWidth
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Verification observations and findings..."
          />
        </Box>
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
          {isPending ? 'Verifying...' : 'Submit Verification'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function Component() {
  const { capaId } = useParams<{ capaId: string }>();
  const navigate = useNavigate();

  const { data, isLoading, isError, error } = useCapa(capaId ?? '');
  const startCapa = useStartCapa();
  const completeCapa = useCompleteCapa();
  const verifyCapa = useVerifyCapa();

  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({ title: '', description: '', category: '', priority: '', assignedToId: '' });
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [users, setUsers] = useState<Array<{ id: string; name: string }>>([]);

  const capa: Record<string, unknown> = data?.data ?? data ?? {};
  const status = (capa.status as string) ?? '';
  const activeStep = STATUS_TO_STEP[status] ?? 0;

  const handleStart = useCallback(async () => {
    if (!capaId) return;
    await startCapa.mutateAsync(capaId);
  }, [capaId, startCapa]);

  const handleComplete = useCallback(
    async (completionNotes: string) => {
      if (!capaId) return;
      await completeCapa.mutateAsync({ capaId, completionNotes });
      setCompleteDialogOpen(false);
    },
    [capaId, completeCapa],
  );

  const handleVerify = useCallback(
    async (verificationResult: string, verificationNotes: string) => {
      if (!capaId) return;
      await verifyCapa.mutateAsync({
        capaId,
        verificationResult,
        verificationNotes: verificationNotes || undefined,
      });
      setVerifyDialogOpen(false);
    },
    [capaId, verifyCapa],
  );

  // Loading
  if (isLoading) {
    return (
      <PageContainer title="CAPA Detail">
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Skeleton variant="rectangular" height={80} />
          <Skeleton variant="rectangular" height={200} />
          <Skeleton variant="rectangular" height={300} />
        </Box>
      </PageContainer>
    );
  }

  // Error
  if (isError) {
    return (
      <PageContainer title="CAPA Detail">
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load CAPA.{' '}
          {error instanceof Error ? error.message : 'Please try again.'}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<BackIcon />}
          onClick={() => navigate('/capa')}
        >
          Back to CAPAs
        </Button>
      </PageContainer>
    );
  }

  const mutationError =
    startCapa.isError || completeCapa.isError || verifyCapa.isError;
  const pageTitle = capa.capaNumber
    ? `CAPA ${capa.capaNumber}`
    : 'CAPA Detail';

  return (
    <PageContainer
      title={pageTitle}
      actions={
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            startIcon={<BackIcon />}
            onClick={() => navigate('/capa')}
          >
            Back
          </Button>

          {(status === 'OPEN' || status === 'IN_PROGRESS' || status === 'OVERDUE') && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<EditIcon />}
              onClick={() => {
                setEditForm({
                  title: (capa.title as string) ?? '',
                  description: (capa.description as string) ?? '',
                  category: (capa.category as string) ?? '',
                  priority: (capa.priority as string) ?? '',
                  assignedToId: (capa.assignedTo as { id: string } | null)?.id ?? (capa.assignedToId as string) ?? '',
                });
                setEditError(null);
                apiClient.get('/users?pageSize=50').then(({ data: d }) => {
                  setUsers((d?.data ?? []) as Array<{ id: string; name: string }>);
                }).catch(() => {});
                setEditDialogOpen(true);
              }}
            >
              Edit
            </Button>
          )}

          {status === 'OPEN' && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<StartIcon />}
              onClick={handleStart}
              disabled={startCapa.isPending}
            >
              {startCapa.isPending ? 'Starting...' : 'Start'}
            </Button>
          )}

          {status === 'IN_PROGRESS' && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<CompleteIcon />}
              onClick={() => setCompleteDialogOpen(true)}
            >
              Complete
            </Button>
          )}

          {status === 'VERIFICATION_PENDING' && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<VerifyIcon />}
              onClick={() => setVerifyDialogOpen(true)}
            >
              Verify
            </Button>
          )}
        </Box>
      }
    >
      {/* Mutation error */}
      {mutationError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to update CAPA status. Please try again.
        </Alert>
      )}

      {/* Status Stepper */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stepper activeStep={activeStep} alternativeLabel>
            {CAPA_LIFECYCLE_STEPS.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </CardContent>
      </Card>

      {/* Detail Grid */}
      <Grid container spacing={3}>
        {/* Main Detail Card */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  mb: 2,
                  flexWrap: 'wrap',
                }}
              >
                {Boolean(status) && (
                  <Chip
                    label={getLabelForValue(CAPA_STATUSES, status)}
                    color={getStatusColor(status)}
                    variant="filled"
                  />
                )}
                {Boolean(capa.priority) && (
                  <Chip
                    label={getLabelForValue(
                      CAPA_PRIORITIES,
                      capa.priority as string,
                    )}
                    size="small"
                    variant="outlined"
                  />
                )}
                {Boolean(capa.actionType) && (
                  <Chip
                    label={capa.actionType as string}
                    size="small"
                    variant="outlined"
                    color="info"
                  />
                )}
              </Box>

              <Typography variant="h6" sx={{ mb: 1 }}>
                {(capa.title as string) ?? 'Untitled CAPA'}
              </Typography>

              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mb: 3 }}>
                {(capa.description as string) ?? 'No description.'}
              </Typography>

              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FieldDisplay
                    label="Category"
                    value={
                      capa.category
                        ? getLabelForValue(
                            CAPA_CATEGORIES,
                            capa.category as string,
                          )
                        : null
                    }
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FieldDisplay
                    label="Assigned To"
                    value={(capa.assignedTo as { name: string } | null)?.name}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FieldDisplay
                    label="Incident"
                    value={(capa.incident as { incidentNumber: string } | null)?.incidentNumber}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FieldDisplay
                    label="Cost"
                    value={
                      <Typography
                        component="span"
                        sx={{
                          color: colors.action.navyBlue,
                          fontWeight: 600,
                        }}
                      >
                        {formatCurrency(capa.cost as number)}
                      </Typography>
                    }
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Dates Sidebar */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h3" sx={{ mb: 2, fontSize: '0.875rem' }}>
                Dates
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <FieldDisplay
                label="Assigned"
                value={formatDate(capa.assignedDate as string)}
              />
              <FieldDisplay
                label="Due Date"
                value={
                  <Typography
                    component="span"
                    sx={{
                      color:
                        capa.dueDate &&
                        new Date(capa.dueDate as string) < new Date() &&
                        status !== 'VERIFIED_EFFECTIVE'
                          ? colors.semantic.error
                          : 'text.primary',
                      fontWeight: 600,
                    }}
                  >
                    {formatDate(capa.dueDate as string)}
                  </Typography>
                }
              />
              <FieldDisplay
                label="Completed"
                value={formatDate(capa.completedDate as string)}
              />
              <FieldDisplay
                label="Verification Due"
                value={formatDate(capa.verificationDueDate as string)}
              />
              <FieldDisplay
                label="Verified"
                value={formatDate(capa.verifiedDate as string)}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Completion Notes (if any) */}
        {Boolean(capa.completionNotes) && (
          <Grid size={12}>
            <Card>
              <CardContent>
                <Typography variant="h3" sx={{ mb: 2, fontSize: '0.875rem' }}>
                  Completion Notes
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                  {capa.completionNotes as string}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Evidence */}
        {Array.isArray(capa.completionEvidence) &&
          (capa.completionEvidence as string[]).length > 0 && (
            <Grid size={12}>
              <Card>
                <CardContent>
                  <Typography variant="h3" sx={{ mb: 2, fontSize: '0.875rem' }}>
                    Evidence
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {(capa.completionEvidence as string[]).map(
                      (item, index) => (
                        <Typography key={index} variant="body2">
                          {item}
                        </Typography>
                      ),
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )}

        {/* Verification (if verified) */}
        {Boolean(capa.verificationResult) && (
          <Grid size={12}>
            <Card>
              <CardContent>
                <Typography variant="h3" sx={{ mb: 2, fontSize: '0.875rem' }}>
                  Verification
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <FieldDisplay
                      label="Result"
                      value={
                        <Chip
                          label={capa.verificationResult as string}
                          size="small"
                          color={
                            capa.verificationResult === 'EFFECTIVE'
                              ? 'success'
                              : capa.verificationResult === 'INEFFECTIVE'
                                ? 'error'
                                : 'warning'
                          }
                        />
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <FieldDisplay
                      label="Verified By"
                      value={(capa.verifiedBy as { name: string } | null)?.name}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <FieldDisplay
                      label="Verified Date"
                      value={formatDate(capa.verifiedDate as string)}
                    />
                  </Grid>
                </Grid>
                {Boolean(capa.verificationNotes) && (
                  <Box sx={{ mt: 1 }}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 0.5 }}
                    >
                      Notes
                    </Typography>
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                      {capa.verificationNotes as string}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Dialogs */}
      <CompleteDialog
        open={completeDialogOpen}
        onClose={() => setCompleteDialogOpen(false)}
        onSubmit={handleComplete}
        isPending={completeCapa.isPending}
      />
      <VerifyDialog
        open={verifyDialogOpen}
        onClose={() => setVerifyDialogOpen(false)}
        onSubmit={handleVerify}
        isPending={verifyCapa.isPending}
      />

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontFamily: 'Oswald, sans-serif', color: colors.action.navyBlue }}>
          Edit CAPA
        </DialogTitle>
        <DialogContent>
          {editError && <Alert severity="error" sx={{ mb: 2, mt: 1 }}>{editError}</Alert>}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
            <TextField
              label="Title"
              fullWidth
              value={editForm.title}
              onChange={(e) => setEditForm((prev) => ({ ...prev, title: e.target.value }))}
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={editForm.description}
              onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))}
            />
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                label="Category"
                value={editForm.category}
                onChange={(e) => setEditForm((prev) => ({ ...prev, category: e.target.value as string }))}
              >
                {CAPA_CATEGORIES.map((c) => (
                  <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                label="Priority"
                value={editForm.priority}
                onChange={(e) => setEditForm((prev) => ({ ...prev, priority: e.target.value as string }))}
              >
                {CAPA_PRIORITIES.map((p) => (
                  <MenuItem key={p.value} value={p.value}>{p.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Assigned To</InputLabel>
              <Select
                label="Assigned To"
                value={editForm.assignedToId}
                onChange={(e) => setEditForm((prev) => ({ ...prev, assignedToId: e.target.value as string }))}
              >
                <MenuItem value="">Unassigned</MenuItem>
                {users.map((u) => (
                  <MenuItem key={u.id} value={u.id}>{u.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)} disabled={editSaving}>Cancel</Button>
          <Button
            variant="contained"
            disabled={editSaving}
            onClick={async () => {
              try {
                setEditSaving(true);
                setEditError(null);
                const payload: Record<string, unknown> = { ...editForm };
                if (!payload.assignedToId) delete payload.assignedToId;
                await apiClient.put(`/capas/${capaId}`, payload);
                setEditDialogOpen(false);
                // Refetch
                window.location.reload();
              } catch (err) {
                setEditError(err instanceof Error ? err.message : 'Failed to save.');
              } finally {
                setEditSaving(false);
              }
            }}
          >
            {editSaving ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
}
