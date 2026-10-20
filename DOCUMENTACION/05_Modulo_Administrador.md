# 05. Módulo administrador

## Estado actual

El módulo administrativo está bastante avanzado. La lógica principal incluye:

- Dashboard
- Inventario
- Pedidos
- Gestión de usuarios
- Creación y edición de productos
- Listado de usuarios

## Archivos clave

- [frontend/src/pages/administracion/page-Dashboard.jsx](../frontend/src/pages/administracion/page-Dashboard.jsx)
- [frontend/src/pages/administracion/page-producto.jsx](../frontend/src/pages/administracion/page-producto.jsx)
- [frontend/src/pages/administracion/page-PedidosBD.jsx](../frontend/src/pages/administracion/page-PedidosBD.jsx)
- [frontend/src/pages/administracion/page-UsuariosBD.jsx](../frontend/src/pages/administracion/page-UsuariosBD.jsx)
- [backend/src/controllers/AdminUsuarioController.js](../backend/src/controllers/AdminUsuarioController.js)
- [backend/src/models/AdminUsuarioModel.js](../backend/src/models/AdminUsuarioModel.js)

## Lo que funciona

- listados reales desde base de datos,
- creación de usuarios administrativos,
- edición de usuarios,
- cambio de estado de usuarios,
- gestión de productos con imagen,
- lectura de estadísticas en dashboard.

## Lo que debe mejorarse

- La administración no debe limitarse a CRUD; debe ser supervisión operativa.
- El dashboard usa información útil, pero aún no refleja de forma integral stock, movimientos, entregas y alertas complejas.
- No existe una estructura real de permisos por acción para admin.
- Bodega y mensajería aún no están integrados con una lógica administrativa central de supervisión.

## Recomendación

Se debe mantener el módulo admin como el centro de supervisión, no como una colección aislada de pantallas. Debe ofrecer vistas de control, estados operativos y alertas reales del sistema.
