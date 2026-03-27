import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import {
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  MyLocation as GpsIcon,
  Send as SubmitIcon,
} from '@mui/icons-material';
import { PageContainer } from '../../../components/layout/PageContainer';
import { useCreateIncident } from '../api/incidents.api';
import {
  INCIDENT_TYPES,
  SEVERITY_LEVELS,
  DIVISIONS,
} from '../../../config/constants';
import { colors } from '../../../design-system/tokens/colors';

const SHIFT_OPTIONS = [
  { value: 'DAY', label: 'Day' },
  { value: 'NIGHT', label: 'Night' },
  { value: 'SWING', label: 'Swing' },
] as const;

const STEPS = ['Basic Info', 'Location', 'Details', 'Review & Submit'];

const incidentSchema = z.object({
  // Step 1 - Basic Info
  incidentType: z.string().min(1, 'Incident type is required'),
  incidentDate: z.string().min(1, 'Incident date is required'),
  division: z.string().min(1, 'Division is required'),
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  description: z.string().min(10, 'Description must be at least 10 characters').max(5000),

  // Step 2 - Location
  jobSite: z.string().optional(),
  locationDescription: z.string().optional(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),

  // Step 3 - Details
  severity: z.string().min(1, 'Severity is required'),
  shift: z.string().optional(),
  weatherConditions: z.string().optional(),
  immediateActionsTaken: z.string().optional(),
});

type IncidentFormValues = z.infer<typeof incidentSchema>;

const defaultValues: IncidentFormValues = {
  incidentType: '',
  incidentDate: new Date().toISOString().slice(0, 16),
  division: '',
  title: '',
  description: '',
  jobSite: '',
  locationDescription: '',
  latitude: null,
  longitude: null,
  severity: '',
  shift: '',
  weatherConditions: '',
  immediateActionsTaken: '',
};

// Fields validated per step
const STEP_FIELDS: (keyof IncidentFormValues)[][] = [
  ['incidentType', 'incidentDate', 'division', 'title', 'description'],
  ['jobSite', 'locationDescription'],
  ['severity'],
  [],
];

function getLabelForValue(
  items: ReadonlyArray<{ value: string; label: string }>,
  value: string,
): string {
  return items.find((item) => item.value === value)?.label ?? value;
}

