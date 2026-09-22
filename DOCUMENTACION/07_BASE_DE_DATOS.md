# 07. Base de datos

## Motor y nombre

El sistema usa MySQL y la base de datos real del proyecto es:

```text
happykids
```

El esquema principal está en:

- `documentacion/sql/DataBaseHappyKids_CORREGIDA.sql`

## Fuente de verdad

Este archivo contiene el esquema corregido y actual. El proyecto indica explícitamente que es la fuente real y que el esquema histórico está en carpetas de referencia o legado.

## Tabla central de usuarios

### `usuario`

Campos relevantes:

- `id`
- `nombre_usuario`
- `contrasena`
- `correo`
- `telefono`
- `foto_perfil`
- `activo`
- `idioma`

Relaciones:

- `usuario` tiene varios roles en `usuario_rol`
- `usuario` puede ser cliente o empleado

### `rol`

```sql
CREATE TABLE IF NOT EXISTS rol (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_rol VARCHAR(50) NOT NULL UNIQUE
)
```

### `usuario_rol`

Relaciona usuarios con roles.

```sql
PRIMARY KEY (id_usuario, id_rol)
```

## Productos e inventario

### `categoria`

- `id`
- `nombre_categoria`
- `descripcion`
- `estado`

### `talla`

- `id`
- `nombre_talla`
- `estado`

### `color`

- `id`
- `nombre_color`
- `estado`

### `producto`

Campos clave:

- `nombre_producto`
- `descripcion`
- `precio_compra`
- `precio_venta`
- `marca`
- `imagen_producto`
- `id_categoria`
- `id_talla`
- `id_color`
- `estado`

### `inventario`

```sql
CREATE TABLE IF NOT EXISTS inventario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cantidad_disponible INT NOT NULL DEFAULT 0,
    cantidad_minima INT NOT NULL DEFAULT 0,
    fecha_actualizacion DATE NOT NULL DEFAULT (CURRENT_DATE),
    id_producto INT NOT NULL UNIQUE,
    CONSTRAINT fk_inventario_producto
        FOREIGN KEY (id_producto) REFERENCES producto(id)
)
```

## Ventas y pedidos

### `cliente`

- `id`
- `primer_nombre`
- `primer_apellido`
- `numero_documento`
- `telefono`
- `direccion`
- `ciudad`
- `id_usuario`
- `id_tipo_documento`

### `factura`

Es la cabecera del pedido o factura. Los pedidos se obtienen con joins a:

- `factura`
- `cliente`
- `usuario`
- `entrega`
- `pago`

### `detalle_pedido`

Guarda los productos de la factura:

- `id_factura`
- `id_producto`
- `cantidad`
- `precio_unitario`
- `subtotal`

### `pago`

Guarda el método de pago asociado a la factura.

### `entrega`

Guarda el estado de la entrega posible a la factura.

## Carrito y favoritos

### `carrito`

Gestión de carrito activo por cliente.

### `detalle_carrito`

Productos dentro del carrito con:

- `cantidad`
- `precio`
- `subtotal`
- `id_carrito`
- `id_producto`

### `favorito`

```sql
UNIQUE (id_usuario, id_producto)
```

Esto evita registros duplicados del mismo producto para un usuario.

## Compras de proveedor

El esquema también incluye:

- `proveedor`
- `compra`
- `detalle_compra`

Esto es funcional para el módulo de abastecimiento e inventario, aunque la documentación de flujo principal de compra del cliente está centrada en `factura`, `detalle_pedido`, `pago` y `entrega`.

## Tabla de idempotencia

La comprobación real de idempotencia se implementa en la base de datos con:

```sql
CREATE TABLE IF NOT EXISTS api_idempotency (
  idempotency_key VARCHAR(128) PRIMARY KEY,
  request_hash CHAR(64) NOT NULL,
  status ENUM('processing', 'completed') NOT NULL DEFAULT 'processing',
  response_status SMALLINT NULL,
  response_body LONGTEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)
```

## Integridad y validaciones

El esquema incluye constraints como:

- `UNIQUE` para emails, usuarios, productos y roles,
- `FOREIGN KEY` para relaciones de negocio,
- checks de cantidad positiva,
- checks de precio no negativo,
- y exclusividad de claves para evitar duplicados.

## Consultas del sistema relevantes

El proyecto usa queries de lectura para:

- dashboard,
- historial de stock,
- pedidos por cliente,
- productos por categoría,
- carrito por usuario,
- favoritos por usuario,
- y resúmenes de logística.

## Importante

La base de datos no es opcional ni redundante: es el almacenamiento real del sistema y ambas instancias de servicio apuntan a la misma base de datos. La documentación debe describirla como fuente de verdad del negocio.
