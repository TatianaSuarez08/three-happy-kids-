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

Edita `backend/.env`:

```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_DATABASE=happykids
CORS_ORIGIN=http://localhost:5173
JWT_SECRET=change_this_secret_in_production
NODE_ENV=development
```

`DB_PASSWORD` debe contener la contraseña de MySQL si el usuario la tiene. `JWT_SECRET` debe cambiarse por una clave privada antes de publicar el sistema.

El frontend usa `VITE_BACKEND_URL` si existe; de lo contrario utiliza `http://localhost:3000`.

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
node src/tmp_import_check.mjs
```

## Archivos principales

- `backend/index.js`: servidor Express, CORS y rutas.
- `backend/src/db.js`: conexión MySQL mediante `mysql2`.
- `frontend/src/App.jsx`: rutas de React.
- `frontend/src/Componentes/Nav.jsx`: navegación según rol.
