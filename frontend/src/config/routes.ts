export const ROUTES = {
  LOGIN: '/login',
  AUTH_CALLBACK: '/auth/callback',

  EXECUTIVE_DASHBOARD: '/dashboard',
  DIVISION_DASHBOARD: '/dashboard/division/:divisionId',
  PROJECT_DASHBOARD: '/dashboard/project/:projectNumber',
  TREND_ANALYSIS: '/dashboard/trends',

  INCIDENT_LIST: '/incidents',
  INCIDENT_CREATE: '/incidents/new',
  INCIDENT_DETAIL: '/incidents/:incidentId',
  INCIDENT_EDIT: '/incidents/:incidentId/edit',
  INCIDENT_COMPLETE: '/incidents/:incidentId/complete',

  INVESTIGATION_LIST: '/investigations',
  INVESTIGATION_DETAIL: '/investigations/:investigationId',
  ROOT_CAUSE_ANALYSIS: '/investigations/:investigationId/rca',

  CAPA_LIST: '/capa',
  CAPA_CREATE: '/capa/new',
  CAPA_DETAIL: '/capa/:capaId',

  RECURRENCE: '/recurrence',

  OSHA_REPORTS: '/reports/osha',

  ADMIN_FACTORS: '/admin/factors',
  ADMIN_NOTIFICATIONS: '/admin/notifications',
  ADMIN_USERS: '/admin/users',
  ADMIN_PROJECTS: '/admin/projects',
  ADMIN_HOURS_WORKED: '/admin/hours-worked',
  ADMIN_SETTINGS: '/admin/settings',
} as const;
