# 7. Base de datos

## Fuente y alcance

El esquema de referencia del repositorio es `DOCUMENTACION/sql/DataBaseHappyKids_CORREGIDA.sql`; declara y selecciona la base MySQL `happykids`. El archivo contiene 31 declaraciones de tabla con `CREATE TABLE IF NOT EXISTS`. Esto no modifica una tabla antigua ya existente, por lo que este DDL por sí solo no verifica ni migra una base configurada fuera del repositorio.

Esta revisión fue estática: no se leyó el `.env`, no se conectó a MySQL y no se ejecutó SQL. Para instalaciones nuevas y datos de prueba, consulta `DOCUMENTACION/sql/README.md`.

## Tablas y relaciones

`PK` significa clave primaria y `FK` clave foránea. La siguiente lista describe columnas importantes y relaciones del DDL; para tipos de datos, nulabilidad, restricciones y demás columnas, la fuente exacta es el SQL.

### Identidad y catálogos

| Tabla | Claves/campos principales | Uso y relación |
|---|---|---|
| `usuario` | PK `id`; únicos `nombre_usuario`, `correo`; credencial, contacto, estado y perfil | Identidad del sistema. Se vincula con roles, cliente y empleado. |
| `rol` | PK `id`; único `nombre_rol` | Roles asignables a usuarios. |
| `usuario_rol` | PK compuesta (`id_usuario`, `id_rol`); ambas columnas FK | Relación muchos-a-muchos entre `usuario` y `rol`. |
| `recuperacion_contrasena` | PK/FK `id_usuario`; único `token_hash`; fechas de creación, expiración y uso | Tabla incremental de recuperación; mantiene como máximo un token hasheado por usuario y lo consume una sola vez. Se crea mediante `MIGRACION_RECUPERACION_CONTRASENA.sql`, no forma parte del DDL base. |
| `tipo_documento` | PK `id`; único `sigla` | Catálogo de identificación usado por clientes. |
| `cargo` | PK `id`; único `nombre_cargo` | Catálogo de cargos usado por empleados. |
| `talla`, `color`, `categoria` | PK `id`; nombre único en cada catálogo | Catálogos referenciados por productos. |

### Cliente, personal, producto e inventario

| Tabla | Claves/campos principales | Uso y relación |
|---|---|---|
| `cliente` | PK `id`; FK única `id_usuario`; FK `id_tipo_documento`; número de documento único | Datos de compra y contacto del cliente. |
| `empleado` | PK `id`; FK única `id_usuario`; FK `id_cargo` | Perfil del personal asociado a un usuario. |
| `producto` | PK `id`; nombre único; precio de compra/venta, imagen y estado; FK `id_categoria`, `id_talla`, `id_color` | Catálogo y producto operado por inventario, carrito, compra y pedido. |
| `inventario` | PK `id`; FK única `id_producto`; cantidades disponible y mínima | Existencia actual por producto. |
| `inventario_movimiento` | PK `id`; referencias a producto y usuario; tipo, cantidad/variación y motivo/referencia | Trazabilidad de movimientos de inventario. |

### Carrito, favoritos y compras de proveedor

| Tabla | Claves/campos principales | Uso y relación |
|---|---|---|
| `carrito` | PK `id`; FK `id_cliente`; estado y fechas | Carrito asociado a cliente. |
| `detalle_carrito` | PK `id`; único (`id_carrito`, `id_producto`); FK a carrito y producto | Cantidad, precio y subtotal de cada línea. |
| `favorito` | PK `id`; único (`id_usuario`, `id_producto`); FK a usuario y producto | Evita duplicar el mismo favorito por usuario. |
| `proveedor` | PK `id`; datos de contacto y estado | Origen de compras de abastecimiento. |
| `compra` | PK `id`; FK `id_proveedor`; fecha, total y estado | Cabecera de compra al proveedor. |
| `detalle_compra` | PK `id`; único (`id_compra`, `id_producto`); FK a compra y producto | Productos y cantidades compradas. |
| `compra_recepcion` | PK `id`; único `clave_idempotencia`; FK a compra y usuario | Registro de una recepción de compra. |
| `compra_recepcion_detalle` | PK `id`; cantidades recibidas/dañadas; FK a recepción y detalle de compra | Resultado por línea de una recepción. |

