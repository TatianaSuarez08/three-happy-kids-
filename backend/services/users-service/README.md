# Users Service

Servicio independiente para usuarios y autenticacion. En esta primera fase expone un endpoint de salud y deja separadas las capas para incorporar registro, login y persistencia sin mezclar responsabilidades.

## Estructura

```text
backend/services/users-service/
├── src/
│   ├── config/env.js
│   ├── controllers/health.controller.js
│   ├── middlewares/internal-auth.js
│   ├── repositories/health.repository.js
│   ├── routes/user.routes.js
│   ├── services/health.service.js
│   ├── app.js
│   └── server.js
├── .env.example
└── package.json
```

## Variables

- `USERS_SERVICE_PORT`: puerto local del servicio, por defecto `4001`.
- `INTERNAL_API_KEY`: debe coincidir con la clave configurada en la Gateway.
- `NODE_ENV`: entorno de ejecución.

## Ejecución

```powershell
cd backend/services/users-service
npm install
copy .env.example .env
npm run dev
```

Endpoint directo:

```text
GET http://localhost:4001/api/v1/users/health
```

Endpoint mediante Gateway:

```text
GET http://localhost:3001/api/v1/users/health
```
