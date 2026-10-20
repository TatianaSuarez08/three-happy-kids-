# Migración de asignaciones de mensajería

La migración `sql/migrations/20261015_asignaciones_mensajeros.sql` agrega el estado logístico `Por recoger` y la tabla `asignacion_entrega`. No elimina ni reescribe pedidos existentes. Los pedidos antiguos permanecen en su estado actual hasta que Bodega confirma su preparación; no deben marcarse listos en bloque.

## Aplicación

1. Hacer una copia de seguridad de la base `happykids`.
2. Verificar que la base desplegada contiene `entrega` con la columna `estado` y que las tablas `usuario` y `entrega` usan InnoDB.
3. Confirmar MySQL 5.7.6 o posterior (se utiliza una columna generada almacenada para imponer una asignación activa única por entrega).
4. Revisar el SQL y ejecutarlo manualmente una sola vez contra la base de datos objetivo.
5. Verificar la nueva definición de `entrega.estado`, la tabla y sus índices/relaciones antes de desplegar el backend.

Las migraciones de asignaciones y evidencias se aplicaron manualmente a la base configurada el 2026-10-15, después de verificar las definiciones existentes. La comprobación posterior confirmó que las 15 filas de `entrega` conservaron sus IDs, facturas y estados. No se marcó ningún pedido como preparado ni se crearon asignaciones/evidencias de prueba. En otros entornos deben aplicarse manualmente, con copia de seguridad, en el mismo orden. Las instalaciones nuevas deben usar `sql/DataBaseHappyKids_CORREGIDA.sql`.

## Datos y reglas

- `entrega.estado = 'Pendiente'`: pedido aún no declarado preparado.
- `entrega.estado = 'Por recoger'`: Bodega confirmó preparación; es elegible para asignar.
- `En camino`, `Entregado` y `Cancelado` conservan los significados previos.
- Cada intento de asignación se conserva en `asignacion_entrega`. La columna generada y su índice único permiten como máximo una fila `Activa` por entrega; las operaciones de asignación también bloquean la fila `entrega` en transacción.
- La reasignación solo se permite antes de `En camino`. Se registra el motivo y el usuario administrador que la autorizó.
- `Entregado` solo se establece mediante la ruta de confirmación con evidencia de la migración `20261015_evidencias_entrega.sql`; la operación inserta evidencia, finaliza la asignación y actualiza la entrega en una transacción.

## Rutas incorporadas

Todas las rutas requieren JWT. Las operaciones de asignación y consulta individual comprueban el rol de mensajero; preparar pedidos requiere administrador o bodeguero; reasignar requiere administrador.

- `GET /entregas/disponibles`: entregas preparadas sin asignación activa.
- `POST /pedidos/:id/asignaciones`: asignar al mensajero del token actual; no acepta un id de mensajero en el body.
- `GET /mis-entregas`: pedidos con asignación activa del mensajero autenticado.
- `GET /pedidos/:id/asignaciones`: detalle e historial; administración o mensajeros con historial en ese pedido.
- `POST /pedidos/:id/reasignar`: requiere `mensajeroId` de destino y `motivo`; solo administración y solo antes de iniciar el trayecto.
- `POST /pedidos/:id/preparacion/iniciar`: iniciar o continuar el alistamiento; administrador o bodeguero.
- `PUT /pedidos/:id/preparacion`: Bodega envía `{ listo: true, observaciones }` para liberar el pedido o `{ listo: false, observaciones }` para dejar una incidencia visible a Administración. No requiere cantidades en el formulario. El formato previo con `productos` se conserva para clientes API existentes.
- `PUT /pedidos/:id/estado`: conserva las reglas de cancelación existentes y permite iniciar ruta desde `Por recoger` solo con asignación activa. Rechaza el estado `Entregado`; se requiere la ruta fotográfica.
- `POST /pedidos/:id/evidencias`: mensajero autenticado, campo multipart `evidencia`; valida JPEG/PNG/WebP por firma binaria, asignación activa y estado `En camino`.
- `GET /pedidos/:id/evidencias` y `GET /evidencias/:id/archivo`: metadatos y archivo con autorización del cliente propietario, mensajeros relacionados con el pedido y administración.

## Evidencias y validación final

La migración de evidencias `sql/migrations/20261015_evidencias_entrega.sql` se aplica después de esta migración. Crea `evidencia_entrega`, enlazada a `entrega`, la asignación exacta y el mensajero mediante claves foráneas; la ruta de archivo es única y hay índices para consulta por pedido y mensajero. Las evidencias son acumulativas y no se eliminan en una reasignación.

La validación del flujo del 2026-10-15 ejecutó `npm test` del backend: 21 pruebas aprobadas, 0 fallidas. También aprobaron el build frontend, ESLint focalizado en los archivos modificados, `node --check` de los archivos backend principales y `git diff --check`. ESLint global sigue mostrando dos diagnósticos en `Frontend/src/pages/publicas/Index.jsx:38` y `Frontend/src/pages/publicas/InicioSesion.jsx:58`, fuera de los archivos logísticos modificados.

La inspección de solo lectura confirmó MariaDB 10.4.32, las tablas `asignacion_entrega` y `evidencia_entrega`, sus índices y claves foráneas, y el índice único sobre la asignación activa. Las tablas de preparación e historial aún no existen en esa base; las migraciones `20261015_preparacion_pedidos.sql` y `20261015_historial_operaciones_pedido.sql` siguen pendientes. No se ejecutaron escrituras de flujo ni pruebas de concurrencia SQL. La validación final de extremo a extremo requiere aplicar esas migraciones en un entorno autorizado y probar con registros controlados.

## Reversión

No hay una reversión automática segura después de registrar asignaciones: eliminar la tabla perdería el historial y retirar `Por recoger` fallaría si hay entregas en ese estado. Antes de revertir, exportar el historial, resolver todas las asignaciones activas y transformar cualquier `Por recoger` según una decisión de negocio aprobada. Ejecutar una reversión manual únicamente tras respaldo y revisión de los datos; no borrar la tabla de historial como parte de un rollback ordinario.
