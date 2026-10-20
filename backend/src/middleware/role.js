const ROLE_PERMISSIONS = {
  administrador: [
    'usuarios:read',
    'usuarios:write',
    'productos:read',
    'productos:write',
    'inventario:read',
    'inventario:write',
    'bodega:read',
    'bodega:write',
    'pedidos:read',
    'pedidos:write',
    'pedidos:own:read',
    'pedidos:own:write',
    'catalogo:read',
    'comprar',
    'dashboard:read'
  ],
  bodeguero: [
    'inventario:read',
    'inventario:write',
    'bodega:read',
    'bodega:write',
    'productos:read',
    'pedidos:read',
    'pedidos:own:read',
    'pedidos:own:write',
    'catalogo:read',
    'comprar'
  ],
  mensajero: [
    'pedidos:read',
    'pedidos:write',
    'pedidos:own:read',
    'pedidos:own:write',
    'catalogo:read',
    'comprar',
    'entregas:read',
    'entregas:write'
  ],
  cliente: [
    'catalogo:read',
    'pedidos:own:read',
    'pedidos:own:write',
    'comprar'
  ]
};

const normalizeValue = (value) => String(value ?? '').trim().toLowerCase();

export const buildRolePermissions = (roles = []) => {
  const inputRoles = Array.isArray(roles) ? roles : [roles];
  const permissions = new Set();

  inputRoles.forEach((role) => {
    const normalizedRole = normalizeValue(role);
    if (!normalizedRole) return;

    const mappedPermissions = ROLE_PERMISSIONS[normalizedRole] || [];
    mappedPermissions.forEach((permission) => permissions.add(permission));
  });

  return [...permissions];
};

export const normalizePermissions = (permissions = []) => {
  if (!Array.isArray(permissions)) return [];

  return [...new Set(
    permissions
      .map((permission) => normalizeValue(permission))
      .filter(Boolean)
  )];
};

// Middleware que chequea si el usuario tiene alguno de los roles o permisos permitidos
export default function permitRoles(...allowedRoles) {
  return (req, res, next) => {
    const user = req.user;
    const roles = Array.isArray(user?.roles)
      ? user.roles
      : user?.roles
        ? [user.roles]
        : user?.role
          ? [user.role]
          : [];

    const userPermissions = normalizePermissions([
      ...(Array.isArray(user?.permissions) ? user.permissions : []),
      ...buildRolePermissions(roles)
    ]);

    const normalizedRoles = roles.map((role) => normalizeValue(role));
    const normalizedAllowed = allowedRoles
      .map((entry) => {
        if (entry && typeof entry === 'object' && !Array.isArray(entry)) {
          if (entry.permission) return normalizeValue(entry.permission);
          if (entry.module && entry.action) return normalizeValue(`${entry.module}:${entry.action}`);
          return '';
        }

        return normalizeValue(entry);
      })
      .filter(Boolean);

    if (!user || (normalizedRoles.length === 0 && userPermissions.length === 0)) {
      return res.status(403).json({ error: 'Acceso denegado: credenciales no disponibles' });
    }

    const hasRoleAccess = normalizedRoles.some((role) => normalizedAllowed.includes(role));
    const hasPermissionAccess = userPermissions.some((permission) => normalizedAllowed.includes(permission));

    if (!hasRoleAccess && !hasPermissionAccess) {
      return res.status(403).json({ error: 'Acceso denegado: permisos insuficientes' });
    }

    next();
  };
}
