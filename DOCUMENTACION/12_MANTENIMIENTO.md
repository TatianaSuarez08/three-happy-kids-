# 12. Mantenimiento

## Objetivo

Este documento define la forma real de mantener la aplicación en operación y revisar su salud técnica.

## Revisión regular

### 1. Salud de base de datos

La comprobación real del sistema es:

```http
GET /health
```

Si falla, el problema más probable es una conexión MySQL o un problema de `DB_HOST`, `DB_USER`, `DB_PASSWORD` o `DB_DATABASE`.

### 2. Salud de backend y API

Se debe revisar:

- arranque del proceso,
- logs de Express,
- puertos específicos,
- y estado de los workers o procesos del servicio.

### 3. Estado de sesión y JWT

Se deben revisar:

- expiración de tokens,
- fechas de sesión en cliente,
- y fallos en `Authorization`.

## Actualización de dependencias

Cuando se actualicen dependencias:

- revisar `package.json` de backend, api y frontend,
- probar instalación limpia,
- validar que el arranque no falle,
- y ejecutar pruebas o smoke tests manuales de rutas importantes.

## Cómo agregar funcionalidad

El patrón real del proyecto es:

1. añadir o ajustar la ruta en `src/routes/`
2. añadir o ajustar el controlador en `src/controllers/`
3. implementar la lógica en `src/models/`
4. validar permisos con `permitRoles()` si aplica
5. verificar la respuesta JSON y casos de error
6. confirmar que la base de datos soporta la operación

## Cómo gestionar imágenes

Las rutas de almacenamiento actuales son:

- productos: `backend/storage/assets/productos`
- perfiles: `backend/storage/assets/foto_de_perfil`

La API usa la carpeta equivalente bajo `api/storage/assets/...`.

## Backups de base de datos

El proyecto no incluye un sistema automático de copia de seguridad en el código revisado. Para mantenimiento real, debe implementarse estrategia operativa externa con:

- copia diaria o por cambio,
- retención temporal,
- restauración validada,
- y pruebas de recuperación.

## Cómo revisar errores

Se deben observar:

- logs de Node.js,
- errores de `502`/`503`/`504` en el cliente,
- y mensajes de MySQL en backend/API.

## Consideraciones de seguridad

Mantenimiento mínimo recomendado:

- rotar `JWT_SECRET` de forma controlada,
- mantener `DB_PASSWORD` fuera de repositorios,
- revisar acceso a rutas administrativas,
- mantener `CORS_ORIGIN` en valores permitidos,
- y no permitir archivos con extensiones no permitidas.

## Mantenimiento de idempotencia

La tabla `api_idempotency` puede crecer con registros. Debe revisarse periódicamente para:

- identificar claves antiguas,
- mantener limpieza si la operación lo requiere,
- y evitar su uso descontrolado por reintentos repetidos.

## Recomendación para producción

Para un despliegue serio, se recomienda:

- observabilidad de backend y API,
- monitoreo del puertos y health checks,
- revisión de logs de error,
- backup de MySQL,
- y documentación de procedimientos de despliegue y rollback.

## Mantenimiento preventivo

Se debe revisar periódicamente:

- stock mínimo vs stock disponible,
- pedidos con estado pendiente,
- usuarios inactivos,
- productos con imagen ausente,
- actualizaciones de permisos y roles,
- y consistencia de datos en `factura`, `entrega`, `pago` e `inventario`.
