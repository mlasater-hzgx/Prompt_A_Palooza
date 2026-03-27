import { describe, it, expect } from 'vitest';
import { calculateCompletionPercentage } from '../../../src/utils/completion-percentage';

describe('calculateCompletionPercentage', () => {
  it('returns 0 for empty incident', () => {
    expect(calculateCompletionPercentage({})).toBe(0);
  });

  it('returns ~30% for quick report fields only', () => {
    const incident = {
      incidentType: 'INJURY',
      incidentDate: new Date(),
      division: 'HCC',
      description: 'Worker slipped',
    };
    const pct = calculateCompletionPercentage(incident);
    expect(pct).toBeGreaterThanOrEqual(27);
    expect(pct).toBeLessThanOrEqual(40);
  });

  it('returns 90% when all required fields filled', () => {
    const incident = {
      title: 'Test Incident',
      incidentType: 'INJURY',
      incidentDate: new Date(),
      division: 'HCC',
      description: 'Worker slipped',
      severity: 'FIRST_AID',
      shift: 'DAY',
      weatherConditions: 'Clear',
      locationDescription: 'Building A',
      immediateActionsTaken: 'First aid applied',
    };
    const pct = calculateCompletionPercentage(incident);
    expect(pct).toBe(90);
  });

  it('returns 100% with all required + optional fields', () => {
    const incident = {
      title: 'Test Incident',
      incidentType: 'INJURY',
      incidentDate: new Date(),
      division: 'HCC',
      description: 'Worker slipped',
      severity: 'FIRST_AID',
      shift: 'DAY',
      weatherConditions: 'Clear',
      locationDescription: 'Building A',
      immediateActionsTaken: 'First aid applied',
      projectNumber: 'PRJ-001',
      jobSite: 'Site A',
      latitude: 39.0,
      longitude: -94.5,
      potentialSeverity: 'MEDICAL_TREATMENT',
    };
    const pct = calculateCompletionPercentage(incident);
    expect(pct).toBe(100);
  });
});
