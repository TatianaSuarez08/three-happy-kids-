# 02. Arquitectura del sistema

## Capa de presentacion

El frontend está construido con React y Vite. La aplicación gestiona rutas con `react-router-dom` y protege accesos según el rol del usuario.

Archivo principal:

- [frontend/src/App.jsx](../frontend/src/App.jsx)
- [frontend/src/components/ProtectedRoute.jsx](../frontend/src/components/ProtectedRoute.jsx)

## Capa de autenticación

La autenticación se realiza con JWT. El backend valida el token en el middleware `auth` y luego se comprueba el rol con `permitRoles`.

Archivos:

- [backend/src/middleware/autenticacion.js](../backend/src/middleware/autenticacion.js)
- [backend/src/middleware/role.js](../backend/src/middleware/role.js)

## Capa de negocio

El backend separa la lógica en rutas, controladores y modelos. Las rutas se montan desde `index.js` y luego se delegan a cada dominio.

Archivos relevantes:

- [backend/index.js](../backend/index.js)
- [backend/src/routes/UsuarioRoute.js](../backend/src/routes/UsuarioRoute.js)
- [backend/src/routes/ProductoRoute.js](../backend/src/routes/ProductoRoute.js)
- [backend/src/routes/PedidoRoute.js](../backend/src/routes/PedidoRoute.js)
- [backend/src/routes/AdminUsuarioRoute.js](../backend/src/routes/AdminUsuarioRoute.js)
- [backend/src/routes/DashboardRoute.js](../backend/src/routes/DashboardRoute.js)

## Capa de base de datos

La base de datos es MySQL y se conecta mediante un pool definido en [backend/src/db.js](../backend/src/db.js). El esquema real disponible se encuentra en [documentacion/sql/DataBaseHappyKids_CORREGIDA.sql](../documentacion/sql/DataBaseHappyKids_CORREGIDA.sql).

## Diagnóstico de arquitectura

El sistema sigue una arquitectura funcional coherente, pero tiene estas limitaciones:

- La gestión de permisos se basa en roles simples, no en permisos granulares por módulo y acción.
- El Bodeguero no tiene una separación funcional y de rutas bien definida.
- Inventory no tiene historial formal de movimientos como una entidad separada.
- El flujo real de pedido → preparación → entrega no está totalmente modelado en tablas específicas de logística.

## Arquitectura sugerida de negocio

El modelo de negocio ideal para este sistema es:

- Productos
- Inventario
- Movimientos de inventario
- Pedidos
- Entregas
- Usuarios + roles + permisos

Esto debe mantenerse con una sola fuente de verdad en la base de datos.
