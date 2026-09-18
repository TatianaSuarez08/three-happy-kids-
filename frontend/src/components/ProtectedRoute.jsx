import { Navigate } from 'react-router-dom';

const normalizeRoles = (roles) => {
  if (!Array.isArray(roles)) return [];
  return roles.flatMap((role) => {
    if (role == null) return [];
    const normalized = String(role).trim().toLowerCase();
    return normalized === 'admin' ? ['administrador'] : [normalized];
  });
};

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const storage = localStorage.getItem('token') ? localStorage : sessionStorage;
  const token = storage.getItem('token');
  const userJson = storage.getItem('user') || storage.getItem('usuario');
  const userRolesJson = storage.getItem('userRoles');
  const user = userJson ? JSON.parse(userJson) : null;
  const userRoles = normalizeRoles(user?.roles || (userRolesJson ? JSON.parse(userRolesJson) : []) || (user?.rol ? [user.rol] : []));
  const allowed = normalizeRoles(allowedRoles);

  if (!token) return <Navigate to="/login" replace />;
  if (allowed.length > 0 && (!user || !userRoles.some((role) => allowed.includes(role)))) return <Navigate to="/no-autorizado" replace />;
  return children;
}
