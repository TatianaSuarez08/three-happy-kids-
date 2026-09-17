# Three Happy Kids

Monorepo del ecommerce Three Happy Kids.

## Requisitos

- Node.js 20+
- MySQL activo
- Base `happykids` creada desde `DOCUMENTACION/sql/DataBaseHappyKids_CORREGIDA.sql`

## Configuración universal

La configuración local real vive en la raíz del proyecto en [.env](.env). Este archivo se comparte con backend y frontend.

Variables principales:

```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_DATABASE=happykids
CORS_ORIGIN=http://localhost:5173
JWT_SECRET=three-happy-kids-dev-secret-2026-change-me
VITE_BACKEND_URL=http://localhost:3000
```

## Backend

```bash
cd Back-end
npm install
node index.js
```

La API quedará disponible en `http://localhost:3000/api/v1`; comprueba la salud de la BD con `GET /api/v1/health`.

## Frontend

En otra terminal:

```bash
cd Front-end
npm install
npm run dev
```

La app frontend consume el backend a través de la variable `VITE_BACKEND_URL` y usa la capa central definida en [API](API).

## Capa API

La integración está centralizada en la carpeta [API](API), con:

- [API/config/index.js](API/config/index.js)
- [API/services/apiClient.js](API/services/apiClient.js)
- [API/auth/auth.js](API/auth/auth.js)
- [API/index.js](API/index.js)

Esto evita repetir URLs, headers y manejo de errores por módulo.
