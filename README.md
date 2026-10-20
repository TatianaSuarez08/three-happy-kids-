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
API_PORT=3001
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_DATABASE=happykids
CORS_ORIGIN=http://localhost:5173
JWT_SECRET=three-happy-kids-dev-secret-2026-change-me
VITE_BACKEND_URL=http://localhost:3000
```

## Inicio automático en VS Code

Al abrir la carpeta del proyecto en VS Code se inician automáticamente el frontend, el backend y `API`. La primera vez, VS Code puede pedir permiso para ejecutar las tareas automáticas; acepta la solicitud.

Instala primero las dependencias de los tres servicios desde la raíz:

```bash
npm run install:all
```

El backend usa el puerto `3000` y es el servidor al que se conecta el frontend. `API` usa el puerto `3001` para evitar conflictos. Ambos requieren las variables de base de datos y `JWT_SECRET` configuradas en el `.env` raíz, además de MySQL activo.

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
