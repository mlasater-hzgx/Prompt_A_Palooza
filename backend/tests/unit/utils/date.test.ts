import { describe, it, expect } from 'vitest';
import { addBusinessDays, businessDaysBetween, getInvestigationTargetDate, getCapaDueDate } from '../../../src/utils/date';

describe('addBusinessDays', () => {
  it('adds business days skipping weekends', () => {
    // Monday Jan 6, 2025 + 5 business days = Monday Jan 13
    const start = new Date(2025, 0, 6);
    const result = addBusinessDays(start, 5);
    expect(result.getDate()).toBe(13);
    expect(result.getDay()).toBe(1); // Monday
  });

  it('handles starting on Friday', () => {
    // Friday Jan 3, 2025 + 1 business day = Monday Jan 6
    const start = new Date(2025, 0, 3);
    const result = addBusinessDays(start, 1);
    expect(result.getDate()).toBe(6);
  });

  it('handles starting on Saturday', () => {
    // Saturday Jan 4, 2025 + 1 business day = Monday Jan 6
    const start = new Date(2025, 0, 4);
    const result = addBusinessDays(start, 1);
    expect(result.getDate()).toBe(6);
  });

  it('adds zero days returns next business day', () => {
    const start = new Date(2025, 0, 6);
    const result = addBusinessDays(start, 0);
    // 0 business days from Monday = still Monday (no days added)
    expect(result.getDate()).toBe(6);
  });
});

describe('businessDaysBetween', () => {
  it('counts business days between two dates', () => {
    const start = new Date(2025, 0, 6); // Monday
    const end = new Date(2025, 0, 10); // Friday
    expect(businessDaysBetween(start, end)).toBe(4);
  });

  it('returns 0 for same day', () => {
    const date = new Date(2025, 0, 6);
    expect(businessDaysBetween(date, date)).toBe(0);
  });

  it('skips weekends', () => {
    const start = new Date(2025, 0, 6); // Monday
    const end = new Date(2025, 0, 13); // Next Monday
    expect(businessDaysBetween(start, end)).toBe(5);
  });
});

describe('getInvestigationTargetDate', () => {
  it('returns 30 business days for FATALITY', () => {
    const start = new Date(2025, 0, 6);
    const target = getInvestigationTargetDate('FATALITY', start);
    // 30 business days from Monday Jan 6 = Feb 17 (Monday, 6 weeks)
    expect(target.getMonth()).toBe(1); // February
  });

  it('returns 5 business days for LOST_TIME', () => {
    const start = new Date(2025, 0, 6);
    const target = getInvestigationTargetDate('LOST_TIME', start);
    expect(target.getDate()).toBe(13);
  });

  it('returns 10 business days for MEDICAL_TREATMENT', () => {
    const start = new Date(2025, 0, 6);
    const target = getInvestigationTargetDate('MEDICAL_TREATMENT', start);
    expect(target.getDate()).toBe(20);
  });

  it('returns 14 business days for NEAR_MISS', () => {
    const start = new Date(2025, 0, 6);
    const target = getInvestigationTargetDate('NEAR_MISS', start);
    expect(target.getDate()).toBe(24);
  });
});

describe('getCapaDueDate', () => {
  it('returns 7 business days for CRITICAL', () => {
    const start = new Date(2025, 0, 6);
    const due = getCapaDueDate('CRITICAL', start);
    expect(due.getDate()).toBe(15);
  });

  it('returns 14 business days for HIGH', () => {
    const start = new Date(2025, 0, 6);
    const due = getCapaDueDate('HIGH', start);
    expect(due.getDate()).toBe(24);
  });
});
