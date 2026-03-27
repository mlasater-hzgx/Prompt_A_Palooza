export const API_BASE_URL = import.meta.env.VITE_API_URL ?? '/api';

export const DIVISIONS = [
  { value: 'HCC', label: 'HCC' },
  { value: 'HRSI', label: 'HRSI' },
  { value: 'HSI', label: 'HSI' },
  { value: 'HTI', label: 'HTI' },
  { value: 'HTSI', label: 'HTSI' },
  { value: 'HERZOG_ENERGY', label: 'Herzog Energy' },
  { value: 'GREEN_GROUP', label: 'Green Group' },
] as const;

export const INCIDENT_TYPES = [
  { value: 'INJURY', label: 'Injury' },
  { value: 'NEAR_MISS', label: 'Near Miss' },
  { value: 'PROPERTY_DAMAGE', label: 'Property Damage' },
  { value: 'ENVIRONMENTAL', label: 'Environmental' },
  { value: 'VEHICLE', label: 'Vehicle' },
  { value: 'FIRE', label: 'Fire' },
  { value: 'UTILITY_STRIKE', label: 'Utility Strike' },
] as const;

export const SEVERITY_LEVELS = [
  { value: 'FATALITY', label: 'Fatality', color: '#000000' },
  { value: 'LOST_TIME', label: 'Lost Time', color: '#AB2D24' },
  { value: 'RESTRICTED_DUTY', label: 'Restricted Duty', color: '#AB2D24' },
  { value: 'MEDICAL_TREATMENT', label: 'Medical Treatment', color: '#8A5700' },
  { value: 'FIRST_AID', label: 'First Aid', color: '#086670' },
  { value: 'NEAR_MISS', label: 'Near Miss', color: '#1E6B38' },
  { value: 'PROPERTY_ONLY', label: 'Property Only', color: '#58595B' },
] as const;

export const INCIDENT_STATUSES = [
  { value: 'REPORTED', label: 'Reported' },
  { value: 'UNDER_INVESTIGATION', label: 'Under Investigation' },
  { value: 'INVESTIGATION_COMPLETE', label: 'Investigation Complete' },
  { value: 'CAPA_ASSIGNED', label: 'CAPA Assigned' },
  { value: 'CAPA_IN_PROGRESS', label: 'CAPA In Progress' },
  { value: 'CLOSED', label: 'Closed' },
  { value: 'REOPENED', label: 'Reopened' },
] as const;
