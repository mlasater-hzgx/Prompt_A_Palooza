import { useAuthStore } from '../store/auth.store';
import type { RoleName } from '../config/roles';

export function useRole() {
  const { user } = useAuthStore();
  const role = (user?.role ?? 'FIELD_REPORTER') as RoleName;

  function hasRole(...roles: RoleName[]) {
    return roles.includes(role);
  }

  function canMutateIncidents() {
    return hasRole('FIELD_REPORTER', 'SAFETY_COORDINATOR', 'SAFETY_MANAGER', 'ADMINISTRATOR');
  }

  function canManageInvestigations() {
    return hasRole('SAFETY_COORDINATOR', 'SAFETY_MANAGER', 'ADMINISTRATOR');
  }

  function canManageCapas() {
    return hasRole('SAFETY_COORDINATOR', 'SAFETY_MANAGER', 'ADMINISTRATOR');
  }

  function canReview() {
    return hasRole('SAFETY_MANAGER', 'ADMINISTRATOR');
  }

  function canAccessAdmin() {
    return hasRole('ADMINISTRATOR');
  }

  function canViewAllData() {
    return hasRole('SAFETY_MANAGER', 'EXECUTIVE', 'ADMINISTRATOR');
  }

  return { role, hasRole, canMutateIncidents, canManageInvestigations, canManageCapas, canReview, canAccessAdmin, canViewAllData };
}
