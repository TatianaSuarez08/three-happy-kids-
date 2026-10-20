# 02. Arquitectura

## Visión general

El sistema está construido como un monorepo con tres módulos principales:

```text
frontend/          -> React + Vite
backend/           -> Express principal para negocio y acceso a MySQL
api/               -> Express backup redundante, misma lógica del backend
documentacion/     -> documentación técnica, SQL y guías operativas
```

## Flujo funcional

```text
Usuario -> Frontend (React) -> Cliente HTTP -> Backend principal (puerto 3000)
                                      \-> API backup (puerto 3001) si falla el principal
                                      -> MySQL (happykids)
```

## Frontend

La aplicación frontend usa React con Vite y la lógica HTTP central está en:

- `frontend/src/services/apiClient.js`
- `frontend/src/services/httpClient.js`
- `frontend/src/services/authService.js`

El cliente intenta múltiples URLs en orden:

1. `VITE_BACKEND_URL` (`http://localhost:3000` por defecto)
2. `VITE_API_BACKUP_URL` (`http://localhost:3001` por defecto)

La lógica real está en `apiClient.js`:

- agrega `Authorization: Bearer <token>` cuando existe sesión,
- agrega `Idempotency-Key` en mutaciones (`POST`, `PUT`, `PATCH`, `DELETE`),
- envia la petición a `/api/v1/...`,
- reintenta automatica y secuencialmente si la respuesta es `502`, `503` o `504`,
- y falla con un error general si ninguna instancia responde.

## Backend principal

El backend principal se inicia en `backend/index.js` y monta todas las rutas directamente sobre la raíz:

```js
app.use('/', userRoutes);
app.use('/', productRoutes);
app.use('/', orderRoutes);
...
```

La capa pública real es `/api/v1` en la instancia `api/`, pero la versión principal no aplica prefijo `/api/v1`; la expone en raíz. Esto es importante para la operación y para la documentación.

Incluye:

- CORS con `origin` desde `CORS_ORIGIN`
- `express.json()` y `express.urlencoded()`
- `morgan('dev')`
- middleware de idempotencia
- hosting de archivos estáticos para imágenes de productos y perfil
- validación de conexión a MySQL al arranque

## API redundante

La instancia `api/` es un clon funcional del backend principal. Se monta con prefijo:

```js
app.use('/api/v1', userRoutes);
app.use('/api/v1', productRoutes);
...
```

La API también usa:

- mismo middleware de autenticación,
- mismo middleware de idempotencia,
- same env file through root `.env`,
- y misma base de datos MySQL.

## Comunicación entre componentes

### Frontend -> Backend/API

- El frontend usa el cliente HTTP centralizado para todas las llamadas.
- Las peticiones autenticadas llevan JWT en `Authorization`.
- Las peticiones mutantes llevan `Idempotency-Key` para evitar reenvíos duplicados.

### Backend/API -> MySQL

- Ambas instancias usan `mysql2/promise` con un pool de conexiones.
- `backend/src/db.js` y `api/src/db.js` crean un pool con `waitForConnections`, `connectionLimit: 10` y `queueLimit: 0`.

## Redundancia y failover

La estrategia real documentada por el código es la siguiente:

1. El frontend intenta `VITE_BACKEND_URL`.
2. Si el backend responde con `502`, `503` o `504`, se intenta la siguiente URL.
3. Si no responde ninguna, se lanza un error final.
4. El backend y la API comparten misma lógica y base de datos.

Esto no es un balancer automático ni un sistema de replicación distribuida: es un failover manual en la capa cliente con dos instancias equivalentes del servicio.

## Riesgo de duplicación

La duplicación real que el proyecto intenta evitar es la reejecución de la misma operación mutante. La protección principal es el middleware `idempotencia.js`:

- se usa `Idempotency-Key` del header,
- se calcula un hash de la petición,
- se guarda la clave en la tabla `api_idempotency`,
- si la misma clave se reutiliza con un cuerpo distinto, responde `409`,
- si la solicitud anterior ya concluyó, devuelve la respuesta guardada,
- si todavía está en proceso, devuelve `409` con estado de procesamiento.

## Capas lógicas

La arquitectura se puede resumir así:

- Capa vista: React + rutas + componentes
- Capa cliente HTTP: `apiClient.js`
- Capa routing: Express routers por módulo
- Capa controladores: validaciones y lógica de negocio
- Capa modelo: consultas a MySQL
- Capa middleware: autenticación, permisos, upload, idempotencia
- Capa persistencia: MySQL + tablas relacionales

## Observación importante

La documentación debe distinguir claramente:

- Backend principal = instancia principal de negocio y servicio web
- API = instancia redundante / respaldo
- Frontend = cliente que alterna entre ambas instancias
- MySQL = almacenamiento real y único
