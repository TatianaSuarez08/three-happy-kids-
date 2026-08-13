import React from 'react';
import { Navigate } from 'react-router-dom';

// ProtectedRoute: comprueba token y role almacenados en localStorage
// props:
// - children: elemento a renderizar si autorizado
// - allowedRoles: array de roles permitidos (opcional)
export default function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem('token');
  const userJson = localStorage.getItem('user');
  const user = userJson ? JSON.parse(userJson) : null;

  // Si no hay token, redirige al login
  if (!token) return <Navigate to="/login" replace />;

  // Si se especifican roles permitidos, comprobar role del usuario
  if (allowedRoles && allowedRoles.length > 0) {
    const roles = user && Array.isArray(user.roles) ? user.roles : [];
    const allowed = roles.some((r) => allowedRoles.includes(r));
    if (!user || !allowed) {
      // Rol no autorizado: redirige a la página de "no autorizado"
      return <Navigate to="/no-autorizado" replace />;
    }
  }

  // Autorizado
  return children;
}
