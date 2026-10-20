# Flujo de pedidos: Cliente, Bodega, Mensajería y Administración

## Estados y transiciones

1. Una compra crea la factura, sus detalles, la entrega y un registro `pedido_flujo` en estado `Pendiente`.
2. Bodega consulta únicamente pedidos pendientes sin bodeguero y puede asignarlos a su usuario.
3. El bodeguero registra la verificación producto por producto. Un producto marcado como no encontrado requiere tipo y descripción de novedad; el pedido queda en `Novedad` y no se ofrece a Mensajería.
4. Administración revisa y registra una decisión para cada novedad. Resolver una novedad no afirma que el producto haya aparecido: Bodega debe verificar nuevamente el producto y guardar la preparación completa.
5. El pedido pasa a `Listo para despacho` solo cuando todos los productos están verificados y no quedan novedades de Bodega pendientes.
6. Mensajería consulta solo pedidos listos, no asignados y sin novedades bloqueantes. La asignación queda asociada al usuario autenticado.
7. El mensajero puede pasar de `Asignado` a `En camino`; después puede finalizar como `Entregado` solo si guardó evidencia fotográfica. Si falla la entrega, registra el motivo y el pedido queda en `Entrega fallida`; el mensajero asignado puede reintentar.
8. Una cancelación administrativa solo es posible antes de iniciar el recorrido. Los cambios relevantes quedan en `pedido_historial`.

`pedido_flujo.estado_preparacion` admite `Pendiente`, `Asignado`, `En preparación`, `Novedad` y `Listo para despacho`. `pedido_flujo.estado_entrega` admite `Pendiente`, `Asignado`, `En camino`, `Entrega fallida`, `Entregado` y `Cancelado`. El estado heredado de `entrega` conserva además el valor de envío para compatibilidad.

## Asignación, permisos y datos

- Las asignaciones se realizan con `UPDATE` condicional dentro de transacciones; una segunda solicitud concurrente no puede reclamar el mismo pedido.
- Bodega ve pedidos disponibles y los asignados a su propio usuario. Mensajería ve pedidos listos disponibles y sus entregas asignadas. Los identificadores del responsable siempre salen del JWT, no del cuerpo enviado por el navegador.
- Administración puede consultar y resolver novedades, y supervisar pedidos. El endpoint administrativo heredado ya no puede cambiar arbitrariamente a `En camino` o `Entregado`.
- Los detalles incluyen cantidades, talla y color procedentes de las relaciones actuales de `producto`, `talla` y `color`.
- La compra ya descuenta del inventario las unidades reservadas. El checklist de Bodega confirma físicamente el producto reservado; no vuelve a descontar stock ni asume que el stock remanente representa las unidades del pedido.
- Las fotografías JPEG, PNG o WebP de hasta 5 MB se almacenan en `backend/storage/assets/entregas`; la base guarda solo el nombre aleatorio. Su descarga requiere autorización y la asignación correspondiente.

## Tablas de flujo

Aplicar [MIGRACION_FLUJO_PEDIDOS.sql](./sql/MIGRACION_FLUJO_PEDIDOS.sql) agrega de forma incremental:

- `pedido_flujo`: responsables, estados y referencia de evidencia por factura.
- `pedido_preparacion_detalle`: checklist persistente de los productos y cantidades verificadas.
- `pedido_novedad`: reportes, decisiones y estado de atención.
- `pedido_historial`: usuario, evento, observación y fecha de cada cambio.

El script usa `CREATE TABLE IF NOT EXISTS` y conserva los estados existentes de `entrega`, añadiendo `Entrega fallida`. No elimina datos ni tablas. Antes de aplicarlo, confirmar que hay una copia de seguridad y que el esquema contiene las tablas `factura`, `entrega`, `detalle_pedido`, `producto` y `usuario`. Ejecutarlo una vez antes de desplegar la versión nueva; puede volver a ejecutarse con seguridad.

## Endpoints

Todos requieren JWT y se publican con prefijos `/api/v1` y `/`:

El proceso principal corre desde `backend/`; el servidor alternativo `API/` comparte las mismas rutas de pedidos y flujo para que el respaldo del frontend no tenga un comportamiento diferente.

| Método | Ruta | Rol | Uso |
|---|---|---|---|
| GET | `/bodega/pedidos/disponibles` | Bodeguero / Administrador | Pedidos pendientes sin asignar |
| GET | `/bodega/pedidos/mios` | Bodeguero | Pedidos asignados al usuario actual |
| POST | `/bodega/pedidos/:id/asignar` | Bodeguero | Asignación exclusiva |
| PUT | `/bodega/pedidos/:id/preparacion` | Bodeguero | Checklist y novedades de preparación |
| GET | `/mensajeria/pedidos/disponibles` | Mensajero | Pedidos listos sin mensajero |
| GET | `/mensajeria/mis-entregas` | Mensajero | Entregas propias, incluidas las finalizadas |
| POST | `/mensajeria/pedidos/:id/asignar` | Mensajero | Asignación exclusiva |
| PUT | `/mensajeria/pedidos/:id/estado` | Mensajero | `En camino`, `Entrega fallida` o `Entregado` con validaciones |
| POST / GET | `/mensajeria/pedidos/:id/evidencia` | Mensajero asignado / Administrador para lectura | Cargar o consultar evidencia |
| GET | `/admin/novedades/pedidos` | Administrador | Consultar novedades y decisiones |
| PUT | `/admin/novedades/pedidos/:id/resolver` | Administrador | Registrar la decisión y resolver |
| GET | `/pedidos` | Administrador | Consulta administrativa general |
| PUT | `/pedidos/:id/estado` | Administrador | Cancelar antes de iniciar recorrido |

## Verificación

Desde `backend`, ejecutar `npm test -- --coverage=false`. Desde `frontend`, ejecutar `npm run build`. La preparación se valida con pruebas unitarias; las asignaciones y transiciones dependen de MySQL y deben verificarse en una base de pruebas migrada.

Prueba manual: crear una compra con un usuario Cliente; asignarla con dos usuarios Bodeguero distintos y comprobar que solo el primero la obtiene; reportar una falta y resolverla como Administrador; volver a verificar todos los productos y marcarla lista; asignarla desde dos usuarios Mensajero; iniciar el recorrido, cargar una imagen y marcarla entregada. Comprobar que se rechaza `Entregado` sin evidencia, que los historiales se conservan al recargar y que los usuarios no pueden consultar entregas ajenas.

## Limitaciones operativas

- Las decisiones administrativas se conservan como texto y no desactivan productos ni modifican cantidades automáticamente. El cambio de inventario o de pedido debe ejecutarse mediante el procedimiento autorizado existente.
- La evidencia se almacena en el sistema de archivos del servidor; los despliegues con varias instancias deben montar un almacenamiento persistente compartido antes de distribuir tráfico.
- No se ejecutó una prueba integrada contra una instancia MySQL real en este cambio; las pruebas automatizadas no sustituyen la verificación transaccional y de concurrencia en una base controlada.
