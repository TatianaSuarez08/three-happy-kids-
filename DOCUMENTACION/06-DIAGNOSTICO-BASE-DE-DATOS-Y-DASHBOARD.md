# Diagnóstico de la base de datos y viabilidad del dashboard

## 1. Conclusión

Sí, la base de datos permite construir un dashboard administrativo real. Tiene las tablas necesarias para consultar:

- Ventas y facturación: `factura` y `pago`.
- Pedidos y productos vendidos: `detalle_pedido` y `producto`.
- Clientes: `cliente` y `usuario`.
- Catálogo: `producto`, `categoria`, `talla` y `color`.
- Inventario: `inventario`.
- Entregas: `entrega`.
- Compras a proveedores: `compra`, `detalle_compra` y `proveedor`.

Sin embargo, el dashboard actual no usa todavía MySQL. En `Front-end/src/admin/page-Dashboard.jsx`, las estadísticas y los pedidos recientes están definidos como constantes de ejemplo. Lo mismo ocurre con las pantallas de productos, inventario, pedidos y usuarios: permiten interactuar con datos locales del navegador, pero no guardan cambios en el backend.

Por tanto, la base de datos está preparada como modelo, pero todavía falta crear la API administrativa que conecte ese modelo con React.

## 2. Revisión del script SQL

El archivo revisado es `DOCUMENTACION/sql/DataBaseHappyKids.sql`.

### Elementos correctos

- La base usa `utf8mb4`, adecuado para nombres y textos en español.
- `usuario`, `rol` y `usuario_rol` forman correctamente una relación de usuarios con roles.
- Las tablas tienen claves primarias.
- Las relaciones principales usan claves foráneas.
- `ON DELETE CASCADE` en `usuario_rol` evita relaciones de roles huérfanas al borrar un usuario.
- `producto` está relacionado con categoría, talla y color.
- `factura` se relaciona con cliente y empleado.
- `detalle_pedido` utiliza una clave primaria compuesta por factura y producto.
- `pago` y `entrega` pueden conservar la información operativa de una venta.

No se observan errores de sintaxis evidentes leyendo el archivo, pero la validación SQL no pudo ejecutarse en este entorno porque el comando `mysql` no está disponible.

## 3. Riesgos y mejoras recomendadas

Estos puntos no impiden crear el dashboard, pero conviene corregirlos antes de usar el sistema con datos reales.

### 3.1. El script borra toda la base

El archivo empieza con:

```sql
DROP DATABASE IF EXISTS happykids;
```

Esto elimina toda la información existente cada vez que se ejecuta. Es útil para reiniciar un entorno de pruebas, pero es peligroso en producción.

Recomendación:

- Mantener este archivo como script de instalación limpia para desarrollo.
- Crear otro script de migraciones para cambios posteriores.
- No ejecutar este archivo en una base con información real.

### 3.2. Faltan datos iniciales

El esquema crea tablas, pero no inserta categorías, tallas, colores, productos, clientes, empleados ni pedidos. El login necesita además que existan los roles y usuarios de prueba definidos en los scripts SQL de la documentación.

Sin datos, el dashboard funcionará técnicamente, pero mostrará ceros y listas vacías.

### 3.3. La API actual solo expone usuarios

El backend registra estas rutas:

- `GET /`
- `POST /registro`
- `POST /login`
- `GET /me`

Todavía no existen rutas para:

- Resumen del dashboard.
- Productos.
- Inventario.
- Pedidos y cambios de estado.
- Usuarios administrativos.
- Compras a proveedores.

Esta es la principal tarea pendiente para que el dashboard deje de usar datos fijos.

### 3.4. Relaciones uno a uno sin restricción única

`cliente.id_usuario` y `empleado.id_usuario` deberían identificar como máximo un perfil por usuario. Actualmente no tienen `UNIQUE`, así que la base podría permitir varios clientes o empleados vinculados al mismo usuario.

Recomendación, después de revisar los datos existentes:

