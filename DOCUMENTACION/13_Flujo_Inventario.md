# 13. Flujo de inventario y preparación de pedidos

## Estructura verificada

- `inventario` mantiene la cantidad disponible y mínima por producto.
- `inventario_movimiento` registra entradas y salidas, su delta, motivo, referencia, usuario y fecha.
- Al crear un pedido, `PedidoModel.createOrder` bloquea y valida las filas de inventario, descuenta las cantidades y registra una salida con motivo `Venta de pedido`, todo en una transacción.
- El alistamiento no reserva ni descuenta stock otra vez. La existencia mostrada en Bodega ya incluye la salida al crear la compra; el bodeguero verifica físicamente las unidades que prepara.

## Flujo de Bodega

1. `GET /pedidos/preparacion` lista pedidos con factura `Pendiente` o `Pagada` y entrega `Pendiente`. Las anulaciones y otros estados de entrega no entran en la lista. El estado distingue pedidos pendientes, seleccionados, en preparación e incidencias.
2. En `/bodeguero/pedidos`, el bodeguero elige un pedido disponible. `POST /pedidos/:id/preparacion/iniciar` registra la selección y `PreparacionIniciada`; una asignación activa en `asignacion_preparacion` impide que otro bodeguero seleccione simultáneamente el mismo pedido. La selección propia permanece visible en “Mis pedidos por preparar” y las de otros bodegueros en “Pedidos ocupados”.
3. La lista de productos muestra nombres, variantes y cantidades pedidas; no solicita captura manual de cantidades. El bodeguero marca cada producto como encontrado o registra para cada faltante un tipo y una descripción dirigidos a Administración.
4. `PUT /pedidos/:id/preparacion` solo acepta pedidos cuya preparación fue iniciada por el bodeguero autenticado. Envía un checklist completo en `productos`; el backend comprueba que sus identificadores coincidan exactamente con las líneas del pedido. Si todas las casillas están marcadas, guarda la cantidad pedida como cantidad verificada. Si hay faltantes, guarda cero como cantidad verificada y crea una fila detallada por producto en `novedad_bodega`; no se descuenta inventario.
5. Un reporte incompleto conserva la entrega como `Pendiente`, mantiene activa la selección de Bodega y registra `AlistamientoIncompleto`. El reporte queda disponible en `/admin/novedades-bodega` y en `GET /bodega/novedades` para Administración; el bodeguero consulta sus propios reportes y las respuestas desde su pedido. La incidencia continúa visible aunque Administración agregue una respuesta. No hay envío por correo ni notificación push implementados.
6. Administración puede marcar la novedad `En revisión`, `Rechazado` o `Resuelto` y agregar una respuesta. Solo `Resuelto` desbloquea la liberación; un pedido con cualquier novedad pendiente, en revisión o rechazada no puede pasar a Envío. La asignación activa sigue siendo propiedad del bodeguero que seleccionó el pedido, que puede retomarlo tras recibir instrucciones.
7. Un intento completo solo libera el pedido si todas las novedades anteriores están `Resuelto`. Actualiza la entrega a `Por recoger` y, dentro de la misma transacción, registra `AlistamientoCompleto` y `PedidoLiberado`; finaliza la asignación de Bodega. Fecha y usuario responsable se conservan en `alistamiento_pedido` y `pedido_historial_operacion`.
8. `/bodeguero/envio` y `GET /pedidos/envio` consultan pedidos con alistamiento completo y entrega `Por recoger`, `En camino` o `Entregado`. La vista muestra resumen, fecha, responsable y observaciones del último intento completo; mantiene pedidos asignados, en camino y entregados visibles para seguimiento.
9. `GET /entregas/disponibles` y la operación de asignación exigen el mismo alistamiento completo y estado `Por recoger`. La lista excluye pedidos con asignación activa. Asignaciones, reasignaciones, cambios logísticos y confirmación de entrega también escriben eventos en `pedido_historial_operacion`. La asignación no altera el estado de entrega; el mensajero lo pasa a `En camino` al iniciar el recorrido.

La equivalencia actual es: `Pendiente` = pendiente de preparación, `En preparación` o `Incidencia` (se derivan del historial de operaciones); `Por recoger` = listo para envío o asignado según exista una asignación activa; `En camino` y `Entregado` corresponden a las etapas gestionadas por Mensajería. Administración y Cliente ven el mismo estado derivado de preparación en su consulta general; el campo logístico original `estadoEntrega` conserva `Pendiente` mientras se alista. Bodega solo completa el alistamiento y no cambia la entrega a `Entregado`.

La interfaz deriva `En preparación` de un evento persistido, y distingue ese estado, pedidos pendientes, incidencias, pedidos listos y asignados. No se crea una lista en memoria como fuente de verdad. `estadoFactura` conserva su significado de facturación y `estadoEntrega` el de logística; la preparación no duplica esos estados en otra columna.

Las rutas de inicio, registro de alistamiento, consulta de pedidos de preparación y consulta de envío están protegidas para `bodeguero` y `administrador`. `GET /bodega/novedades` filtra por bodeguero autenticado y entrega toda la lista a Administración; `PATCH /bodega/novedades/:id` solo permite responder a Administración. Bodega no está autorizada para asignar, reasignar o confirmar entregas; estas operaciones tienen protecciones de rol en rutas y comprobaciones de estado/asignación en el backend. Administración conserva lectura y supervisión. `GET /mis-pedidos` sigue filtrando por el usuario autenticado y la clave del cliente.

## Historial de operaciones

