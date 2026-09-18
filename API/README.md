# API Gateway

Punto de entrada público entre el frontend y el Backend Service.

## Estructura

```text
API/
├── src/
│   ├── clients/       # Proxies hacia servicios internos
│   ├── config/        # Entorno y CORS
│   ├── middlewares/   # Seguridad, request ID y errores
│   ├── routes/        # Rutas públicas versionadas
│   ├── app.js         # Composición de Express, sin listen()
│   └── server.js      # Punto de arranque del proceso
├── .env.example
├── package.json
└── index.js           # Fachada de compatibilidad
```

## Configuración

- `GATEWAY_PORT`: puerto público, por defecto `3001`.
- `BACKEND_URL`: URL interna del Backend, por defecto `http://localhost:3000`.
- `USERS_SERVICE_URL`: servicio simulado de usuarios/autenticación, por defecto `http://localhost:4001`.
- `INTERNAL_API_KEY`: clave compartida con el Backend.
- `FRONTEND_ORIGINS`: orígenes permitidos separados por comas.
- `PROXY_TIMEOUT_MS`: timeout de comunicación interna.
- `NODE_ENV`: entorno de ejecución.

## Uso

El Gateway expone rutas versionadas bajo `/api/v1`:

- `GET /api/v1/health`: salud del Gateway.
- `GET /api/v1/users/health`: salud del Users Service mediante proxy.
- `/assets/*`: proxy hacia las imágenes servidas por Backend.
- `/api/v1/auth/*`: proxy al servicio `USERS_SERVICE_URL`.
- El resto de `/api/v1/*`: proxy al `BACKEND_URL` existente.

Por ejemplo, `POST /api/v1/auth/login` se entrega al servicio de usuarios como `POST /api/v1/auth/login`.

## Reglas

- No agregar consultas SQL ni reglas de negocio al Gateway.
- El Backend conserva la validación JWT y permisos definitivos.
- Las subidas multipart se reenvían sin analizar el cuerpo en el Gateway.
- El Frontend solo debe conocer la URL pública del Gateway.

## Puesta en marcha

```bash
cd API
npm install
copy .env.example .env
npm run dev
```

El servicio queda disponible en `http://localhost:3001`. Para probar el arranque sin servicios internos, consulta `GET /`; las rutas proxy requieren que el servicio correspondiente esté escuchando.