```sql
ALTER TABLE cliente
ADD CONSTRAINT uq_cliente_usuario UNIQUE (id_usuario);

ALTER TABLE empleado
ADD CONSTRAINT uq_empleado_usuario UNIQUE (id_usuario);
```

No se aplicó automáticamente porque primero hay que comprobar que no existan duplicados.

### 3.5. Posibles duplicados en los detalles

Un mismo producto puede aparecer varias veces en `detalle_carrito` para el mismo carrito, y también en `detalle_compra` para la misma compra. Esto complica sumar cantidades.

Recomendación:

```sql
ALTER TABLE detalle_carrito
ADD CONSTRAINT uq_carrito_producto UNIQUE (id_carrito, id_producto);

ALTER TABLE detalle_compra
ADD CONSTRAINT uq_compra_producto UNIQUE (id_compra, id_producto);
```

Antes de aplicarlo, se deben revisar duplicados con:

```sql
SELECT id_carrito, id_producto, COUNT(*) AS repeticiones
FROM detalle_carrito
GROUP BY id_carrito, id_producto
HAVING COUNT(*) > 1;

SELECT id_compra, id_producto, COUNT(*) AS repeticiones
FROM detalle_compra
GROUP BY id_compra, id_producto
HAVING COUNT(*) > 1;
```

### 3.6. Falta validar cantidades y precios

Varias columnas aceptan valores negativos o cero, por ejemplo cantidades, precios y subtotales. La aplicación debe validarlo, pero también es recomendable proteger la base con restricciones `CHECK` si se usa una versión de MySQL que las aplique.

Ejemplo para futuras migraciones:

```sql
ALTER TABLE inventario
ADD CONSTRAINT chk_inventario_cantidad
CHECK (cantidad_disponible >= 0 AND cantidad_minima >= 0);

ALTER TABLE detalle_pedido
ADD CONSTRAINT chk_detalle_pedido_cantidad
CHECK (cantidad > 0);
```

### 3.7. Fechas sin hora

Las tablas usan `DATE`. Para un dashboard de ventas puede ser útil saber la hora exacta de una operación, especialmente si se quieren mostrar ventas por día y hora o auditar cambios.

No es un error. Es una decisión de diseño. Si se necesita trazabilidad, se pueden migrar las fechas operativas a `DATETIME`.

### 3.8. Estados en tablas diferentes

`factura.estado` usa `Pendiente`, `Pagada`, `Anulada`, mientras `entrega.estado` usa `Pendiente`, `En camino`, `Entregado`, `Cancelado`. Esto es correcto porque representan procesos diferentes, pero el backend debe unirlos correctamente para que el frontend no confunda el estado de pago con el estado de entrega.

## 4. Qué puede mostrar el dashboard con esta base

El dashboard puede calcular estas tarjetas:

| Tarjeta | Fuente recomendada |
|---|---|
| Ventas totales | `SUM(factura.total)` filtrando facturas no anuladas. |
| Total de pedidos | `COUNT(factura.id)`. |
| Clientes | `COUNT(cliente.id)` o usuarios con rol `cliente`. |
| Productos | `COUNT(producto.id)` filtrando productos activos. |
| Pedidos pendientes | `COUNT(entrega.id)` por estado `Pendiente`. |
| Pedidos en camino | `COUNT(entrega.id)` por estado `En camino`. |
| Pedidos entregados | `COUNT(entrega.id)` por estado `Entregado`. |
| Stock bajo | Conteo de inventario donde `cantidad_disponible <= cantidad_minima`. |

Consulta de resumen sugerida:

