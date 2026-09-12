# 07. Módulo bodeguero

## Estado actual

El bodeguero existe como rol administrativo, pero no existe un módulo operativo dedicado ni rutas específicas para gestión de inventario físico, entradas, salidas, ajustes ni historial.

## Lo que existe

- Se puede crear usuarios con rol `Bodeguero`.
- Existe una tabla de inventario.
- Existe `producto`, `compra`, `detalle_compra` y `factura`.
- Existe un dashboard administrativo con alertas de stock bajo.

## Lo que falta

- Ruta operativa para bodeguero.
- Registro de movimientos de inventario.
- Confirmación de preparación y salidas por pedido.
- Historial de entradas/salidas.
- Mecanismo de auditoría del inventario.

## Diagnóstico

Bodeguero no debe ser un módulo aislado ni un simple rol administrativo. Debe operar sobre el mismo inventario global del sistema y generar trazabilidad real.

## Recomendación para implementación

Crear una capa de inventario y movimientos con:

- `inventario` como existencia actual
- `movimientos_inventario` como historial de cambios
- operaciones tipo: entrada, salida, ajuste, devolución, traslado

Esto permite que el bodeguero opere sobre la misma verdad del sistema sin duplicar la información.
