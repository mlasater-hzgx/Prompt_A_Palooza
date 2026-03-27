import { useCallback, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useForm, Controller } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  FormControl,
  InputLabel,
  LinearProgress,
  MenuItem,
  Select,
  Skeleton,
  TextField,
  Typography,
  Alert,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import {
  ArrowBack as BackIcon,
  CheckCircleOutline as CompleteIcon,
} from '@mui/icons-material';
import { PageContainer } from '../../../components/layout/PageContainer';
import { apiClient } from '../../../lib/api-client';
import { useIncident, useUpdateIncident } from '../api/incidents.api';
import { SEVERITY_LEVELS } from '../../../config/constants';

const SHIFT_OPTIONS = [
  { value: 'DAY', label: 'Day' },
  { value: 'NIGHT', label: 'Night' },
  { value: 'SWING', label: 'Swing' },
] as const;

interface CompletionFormValues {
  severity: string;
  shift: string;
  weatherConditions: string;
  immediateActionsTaken: string;
  projectNumber: string;
  potentialSeverity: string;
  railroadClient: string;
}

const COMPLETION_FIELDS: (keyof CompletionFormValues)[] = [
  'severity',
  'shift',
  'weatherConditions',
  'immediateActionsTaken',
  'projectNumber',
  'potentialSeverity',
  'railroadClient',
];

const FIELD_LABELS: Record<keyof CompletionFormValues, string> = {
  severity: 'Severity',
  shift: 'Shift',
  weatherConditions: 'Weather Conditions',
  immediateActionsTaken: 'Immediate Actions Taken',
  projectNumber: 'Project Number',
  potentialSeverity: 'Potential Severity',
  railroadClient: 'Railroad / Client',
};

function computeLocalCompletion(
  incident: Record<string, unknown>,
  formValues: CompletionFormValues,
): number {
  // Count all relevant fields on the incident; completion fields from the form override incident values
  const allFields = [
    'incidentType',
    'incidentDate',
    'division',
    'title',
    'description',
    'jobSite',
    'locationDescription',
    ...COMPLETION_FIELDS,
  ] as const;

  let filled = 0;
  for (const f of allFields) {
    const value = (f in formValues)
      ? formValues[f as keyof CompletionFormValues]
      : incident[f];
    if (value !== undefined && value !== null && value !== '') filled++;
  }

  return Math.round((filled / allFields.length) * 100);
}

