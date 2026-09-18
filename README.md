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
GATEWAY_PORT=3001
BACKEND_URL=http://localhost:3000
USERS_SERVICE_URL=http://localhost:4001
USERS_SERVICE_PORT=4001
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_DATABASE=happykids
CORS_ORIGIN=http://localhost:5173
FRONTEND_ORIGINS=http://localhost:5173
INTERNAL_API_KEY=replace-with-a-long-random-value
JWT_SECRET=three-happy-kids-dev-secret-2026-change-me
VITE_API_URL=http://localhost:3001
```

## Backend

```bash
cd backend
npm install
npm start
```

El Backend interno escucha en `http://localhost:3000`. La entrada pública es el Gateway.

## API Gateway

En otra terminal:

```bash
cd api
npm install
npm start
```

El Gateway queda disponible en `http://localhost:3001/api/v1` y reenvía las solicitudes al Backend. Comprueba la salud mediante `GET http://localhost:3001/api/v1/health`.

## Users Service

En otra terminal:

```bash
cd backend/services/users-service
npm install
npm start
```

El servicio escucha en `http://localhost:4001`. Su endpoint público a través de la Gateway es `GET http://localhost:3001/api/v1/users/health`.

## Frontend

En otra terminal:

```bash
cd frontend
npm install
npm run dev
```

La app frontend consume únicamente el Gateway mediante `VITE_API_URL`. El cliente HTTP central está en `frontend/src/services/`.
