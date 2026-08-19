# Frontend, rutas y compras

## Rutas públicas

- `/`: inicio y productos.
- `/catalogo` y `/cliente/catalogo`: catálogo.
- `/producto/:id`: detalle del producto.
- `/login`: inicio de sesión.
- `/registro`: registro.
- `/recuperar-pass`: recuperación de contraseña.
- `/no-autorizado`: acceso rechazado.

## Rutas de compra

- `/carrito`: productos seleccionados.
- `/confirmar-compra`: confirmación.
- `/favoritos`: productos favoritos.
- `/mis-pedidos`: historial de compras.

El administrador también puede usar catálogo, carrito, favoritos, confirmar compra y `Mis pedidos`. Tener rol administrativo no impide comprar.

## Rutas administrativas

Todas están protegidas con `allowedRoles={["administrador"]}`:

- `/admin` redirige a `/admin/dashboard`.
- `/admin/dashboard` muestra el panel.
- `/admin/producto` y `/admin/productos` muestran productos.
- `/admin/agregar-producto` y `/admin/editar-producto/:id` usan la pantalla de productos.
- `/admin/inventario` muestra inventario.
- `/admin/pedidos` muestra pedidos para gestión.
- `/admin/usuarios` muestra usuarios.

## Menú

`Nav.jsx` identifica el rol guardado y muestra:

- Cliente: Inicio, Catálogo y Mis pedidos.
- Administrador: Dashboard, Productos, Inventario, Pedidos, Usuarios, Mis pedidos y Comprar en la tienda.

El menú de usuario muestra correo, rol, enlaces administrativos, perfil, favoritos y cerrar sesión. `Mis pedidos` se presenta una sola vez en la barra inferior.

## Mis pedidos

`page-MisPedidos.jsx` muestra tarjetas expandibles, estado, fecha, total y productos. Incluye filtros por `Todos`, `Pendiente`, `En camino` y `Entregado`, además de un resumen por estado. Los datos actuales son de ejemplo y pueden reemplazarse por una consulta a la API.

## Carrito y favoritos

`CarritoContext.jsx` y `FavoritosContext.jsx` mantienen los datos en `localStorage`. El carrito calcula cantidades y total; favoritos guarda los productos seleccionados.

## Diseño

Los estilos se mantienen en `Front-end/src/styles/global.css` y `Front-end/src/styles/style.css`. La interfaz conserva el fondo claro, naranja de HappyKids, tarjetas compactas y adaptación móvil.

## Últimos ajustes

- `Index.jsx` obtiene la búsqueda directamente desde `?buscar=` para evitar actualizar estado dentro de un efecto de React.
- `Nav.jsx` muestra una sola entrada de `Mis pedidos` en la barra inferior.
- El menú admin incluye la gestión y también el acceso `Comprar en la tienda`.
- Al cerrar sesión se limpian `localStorage` y `sessionStorage`, y se redirige a `/login`.
- El dashboard se muestra desde `page-Dashboard.jsx`; `/admin` redirige a `/admin/dashboard`.
