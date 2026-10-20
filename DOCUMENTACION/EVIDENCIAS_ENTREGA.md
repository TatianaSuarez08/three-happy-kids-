# Evidencias fotográficas de entrega

## Almacenamiento y configuración

El directorio predeterminado es `Frontend/src/assets/entregas/`, junto a las imágenes de productos y perfiles. El backend lo crea si hace falta. En despliegue, configura `DELIVERY_IMAGES_DIR` para apuntar a un directorio persistente montado fuera de los artefactos que se reemplazan al compilar o desplegar. Ese directorio debe estar disponible para el proceso Node.js y respaldarse según la política de datos del despliegue. No se sirve como contenido estático.

El límite del servidor es de 5 MiB de forma predeterminada. Puede cambiarse mediante `DELIVERY_IMAGE_MAX_BYTES` (entero entre 1024 y 20971520). El límite de tamaño del servidor es autoritativo.
Si se cambia ese límite, define también el mismo valor en `VITE_DELIVERY_IMAGE_MAX_BYTES` al compilar el frontend para que la validación previa y el mensaje del formulario coincidan; el backend sigue siendo la autoridad.

## Migración

Las migraciones `DOCUMENTACION/sql/migrations/20261015_asignaciones_mensajeros.sql` y `DOCUMENTACION/sql/migrations/20261015_evidencias_entrega.sql` se aplicaron manualmente a la base configurada el 2026-10-15, tras verificar las tablas existentes. Las 15 entregas existentes mantuvieron sus IDs, facturas y estados; no se actualizaron estados de pedido. Para cualquier otro entorno, hacer primero una copia de seguridad y aplicar ambos SQL en ese orden. No se ejecutan migraciones al iniciar la aplicación. Las instrucciones de reversión están comentadas al final del SQL; no deben usarse si hay datos que conservar.

El esquema para instalaciones nuevas incluye `evidencia_entrega` en `DOCUMENTACION/sql/DataBaseHappyKids_CORREGIDA.sql`.

## Confirmación y acceso

`POST /pedidos/:id/evidencias` recibe un único campo multipart `evidencia`. Acepta JPEG, PNG y WebP, los identifica por su firma binaria y genera un nombre UUID exclusivo. Se requiere una asignación activa del usuario autenticado y que el pedido esté `En camino`. Evidencia, estado `Entregado` y finalización de asignación se registran en la misma transacción MySQL. Si la transacción falla antes de iniciar el commit, se elimina solo el archivo recién creado; ante un resultado de commit incierto, el archivo se conserva para evitar dejar una referencia confirmada sin su imagen.

`GET /pedidos/:id/evidencias` devuelve metadatos; `GET /evidencias/:id/archivo` sirve la imagen con autorización. Pueden consultar el cliente propietario, los mensajeros vinculados al historial de asignaciones y administración. No se publica una URL estática de acceso anónimo.

## Validación de la fase 5

En la validación del flujo completo del 2026-10-15, `npm test` del backend aprobó 21 pruebas (0 fallidas), incluyendo transiciones, permisos, alistamiento y validación binaria de evidencias. El build de producción y ESLint focalizado para los archivos modificados del flujo aprobaron. `git diff --check` y `node --check` en los archivos backend principales también aprobaron.

El lint global de Frontend no aprueba por dos diagnósticos en `src/pages/publicas/Index.jsx:38` y `src/pages/publicas/InicioSesion.jsx:58`, ambos sobre llamadas a `setState` dentro de un efecto. El lint focalizado del flujo sí aprobó. Esos archivos son ajenos a los cambios logísticos y no se modificaron.

La inspección de solo lectura confirmó MariaDB 10.4.32, `asignacion_entrega`, `evidencia_entrega`, las relaciones correspondientes, y el índice único sobre la asignación activa. El estado enum de entrega incluye `Por recoger`. En esta comprobación también se confirmó que faltan las tablas `alistamiento_pedido`, `detalle_alistamiento_pedido` y `pedido_historial_operacion`; sus migraciones están pendientes y el flujo persistente completo todavía no puede ejecutarse contra esa base.

La consulta encontró dos entregas en `Pendiente`, dos en `En camino`, once en `Entregado`, ninguna en `Por recoger` y ninguna asignación activa. No se marcaron pedidos como preparados ni se crearon datos de prueba. Por ello Mensajería no tiene actualmente pedidos disponibles. No se verificaron las transacciones de preparación, concurrencia SQL, autorización HTTP con JWT real, persistencia tras reiniciar el servidor ni navegación visual en navegador. Las tres primeras requieren aplicar las migraciones pendientes en una base autorizada; la persistencia de imágenes requiere validar el volumen persistente del despliegue.