export function Component() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const createIncident = useCreateIncident();

  const {
    control,
    handleSubmit,
    trigger,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<IncidentFormValues>({
    resolver: zodResolver(incidentSchema),
    defaultValues,
    mode: 'onTouched',
  });

  const handleNext = useCallback(async () => {
    const fieldsToValidate = STEP_FIELDS[activeStep];
    const valid = await trigger(fieldsToValidate);
    if (valid) {
      setActiveStep((prev) => Math.min(prev + 1, STEPS.length - 1));
    }
  }, [activeStep, trigger]);

  const handleBack = useCallback(() => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
  }, []);

  const handleDetectGps = useCallback(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setValue('latitude', position.coords.latitude);
        setValue('longitude', position.coords.longitude);
      },
      () => {
        // GPS detection failed silently; user can enter manually
      },
    );
  }, [setValue]);

  const onSubmit = useCallback(
    async (formData: IncidentFormValues) => {
      try {
        const result = await createIncident.mutateAsync(formData as Record<string, unknown>);
        const newId = result?.data?.id ?? result?.id;
        if (newId) {
          navigate(`/incidents/${newId}`);
        } else {
          navigate('/incidents');
        }
      } catch {
        // Error is handled by mutation state
      }
    },
    [createIncident, navigate],
  );

  const values = getValues();

  return (
    <PageContainer
      title="Report Incident"
      actions={
        <Button variant="outlined" onClick={() => navigate('/incidents')}>
          Cancel
        </Button>
      }
    >
      {/* Stepper */}
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {STEPS.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* Mutation Error */}
      {createIncident.isError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Failed to report incident.{' '}
          {createIncident.error instanceof Error
            ? createIncident.error.message
            : 'Please try again.'}
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Step 1: Basic Info */}
        {activeStep === 0 && (
          <Card>
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
        )}

        {/* Step 2: Location */}
        {activeStep === 1 && (
          <Card>
            <CardContent>
              <Typography variant="h3" sx={{ mb: 3 }}>
                Location Information
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
        )}

        {/* Step 3: Details */}
        {activeStep === 2 && (
          <Card>
            <CardContent>
              <Typography variant="h3" sx={{ mb: 3 }}>
                Incident Details
              </Typography>

              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller
                    name="severity"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth error={!!errors.severity}>
                        <InputLabel>Severity *</InputLabel>
                        <Select {...field} label="Severity *">
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
                        {errors.severity && (
                          <FormHelperText>{errors.severity.message}</FormHelperText>
                        )}
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
        )}

        {/* Step 4: Review & Submit */}
        {activeStep === 3 && (
          <Card>
            <CardContent>
              <Typography variant="h3" sx={{ mb: 3 }}>
                Review & Submit
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Please review the information below before submitting the incident report.
              </Typography>

              {/* Basic Info Review */}
              <Typography variant="h3" sx={{ mb: 1, fontSize: '0.875rem' }}>
                Basic Information
              </Typography>
              <Card variant="outlined" sx={{ mb: 3 }}>
                <List dense disablePadding>
                  <ListItem divider>
                    <ListItemText
                      primary="Title"
                      secondary={values.title || '--'}
                    />
                  </ListItem>
                  <ListItem divider>
                    <ListItemText
                      primary="Incident Type"
                      secondary={
                        values.incidentType
                          ? getLabelForValue(INCIDENT_TYPES, values.incidentType)
                          : '--'
                      }
                    />
                  </ListItem>
                  <ListItem divider>
                    <ListItemText
                      primary="Date & Time"
                      secondary={values.incidentDate || '--'}
                    />
                  </ListItem>
                  <ListItem divider>
                    <ListItemText
                      primary="Division"
                      secondary={
                        values.division
                          ? getLabelForValue(DIVISIONS, values.division)
                          : '--'
                      }
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Description"
                      secondary={values.description || '--'}
                      secondaryTypographyProps={{ sx: { whiteSpace: 'pre-wrap' } }}
                    />
                  </ListItem>
                </List>
              </Card>

              {/* Location Review */}
              <Typography variant="h3" sx={{ mb: 1, fontSize: '0.875rem' }}>
                Location
              </Typography>
              <Card variant="outlined" sx={{ mb: 3 }}>
                <List dense disablePadding>
                  <ListItem divider>
                    <ListItemText
                      primary="Job Site"
                      secondary={values.jobSite || '--'}
                    />
                  </ListItem>
                  <ListItem divider>
                    <ListItemText
                      primary="Location Description"
                      secondary={values.locationDescription || '--'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="GPS Coordinates"
                      secondary={
                        values.latitude && values.longitude
                          ? `${values.latitude}, ${values.longitude}`
                          : 'Not provided'
                      }
                    />
                  </ListItem>
                </List>
              </Card>

              {/* Details Review */}
              <Typography variant="h3" sx={{ mb: 1, fontSize: '0.875rem' }}>
                Details
              </Typography>
              <Card variant="outlined" sx={{ mb: 3 }}>
                <List dense disablePadding>
                  <ListItem divider>
                    <ListItemText
                      primary="Severity"
                      secondary={
                        values.severity ? (
                          <Chip
                            label={getLabelForValue(SEVERITY_LEVELS, values.severity)}
                            size="small"
                            sx={{
                              backgroundColor:
                                SEVERITY_LEVELS.find((s) => s.value === values.severity)?.color ??
                                colors.brand.midGray,
                              color: colors.neutral.white,
                              mt: 0.5,
                            }}
                          />
                        ) : (
                          '--'
                        )
                      }
                    />
                  </ListItem>
                  <ListItem divider>
                    <ListItemText
                      primary="Shift"
                      secondary={
                        values.shift
                          ? getLabelForValue(SHIFT_OPTIONS as unknown as ReadonlyArray<{ value: string; label: string }>, values.shift)
                          : '--'
                      }
                    />
                  </ListItem>
                  <ListItem divider>
                    <ListItemText
                      primary="Weather Conditions"
                      secondary={values.weatherConditions || '--'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Immediate Actions Taken"
                      secondary={values.immediateActionsTaken || '--'}
                      secondaryTypographyProps={{ sx: { whiteSpace: 'pre-wrap' } }}
                    />
                  </ListItem>
                </List>
              </Card>
            </CardContent>
          </Card>
        )}

        {/* Navigation Buttons */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            mt: 3,
          }}
        >
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
            disabled={activeStep === 0}
          >
            Back
          </Button>

          {activeStep < STEPS.length - 1 ? (
            <Button
              variant="contained"
              color="primary"
              endIcon={<ArrowForwardIcon />}
              onClick={handleNext}
            >
              Next
            </Button>
          ) : (
            <Button
              variant="contained"
              color="primary"
              endIcon={
                createIncident.isPending ? (
                  <CircularProgress size={18} color="inherit" />
                ) : (
                  <SubmitIcon />
                )
              }
              type="submit"
              disabled={createIncident.isPending}
            >
              {createIncident.isPending ? 'Submitting...' : 'Submit Report'}
            </Button>
          )}
        </Box>
      </form>
    </PageContainer>
  );
}
