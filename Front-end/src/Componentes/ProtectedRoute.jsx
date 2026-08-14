import React from 'react';
import { Navigate } from 'react-router-dom';

const normalizeRoles = (roles) => {
  if (!Array.isArray(roles)) return [];

  return roles.flatMap((role) => {
    if (role == null) return [];

    const normalized = String(role).trim().toLowerCase();
    if (normalized === 'admin') return ['administrador'];
    if (normalized === 'administrador') return ['administrador'];
    if (normalized === 'cliente') return ['cliente'];
    return [normalized];
  });
};

// ProtectedRoute: comprueba token y role almacenados en localStorage
// props:
// - children: elemento a renderizar si autorizado
// - allowedRoles: array de roles permitidos (opcional)
export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const token = localStorage.getItem('token');
  const userJson = localStorage.getItem('user') || localStorage.getItem('usuario');
  const userRolesJson = localStorage.getItem('userRoles');
  const user = userJson ? JSON.parse(userJson) : null;

  const userRoles = normalizeRoles(
    user?.roles ||
    (userRolesJson ? JSON.parse(userRolesJson) : []) ||
    (user?.rol ? [user.rol] : [])
  );

  const allowed = normalizeRoles(allowedRoles);

  // Si no hay token, redirige al login
  if (!token) return <Navigate to="/login" replace />;

  // Si se especifican roles permitidos, comprobar role del usuario
  if (allowed.length > 0) {
    const hasAccess = userRoles.some((role) => allowed.includes(role));
    if (!user || !hasAccess) {
      // Rol no autorizado: redirige a la página de "no autorizado"
      return <Navigate to="/no-autorizado" replace />;
    }
  }

  // Autorizado
  return children;
}
