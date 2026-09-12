# 12. Flujo de pedidos

## Flujo actual detectado

El flujo funcional observado en el código y la base de datos es:

1. Cliente realiza pedido.
2. Pedido se registra como factura y detalle_pedido.
3. El pedido puede consultarse desde el backend.
4. El administrador puede supervisar el pedido.
5. El estado cambia con `PUT /pedidos/:id/estado`.
6. La entrega corresponde a la factura y depende del estado.

## Estados de pedido

La API actual soporta estados como:

- Pendiente
- En camino
- Entregado
- Cancelado

## Problemas detectados

- No hay una separación formal entre pedido, preparación de bodega y entrega física.
- No existe una entidad de preparación y asignación para bodeguero.
- Las transiciones del flujo no están totalmente registradas desde la operación real.

## Recomendación

Se debe reforzar la trazabilidad del pedido hacia una lógica de preparación y logística real, siguiendo este modelo:

- pendiente
- confirmado
- en preparación
- preparado
- enviado
- entregado
- cancelado

Esto debe reflejarse en la base de datos y en la API.
