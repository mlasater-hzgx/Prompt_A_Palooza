import { useCallback } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  FormControl,
  FormHelperText,
  InputLabel,
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
  Save as SaveIcon,
  MyLocation as GpsIcon,
} from '@mui/icons-material';
import { PageContainer } from '../../../components/layout/PageContainer';
import { useIncident, useUpdateIncident } from '../api/incidents.api';
import {
  INCIDENT_TYPES,
  SEVERITY_LEVELS,
  DIVISIONS,
  INCIDENT_STATUSES,
} from '../../../config/constants';

const SHIFT_OPTIONS = [
  { value: 'DAY', label: 'Day' },
  { value: 'NIGHT', label: 'Night' },
  { value: 'SWING', label: 'Swing' },
] as const;

const editSchema = z.object({
  // Basic Info
  incidentType: z.string().min(1, 'Incident type is required'),
  incidentDate: z.string().min(1, 'Incident date is required'),
  division: z.string().min(1, 'Division is required'),
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  description: z.string().min(10, 'Description must be at least 10 characters').max(5000),
  status: z.string().optional(),

  // Location
  jobSite: z.string().optional(),
  locationDescription: z.string().optional(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),

  // Details
  severity: z.string().optional(),
  shift: z.string().optional(),
  weatherConditions: z.string().optional(),
  immediateActionsTaken: z.string().optional(),

  // OSHA / Client Info
  isOshaRecordable: z.boolean().optional(),
  oshaClassification: z.string().optional(),
  projectNumber: z.string().optional(),
  potentialSeverity: z.string().optional(),
  railroadClient: z.string().optional(),
});

type EditFormValues = z.infer<typeof editSchema>;

