# 04. Modelo relacional

## Relaciones principales

### Usuarios y roles

- `usuario` 1:N `usuario_rol`
- `rol` 1:N `usuario_rol`

Esto permite varios roles por usuario, aunque el sistema actual sólo usa algunos casos concretos.

### Producto y clasificación

- `categoria` 1:N `producto`
- `talla` 1:N `producto`
- `color` 1:N `producto`

### Inventario

- `producto` 1:1 `inventario`

Esto hace que el stock del producto se mantenga como dato actual en una sola tabla, pero no registra historia de movimientos.

### Cliente y factura

- `usuario` 1:1 `cliente`
- `cliente` 1:N `factura`
- `factura` 1:N `detalle_pedido`
- `producto` 1:N `detalle_pedido`

### Pago y despacho

- `factura` 1:N `pago`
- `factura` 1:1 `entrega`

## Observación crítica

La relación conceptual de negocio entre pedido, bodega y mensajería existe en el flujo, pero no queda representada en tablas separadas de preparación, asignación ni logística. La entrega está asociada a una factura, pero no existe un historial de preparación ni bloque de inventario por pedido.

## Conclusión

El modelo actual es funcional, pero aún no cumple a nivel relacional la arquitectura de negocio que pide trazabilidad de inventario y flujo completo de operaciones.
