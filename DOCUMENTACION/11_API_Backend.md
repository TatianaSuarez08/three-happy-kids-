# 11. API Backend

## Rutas principales

### Autenticación

- POST /registro
- POST /login
- GET /me

### Productos

- GET /productos-publicos
- GET /productos-publicos/:id
- GET /colores
- GET /productos
- GET /productos/:id
- POST /productos
- PUT /productos/:id
- DELETE /productos/:id

### Pedidos

- GET /pedidos
- POST /pedidos
- PUT /pedidos/:id/estado
- GET /mis-pedidos

### Usuarios administrativos

- GET /usuarios
- POST /usuarios
- PUT /usuarios/:id
- PUT /usuarios/:id/estado
- DELETE /usuarios/:id

### Dashboard

- GET /dashboard

### Inventario

- GET /inventario/:id/historial
- POST /inventario/movimiento

### Logística

- GET /logistica

## Archivos de implementación

- [Back-end/index.js](../Back-end/index.js)
- [Back-end/src/routes/UsuarioRoute.js](../Back-end/src/routes/UsuarioRoute.js)
- [Back-end/src/routes/ProductoRoute.js](../Back-end/src/routes/ProductoRoute.js)
- [Back-end/src/routes/PedidoRoute.js](../Back-end/src/routes/PedidoRoute.js)
- [Back-end/src/routes/AdminUsuarioRoute.js](../Back-end/src/routes/AdminUsuarioRoute.js)
- [Back-end/src/routes/DashboardRoute.js](../Back-end/src/routes/DashboardRoute.js)

## Observación importante

La API está funcionando, pero no está documentada con permisos ni con control granular por módulo y acción. La autorización está parcialmente en la ruta, aunque no es una matriz de permisos completa.

`GET /productos-publicos` y `GET /productos-publicos/:id` se utilizan para el catálogo y el detalle del cliente. El frontend consume estos endpoints mediante `productoService.js`; los datos de nombre, descripción, precio, imagen, talla, color y stock proceden del modelo `ProductoModel.js`.
