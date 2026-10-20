# 09. Funcionalidades reales del sistema

## 1. Autenticación y registro

### Registro

Endpoint real:

- `POST /registro`

Validaciones:

- nombre de usuario obligatorio y mínimo 3 caracteres,
- email válido,
- password y confirmar_password requeridos,
- contraseñas iguales,
- longitud mínima 6,
- email no repetido.

Al registrarse, el backend:

- crea el usuario en `usuario`,
- lo asigna al rol `cliente` por defecto,
- genera JWT,
- devuelve `user` y `token`.

### Login

Endpoint real:

- `POST /login`

Devuelve:

- `success`,
- `message`,
- `user`,
- `token`.

## 2. Usuarios

Los usuarios tienen roles reales y pueden verse en la base de datos:

- `usuario`
- `usuario_rol`
- `rol`

Además existen usuarios administrativos con su perfil de empleado:

- `empleado`
- `cargo`

Los administradores pueden:

- consultar usuarios,
- crear usuarios administrativos,
- editar datos,
- cambiar estado activo/inactivo,
- eliminar usuarios lógicamente (desactivar).

## 3. Productos

### Catálogo

Se expone:

- `GET /productos-publicos`
- `GET /productos-publicos/:id`
- `GET /categorias`

### Administración

- `POST /productos`
- `PUT /productos/:id`
- `DELETE /productos/:id`

Se valida:

- nombre mínimo 3 caracteres,
- precio de venta válido,
- estado activo/inactivo,
- categoría, talla y color obligatorios,
- stock y stock mínimo no negativos,
- imagen requerida en creación.

## 4. Favoritos

Endpoints:

- `GET /favoritos`
- `POST /favoritos`
- `DELETE /favoritos/:productId`

La lógica usa la tabla `favorito` con restricción `UNIQUE (id_usuario, id_producto)` para evitar duplicados.

## 5. Carrito

Endpoints:

- `GET /carrito`
- `POST /carrito`
- `PUT /carrito/:productId`
- `DELETE /carrito/:productId`
- `DELETE /carrito`

La lógica:

- crea o reutiliza carrito activo por cliente,
- utiliza `detalle_carrito`,
- acumula la cantidad si el mismo producto ya existe,
- valida que el productId y la cantidad sean válidos,
- y calcula subtotal por producto.

## 6. Pedidos

### Creación

Endpoint real:

- `POST /pedidos`

El backend:

- valida que el usuario tenga perfil de cliente,
- valida stock disponible por producto usando `FOR UPDATE`,
- calcula total,
- crea la `factura`,
- inserta `detalle_pedido`,
- descuenta stock en `inventario`,
- crea el registro de `pago`,
- crea la fila de entrega en estado `Pendiente`.

### Consulta

- `GET /pedidos` para administradores/bodeguero/mensajero
- `GET /mis-pedidos` para el usuario autenticado

### Estado de pedido

- `PUT /pedidos/:id/estado`

Los estados válidos del código son:

- `Pendiente`
- `En camino`
- `Entregado`
- `Cancelado`

## 7. Inventario

### Historial

- `GET /inventario/:id/historial`

### Movimiento

- `POST /inventario/movimiento`

Tipos permitidos:

- `entrada`
- `salida`
- `ajuste`

La lógica actual:

- guarda el tipo de movimiento,
- actualiza el inventario disponible,
- y calcula diferencia con `delta` del movimiento.

## 8. Dashboard

Endpoint:

- `GET /dashboard`

Muestra:

- total ventas,
- total pedidos,
- total clientes,
- total productos,
- pedidos pendientes,
- pedidos en camino,
- pedidos entregados,
- stock bajo,
- pedidos recientes,
- productos con stock bajo.

## 9. Logística

Endpoint:

- `GET /logistica`

Se usa para obtener un resumen relacionado con pedidos y entregas por rol/logística.

## 10. Administración

### Usuarios administrativos

- Gestionan usuarios con roles `administrador`, `bodeguero`, `mensajero`.
- Se crean con `createAdminUser()` y se relacionan también con `empleado` y `cargo`.

### Productos y inventario

- El usuario administrador puede actualizar productos, administrar inventario y visualizar dashboard.

## 11. Seguridad funcional

Además de la autenticación, el sistema incluye mecanismos para:

- impedir registros duplicados,
- impedir favoritos duplicados,
- controlar stock insuficiente,
- proteger rutas por permisos,
- y evitar reejecuciones con `Idempotency-Key`.

## 12. Funcionalidades no documentadas como “inventadas”

La documentación debe evitar describir módulos que no estén respaldados por código real. No se documentan, por ejemplo:

- pagos en línea de terceros,
- notificaciones push,
- api pública externa,
- multi-tenancy,
- microservicios ajenos,
- replicación de base de datos active-active.

Lo real del proyecto es lo que el código implementa y lo que la base de datos soporta.
