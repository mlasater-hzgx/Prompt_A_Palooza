import { ReactNode } from 'react';
import { useRole } from '../../hooks/useRole';
import type { RoleName } from '../../config/roles';

interface RoleGateProps {
  roles: RoleName[];
  children: ReactNode;
  fallback?: ReactNode;
}

export function RoleGate({ roles, children, fallback = null }: RoleGateProps) {
  const { hasRole } = useRole();

  if (!hasRole(...roles)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
