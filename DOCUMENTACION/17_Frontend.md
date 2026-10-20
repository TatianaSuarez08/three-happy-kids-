# 17. Frontend

## Estado actual

El frontend usa React + Vite y cuenta con vistas para cliente, administrador y mensajería.

## Archivos principales

- [frontend/src/App.jsx](../frontend/src/App.jsx)
- [frontend/src/components/Nav.jsx](../frontend/src/components/Nav.jsx)
- [frontend/src/components/ProtectedRoute.jsx](../frontend/src/components/ProtectedRoute.jsx)
- [frontend/src/pages/publicas/Index.jsx](../frontend/src/pages/publicas/Index.jsx)
- [frontend/src/pages/publicas/InicioSesion.jsx](../frontend/src/pages/publicas/InicioSesion.jsx)
- [frontend/src/pages/publicas/Registro.jsx](../frontend/src/pages/publicas/Registro.jsx)

## Observaciones

- Hay una navegación global con utilización de roles.
- Hay varias vistas del mismo dominio repetidas en varios módulos.
- El proyecto necesita un orden más claro de carpetas y una separación aún mejor de lógica y estilos.

## Recomendación

Conservar la estructura actual pero normalizar mejores patrones para:

- componentes reutilizables,
- servicios API centralizados,
- validación de permisos y navegación por roles,
- separación entre UI y lógica de negocio.