### Facturas, pedidos, pagos y entregas

| Tabla | Claves/campos principales | Uso y relación |
|---|---|---|
| `factura` | PK `id`; FK a cliente y FK opcional a empleado; fecha, total y estado | Cabecera usada por los flujos de pedido. |
| `detalle_pedido` | PK compuesta (`id_factura`, `id_producto`); FKs a factura y producto | Líneas del pedido con cantidad, precio y subtotal. |
| `pago` | PK `id`; FK `id_factura`; método, fecha, total y transacción | Datos del pago asociado a la factura; no representa integración con un procesador externo. |
| `entrega` | PK `id`; FK única `id_factura`; estado y datos de entrega | Estado de entrega asociado a la factura. |
| `pedido_flujo` | PK/FK `id_factura`; FKs opcionales de responsables y usuario de evidencia | Estados y asignaciones de preparación/entrega por pedido. |
| `pedido_preparacion_detalle` | PK compuesta (`id_factura`, `id_producto`); FKs a factura, producto y usuario bodeguero | Resultado de verificación de cada producto preparado. |
| `pedido_novedad` | PK `id`; referencias opcionales a factura o compra, producto, detalle y usuarios | Novedades de pedido/compra, reporte y resolución; el DDL restringe el origen para que corresponda a factura o compra. |
| `pedido_historial` | PK `id`; FKs a factura y usuario; evento | Auditoría de eventos de pedido. |
| `admin_reporte_actividad` | PK `id`; FKs a administrador, usuario reportado y factura opcional | Reporte administrativo vinculado a usuario/actividad. |

### Soporte de idempotencia

`api_idempotency` usa `idempotency_key` como PK y almacena hash de solicitud, estado, código/cuerpo de respuesta y marcas de tiempo. No tiene una FK de negocio. El middleware consulta esta tabla para resolver reintentos HTTP con la misma clave.

## Relaciones principales

```text
usuario ──< usuario_rol >── rol
usuario ── recuperacion_contrasena
usuario ── cliente ──< carrito ──< detalle_carrito >── producto
usuario ── empleado
producto ── inventario
producto ──< inventario_movimiento
producto ──< favorito >── usuario
proveedor ──< compra ──< detalle_compra >── producto
compra ──< compra_recepcion ──< compra_recepcion_detalle >── detalle_compra
cliente ──< factura ──< detalle_pedido >── producto
factura ── pago
factura ── entrega
factura ── pedido_flujo (asignaciones/responsables)
factura ──< pedido_preparacion_detalle >── producto
factura o compra ──< pedido_novedad
factura ──< pedido_historial
usuario ──< pedido_historial
```

La cardinalidad y acciones de borrado exactas se determinan por los `FOREIGN KEY`, `UNIQUE` y restricciones del DDL; el diagrama es una vista funcional resumida.

## Uso desde el backend

- Los modelos de usuario consultan `usuario`, roles y perfiles de cliente/empleado.
- La recuperación relaciona un token SHA-256 almacenado con `usuario`; la actualización de contraseña y el marcado de uso ocurren en una transacción. La tabla adicional requiere aplicar su migración de forma manual.
- Catálogo, productos e inventario usan `producto`, sus catálogos, `inventario` y movimientos.
- El carrito y favoritos usan sus tablas de cabecera/detalle.
- El checkout escribe factura, detalle, inventario, pago y entrega en el flujo definido por el backend.
- Bodega y mensajería usan recepción, asignación, preparación, novedad e historial.
- Idempotencia HTTP y recepción de compra conservan claves para evitar duplicados según su implementación.

El backend también llama `CREATE TABLE IF NOT EXISTS api_idempotency` durante su inicialización. No crea ni migra automáticamente las otras tablas del esquema.
