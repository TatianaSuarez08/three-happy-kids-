# Three Happy Kids

Monorepo del ecommerce Three Happy Kids.

## Requisitos

- Node.js 20+
- MySQL activo
- Base `happykids` creada desde `documentacion/sql/DataBaseHappyKids_CORREGIDA.sql`

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
cd backend
npm install
npm start
```

El Backend escucha en `http://localhost:3000` y expone directamente las rutas `/api/v1`.

## Frontend

En otra terminal:

```bash
cd frontend
npm install
npm run dev
```

La app frontend consume directamente el Backend mediante `VITE_BACKEND_URL`. El cliente HTTP central está en `frontend/src/services/`.
