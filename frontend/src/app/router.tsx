import { createBrowserRouter, RouterProvider } from 'react-router';
import { AppShell } from '../components/layout/AppShell';

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      // Dashboard
      { index: true, lazy: () => import('../features/dashboard/pages/ExecutiveDashboardPage') },
      { path: 'dashboard', lazy: () => import('../features/dashboard/pages/ExecutiveDashboardPage') },
      { path: 'dashboard/division/:divisionId', lazy: () => import('../features/dashboard/pages/DivisionDashboardPage') },
      { path: 'dashboard/project/:projectNumber', lazy: () => import('../features/dashboard/pages/ProjectDashboardPage') },
      { path: 'dashboard/trends', lazy: () => import('../features/dashboard/pages/TrendAnalysisPage') },

      // Incidents
      { path: 'incidents', lazy: () => import('../features/incidents/pages/IncidentListPage') },
      { path: 'incidents/new', lazy: () => import('../features/incidents/pages/IncidentReportPage') },
      { path: 'incidents/:incidentId', lazy: () => import('../features/incidents/pages/IncidentDetailPage') },
      { path: 'incidents/:incidentId/edit', lazy: () => import('../features/incidents/pages/IncidentEditPage') },
      { path: 'incidents/:incidentId/complete', lazy: () => import('../features/incidents/pages/IncidentCompleteDetailsPage') },

      // Investigations
      { path: 'investigations', lazy: () => import('../features/investigations/pages/InvestigationListPage') },
      { path: 'investigations/:investigationId', lazy: () => import('../features/investigations/pages/InvestigationDetailPage') },
      { path: 'investigations/:investigationId/rca', lazy: () => import('../features/investigations/pages/RootCauseAnalysisPage') },

      // CAPA
      { path: 'capa', lazy: () => import('../features/capa/pages/CapaListPage') },
      { path: 'capa/new', lazy: () => import('../features/capa/pages/CapaCreatePage') },
      { path: 'capa/:capaId', lazy: () => import('../features/capa/pages/CapaDetailPage') },

      // Recurrence
      { path: 'recurrence', lazy: () => import('../features/recurrence/pages/RecurrenceDetectionPage') },

      // Reports
      { path: 'reports/osha', lazy: () => import('../features/reports/pages/OshaReportsPage') },

      // Admin
      { path: 'admin/factors', lazy: () => import('../features/admin/pages/FactorLibraryPage') },
      { path: 'admin/notifications', lazy: () => import('../features/admin/pages/NotificationSettingsPage') },
      { path: 'admin/users', lazy: () => import('../features/admin/pages/UserManagementPage') },
      { path: 'admin/projects', lazy: () => import('../features/admin/pages/ProjectManagementPage') },
      { path: 'admin/hours-worked', lazy: () => import('../features/admin/pages/HoursWorkedPage') },
      { path: 'admin/settings', lazy: () => import('../features/admin/pages/SystemConfigPage') },
    ],
  },
  // Auth routes (outside AppShell)
  { path: 'login', lazy: () => import('../components/auth/LoginRedirect') },
  { path: 'auth/callback', lazy: () => import('../components/auth/LoginRedirect') },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
