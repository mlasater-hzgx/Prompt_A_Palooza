export function addBusinessDays(date: Date, days: number): Date {
  const result = new Date(date);
  let added = 0;
  while (added < days) {
    result.setDate(result.getDate() + 1);
    const dayOfWeek = result.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      added++;
    }
  }
  return result;
}

export function businessDaysBetween(start: Date, end: Date): number {
  let count = 0;
  const current = new Date(start);
  while (current < end) {
    current.setDate(current.getDate() + 1);
    const dayOfWeek = current.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      count++;
    }
  }
  return count;
}

export function getInvestigationTargetDate(severity: string, startDate: Date): Date {
  switch (severity) {
    case 'FATALITY':
      return addBusinessDays(startDate, 30);
    case 'LOST_TIME':
      return addBusinessDays(startDate, 5);
    case 'RESTRICTED_DUTY':
    case 'MEDICAL_TREATMENT':
      return addBusinessDays(startDate, 10);
    case 'FIRST_AID':
    case 'NEAR_MISS':
    case 'PROPERTY_ONLY':
    default:
      return addBusinessDays(startDate, 14);
  }
}

export function getCapaDueDate(priority: string, startDate: Date): Date {
  switch (priority) {
    case 'CRITICAL':
      return addBusinessDays(startDate, 7);
    case 'HIGH':
      return addBusinessDays(startDate, 14);
    case 'MEDIUM':
      return addBusinessDays(startDate, 30);
    case 'LOW':
    default:
      return addBusinessDays(startDate, 60);
  }
}
