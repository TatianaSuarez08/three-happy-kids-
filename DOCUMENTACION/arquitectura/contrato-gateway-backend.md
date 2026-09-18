# Contrato Gateway - Backend

## Flujo

```text
Frontend Client -> API Gateway:3001 -> Backend Service:3000 -> MySQL
                                      -> Users Service:4001
```

El Frontend usa únicamente la URL pública del Gateway y las rutas `/api/v1/*`. No conoce modelos, controladores internos ni credenciales de MySQL.

## Enrutamiento

- `/api/v1/users/*` se reenvía a `USERS_SERVICE_URL` y conserva el prefijo `/api/v1/users`.
- `/api/v1/auth/*` se reenvía a `USERS_SERVICE_URL` para compatibilidad.
- El resto de `/api/v1/*` se reenvía a `BACKEND_URL`.
- `/assets/*` se reenvía al almacenamiento público servido por Backend.

Se preservan método, query string, cuerpo, `Authorization`, `Content-Type` y respuestas.

## Seguridad interna

La Gateway añade `x-internal-api-key` cuando `INTERNAL_API_KEY` está configurada. Backend y Users Service validan la misma clave mediante comparación de tiempo constante. La autenticación JWT y los permisos definitivos pertenecen al servicio de dominio correspondiente.

## Errores

- `401` y `403`: decisión del servicio interno.
- `404`: ruta inexistente.
- `502`: servicio interno no disponible.
- `5xx`: error del servicio interno.

## Salud

- `GET /` comprueba que la Gateway esté levantada.
- `GET /api/v1/health` atraviesa la Gateway hacia el Backend.
- `GET /api/v1/users/health` comprueba el Users Service mediante la Gateway.
