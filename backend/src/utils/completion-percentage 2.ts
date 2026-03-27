const REQUIRED_FIELDS = [
  'title',
  'incidentType',
  'incidentDate',
  'division',
  'description',
  'severity',
  'shift',
  'weatherConditions',
  'locationDescription',
  'immediateActionsTaken',
] as const;

const OPTIONAL_BONUS_FIELDS = [
  'projectNumber',
  'jobSite',
  'latitude',
  'longitude',
  'potentialSeverity',
] as const;

export function calculateCompletionPercentage(incident: Record<string, unknown>): number {
  let filledRequired = 0;
  for (const field of REQUIRED_FIELDS) {
    const val = incident[field];
    if (val !== null && val !== undefined && val !== '') {
      filledRequired++;
    }
  }

  const basePercentage = Math.round((filledRequired / REQUIRED_FIELDS.length) * 90);

  let bonus = 0;
  for (const field of OPTIONAL_BONUS_FIELDS) {
    const val = incident[field];
    if (val !== null && val !== undefined && val !== '') {
      bonus++;
    }
  }

  const bonusPercentage = Math.round((bonus / OPTIONAL_BONUS_FIELDS.length) * 10);

  return Math.min(100, basePercentage + bonusPercentage);
}
