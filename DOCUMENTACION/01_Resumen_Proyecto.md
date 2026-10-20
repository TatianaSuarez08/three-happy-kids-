# 01. Resumen del proyecto

## Alcance actual

HappyKids es un sistema de comercio, pedidos y gestión de inventario para una tienda infantil. El proyecto divide su lógica en frontend React y backend Express con MySQL. La arquitectura actual ya incluye módulos de cliente, administrador y mensajería, con la base de datos y las rutas principales operativas.

## Componentes reales detectados

- Frontend: React + Vite + React Router
- Backend: Express + JWT + CORS + multer + mysql2
- Base de datos: MySQL con esquema de usuarios, clientes, empleado, productos, inventario, pedidos, pagos y entregas
- Autenticación: JWT con roles en el token
- Roles implementados: administrador, cliente, mensajero
- Rol Bodeguero: existe como opción de creación en el módulo administrativo, pero no tiene un flujo real ni rutas dedicadas de inventario

## Observación clave

El sistema ya funciona como un conjunto integrado, pero la separación conceptual de roles y módulos aún no está completamente alineada con la arquitectura de negocio pedida. El mayor problema no es la ausencia total del sistema, sino la falta de coherencia entre:

- roles y permisos reales,
- módulos administrativos y operativos,
- inventario y flujo de pedidos,
- trazabilidad de movimientos.

## Estructura real detectada

- Frontend: [frontend/src/App.jsx](../frontend/src/App.jsx)
- Backend: [backend/index.js](../backend/index.js)
- Middleware de auth: [backend/src/middleware/autenticacion.js](../backend/src/middleware/autenticacion.js)
- Middleware de roles: [backend/src/middleware/role.js](../backend/src/middleware/role.js)
- Modelo de dashboard: [backend/src/models/DashboardModel.js](../backend/src/models/DashboardModel.js)
- Esquema SQL: [documentacion/sql/DataBaseHappyKids_CORREGIDA.sql](../documentacion/sql/DataBaseHappyKids_CORREGIDA.sql)

## Diagnóstico general

El proyecto está en una fase funcional, pero aún necesita una consolidación de:

1. permisos de backend,
2. modelado de inventario y movimientos,
3. flujo Bodega → pedido → entrega,
4. documentación técnica actualizada,
5. claridad entre módulo administrativo y módulo operativo.
