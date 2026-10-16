# 06. Módulo cliente

## Estado actual

El cliente cuenta con catálogo, detalle del producto, carrito, favoritos, compra y historial de pedidos.

## Archivos clave

- [Front-end/src/cliente/page-catalogo.jsx](../Front-end/src/cliente/page-catalogo.jsx)
- [Front-end/src/cliente/page-DetalleProducto.jsx](../Front-end/src/cliente/page-DetalleProducto.jsx)
- [Front-end/src/cliente/page-Carrito.jsx](../Front-end/src/cliente/page-Carrito.jsx)
- [Front-end/src/cliente/page-ConfirmarCompra.jsx](../Front-end/src/cliente/page-ConfirmarCompra.jsx)
- [Front-end/src/cliente/page-MisPedidosBD.jsx](../Front-end/src/cliente/page-MisPedidosBD.jsx)
- [Back-end/src/routes/PedidoRoute.js](../Back-end/src/routes/PedidoRoute.js)
- [Back-end/src/controllers/PedidoController.js](../Back-end/src/controllers/PedidoController.js)

## Observaciones

- El cliente puede revisar productos y realizar pedido.
- El flujo de pedido se conecta con la base de datos a través de `factura` y `detalle_pedido`.
- La información del cliente también está vinculada a `usuario` y `cliente`.

## Problemas detectados

- La ecuación de stock real no tiene trazabilidad por pedido ni por bodega.
- La información del estado del pedido se presenta sin una separación clara entre preparación, despacho y entrega.
- El usuario cliente no tiene una vista del proceso de operación completa del pedido.

## Recomendación

Se debe reforzar la trazabilidad del pedido para que el cliente vea el ciclo completo: confirmado → preparación → listo → en tránsito → entregado.
