# 03. Base de datos

## Motor y conexión

El backend usa MySQL con `mysql2/promise` desde [Back-end/src/db.js](../Back-end/src/db.js).

## Esquema documentado

El esquema real documentado se encuentra en [DOCUMENTACION/sql/DataBaseHappyKids_CORREGIDA.sql](../DOCUMENTACION/sql/DataBaseHappyKids_CORREGIDA.sql) y contempla las tablas principales:

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
- asignacion_entrega
- evidencia_entrega
- alistamiento_pedido
- detalle_alistamiento_pedido
- pedido_historial_operacion

El archivo corregido incluye las definiciones completas para una instalación nueva. Para una base existente, `CREATE TABLE IF NOT EXISTS` no modifica columnas ni agrega restricciones faltantes: se deben utilizar las migraciones incrementales aplicables.

## Relaciones de pedidos y logística

- `factura` contiene el pedido asociado al cliente; `detalle_pedido` conserva productos y cantidades.
- `entrega` mantiene el estado logístico, separado del estado de factura.
- `asignacion_preparacion` registra el bodeguero que seleccionó el pedido; un índice único permite una sola selección activa por entrega.
- `novedad_bodega` conserva incidencias por producto, su estado y la respuesta de Administración.
- `alistamiento_pedido` registra cada intento, usuario, resultado y fecha; `detalle_alistamiento_pedido` registra cantidades verificadas por línea.
- `asignacion_preparacion`
- `novedad_bodega`
- `asignacion_entrega` conserva el historial de mensajeros y limita a una asignación activa por entrega.
- `evidencia_entrega` referencia una imagen real, la entrega, la asignación y el mensajero. El archivo reside fuera de SQL.
- `pedido_historial_operacion` conserva eventos logísticos, estados anterior/nuevo, responsable, fecha y observaciones.
- `inventario_movimiento` conserva el tipo y motivo de las entradas, salidas y ajustes. El proceso de alistamiento no descuenta stock por segunda vez.

Los estados de `entrega` son `Pendiente`, `Por recoger`, `En camino`, `Entregado` y `Cancelado`. `En preparación` se deriva del historial; `Incidencia` se deriva de novedades no resueltas y se conserva tras la respuesta de Administración. No son valores del enum de entrega.

## Datos de ejemplo y migraciones

[`sql/dml.sql`](../DOCUMENTACION/sql/dml.sql) contiene datos de ejemplo para una base nueva: un pedido listo sin asignar, dos pedidos en camino con mensajeros activos, una selección activa de Bodega y un reporte de novedad asociado al producto faltante. No crea evidencias ficticias: para probar una imagen se debe subir un archivo real por el flujo de Mensajería.

El DML asume una instalación vacía y los IDs consecutivos creados por su carga inicial; no ejecutarlo sobre una base con datos existentes. Para bases existentes, aplicar únicamente las migraciones incrementales pertinentes, luego validar el esquema y probar con datos controlados.

La inspección realizada el 2026-10-15 confirmó que la base configurada contiene las tablas de asignación y evidencia, pero aún no las tres tablas de preparación e historial. Las migraciones de `alistamiento_pedido`, `detalle_alistamiento_pedido` y `pedido_historial_operacion` siguen pendientes en esa base.
