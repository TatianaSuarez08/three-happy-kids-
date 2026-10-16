# 02. Arquitectura del sistema

## Capa de presentacion

El frontend está construido con React y Vite. La aplicación gestiona rutas con `react-router-dom` y protege accesos según el rol del usuario.

Archivo principal:

- [Front-end/src/App.jsx](../Front-end/src/App.jsx)
- [Front-end/src/Componentes/ProtectedRoute.jsx](../Front-end/src/Componentes/ProtectedRoute.jsx)

## Capa de autenticación

La autenticación se realiza con JWT. El backend valida el token en el middleware `auth` y luego se comprueba el rol con `permitRoles`.

Archivos:

- [Back-end/src/middleware/autenticacion.js](../Back-end/src/middleware/autenticacion.js)
- [Back-end/src/middleware/role.js](../Back-end/src/middleware/role.js)

## Capa de negocio

El backend separa la lógica en rutas, controladores y modelos. Las rutas se montan desde `index.js` y luego se delegan a cada dominio.

Archivos relevantes:

- [Back-end/index.js](../Back-end/index.js)
- [Back-end/src/routes/UsuarioRoute.js](../Back-end/src/routes/UsuarioRoute.js)
- [Back-end/src/routes/ProductoRoute.js](../Back-end/src/routes/ProductoRoute.js)
- [Back-end/src/routes/PedidoRoute.js](../Back-end/src/routes/PedidoRoute.js)
- [Back-end/src/routes/AdminUsuarioRoute.js](../Back-end/src/routes/AdminUsuarioRoute.js)
- [Back-end/src/routes/DashboardRoute.js](../Back-end/src/routes/DashboardRoute.js)

## Capa de base de datos

La base de datos es MySQL y se conecta mediante un pool definido en [Back-end/src/db.js](../Back-end/src/db.js). El esquema real disponible se encuentra en [DOCUMENTACION/sql/DataBaseHappyKids_CORREGIDA.sql](../DOCUMENTACION/sql/DataBaseHappyKids_CORREGIDA.sql).

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
