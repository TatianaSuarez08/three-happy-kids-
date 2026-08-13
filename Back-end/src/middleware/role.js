// Middleware que chequea si el usuario tiene alguno de los roles permitidos
export default function permitRoles(...allowedRoles) {
  return (req, res, next) => {
    const user = req.user;
    // Esperamos que `req.user.roles` sea un array de nombres de rol
    const roles = (user && user.roles) || [];
    if (!user || !Array.isArray(roles) || roles.length === 0) {
      return res.status(403).json({ error: 'Acceso denegado: rol no disponible' });
    }

    // Comprobar intersección entre roles del usuario y roles permitidos
    const has = roles.some((r) => allowedRoles.includes(r));
    if (!has) {
      return res.status(403).json({ error: 'Acceso denegado: rol insuficiente' });
    }

    next();
  };
}
