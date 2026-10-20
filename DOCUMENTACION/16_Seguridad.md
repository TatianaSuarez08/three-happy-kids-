# 16. Seguridad

## Estado actual

La capa de seguridad principal consiste en:

- JWT
- token en cabecera Authorization
- validación de rol en rutas
- validación visual en frontend

## Archivos relevantes

- [backend/src/middleware/autenticacion.js](../backend/src/middleware/autenticacion.js)
- [backend/src/middleware/role.js](../backend/src/middleware/role.js)
- [frontend/src/components/ProtectedRoute.jsx](../frontend/src/components/ProtectedRoute.jsx)

## Lo que funciona

- Los endpoints críticos requieres autenticación.
- El rol del usuario se valida en backend para rutas clave.

## Lo que falta

- permisos granulares por módulo y acción,
- validación de permisos por endpoint en lugar de solo rol,
- auditoría de cambios,
- manejo más estricto de variables de entorno,
- mayor control sobre validación de payloads.

## Recomendación

Se recomienda mantener JWT y roles, pero complementar con permisos y trazabilidad de acceso.
