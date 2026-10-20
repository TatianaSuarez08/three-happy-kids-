# 15. Reportes

## Reportes que ya existen o se pueden inferir

- Dashboard administrativo con métricas básicas
- Indicadores de stock bajo
- Pedidos recientes
- Ventas totales

## Archivos relevantes

- [backend/src/models/DashboardModel.js](../backend/src/models/DashboardModel.js)
- [backend/src/controllers/DashboardController.js](../backend/src/controllers/DashboardController.js)

## Problemas

- Los reportes están limitados a métricas generales.
- No hay un análisis de inventario por movimiento, local o historial.
- No hay reportes por proveedor, categoría o entregas con trazabilidad real.

## Recomendación

Mantener el dashboard principal, pero ampliarlo con:

- ventas por día / mes / periodo
- stock por producto
- productos agotados
- productos bajos
- entregas por estado
- usuarios por rol
- pedidos por estado

Esto será útil para administración y bodeguero.
