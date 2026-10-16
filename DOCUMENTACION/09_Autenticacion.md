# 09. Autenticación

## Tecnología usada

- JWT
- Middleware `auth`
- Middleware `permitRoles`

## Archivos

- [Back-end/src/middleware/autenticacion.js](../Back-end/src/middleware/autenticacion.js)
- [Back-end/src/middleware/role.js](../Back-end/src/middleware/role.js)
- [Back-end/src/controllers/UsuarioController.js](../Back-end/src/controllers/UsuarioController.js)
- [Front-end/src/Componentes/ProtectedRoute.jsx](../Front-end/src/Componentes/ProtectedRoute.jsx)

## Observaciones

La autenticación actual funciona para sesiones básicas y validación de roles. El token incluye user id, email, nombre y roles.

## Problemas

- La seguridad se apoya mucho en roles simples y no en permisos granulares.
- No existe restricción por módulo y acción en backend.
- El frontend oculta elementos visualmente, pero eso no reemplaza la autorización real.

## Recomendación

Mantener JWT como base, pero evolucionar hacia permisos por acción y validación modular en backend.
