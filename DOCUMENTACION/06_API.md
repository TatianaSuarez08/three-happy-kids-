# 06. API

## Función de la API

La carpeta `api/` contiene una instancia de Express que funciona como respaldo o réplica funcional del backend principal. Su función real no es ser un servicio adicional con lógica distinta; es mantener la misma capa de negocio y la misma base de datos disponible para continuidad del servicio.

## Diferencia con el backend

### Backend principal

- archivo principal: `backend/index.js`
- monta rutas directamente en la raíz
- usa `PORT` para escuchar
- no usa `/api/v1` en la raíz

### API redundante

- archivo principal: `api/index.js`
- monta rutas con prefijo `/api/v1`
- usa `API_PORT` para escuchar
- sirve como instancia alternativa del mismo servicio

## Estructura real

```text
api/src/
├── config/
├── controllers/
├── middleware/
├── models/
├── routes/
├── utils/
├── db.js
```

La estructura es virtualmente equivalente a la del backend.

## Comportamiento de failover

El frontend no elige aleatoriamente una instancia. El cliente HTTP real en `frontend/src/services/apiClient.js` usa una lista de URLs:

```js
const API_BASE_URLS = [
  import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000',
  import.meta.env.VITE_API_BACKUP_URL || 'http://localhost:3001'
];
```

Lógica real:

1. intenta la primera URL,
2. si falla por `502`, `503` o `504`, continúa con la siguiente,
3. si ninguna responde, lanza el error final.

Esto da continuidad frente a fallas de un nodo, pero no distribuye la carga ni hace "replicación transaccional" automática.

## Seguridad y endpoints

La API usa los mismos mecanismos de seguridad del backend:

- JWT en `Authorization: Bearer <token>`
- validación de permisos por rol
- `Idempotency-Key` para mutaciones
- CORS con `CORS_ORIGIN`

## Rutas montadas en la API

La API monta rutas con el prefijo `/api/v1`, por ejemplo:

- `/api/v1/registro`
- `/api/v1/login`
- `/api/v1/me`
- `/api/v1/productos`
- `/api/v1/pedidos`
- `/api/v1/carrito`
- `/api/v1/favoritos`
- `/api/v1/dashboard`
- `/api/v1/health`

## Redundancia real del sistema

La redundancia es de servicio, no de base de datos.

Ambas instancias apuntan a la misma MySQL `happykids` y usan la misma lógica de negocio. Si el backend falla, la API puede seguir atendiendo la mayor parte del sistema mientras el frontend la utiliza como respaldo.

## Idempotencia en la API

El middleware `idempotencia.js` se usa además en la API con la misma lógica que en backend. Esto evita situaciones como:

- dobles clic repetidos,
- reintentos de red,
- y reenvío accidental del mismo POST/PUT/DELETE.

## Mecanismo real para evitar duplicaciones

Se guarda en `api_idempotency`:

- la clave enviada por `Idempotency-Key`,
- un hash de la solicitud,
- y la respuesta final.

Si la misma clave se reutiliza con otra solicitud diferente, devuelve `409`.

## Consideraciones de operación

- la API no reemplaza la base de datos ni la lógica de negocio,
- la API no crea un segundo sistema inconsistente: ambos usan la misma base de datos,
- la elección activa se hace en el frontend según disponibilidad,
- la práctica de producción debe mantener ambas instancias sincronizadas en código y dependencias.

## Observación crítica

El proyecto implementa failover de servicio y no balanceo de carga. La documentación debe describirlo exactamente así: dos instancias equivalentes, mismo esquema de negocio, misma base de datos, decisión de ruta en el cliente.
