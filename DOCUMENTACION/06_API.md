# 6. Comunicación HTTP y servicio API

## Cliente HTTP del frontend

La mayoría de las solicitudes de `frontend/src/services/` pasan por `apiClient.js`. El cliente añade `/api/v1` al path, envía JSON cuando corresponde y adjunta `Authorization: Bearer <token>` si encuentra un token en el almacenamiento del navegador. Para `POST`, `PUT`, `PATCH` y `DELETE` agrega `Idempotency-Key` (usa una clave proporcionada por el servicio o genera una UUID).

La lista de base URLs es:

1. `VITE_BACKEND_URL`, por defecto `http://localhost:3000`.
2. `VITE_API_BACKUP_URL`, por defecto `http://localhost:3001`.

El cliente prueba las URLs en ese orden. Continúa ante error de red, timeout de 20 segundos o HTTP 502, 503 o 504. En cambio, un 4xx, 404 o un HTTP distinto a esos estados se convierte en error y no dispara otro intento. Por tanto, tener dos URLs configuradas no garantiza disponibilidad equivalente.

La consulta binaria de evidencia de entrega es una excepción: `pedidoService.js` usa `fetch` directamente y adjunta el token en su propia lógica.

## Servicios Express

### `backend/` — principal

`backend/index.js` monta las rutas del sistema en `/api/v1` y también en la raíz sin prefijo. El frontend utiliza la versión `/api/v1`; las rutas sin prefijo permanecen registradas por compatibilidad. Predeterminado: puerto `3000`.

### `API/` — instancia adicional

`API/index.js` registra rutas solo bajo `/api/v1` y predetermina el puerto `3001`. Comparte modelos y partes del flujo con el backend, pero no todas las rutas están presentes. En particular, faltan `GET /tipos-documento` y las rutas de actividad/reportes y compras/recepción que `backend/src/routes/InventarioRoute.js` sí registra. La carga de página de registro y algunos flujos de bodega pueden fallar si solo responde esta instancia.

La aplicación de frontend puede intentar `API/` después de un error de transporte o de los estados transitorios indicados, pero la falta de una ruta devuelve 404, que no activa fallback. No describas `API/` como réplica completa ni como balanceador.

## Contrato de solicitudes

Los paths, métodos, guardas y operaciones principales están enumerados en [Referencia de endpoints](10_API_ENDPOINTS.md). El contrato base es JSON; las subidas usan `multipart/form-data` (`foto`, `imagen` o `evidencia`, según la ruta). Las respuestas de error contienen un campo `error` o `message` según controlador.

## Idempotencia

El middleware del backend considera métodos mutantes solo cuando incluyen `Idempotency-Key`. Guarda hash y respuesta en `api_idempotency` para permitir replay de una solicitud completada y detectar una clave reutilizada con otra solicitud. Si la llamada no incluye la cabecera, el middleware continúa sin persistir una clave. La tabla también está declarada en el DDL y se asegura al iniciar el servicio.

## CORS y archivos

Los servicios leen `CORS_ORIGIN`; el backend permite los encabezados de contenido, autorización e idempotencia. Express publica imágenes bajo `/assets/productos` y `/assets/foto_de_perfil`; las rutas de evidencia se atienden mediante endpoints autenticados. Las rutas de disco se configuran en `subidaImagen.js`.

## Pruebas de caja negra

Cypress verifica vistas y algunos flujos de UI sobre el frontend en `localhost:5173`. Las pruebas interceptan llamadas `/api/v1` y no comprueban la integración real con MySQL; las suites de backend/API son pruebas separadas. Consulta [pruebas y mantenimiento](12_MANTENIMIENTO.md).
