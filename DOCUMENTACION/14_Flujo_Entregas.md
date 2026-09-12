# 14. Flujo de entregas

## Estado actual

La entrega está representada por la tabla `entrega`, vinculada a `factura` y con estado `Pendiente`, `En camino`, `Entregado`, `Cancelado`.

## Observación

El flujo de entrega existe funcionalmente, aunque no está totalmente integrado con la preparación del pedido y con la auditoría de bodega.

## Problemas

- No hay campo para asignar mensajero por usuario real.
- No hay historial de evidencias ni seguimiento detallado.
- No está formalizado el paso de pedido preparado → enviado → entregado.

## Recomendación

Se debe evolucionar la entidad de entrega hacia un sistema con:

- id_factura
- id_mensajero
- fecha_asignacion
- fecha_entrega
- estado
- observacion
- evidencia

Esto facilitará el control desde administración y la transparencia para el cliente.
