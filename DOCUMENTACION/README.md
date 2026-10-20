# Documentación técnica de Three Happy Kids

## Estado de la documentación

Esta carpeta contiene la documentación técnica activa del sistema y la referencia histórica que se conservó por seguridad. La versión vigente está orientada a producción y se basó en el código real del proyecto.

## Documentación activa

1. [01_INTRODUCCION.md](01_INTRODUCCION.md)
2. [02_ARQUITECTURA.md](02_ARQUITECTURA.md)
3. [03_INSTALACION.md](03_INSTALACION.md)
4. [04_FRONTEND.md](04_FRONTEND.md)
5. [05_BACKEND.md](05_BACKEND.md)
6. [06_API.md](06_API.md)
7. [07_BASE_DE_DATOS.md](07_BASE_DE_DATOS.md)
8. [08_AUTENTICACION_Y_SEGURIDAD.md](08_AUTENTICACION_Y_SEGURIDAD.md)
9. [09_FUNCIONALIDADES.md](09_FUNCIONALIDADES.md)
10. [10_API_ENDPOINTS.md](10_API_ENDPOINTS.md)
11. [11_DESPLIEGUE.md](11_DESPLIEGUE.md)
12. [12_MANTENIMIENTO.md](12_MANTENIMIENTO.md)

## Documentación histórica conservada

Los archivos con nombres antiguos y numeración en formato legacy se dejaron en la carpeta como referencia técnica histórica y de diagnóstico. No reemplazan la documentación actual, pero no se eliminaron por ser útil para auditoría de cambios.

## Fuente de verdad

La documentación actual se sustentó en:

- `backend/index.js`
- `api/index.js`
- `backend/src/**`
- `api/src/**`
- `frontend/src/**`
- `documentacion/sql/DataBaseHappyKids_CORREGIDA.sql`
- `.env` raíz

## Convenciones

- El backend principal es la instancia de negocio principal.
- La API es la instancia redundante / de respaldo.
- El frontend intenta backend y API por orden configurable.
- La autenticación real es JWT con `Authorization: Bearer <token>`.
- La base de datos real es MySQL `happykids`.
- La prevención de duplicados se realiza con `Idempotency-Key` y `api_idempotency`.

## Nota de seguridad

No se documentan secretos reales ni valores privativos. Los ejemplos de variables sensibles usan placeholders seguros y deben sustituirse por valores del entorno de despliegue.
