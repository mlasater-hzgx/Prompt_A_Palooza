export const Role = {
  FIELD_REPORTER: 'FIELD_REPORTER',
  SAFETY_COORDINATOR: 'SAFETY_COORDINATOR',
  SAFETY_MANAGER: 'SAFETY_MANAGER',
  PROJECT_MANAGER: 'PROJECT_MANAGER',
  DIVISION_MANAGER: 'DIVISION_MANAGER',
  EXECUTIVE: 'EXECUTIVE',
  ADMINISTRATOR: 'ADMINISTRATOR',
} as const;

export type RoleName = (typeof Role)[keyof typeof Role];

export const ROLE_LABELS: Record<RoleName, string> = {
  FIELD_REPORTER: 'Field Reporter',
  SAFETY_COORDINATOR: 'Safety Coordinator',
  SAFETY_MANAGER: 'Safety Manager',
  PROJECT_MANAGER: 'Project Manager',
  DIVISION_MANAGER: 'Division Manager',
  EXECUTIVE: 'Executive',
  ADMINISTRATOR: 'Administrator',
};

type NavSection = 'dashboard' | 'incidents' | 'investigations' | 'capa' | 'recurrence' | 'trends' | 'reports' | 'admin';

export const ROLE_NAV_ACCESS: Record<RoleName, NavSection[]> = {
  FIELD_REPORTER: ['dashboard', 'incidents'],
  SAFETY_COORDINATOR: ['dashboard', 'incidents', 'investigations', 'capa', 'reports'],
  SAFETY_MANAGER: ['dashboard', 'incidents', 'investigations', 'capa', 'recurrence', 'trends', 'reports'],
  PROJECT_MANAGER: ['dashboard', 'incidents'],
  DIVISION_MANAGER: ['dashboard', 'incidents', 'investigations', 'capa', 'trends'],
  EXECUTIVE: ['dashboard', 'incidents', 'investigations', 'capa', 'recurrence', 'trends', 'reports'],
  ADMINISTRATOR: ['dashboard', 'incidents', 'investigations', 'capa', 'recurrence', 'trends', 'reports', 'admin'],
};