export function Component() {
  const { incidentId } = useParams<{ incidentId: string }>();
  const navigate = useNavigate();
  const updateIncident = useUpdateIncident();

  const { data, isLoading, isError, error } = useIncident(incidentId ?? '');
  const incident = data?.data ?? data ?? {};

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isDirty },
    reset,
  } = useForm<EditFormValues>({
    resolver: zodResolver(editSchema),
    values: {
      incidentType: (incident.incidentType as string) ?? '',
      incidentDate: incident.incidentDate
        ? new Date(incident.incidentDate as string).toISOString().slice(0, 16)
        : '',
      division: (incident.division as string) ?? '',
      title: (incident.title as string) ?? '',
      description: (incident.description as string) ?? '',
      status: (incident.status as string) ?? '',
      jobSite: (incident.jobSite as string) ?? '',
      locationDescription: (incident.locationDescription as string) ?? '',
      latitude: (incident.latitude as number | null) ?? null,
      longitude: (incident.longitude as number | null) ?? null,
      severity: (incident.severity as string) ?? '',
      shift: (incident.shift as string) ?? '',
      weatherConditions: (incident.weatherConditions as string) ?? '',
      immediateActionsTaken: (incident.immediateActionsTaken as string) ?? '',
      isOshaRecordable: (incident.isOshaRecordable as boolean) ?? false,
      oshaClassification: (incident.oshaClassification as string) ?? '',
      projectNumber: (incident.projectNumber as string) ?? '',
      potentialSeverity: (incident.potentialSeverity as string) ?? '',
      railroadClient: (incident.railroadClient as string) ?? '',
    },
    mode: 'onTouched',
  });

  const handleDetectGps = useCallback(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setValue('latitude', position.coords.latitude, { shouldDirty: true });
        setValue('longitude', position.coords.longitude, { shouldDirty: true });
      },
      () => {
        // GPS detection failed silently
      },
    );
  }, [setValue]);

  const onSubmit = useCallback(
    async (formData: EditFormValues) => {
      if (!incidentId) return;
      try {
        await updateIncident.mutateAsync({ id: incidentId, ...formData });
        navigate(`/incidents/${incidentId}`);
      } catch {
        // Error is handled by mutation state
      }
    },
    [incidentId, updateIncident, navigate],
  );

  const handleCancel = useCallback(() => {
    reset();
    navigate(`/incidents/${incidentId}`);
  }, [incidentId, navigate, reset]);

  // Loading State
  if (isLoading) {
    return (
      <PageContainer title="Edit Incident">
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Skeleton variant="rectangular" height={48} />
          <Skeleton variant="rectangular" height={200} />
          <Skeleton variant="rectangular" height={200} />
          <Skeleton variant="rectangular" height={200} />
        </Box>
      </PageContainer>
    );
  }

  // Error State
  if (isError) {
    return (
      <PageContainer title="Edit Incident">
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

  return (
    <PageContainer
      title="Edit Incident"
      actions={
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={
              updateIncident.isPending ? (
                <CircularProgress size={18} color="inherit" />
              ) : (
                <SaveIcon />
              )
            }
            onClick={handleSubmit(onSubmit)}
            disabled={updateIncident.isPending || !isDirty}
          >
            {updateIncident.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </Box>
      }
    >
      {/* Mutation Error */}
      {updateIncident.isError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Failed to save changes.{' '}
          {updateIncident.error instanceof Error
            ? updateIncident.error.message
            : 'Please try again.'}
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Section 1: Basic Info */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h3" sx={{ mb: 3 }}>
              Basic Information
            </Typography>

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="incidentType"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.incidentType}>
                      <InputLabel>Incident Type *</InputLabel>
                      <Select {...field} label="Incident Type *">
                        {INCIDENT_TYPES.map((t) => (
                          <MenuItem key={t.value} value={t.value}>
                            {t.label}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.incidentType && (
                        <FormHelperText>{errors.incidentType.message}</FormHelperText>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="incidentDate"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Incident Date & Time *"
                      type="datetime-local"
                      fullWidth
                      error={!!errors.incidentDate}
                      helperText={errors.incidentDate?.message}
                      slotProps={{ inputLabel: { shrink: true } }}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="division"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.division}>
                      <InputLabel>Division *</InputLabel>
                      <Select {...field} label="Division *">
                        {DIVISIONS.map((d) => (
                          <MenuItem key={d.value} value={d.value}>
                            {d.label}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.division && (
                        <FormHelperText>{errors.division.message}</FormHelperText>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>Status</InputLabel>
                      <Select {...field} label="Status">
                        {INCIDENT_STATUSES.map((s) => (
                          <MenuItem key={s.value} value={s.value}>
                            {s.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid size={12}>
                <Controller
                  name="title"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Incident Title *"
                      fullWidth
                      error={!!errors.title}
                      helperText={errors.title?.message}
                      placeholder="Brief description of the incident"
                    />
                  )}
                />
              </Grid>

              <Grid size={12}>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Description *"
                      fullWidth
                      multiline
                      rows={5}
                      error={!!errors.description}
                      helperText={errors.description?.message}
                      placeholder="Provide a detailed description of what happened..."
                    />
                  )}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Section 2: Location */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h3" sx={{ mb: 3 }}>
              Location
            </Typography>

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="jobSite"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Job Site / Project Number"
                      fullWidth
                      placeholder="e.g., PRJ-2026-0042"
                    />
                  )}
                />
              </Grid>

              <Grid size={12}>
                <Controller
                  name="locationDescription"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Location Description"
                      fullWidth
                      multiline
                      rows={3}
                      placeholder="Describe the exact location where the incident occurred..."
                    />
                  )}
                />
              </Grid>

              <Grid size={12}>
                <Divider sx={{ my: 1 }} />
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  GPS Coordinates (optional)
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <Controller
                  name="latitude"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      label="Latitude"
                      fullWidth
                      type="number"
                      value={field.value ?? ''}
                      onChange={(e) =>
                        field.onChange(e.target.value ? parseFloat(e.target.value) : null)
                      }
                      slotProps={{ htmlInput: { step: 'any' } }}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <Controller
                  name="longitude"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      label="Longitude"
                      fullWidth
                      type="number"
                      value={field.value ?? ''}
                      onChange={(e) =>
                        field.onChange(e.target.value ? parseFloat(e.target.value) : null)
                      }
                      slotProps={{ htmlInput: { step: 'any' } }}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }} sx={{ display: 'flex', alignItems: 'center' }}>
                <Button
                  variant="outlined"
                  startIcon={<GpsIcon />}
                  onClick={handleDetectGps}
                  fullWidth
                  sx={{ height: 56 }}
                >
                  Auto-Detect GPS
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Section 3: Details */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h3" sx={{ mb: 3 }}>
              Details
            </Typography>

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="severity"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>Severity</InputLabel>
                      <Select {...field} label="Severity">
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
            </Grid>
          </CardContent>
        </Card>

        {/* Section 4: OSHA / Client Info */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h3" sx={{ mb: 3 }}>
              OSHA / Client Information
            </Typography>

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="oshaClassification"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>OSHA Classification</InputLabel>
                      <Select {...field} label="OSHA Classification">
                        <MenuItem value="">Not specified</MenuItem>
                        <MenuItem value="RECORDABLE">Recordable</MenuItem>
                        <MenuItem value="FIRST_AID">First Aid</MenuItem>
                        <MenuItem value="NEAR_MISS">Near Miss</MenuItem>
                        <MenuItem value="NON_RECORDABLE">Non-Recordable</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>

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

              <Grid size={{ xs: 12, sm: 6 }}>
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

        {/* Bottom Action Bar */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button variant="outlined" startIcon={<BackIcon />} onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={
              updateIncident.isPending ? (
                <CircularProgress size={18} color="inherit" />
              ) : (
                <SaveIcon />
              )
            }
            type="submit"
            disabled={updateIncident.isPending || !isDirty}
          >
            {updateIncident.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </Box>
      </form>
    </PageContainer>
  );
}