`alistamiento_pedido` conserva intentos y cantidades verificadas; `asignacion_preparacion` conserva quién seleccionó cada pedido y cuándo finalizó; `novedad_bodega` guarda producto, tipo, descripción, estado y la respuesta de Administración. `asignacion_entrega` conserva el historial de asignaciones a Mensajería. La tabla `pedido_historial_operacion` reúne entrega, operación, estado anterior/nuevo, usuario, fecha/hora y observaciones. Registra pedido creado, inicio, resultado del alistamiento, liberación, respuesta a novedad, asignación, reasignación, cancelación, cambios de estado y entrega confirmada. `GET /pedidos/:id/operaciones` está disponible para Administración y Bodega. Los eventos nuevos empiezan a registrarse al desplegar el backend y aplicar las migraciones; no se inventan eventos históricos para operaciones anteriores.

## Esquema y despliegue

Las migraciones incrementales de asignaciones y evidencias se aplicaron a la base configurada el 2026-10-15. La inspección de solo lectura de esa fecha confirmó que existen `asignacion_entrega` y `evidencia_entrega`, y que `entrega.estado` incluye `Por recoger`. También confirmó una columna generada con índice único para permitir como máximo una asignación activa por entrega, además de las relaciones entre asignaciones, evidencias, entregas y usuarios.

Las migraciones [`20261015_preparacion_pedidos.sql`](./sql/migrations/20261015_preparacion_pedidos.sql), [`20261015_historial_operaciones_pedido.sql`](./sql/migrations/20261015_historial_operaciones_pedido.sql) y [`20261015_bodega_seleccion_novedades.sql`](./sql/migrations/20261015_bodega_seleccion_novedades.sql) están preparadas pero **no aplicadas** en esa base: en la inspección no existían las tablas de preparación e historial, y la migración de selección y novedades todavía no se había aplicado. Los endpoints que dependen de esas tablas no se pueden considerar operativos contra ese esquema hasta aplicar todas las migraciones.

Para una base que ya tenga asignaciones y evidencias, respalda la base y ejecuta desde la raíz del repositorio, en este orden:

1. `mysql -u <usuario> -p happykids < DOCUMENTACION/sql/migrations/20261015_preparacion_pedidos.sql`
2. `mysql -u <usuario> -p happykids < DOCUMENTACION/sql/migrations/20261015_historial_operaciones_pedido.sql`
3. `mysql -u <usuario> -p happykids < DOCUMENTACION/sql/migrations/20261015_bodega_seleccion_novedades.sql`

Para una instalación nueva, el orden de las cinco migraciones es: `20261015_asignaciones_mensajeros.sql`, `20261015_evidencias_entrega.sql`, `20261015_preparacion_pedidos.sql`, `20261015_historial_operaciones_pedido.sql` y `20261015_bodega_seleccion_novedades.sql`. Confirmar la existencia de las tablas, índices y claves foráneas antes de desplegar el backend. No ejecutar los bloques de reversión en instalaciones con historial que deba conservarse.

El esquema completo para instalaciones nuevas incluye las tablas correspondientes en [`DataBaseHappyKids_CORREGIDA.sql`](./sql/DataBaseHappyKids_CORREGIDA.sql).

El DDL incluye también las tablas de selección exclusiva, novedades, preparación, asignaciones, evidencias e historial para una base nueva. Los ejemplos de esas tablas están en [`dml.sql`](./sql/dml.sql): incluye pedidos listos, pedidos asignados/en camino y un intento incompleto con detalle verificado, selección activa y novedad pendiente de respuesta. Ejecutar el DML únicamente después del DDL y sobre una base vacía; no usarlo para actualizar una base existente. No se siembran metadatos de evidencia sin una imagen real en el almacenamiento.

## Límites conocidos

- El flujo actual crea la factura como `Pendiente` y registra una fila de pago, pero no acredita que el pago haya sido confirmado. Por compatibilidad con ese proceso, Bodega acepta facturas `Pendiente` o `Pagada`; no se ha añadido una condición de pago nueva.
- El stock es descontado durante la compra. La preparación registra cantidades verificadas y faltantes, pero no altera stock ni corrige pedidos con movimientos históricos incompletos.
- Los pedidos existentes con entrega `Pendiente` requieren que Bodega registre un alistamiento completo para ser visibles en Mensajería.

## Validación final (2026-10-15)

- `Backend/npm test`: 21 pruebas aprobadas, 0 fallidas. Incluyen validación de alistamientos, transiciones, reglas de roles, firmas de imágenes y servicio de almacenamiento; no ejecutan las transacciones de este flujo contra MariaDB.
- `Frontend/npm run build`: aprobado.
- ESLint focalizado en las pantallas y servicios modificados del flujo: aprobado.
- ESLint global: no aprobado por dos diagnósticos en `src/pages/publicas/Index.jsx:38` y `src/pages/publicas/InicioSesion.jsx:58`, ambos por llamadas a `setState` dentro de un efecto. Son archivos fuera del flujo modificado y no se cambiaron.
- `node --check` en los archivos backend principales y `git diff --check`: aprobados.
- Inspección SQL de solo lectura: MariaDB 10.4.32; las tablas base revisadas usan InnoDB; existen las tablas de asignación y evidencia con sus FK e índice único para la asignación activa. No existen todavía las tablas de alistamiento e historial.
- La base consultada contiene 2 entregas `Pendiente`, 2 `En camino` y 11 `Entregado`; no hay entregas `Por recoger` ni asignaciones activas. No se crearon pedidos ni se escribieron datos de prueba.

Por no estar aplicadas las migraciones de preparación e historial, no se pudo comprobar en SQL el flujo integral, la persistencia de eventos ni la concurrencia entre solicitudes. No se aplicaron migraciones ni se alteraron datos durante esta validación. Antes de habilitar el flujo, aplicar las dos migraciones pendientes en una base autorizada y probar allí preparación, faltantes, liberación, asignación concurrente y seguimiento de extremo a extremo.
