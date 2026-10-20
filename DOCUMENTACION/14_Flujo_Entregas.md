# 14. Flujo de entregas

La entrega utiliza la factura y la tabla heredada `entrega`, complementadas por `pedido_flujo` para responsable, fecha de asignación, estado de preparación, progreso de entrega y referencia de evidencia. Los cambios se auditan en `pedido_historial`; los fallos de entrega se registran también como `pedido_novedad`.

El mensajero solo puede asignar un pedido que Bodega haya marcado `Listo para despacho`. Las transiciones permitidas son `Asignado` → `En camino` → `Entregado` o `Entrega fallida`; una entrega fallida puede reintentarse por el mismo mensajero. El servidor rechaza transiciones no autorizadas y exige evidencia guardada antes de `Entregado`.

La fotografía se almacena como archivo JPEG, PNG o WebP (máximo 5 MB) bajo `backend/storage/assets/entregas`. La consulta se realiza por una ruta autenticada y valida el mensajero asignado o el rol Administrador. En despliegues con varias instancias, el directorio debe estar en almacenamiento persistente compartido.

Para el esquema, endpoints y pasos de verificación, consulta [Flujo de pedidos](./12_Flujo_Pedidos.md) y aplica [MIGRACION_FLUJO_PEDIDOS.sql](./sql/MIGRACION_FLUJO_PEDIDOS.sql).
