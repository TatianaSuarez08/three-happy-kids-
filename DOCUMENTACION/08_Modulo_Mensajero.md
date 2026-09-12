# 08. Módulo mensajero

## Estado actual

El módulo mensajero está funcional y está conectado a rutas protegidas para entregas y seguimiento.

## Archivos relevantes

- [Front-end/src/App.jsx](../Front-end/src/App.jsx)
- [Front-end/src/mensajeria/MensajeriaUI.jsx](../Front-end/src/mensajeria/MensajeriaUI.jsx)
- [Front-end/src/mensajeria/page-EntregasMensajeria.jsx](../Front-end/src/mensajeria/page-EntregasMensajeria.jsx)
- [Front-end/src/mensajeria/page-RutaMensajeria.jsx](../Front-end/src/mensajeria/page-RutaMensajeria.jsx)
- [Back-end/src/routes/PedidoRoute.js](../Back-end/src/routes/PedidoRoute.js)

## Observaciones

La entrega está asociada a una factura y el mensajero puede ver el estado del pedido y gestionarlo.

## Problemas detectados

- No hay una asignación clara de entregas por mensajero en base de datos.
- No hay evidencia de registros de evidencia o seguimiento de entrega en tablas propias.
- El flujo entre pedido preparado y entrega no está modelado en una entidad de logística diferenciada.

## Recomendación

Se recomienda mantener el módulo mensajero como parte del flujo de logística, pero conectando estados reales con el pedido y la entrega. Debe quedar aclarado quién entrega, cuál es la referencia, y qué evidencia se tuvo de la entrega.
