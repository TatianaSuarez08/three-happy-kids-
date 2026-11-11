# 9. Módulos funcionales

Los permisos descritos aquí son los configurados en `App.jsx` y los routers Express. La autorización del backend prevalece; el guard de React solo controla navegación.

## Administrador

**Objetivo y funciones.** Consultar métricas; crear/editar productos y usuarios; revisar pedidos; crear compras a proveedores; consultar actividad y resolver novedades/reclamos. La pantalla `/bodega` conserva una vista de inventario administrada con rol administrador.

**Permiso.** Rol `administrador` para el panel. Las rutas administrativas del API exigen token y rol o permiso configurado en cada endpoint.

**Frontend principal.** `pages/administracion/page-Dashboard.jsx`, `page-producto.jsx`, `page-AgregarProducto.jsx`, `page-EditarProducto.jsx`, `page-Compras.jsx`, `page-PedidosBD.jsx`, `page-NovedadesPedidos.jsx`, `page-UsuariosBD.jsx`, `page-CrearUsuario.jsx` y `page-EditarUsuario.jsx`. La consulta de actividad se comparte con `pages/bodeguero/BodegueroMovimientos.jsx`.

**API y datos.** `/dashboard`, `/productos`, `/usuarios`, `/pedidos`, `/admin/compras`, `/admin/compras/opciones`, `/inventario/actividad` y `/admin/novedades/pedidos` junto con sus operaciones de escritura. Interactúa principalmente con `usuario`, `usuario_rol`, `empleado`, `cargo`, `producto`, `inventario`, `factura`, `compra`, `pedido_novedad` y `admin_reporte_actividad`.

## Cliente

**Objetivo y funciones.** Explorar el catálogo y detalles públicos; iniciar sesión/registrarse; mantener carrito y favoritos; confirmar compra; consultar historial y perfil.

**Permiso.** Catálogo, categorías y detalle son públicos. Compra, favoritos, pedidos propios y perfil usan sesión; los permisos de servidor se definen en los routers correspondientes. La UI también permite algunas rutas de compra a otros roles, como figura en `App.jsx`.

**Frontend principal.** `pages/publicas/Index.jsx`, `InicioSesion.jsx`, `Registro.jsx`; páginas de `pages/cliente/` para catálogo, producto, carrito, compra, favoritos, pedidos, contraseña y perfil; `context/CarritoContext.jsx` y `FavoritosContext.jsx`; servicios `authService`, `catalogoService`, `carritoService`, `favoritoService` y `pedidoService`.

**API y datos.** `/registro`, `/login`, `/tipos-documento`, `/me`, `/productos-publicos`, `/categorias`, `/carrito`, `/favoritos`, `/pedidos` y `/mis-pedidos`. El esquema usa `usuario`, `cliente`, `tipo_documento`, `producto`, `inventario`, `carrito`, `detalle_carrito`, `favorito`, `factura`, `detalle_pedido`, `pago` y `entrega`.

**Flujo de compra.** El frontend envía dirección, ciudad, teléfono, método de pago y productos al endpoint de creación de pedido. El backend valida stock y registra la factura y sus detalles, actualiza inventario y crea pago/entrega. No hay integración de pago externo descrita en este flujo.

## Bodega

**Objetivo y funciones.** Revisar disponibilidad e historial de inventario, recibir compras de proveedor, tomar un pedido disponible, verificar sus productos y registrar preparación/novedades.

**Permiso.** Las rutas `/bodeguero/*` requieren rol `bodeguero`; el inventario heredado bajo `/bodega` corresponde al administrador. Algunas consultas de pedidos disponibles permiten también al administrador, según el router.

**Frontend principal.** `pages/bodeguero/BodegueroLayout.jsx`, `BodegueroDashboard.jsx`, `BodegueroInventario.jsx`, `BodegueroPedidos.jsx`, `BodegueroMovimientos.jsx` y `BodegueroCompras.jsx`.

**API y datos.** `/inventario/:id/historial`, `/inventario/movimiento`, `/inventario/actividad`, `/bodega/compras`, `/bodega/compras/:id/recepcion` y `/bodega/pedidos/...`. Usa productos/inventario/movimientos, compras y recepción, y las tablas `pedido_flujo`, `pedido_preparacion_detalle`, `pedido_novedad` y `pedido_historial`.

**Flujo de preparación.** El bodeguero consulta pedidos sin asignar, se asigna uno, registra el resultado por producto y envía la preparación. El historial y las novedades quedan persistidos para que administración pueda resolverlas y mensajería consulte pedidos listos.

## Mensajería

**Objetivo y funciones.** Consultar pedidos preparados sin mensajero, asignar una entrega, actualizar su estado, registrar una novedad, adjuntar evidencia y consultar historial/ruta/perfil.

**Permiso.** Las páginas operativas y las rutas de mensajero requieren el rol `mensajero`; la consulta de evidencia permite también al administrador, según el endpoint.

**Frontend principal.** `pages/mensajeria/` contiene inicio, entregas, ruta, evidencia, novedades, historial y perfil; `components/mensajeria/` contiene UI y datos compartidos.

**API y datos.** `/mensajeria/pedidos/disponibles`, `/mensajeria/mis-entregas`, `/mensajeria/historial`, rutas de asignación/liberación/estado y `/mensajeria/pedidos/:id/evidencia`. Las entidades centrales son `factura`, `entrega`, `pedido_flujo`, `pedido_historial`, `pedido_novedad` y usuario responsable.

**Flujo de entrega.** El servicio de pedido valida transiciones permitidas; para marcar entrega completada se requiere evidencia y para registrar entrega fallida se exige observación. La evidencia se carga como archivo y su resultado se asocia al flujo del pedido.

## Cobertura de `API/`

La instancia secundaria no contiene todas las rutas del backend principal, especialmente tipos de documento y operaciones de actividad/reportes/compra de inventario. Los endpoints y permisos completos se describen en [Referencia de endpoints](10_API_ENDPOINTS.md); las diferencias del cliente de respaldo están en [API](06_API.md).
