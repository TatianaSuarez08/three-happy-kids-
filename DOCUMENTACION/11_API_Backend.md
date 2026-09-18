# 11. API Backend

## Rutas principales

La API nueva se consume bajo `/api/v1`. Las rutas sin prefijo se mantienen temporalmente como compatibilidad con clientes existentes.

### Autenticación

- GET `/api/v1/health` — público; verifica conexión con MySQL.
- POST `/api/v1/registro` — público.
- POST `/api/v1/login` — público.
- GET `/api/v1/me` — usuario autenticado.
- PUT `/api/v1/me/foto` — usuario autenticado; recibe `multipart/form-data` con `foto`.

### Productos

- GET `/api/v1/productos-publicos`, `/api/v1/productos-publicos/:id` — público.
- GET `/api/v1/colores` — administrador/bodeguero.
- GET `/api/v1/productos`, `/api/v1/productos/:id` — administrador/bodeguero.
- POST `/api/v1/productos`, PUT `/api/v1/productos/:id`, DELETE `/api/v1/productos/:id` — administrador/bodeguero según permisos.

### Pedidos

- GET `/api/v1/pedidos` — administración, bodega y mensajería con `pedidos:read`.
- POST `/api/v1/pedidos` — roles con permiso `comprar`.
- PUT `/api/v1/pedidos/:id/estado` — administrador/mensajero con `pedidos:write`.
- GET `/api/v1/mis-pedidos` — usuario autenticado con `pedidos:own:read`; filtra por el usuario del JWT.

### Usuarios administrativos

- GET `/api/v1/usuarios` — administrador con `usuarios:read`.
- POST `/api/v1/usuarios`, PUT `/api/v1/usuarios/:id`, PUT `/api/v1/usuarios/:id/estado`, DELETE `/api/v1/usuarios/:id` — administrador con `usuarios:write`.

### Dashboard

- GET `/api/v1/dashboard` — administrador con `dashboard:read`.

### Inventario

- GET `/api/v1/inventario/:id/historial` — roles autorizados de inventario.
- POST `/api/v1/inventario/movimiento` — roles autorizados de inventario.

### Logística

- GET `/api/v1/logistica` — roles autorizados de logística.

## Archivos de implementación

- [backend/index.js](../backend/index.js)
- [backend/src/routes/UsuarioRoute.js](../backend/src/routes/UsuarioRoute.js)
- [backend/src/routes/ProductoRoute.js](../backend/src/routes/ProductoRoute.js)
- [backend/src/routes/PedidoRoute.js](../backend/src/routes/PedidoRoute.js)
- [backend/src/routes/AdminUsuarioRoute.js](../backend/src/routes/AdminUsuarioRoute.js)
- [backend/src/routes/DashboardRoute.js](../backend/src/routes/DashboardRoute.js)

## Separación frontend/backend

El frontend utiliza `src/services/httpClient.js` como único punto de acceso HTTP. Las páginas no construyen headers ni llaman `fetch` directamente. Los formularios con archivos usan `FormData` y dejan que el cliente HTTP gestione el token sin fijar manualmente el boundary multipart.

## Observación importante

La API está funcionando, pero no está documentada con permisos ni con control granular por módulo y acción. La autorización está parcialmente en la ruta, aunque no es una matriz de permisos completa.

`GET /productos-publicos` y `GET /productos-publicos/:id` se utilizan para el catálogo y el detalle del cliente. El frontend consume estos endpoints mediante `productoService.js`; los datos de nombre, descripción, precio, imagen, talla, color y stock proceden del modelo `ProductoModel.js`.
