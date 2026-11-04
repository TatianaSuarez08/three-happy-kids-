# Inicio y configuración

## Requisitos

- Node.js instalado.
- MySQL funcionando.
- Base de datos `happykids` creada.

## Instalar dependencias

```bash
cd backend
npm install

cd ../frontend
npm install
```

## Variables de entorno

Desde la raíz del repositorio, copia `.env.example` a `.env` y edítalo:

```powershell
Copy-Item .env.example .env
```

Configura `DB_PASSWORD` con la contraseña de MySQL si el usuario la tiene. Reemplaza también el valor de ejemplo de `JWT_SECRET` por una clave aleatoria; nunca publiques `.env`.

El archivo raíz es compartido por `backend`, `API` y frontend. Los servicios backend pueden usar sus `.env` locales si el archivo compartido no define alguna variable. El frontend usa `VITE_BACKEND_URL` y `VITE_API_BACKUP_URL`; sus valores predeterminados son `http://localhost:3000` y `http://localhost:3001`.

## Ejecutar

Terminal 1:

```bash
cd backend
npm run dev
```

Terminal 2:

```bash
cd frontend
npm run dev
```

URLs de desarrollo:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000`
- Login: `http://localhost:5173/login`

## Comprobación

El frontend se valida con:

```bash
cd frontend
npm.cmd run build
```

El backend puede comprobar sus imports con:

```bash
cd backend
npm test
```

## Archivos principales

- `backend/index.js`: servidor Express, CORS y rutas.
- `backend/src/db.js`: conexión MySQL mediante `mysql2`.
- `frontend/src/App.jsx`: rutas de React.
- `frontend/src/Componentes/Nav.jsx`: navegación según rol.
