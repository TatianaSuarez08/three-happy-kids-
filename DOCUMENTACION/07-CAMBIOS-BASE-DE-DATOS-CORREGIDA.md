# Cambios de la base de datos corregida

## Archivo creado

La nueva versión está en:

```text
DOCUMENTACION/sql/DataBaseHappyKids_CORREGIDA.sql
```

Es un archivo independiente de `DataBaseHappyKids.sql`. No reemplaza automáticamente el archivo original ni elimina información existente.

## Qué contiene

El archivo vuelve a crear la estructura completa de la base de datos `happykids`, incluyendo:

- Usuarios y roles.
- Clientes y empleados.
- Categorías, tallas, colores y productos.
- Inventario.
- Carrito y detalle del carrito.
- Proveedores y compras.
- Facturas y detalle de pedidos.
- Pagos.
- Entregas.

No contiene usuarios de prueba, productos de ejemplo ni consultas `SELECT`. Solo contiene la definición de la base de datos y sus tablas.

## Cambios realizados y motivo

### 1. No se elimina la base de datos

La versión original comenzaba con:

```sql
DROP DATABASE IF EXISTS happykids;
```

La versión corregida utiliza:

```sql
CREATE DATABASE IF NOT EXISTS happykids;
```

**Motivo:** ejecutar el archivo original podía borrar toda la información existente. La versión nueva es más segura para conservar datos. Debe ejecutarse preferiblemente sobre una base nueva o después de una copia de seguridad.

### 2. Se especifica `InnoDB`

Todas las tablas utilizan:

```sql
ENGINE=InnoDB
```

**Motivo:** InnoDB permite trabajar correctamente con claves foráneas, transacciones y relaciones entre las tablas.

### 3. Se refuerzan campos obligatorios

Se añadieron `NOT NULL` y valores predeterminados en estados, fechas, cantidades y totales.

**Motivo:** evita guardar registros incompletos que después producirían errores en el dashboard o en los cálculos de ventas e inventario.

### 4. Se evita vincular varias veces un usuario

Se agregó `UNIQUE` a:

```sql
cliente.id_usuario
empleado.id_usuario
```

**Motivo:** un mismo usuario no debe tener repetidos varios perfiles del mismo tipo. Esto mantiene coherentes las relaciones entre `usuario`, `cliente` y `empleado`.

### 5. Se evitan productos repetidos en un mismo carrito o compra

Se agregaron restricciones únicas a:

```sql
(id_carrito, id_producto)
(id_compra, id_producto)
```

**Motivo:** un producto debe aparecer una sola vez por carrito o compra. Si aumenta la cantidad, se actualiza el registro existente en lugar de crear duplicados.

### 6. Se agregan validaciones de cantidades

Se añadieron restricciones para impedir:

- Inventario negativo.
- Cantidades menores o iguales a cero en los detalles.
- Cantidades mínimas negativas.

**Motivo:** un inventario negativo o una línea de pedido con cantidad cero dañaría las estadísticas y los cálculos del dashboard.

### 7. Se agregan validaciones de precios y totales

Se validan `precio`, `precio_compra`, `precio_venta`, `subtotal` y `total` para que no sean negativos.

**Motivo:** evita ventas, compras o pagos con importes inválidos.

### 8. Se permite una factura sin empleado asignado

En la versión corregida:

```sql
id_empleado INT NULL
```

**Motivo:** una compra realizada directamente desde la tienda online puede no tener un empleado asociado. Si la venta se procesa desde una caja o por un empleado, el campo puede completarse.

### 9. Se evita más de una entrega por factura

Se agregó una restricción única sobre:

```sql
entrega.id_factura
```

**Motivo:** una factura debe tener una única entrega activa dentro de este modelo. Así el dashboard no cuenta dos veces el mismo pedido.

### 10. Se mantienen separados los estados de factura y entrega

La factura conserva estados de pago:

```text
Pendiente, Pagada, Anulada
```

La entrega conserva estados logísticos:

```text
Pendiente, En camino, Entregado, Cancelado
```

**Motivo:** el estado del pago y el estado del envío representan procesos diferentes. El dashboard puede mostrar ambos sin mezclarlos.

## Qué no se cambió

- No se cambiaron los nombres principales de tablas ni columnas usados por el backend actual.
- No se modificó el formato de la contraseña `salt:hash`.
- No se eliminaron tablas necesarias para el catálogo o el dashboard.
- No se insertaron datos de prueba.
- No se crearon endpoints del backend en este archivo SQL.

## Importante sobre `IF NOT EXISTS`

Este archivo crea las tablas que no existan, pero no modifica automáticamente una tabla que ya fue creada con la estructura anterior. Por ejemplo, si `cliente` ya existe, el nuevo `UNIQUE` no se añade solo por volver a ejecutar el archivo.

Para una base existente, se debe hacer una migración controlada después de comprobar que no haya datos duplicados. Para una instalación limpia, lo recomendable es crear una base nueva y ejecutar este archivo.

## Compatibilidad con el dashboard

La estructura corregida permite calcular:

- Ventas totales desde `factura`.
- Total de pedidos desde `factura`.
- Clientes desde `cliente`.
- Productos activos desde `producto`.
- Stock bajo desde `inventario`.
- Estados de entrega desde `entrega`.
- Productos vendidos desde `detalle_pedido`.

Para que el dashboard use estos datos reales todavía deben crearse las rutas y controladores del backend, porque el frontend actual utiliza datos de ejemplo.

## Resultado

La base corregida queda preparada para trabajar con el dashboard y reduce los errores de integridad más importantes sin borrar datos ni incluir información ficticia.
