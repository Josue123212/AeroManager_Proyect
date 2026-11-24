import React from 'react';
import { Navigate } from 'react-router-dom';
import { RolActivoType } from '../../types/models';
import { notifyWarning } from '../../utils/notify';

interface ProtectedRouteProps {
  allowedRoles: RolActivoType[];
  children: React.ReactNode;
}

interface StoredUser {
  usuarioId: number;
  nombreCompleto: string;
  email: string;
  rolActivo: RolActivoType;
  roles: string[];
}

function isJwtExpired(token: string): boolean {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return true;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const payload = JSON.parse(atob(padded)) as { exp?: number };
    if (typeof payload.exp !== 'number') return true;
    return Date.now() >= payload.exp * 1000;
  } catch {
    return true;
  }
}

function clearSessionStorage() {
  localStorage.removeItem('aeromanager_token');
  localStorage.removeItem('aeromanager_user');
}

export function getHomePathForRoles(roles: string[]): string {
  const normalized = roles.map((r) => r.trim().toLowerCase());
  if (normalized.some((r) => r === 'superadmin')) return '/superadmin/dashboard';
  if (normalized.some((r) => r.includes('admin'))) return '/admin/dashboard';
  if (normalized.some((r) => r.includes('operador'))) return '/operador/fids';
  if (normalized.some((r) => r.includes('counter'))) return '/counter/cartelera';
  return '/login';
}

export function getSessionHomePath(): string {
  const token = localStorage.getItem('aeromanager_token');
  const rawUser = localStorage.getItem('aeromanager_user');
  if (!token || !rawUser || isJwtExpired(token)) {
    if (token || rawUser) clearSessionStorage();
    return '/login';
  }
  try {
    const parsed = JSON.parse(rawUser) as Partial<StoredUser>;
    const roles = Array.isArray(parsed?.roles) ? parsed.roles : [];
    return roles.length > 0 ? getHomePathForRoles(roles) : '/login';
  } catch {
    clearSessionStorage();
    return '/login';
  }
}

export default function ProtectedRoute({ allowedRoles, children }: ProtectedRouteProps) {
  const token = localStorage.getItem('aeromanager_token');
  const rawUser = localStorage.getItem('aeromanager_user');

  if (!token || !rawUser || isJwtExpired(token)) {
    if (token && isJwtExpired(token)) {
      notifyWarning('Sesión expirada', 'Tu token de seguridad ha vencido. Inicia sesión nuevamente.');
    }
    if (token || rawUser) clearSessionStorage();
    return <Navigate to="/login" replace />;
  }

  let user: StoredUser | null = null;
  try {
    user = JSON.parse(rawUser);
  } catch {
    clearSessionStorage();
    return <Navigate to="/login" replace />;
  }

  const userRoles = Array.isArray(user?.roles) ? user.roles : [];
  if (userRoles.length === 0) {
    return <Navigate to="/login" replace />;
  }

  const isSuperAdmin = userRoles.some(
    (ur) => ur.trim().toLowerCase() === 'superadmin'
  );

  const hasPermission =
    isSuperAdmin ||
    allowedRoles.some((allowed) =>
      userRoles.some((ur) => ur.trim().toLowerCase() === allowed.trim().toLowerCase())
    );

  if (!hasPermission) {
    return <Navigate to={getHomePathForRoles(userRoles)} replace />;
  }

  return <>{children}</>;
}