```sql
SELECT
  (SELECT COALESCE(SUM(total), 0)
   FROM factura
   WHERE estado <> 'Anulada') AS ventas_totales,
  (SELECT COUNT(*)
   FROM factura
   WHERE estado <> 'Anulada') AS total_pedidos,
  (SELECT COUNT(*) FROM cliente) AS total_clientes,
  (SELECT COUNT(*) FROM producto WHERE estado = 'Activo') AS total_productos,
  (SELECT COUNT(*) FROM entrega WHERE estado = 'Pendiente') AS pedidos_pendientes,
  (SELECT COUNT(*) FROM entrega WHERE estado = 'En camino') AS pedidos_en_camino,
  (SELECT COUNT(*) FROM entrega WHERE estado = 'Entregado') AS pedidos_entregados,
  (SELECT COUNT(*)
   FROM inventario
   WHERE cantidad_disponible <= cantidad_minima) AS stock_bajo;
```

Consulta para pedidos recientes:

```sql
SELECT
  f.id,
  CONCAT(c.primer_nombre, ' ', c.primer_apellido) AS cliente,
  f.fecha,
  f.total,
  f.estado AS estado_factura,
  e.estado AS estado_entrega
FROM factura f
JOIN cliente c ON c.id = f.id_cliente
LEFT JOIN entrega e ON e.id_factura = f.id
ORDER BY f.fecha DESC, f.id DESC
LIMIT 10;
```

Consulta para productos con stock bajo:

```sql
SELECT
  p.id,
  p.nombre_producto,
  i.cantidad_disponible,
  i.cantidad_minima,
  t.nombre_talla,
  c.nombre_color
FROM inventario i
JOIN producto p ON p.id = i.id_producto
JOIN talla t ON t.id = p.id_talla
JOIN color c ON c.id = p.id_color
WHERE i.cantidad_disponible <= i.cantidad_minima
ORDER BY i.cantidad_disponible ASC;
```

## 5. API que se necesita para conectar el dashboard

Una primera versión del backend debería añadir una ruta protegida para el resumen:

```text
GET /admin/dashboard
Authorization: Bearer <token>
```

Respuesta sugerida:

```json
{
  "success": true,
  "stats": {
    "ventasTotales": 1245000,
    "totalPedidos": 4,
    "totalClientes": 5,
    "totalProductos": 10,
    "pedidosPendientes": 2,
    "pedidosEnCamino": 1,
    "pedidosEntregados": 1,
    "stockBajo": 3
  },
  "pedidosRecientes": [],
  "productosStockBajo": []
}
```

La ruta debería aplicar autenticación JWT y autorización para el rol `administrador`. Después, `page-Dashboard.jsx` reemplazaría las constantes `stats`, `pedidosRecientes` y `productosStockBajo` por el resultado de `fetch`.

Para las demás pantallas se necesitarían, como mínimo:

```text
GET    /productos
POST   /productos
PUT    /productos/:id
DELETE /productos/:id
GET    /inventario
PUT    /inventario/:id
GET    /pedidos
PUT    /pedidos/:id/estado
GET    /usuarios
PUT    /usuarios/:id/estado
```

## 6. Cambios realizados en esta revisión

No se modificó el archivo SQL ni el código de la aplicación. Se creó esta guía para:

- Confirmar que el modelo permite construir el dashboard.
- Identificar que los datos actuales del dashboard son de ejemplo.
- Señalar riesgos de integridad antes de aplicar restricciones.
- Proponer consultas compatibles con las tablas existentes.
- Definir las rutas backend que faltan.

La decisión de no aplicar automáticamente los `ALTER TABLE` evita romper una base que ya tenga datos duplicados. Primero deben ejecutarse las consultas de diagnóstico y confirmar los resultados.

## 7. Prueba recomendada cuando MySQL esté disponible

Desde MySQL Workbench o el cliente de consola:

```sql
SOURCE DOCUMENTACION/sql/DataBaseHappyKids.sql;
USE happykids;
SHOW TABLES;
```

Después, comprobar las relaciones:

```sql
SELECT TABLE_NAME, CONSTRAINT_NAME, REFERENCED_TABLE_NAME
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'happykids'
  AND REFERENCED_TABLE_NAME IS NOT NULL;
```

Y verificar que las consultas del resumen devuelvan una fila, aunque los valores sean cero si aún no hay datos.
