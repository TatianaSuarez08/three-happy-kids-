# Módulo de Mensajería

## Flujo conectado

El inicio del mensajero muestra únicamente pedidos con preparación `Listo para despacho`, sin mensajero asignado y sin novedades de Bodega pendientes. El mensajero puede consultar el detalle (cliente y dirección necesarios para la entrega, teléfono, productos, tallas, colores, novedades e historial) antes de asignarlo.

La asignación se hace en el servidor a partir del usuario autenticado y se guarda en `pedido_flujo`. Una actualización condicional impide que dos mensajeros tomen el mismo pedido. `Mis entregas` muestra exclusivamente pedidos asignados al usuario, incluso después de cerrar sesión, recargar o terminar la entrega.

Transiciones admitidas:

- `Asignado` → `En camino`.
- `En camino` → `Entrega fallida`, indicando el motivo, o `Entregado`.
- `Entrega fallida` → `En camino` para reintentar con el mismo responsable.
- `Entregado` es terminal y exige evidencia guardada.

Los eventos se conservan en `pedido_historial`; una entrega fallida también se reporta como novedad visible para Administración.

## Evidencia

La vista de cada entrega permite capturar una foto desde dispositivos compatibles o seleccionar JPEG, PNG o WebP. Se muestra una vista previa antes de guardar. El backend comprueba tipo y tamaño (máximo 5 MB), verifica que el mensajero tenga asignado el pedido y persiste la imagen bajo `backend/storage/assets/entregas` con nombre aleatorio. Se guarda una referencia, no el contenido binario en MySQL. Las lecturas de la evidencia pasan por un endpoint autenticado.

## API y base de datos

Ver [Flujo de pedidos](./12_Flujo_Pedidos.md) para las rutas, permisos, estados y pasos de migración. Las tablas nuevas relevantes son `pedido_flujo`, `pedido_historial` y `pedido_novedad`; las verificaciones por producto quedan en `pedido_preparacion_detalle`.

La fotografía reside en almacenamiento local persistente. Si se ejecuta el backend en varias instancias, debe configurarse un volumen compartido; de lo contrario, cada instancia podría no tener acceso al archivo que guardó otra.
