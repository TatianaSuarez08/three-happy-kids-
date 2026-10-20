# 03. Base de datos

## Motor y conexión

El backend usa MySQL con `mysql2/promise` desde [backend/src/db.js](../backend/src/db.js).

## Esquema principal que existe

El esquema real documentado se encuentra en [documentacion/sql/DataBaseHappyKids_CORREGIDA.sql](../documentacion/sql/DataBaseHappyKids_CORREGIDA.sql) y contempla las tablas principales:

- rol
- usuario
- usuario_rol
- tipo_documento
- cargo
- talla
- color
- categoria
- producto
- cliente
- empleado
- inventario
- carrito
- detalle_carrito
- proveedor
- compra
- detalle_compra
- factura
- detalle_pedido
- pago
- entrega

## Observaciones reales

### 1. Roles
La tabla `rol` existe y se usa junto a `usuario_rol`. El sistema soporta `administrador`, `cliente` y `mensajero` como roles funcionales.

### 2. Inventario
Existe la tabla `inventario`, pero no hay una tabla de historial de movimientos ni diferenciación entre inventario actual y movimientos. La cantidad disponible representa el stock actual, pero no documenta el origen/causa del cambio.

### 3. Pedidos
La tabla `factura` representa el pedido/pago principal y `detalle_pedido` representa sus líneas. La entrega está separada en `entrega`.

### 4. Entregas
La entrega tiene estado `Pendiente`, `En camino`, `Entregado`, `Cancelado`, y está asociada a una factura.

## Problemas detectados

- No existe una tabla de `movimientos_inventario`.
- El rol de bodeguero no está formalizado con permisos por acción.
- La lógica de stock bajo y agotado depende de `inventario.cantidad_disponible` sin trazabilidad.
- La base de datos no tiene un sistema de permisos granulares ni módulos de autorización por acción.

## Recomendación

La base de datos podría mantenerse tal como está para la fase actual, pero se recomienda:

- crear un historial de movimientos de inventario,
- mantener el stock actual en `inventario`,
- separar claramente la lógica del pedido y la logística de entrega,
- formalizar permisos por acción.
