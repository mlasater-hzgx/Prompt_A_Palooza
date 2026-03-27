import { z } from 'zod';

// Enum value arrays for reuse
const incidentTypeValues = [
  'INJURY', 'NEAR_MISS', 'PROPERTY_DAMAGE', 'ENVIRONMENTAL',
  'VEHICLE', 'FIRE', 'UTILITY_STRIKE',
] as const;

const divisionValues = [
  'HCC', 'HRSI', 'HSI', 'HTI', 'HTSI', 'HERZOG_ENERGY', 'GREEN_GROUP',
] as const;

const severityValues = [
  'FIRST_AID', 'MEDICAL_TREATMENT', 'RESTRICTED_DUTY', 'LOST_TIME',
  'FATALITY', 'NEAR_MISS', 'PROPERTY_ONLY',
] as const;

const shiftValues = ['DAY', 'NIGHT', 'SWING'] as const;

const railroadClientValues = ['BNSF', 'UP', 'CSX', 'NS', 'CN', 'KCS', 'NA'] as const;

const incidentStatusValues = [
  'REPORTED', 'UNDER_INVESTIGATION', 'INVESTIGATION_COMPLETE',
  'CAPA_ASSIGNED', 'CAPA_IN_PROGRESS', 'CLOSED', 'REOPENED',
] as const;

// ---------------------------------------------------------------------------
// Create Incident (quick report)
// ---------------------------------------------------------------------------
export const createIncidentSchema = z.object({
  incidentType: z.enum(incidentTypeValues),
  incidentDate: z.coerce.date(),
  division: z.enum(divisionValues),
  description: z.string().min(1, 'Description is required'),
  // Optional fields
  title: z.string().optional(),
  incidentTime: z.string().optional(),
  projectNumber: z.string().optional(),
  jobSite: z.string().optional(),
  locationDescription: z.string().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  immediateActionsTaken: z.string().optional(),
  weatherConditions: z.string().optional(),
  shift: z.enum(shiftValues).optional(),
  severity: z.enum(severityValues).optional(),
  potentialSeverity: z.enum(severityValues).optional(),
  railroadClient: z.enum(railroadClientValues).optional(),
  photos: z.array(z.string()).optional(),
});

// ---------------------------------------------------------------------------
// Update Incident (all fields optional)
// ---------------------------------------------------------------------------
export const updateIncidentSchema = z.object({
  title: z.string().optional(),
  incidentType: z.enum(incidentTypeValues).optional(),
  incidentDate: z.coerce.date().optional(),
  incidentTime: z.string().optional(),
  division: z.enum(divisionValues).optional(),
  description: z.string().min(1).optional(),
  projectNumber: z.string().nullable().optional(),
  jobSite: z.string().nullable().optional(),
  locationDescription: z.string().nullable().optional(),
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),
  immediateActionsTaken: z.string().nullable().optional(),
  weatherConditions: z.string().nullable().optional(),
  shift: z.enum(shiftValues).nullable().optional(),
  severity: z.enum(severityValues).nullable().optional(),
  potentialSeverity: z.enum(severityValues).nullable().optional(),
  railroadClient: z.enum(railroadClientValues).nullable().optional(),
  photos: z.array(z.string()).optional(),
});

// ---------------------------------------------------------------------------
// Complete Details (staged completion - severity is required)
// ---------------------------------------------------------------------------
export const completeDetailsSchema = z.object({
  title: z.string().optional(),
  incidentType: z.enum(incidentTypeValues).optional(),
  incidentDate: z.coerce.date().optional(),
  incidentTime: z.string().optional(),
  division: z.enum(divisionValues).optional(),
  description: z.string().min(1).optional(),
  projectNumber: z.string().nullable().optional(),
  jobSite: z.string().nullable().optional(),
  locationDescription: z.string().nullable().optional(),
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),
  immediateActionsTaken: z.string().nullable().optional(),
  weatherConditions: z.string().nullable().optional(),
  shift: z.enum(shiftValues).nullable().optional(),
  severity: z.enum(severityValues),
  potentialSeverity: z.enum(severityValues).nullable().optional(),
  railroadClient: z.enum(railroadClientValues).nullable().optional(),
  photos: z.array(z.string()).optional(),
});

// ---------------------------------------------------------------------------
// Status Transition
// ---------------------------------------------------------------------------
export const statusTransitionSchema = z.object({
  status: z.enum(incidentStatusValues),
});

// ---------------------------------------------------------------------------
// Query Params (filters)
// ---------------------------------------------------------------------------
export const incidentQuerySchema = z.object({
  incidentType: z.string().optional(),
  severity: z.string().optional(),
  status: z.string().optional(),
  division: z.string().optional(),
  projectNumber: z.string().optional(),
  railroadClient: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  search: z.string().optional(),
  isDraft: z.string().optional(),
});
