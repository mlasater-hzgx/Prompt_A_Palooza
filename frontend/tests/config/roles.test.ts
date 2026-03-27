import { describe, it, expect } from 'vitest';
import { Role, ROLE_NAV_ACCESS, ROLE_LABELS } from '../../src/config/roles';

describe('roles configuration', () => {
  it('has all 7 roles defined', () => {
    expect(Object.keys(Role)).toHaveLength(7);
  });

  it('has labels for all roles', () => {
    for (const role of Object.values(Role)) {
      expect(ROLE_LABELS[role]).toBeDefined();
      expect(ROLE_LABELS[role].length).toBeGreaterThan(0);
    }
  });

  it('field reporter has limited nav access', () => {
    expect(ROLE_NAV_ACCESS.FIELD_REPORTER).toContain('dashboard');
    expect(ROLE_NAV_ACCESS.FIELD_REPORTER).toContain('incidents');
    expect(ROLE_NAV_ACCESS.FIELD_REPORTER).not.toContain('admin');
    expect(ROLE_NAV_ACCESS.FIELD_REPORTER).not.toContain('investigations');
  });

  it('administrator has all nav sections', () => {
    expect(ROLE_NAV_ACCESS.ADMINISTRATOR).toContain('admin');
    expect(ROLE_NAV_ACCESS.ADMINISTRATOR).toContain('dashboard');
    expect(ROLE_NAV_ACCESS.ADMINISTRATOR).toContain('incidents');
    expect(ROLE_NAV_ACCESS.ADMINISTRATOR).toContain('investigations');
    expect(ROLE_NAV_ACCESS.ADMINISTRATOR).toContain('capa');
  });
});
