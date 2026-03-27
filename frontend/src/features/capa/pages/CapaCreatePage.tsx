import { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { useForm, Controller } from 'react-hook-form';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { ArrowBack as BackIcon, Save as SaveIcon } from '@mui/icons-material';
import { PageContainer } from '../../../components/layout/PageContainer';
import { useCreateCapa } from '../api/capa.api';
import { useIncidents } from '../../incidents/api/incidents.api';
import { colors } from '../../../design-system/tokens/colors';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CAPA_CATEGORIES = [
  { value: 'TRAINING', label: 'Training' },
  { value: 'PROCEDURE_CHANGE', label: 'Procedure Change' },
  { value: 'ENGINEERING_CONTROL', label: 'Engineering Control' },
  { value: 'PPE', label: 'PPE' },
  { value: 'EQUIPMENT_MODIFICATION', label: 'Equipment Modification' },
  { value: 'DISCIPLINARY', label: 'Disciplinary' },
  { value: 'POLICY_CHANGE', label: 'Policy Change' },
  { value: 'OTHER', label: 'Other' },
] as const;

const CAPA_PRIORITIES = [
  { value: 'CRITICAL', label: 'Critical', days: 7 },
  { value: 'HIGH', label: 'High', days: 14 },
  { value: 'MEDIUM', label: 'Medium', days: 30 },
  { value: 'LOW', label: 'Low', days: 90 },
] as const;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CapaFormValues {
  title: string;
  description: string;
  actionType: 'CORRECTIVE' | 'PREVENTIVE';
  category: string;
  priority: string;
  assignedToId: string;
  incidentId: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function computeDueDate(priority: string): string {
  const p = CAPA_PRIORITIES.find((x) => x.value === priority);
  if (!p) return '';
  const due = new Date();
  due.setDate(due.getDate() + p.days);
  return due.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function Component() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const presetIncidentId = searchParams.get('incidentId') ?? '';

  const createCapa = useCreateCapa();

  // Load incidents for linking
  const { data: incidentsData } = useIncidents({ pageSize: 200 });
  const incidents = incidentsData?.data ?? [];

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<CapaFormValues>({
    defaultValues: {
      title: '',
      description: '',
      actionType: 'CORRECTIVE',
      category: '',
      priority: '',
      assignedToId: '',
      incidentId: presetIncidentId,
    },
    mode: 'onChange',
  });

  const selectedPriority = watch('priority');

  const calculatedDueDate = useMemo(
    () => computeDueDate(selectedPriority),
    [selectedPriority],
  );

  const onSubmit = async (values: CapaFormValues) => {
    const result = await createCapa.mutateAsync({
      title: values.title,
      description: values.description || undefined,
      actionType: values.actionType,
      category: values.category,
      priority: values.priority,
      assignedToId: values.assignedToId || undefined,
      incidentId: values.incidentId,
    });
    const newId = result?.data?.id ?? result?.id;
    if (newId) {
      navigate(`/capa/${newId}`);
    } else {
      navigate('/capa');
    }
  };

  return (
    <PageContainer
      title="Create CAPA"
      actions={
        <Button
          variant="outlined"
          startIcon={<BackIcon />}
          onClick={() => navigate('/capa')}
        >
          Back
        </Button>
      }
    >
      {createCapa.isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to create CAPA. Please try again.
        </Alert>
      )}

      <Card>
        <CardContent>
          <Box
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}
          >
            {/* Title */}
            <Controller
              name="title"
              control={control}
              rules={{ required: 'Title is required' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Title"
                  fullWidth
                  required
                  error={!!errors.title}
                  helperText={errors.title?.message}
                />
              )}
            />

            {/* Description */}
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Description"
                  fullWidth
                  multiline
                  rows={4}
                  placeholder="Describe the corrective or preventive action..."
                />
              )}
            />

            {/* Action Type (Radio) */}
            <Controller
              name="actionType"
              control={control}
              rules={{ required: 'Action type is required' }}
              render={({ field }) => (
                <FormControl error={!!errors.actionType}>
                  <FormLabel>Action Type</FormLabel>
                  <RadioGroup row {...field}>
                    <FormControlLabel
                      value="CORRECTIVE"
                      control={<Radio />}
                      label="Corrective"
                    />
                    <FormControlLabel
                      value="PREVENTIVE"
                      control={<Radio />}
                      label="Preventive"
                    />
                  </RadioGroup>
                  {errors.actionType && (
                    <FormHelperText>{errors.actionType.message}</FormHelperText>
                  )}
                </FormControl>
              )}
            />

            {/* Category */}
            <Controller
              name="category"
              control={control}
              rules={{ required: 'Category is required' }}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.category} required>
                  <InputLabel>Category</InputLabel>
                  <Select {...field} label="Category">
                    {CAPA_CATEGORIES.map((c) => (
                      <MenuItem key={c.value} value={c.value}>
                        {c.label}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.category && (
                    <FormHelperText>{errors.category.message}</FormHelperText>
                  )}
                </FormControl>
              )}
            />

            {/* Priority + Calculated Due Date */}
            <Box>
              <Controller
                name="priority"
                control={control}
                rules={{ required: 'Priority is required' }}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.priority} required>
                    <InputLabel>Priority</InputLabel>
                    <Select {...field} label="Priority">
                      {CAPA_PRIORITIES.map((p) => (
                        <MenuItem key={p.value} value={p.value}>
                          {p.label} ({p.days} days)
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.priority && (
                      <FormHelperText>
                        {errors.priority.message}
                      </FormHelperText>
                    )}
                  </FormControl>
                )}
              />
              {calculatedDueDate && (
                <Typography
                  variant="body2"
                  sx={{
                    mt: 1,
                    color: colors.action.navyBlue,
                    fontWeight: 600,
                  }}
                >
                  Calculated Due Date: {calculatedDueDate}
                </Typography>
              )}
            </Box>

            {/* Assigned To (free text - could be user dropdown with user query) */}
            <Controller
              name="assignedToId"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Assigned To (User ID)"
                  fullWidth
                  placeholder="Enter the user ID of the assignee"
                  helperText="The person responsible for completing this CAPA"
                />
              )}
            />

            {/* Linked Incident */}
            <Controller
              name="incidentId"
              control={control}
              rules={{ required: 'Linked incident is required' }}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.incidentId} required>
                  <InputLabel>Linked Incident</InputLabel>
                  <Select {...field} label="Linked Incident">
                    {incidents.map(
                      (incident: {
                        id: string;
                        incidentNumber?: string;
                        title?: string;
                      }) => (
                        <MenuItem key={incident.id} value={incident.id}>
                          {incident.incidentNumber ?? 'N/A'} -{' '}
                          {incident.title ?? 'Untitled'}
                        </MenuItem>
                      ),
                    )}
                  </Select>
                  {errors.incidentId && (
                    <FormHelperText>
                      {errors.incidentId.message}
                    </FormHelperText>
                  )}
                </FormControl>
              )}
            />

            {/* Submit */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 1 }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/capa')}
                disabled={createCapa.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                startIcon={<SaveIcon />}
                disabled={createCapa.isPending || !isValid}
              >
                {createCapa.isPending ? 'Creating...' : 'Create CAPA'}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