export function Component() {
  const { incidentId } = useParams<{ incidentId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const updateIncident = useUpdateIncident();
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data, isLoading, isError, error } = useIncident(incidentId ?? '');
  const incident: Record<string, unknown> = data?.data ?? data ?? {};

  const completeDetails = useMutation({
    mutationFn: async (body: Record<string, unknown>) => {
      const { data: result } = await apiClient.post(
        `/incidents/${incidentId}/complete-details`,
        body,
      );
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      queryClient.invalidateQueries({ queryKey: ['incident', incidentId] });
    },
  });

  const { control, handleSubmit, watch, getValues } = useForm<CompletionFormValues>({
    values: {
      severity: (incident.severity as string) ?? '',
      shift: (incident.shift as string) ?? '',
      weatherConditions: (incident.weatherConditions as string) ?? '',
      immediateActionsTaken: (incident.immediateActionsTaken as string) ?? '',
      projectNumber: (incident.projectNumber as string) ?? '',
      potentialSeverity: (incident.potentialSeverity as string) ?? '',
      railroadClient: (incident.railroadClient as string) ?? '',
    },
    mode: 'onChange',
  });

  const currentValues = watch();
  const completionPercentage = isLoading
    ? 0
    : computeLocalCompletion(incident, currentValues);

  // Determine which fields are still empty (need attention)
  const missingFields = COMPLETION_FIELDS.filter((f) => {
    const val = currentValues[f];
    return val === undefined || val === null || val === '';
  });

  // Auto-save on field change (debounced)
  const watchedSeverity = watch('severity');
  const watchedShift = watch('shift');
  const watchedWeather = watch('weatherConditions');
  const watchedActions = watch('immediateActionsTaken');
  const watchedProject = watch('projectNumber');
  const watchedPotential = watch('potentialSeverity');
  const watchedClient = watch('railroadClient');

  useEffect(() => {
    if (isLoading || !incidentId) return;

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      const values = getValues();
      const payload: Record<string, unknown> = { id: incidentId };
      for (const f of COMPLETION_FIELDS) {
        if (values[f] !== undefined && values[f] !== '') {
          payload[f] = values[f];
        }
      }
      // Only auto-save if at least one completion field has a value
      const hasValues = COMPLETION_FIELDS.some(
        (f) => values[f] !== undefined && values[f] !== null && values[f] !== '',
      );
      if (hasValues) {
        updateIncident.mutate(payload as Record<string, unknown> & { id: string });
      }
    }, 1200);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    watchedSeverity,
    watchedShift,
    watchedWeather,
    watchedActions,
    watchedProject,
    watchedPotential,
    watchedClient,
  ]);

  const onSubmit = useCallback(
    async (formData: CompletionFormValues) => {
      if (!incidentId) return;
      try {
        await completeDetails.mutateAsync(formData as unknown as Record<string, unknown>);
        navigate(`/incidents/${incidentId}`);
      } catch {
        // Error is handled by mutation state
      }
    },
    [incidentId, completeDetails, navigate],
  );

  // Loading State
  if (isLoading) {
    return (
      <PageContainer title="Complete Incident Details">
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Skeleton variant="rectangular" height={24} />
          <Skeleton variant="rectangular" height={8} sx={{ borderRadius: 4 }} />
          <Skeleton variant="rectangular" height={300} />
        </Box>
      </PageContainer>
    );
  }

  // Error State
  if (isError) {
    return (
      <PageContainer title="Complete Incident Details">
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load incident.{' '}
          {error instanceof Error ? error.message : 'Please try again.'}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<BackIcon />}
          onClick={() => navigate(`/incidents/${incidentId}`)}
        >
          Back to Incident
        </Button>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Complete Incident Details"
      actions={
        <Button
          variant="outlined"
          startIcon={<BackIcon />}
          onClick={() => navigate(`/incidents/${incidentId}`)}
        >
          Back to Incident
        </Button>
      }
    >
      {/* Completion Progress Bar */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Completion Progress
            </Typography>
            <Typography variant="body2" fontWeight={700}>
              {completionPercentage}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={completionPercentage}
            sx={{ height: 10, borderRadius: 5 }}
          />
          {missingFields.length > 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
              Missing fields:{' '}
              {missingFields.map((f) => FIELD_LABELS[f]).join(', ')}
            </Typography>
          )}
          {missingFields.length === 0 && (
            <Typography variant="body2" color="success.main" sx={{ mt: 1.5 }}>
              All completion fields are filled. You can submit the details.
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Auto-save indicator */}
      {updateIncident.isPending && (
        <Alert severity="info" sx={{ mb: 2 }} icon={<CircularProgress size={18} />}>
          Auto-saving changes...
        </Alert>
      )}

      {/* Mutation Error */}
      {completeDetails.isError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Failed to complete incident details.{' '}
          {completeDetails.error instanceof Error
            ? completeDetails.error.message
            : 'Please try again.'}
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h3" sx={{ mb: 3 }}>
              Required & Optional Fields
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Fill in the missing fields below to bring this incident to 100% completion.
              Changes are saved automatically as you type.
            </Typography>

            <Grid container spacing={3}>
              {/* Severity (required) */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="severity"
                  control={control}
                  rules={{ required: 'Severity is required' }}
                  render={({ field, fieldState }) => (
                    <FormControl
                      fullWidth
                      error={!!fieldState.error}
                      sx={
                        !field.value
                          ? { '& .MuiOutlinedInput-root': { borderColor: 'warning.main' } }
                          : undefined
                      }
                    >
                      <InputLabel>Severity *</InputLabel>
                      <Select {...field} label="Severity *">
                        <MenuItem value="">Not specified</MenuItem>
                        {SEVERITY_LEVELS.map((s) => (
                          <MenuItem key={s.value} value={s.value}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box
                                sx={{
                                  width: 12,
                                  height: 12,
                                  borderRadius: '50%',
                                  backgroundColor: s.color,
                                }}
                              />
                              {s.label}
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                      {fieldState.error && (
                        <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                          {fieldState.error.message}
                        </Typography>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>

              {/* Shift */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="shift"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>Shift</InputLabel>
                      <Select {...field} label="Shift">
                        <MenuItem value="">Not specified</MenuItem>
                        {SHIFT_OPTIONS.map((s) => (
                          <MenuItem key={s.value} value={s.value}>
                            {s.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>

              {/* Weather Conditions */}
              <Grid size={12}>
                <Controller
                  name="weatherConditions"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Weather Conditions"
                      fullWidth
                      placeholder="e.g., Clear, 72F, light wind"
                    />
                  )}
                />
              </Grid>

              {/* Immediate Actions Taken */}
              <Grid size={12}>
                <Controller
                  name="immediateActionsTaken"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Immediate Actions Taken"
                      fullWidth
                      multiline
                      rows={4}
                      placeholder="Describe any immediate corrective or first aid actions taken at the scene..."
                    />
                  )}
                />
              </Grid>

              {/* Project Number */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="projectNumber"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Project Number"
                      fullWidth
                      placeholder="e.g., PRJ-2026-0042"
                    />
                  )}
                />
              </Grid>

              {/* Potential Severity */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="potentialSeverity"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>Potential Severity</InputLabel>
                      <Select {...field} label="Potential Severity">
                        <MenuItem value="">Not specified</MenuItem>
                        {SEVERITY_LEVELS.map((s) => (
                          <MenuItem key={s.value} value={s.value}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box
                                sx={{
                                  width: 12,
                                  height: 12,
                                  borderRadius: '50%',
                                  backgroundColor: s.color,
                                }}
                              />
                              {s.label}
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>

              {/* Railroad / Client */}
              <Grid size={12}>
                <Controller
                  name="railroadClient"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Railroad / Client"
                      fullWidth
                      placeholder="e.g., BNSF, UP, CSX"
                    />
                  )}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            variant="outlined"
            startIcon={<BackIcon />}
            onClick={() => navigate(`/incidents/${incidentId}`)}
          >
            Back to Incident
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={
              completeDetails.isPending ? (
                <CircularProgress size={18} color="inherit" />
              ) : (
                <CompleteIcon />
              )
            }
            type="submit"
            disabled={completeDetails.isPending}
          >
            {completeDetails.isPending ? 'Submitting...' : 'Submit Completed Details'}
          </Button>
        </Box>
      </form>
    </PageContainer>
  );
}
