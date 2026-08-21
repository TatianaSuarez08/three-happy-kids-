// Middleware que chequea si el usuario tiene alguno de los roles permitidos
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
    const normalizedRoles = roles.map((role) => String(role).trim().toLowerCase());
    const normalizedAllowedRoles = allowedRoles.map((role) => String(role).trim().toLowerCase());

    if (!user || normalizedRoles.length === 0) {
      return res.status(403).json({ error: 'Acceso denegado: rol no disponible' });
    }

    const has = normalizedRoles.some((role) => normalizedAllowedRoles.includes(role));
    if (!has) {
      return res.status(403).json({ error: 'Acceso denegado: rol insuficiente' });
    }

    next();
  };
}
