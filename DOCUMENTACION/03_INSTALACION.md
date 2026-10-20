# 03. Instalación y configuración

## Requisitos previos

### Software

- Node.js 20 o superior
- npm
- MySQL 8.x o compatible
- acceso a un entorno de desarrollo para crear la base de datos

### Repositorio

El proyecto se entrega como monorepo con estas carpetas relevantes:

- `backend/`
- `api/`
- `frontend/`
- `documentacion/`
- `.env` en la raíz del proyecto

## Variables de entorno

La configuración local real vive en la raíz del proyecto en `.env`.

Ejemplo real del proyecto:

```env
PORT=3000
API_PORT=3001
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_DATABASE=happykids
JWT_SECRET=change_this_secret_in_production
CORS_ORIGIN=http://localhost:5173
VITE_BACKEND_URL=http://localhost:3000
VITE_API_BACKUP_URL=http://localhost:3001
```

### Descripción de variables

- `PORT`: puerto del backend principal
- `API_PORT`: puerto de la API de respaldo
- `DB_HOST`: host MySQL
- `DB_USER`: usuario de la base de datos
- `DB_PASSWORD`: contraseña del usuario MySQL
- `DB_DATABASE`: nombre de la base de datos
- `JWT_SECRET`: clave privada para firmar JWT
- `CORS_ORIGIN`: origen permitido por CORS para frontend
- `VITE_BACKEND_URL`: URL principal del backend para el frontend
- `VITE_API_BACKUP_URL`: URL de respaldo para failover

> No se deben almacenar secretos reales en documentación ni en commits públicos.

## Instalación de dependencias

### Backend principal

```bash
cd backend
npm install
```

### API redundante

```bash
cd api
npm install
```

### Frontend

```bash
cd frontend
npm install
```

## Creación de la base de datos

La base de datos debe crearse usando el esquema real del proyecto:

```bash
mysql -u root -p
CREATE DATABASE happykids;
```

Luego importar el archivo:

```bash
mysql -u root -p happykids < documentacion/sql/DataBaseHappyKids_CORREGIDA.sql
```

La fuente de verdad del esquema se encuentra en:

- `documentacion/sql/DataBaseHappyKids_CORREGIDA.sql`

Para probar el esquema y los datos de ejemplo, usa una instancia o una base de datos desechable de desarrollo, nunca la base de producción. El archivo DDL selecciona `happykids`; para pruebas aisladas, cambia el nombre de la base en una copia local del DDL y del DML. Después de cargar el DDL, ejecuta:

```bash
mysql -u root -p happykids < documentacion/sql/dml.sql
```

El seed no reemplaza ni elimina filas existentes y puede repetirse. Revisa [la guía de los archivos SQL](./sql/README.md) para el orden, las migraciones y las limitaciones del entorno.

## Arranque local

### 1. Iniciar backend principal

```bash
cd backend
npm run dev
```

El backend principal escucha en `http://localhost:3000` según `PORT`.

### 2. Iniciar API redundante

```bash
cd api
npm run dev
```

La API backup usa su propio `PORT` configurado en `.env` (actualmente `API_PORT=3001`).

### 3. Iniciar frontend

```bash
cd frontend
npm run dev
```

El frontend queda en `http://localhost:5173` asumiendo el puerto por defecto de Vite.

## Verificación inicial

### Health check

- backend: `GET http://localhost:3000/health`
- api: `GET http://localhost:3001/api/v1/health`

### Estado esperado

El controlador de salud hace una consulta `SELECT 1` a MySQL y responde:

```json
{ "ok": true }
```

Si hay error de base de datos, responde `503` con:

```json
{ "ok": false, "error": "Base de datos no disponible" }
```

## Dependencias principales

### Backend/API

- `express`
- `mysql2`
- `dotenv`
- `cors`
- `jsonwebtoken`
- `bcryptjs`
- `multer`
- `morgan`

### Frontend

- `react`
- `react-dom`
- `react-router-dom`
- `bootstrap`
- `bootstrap-icons`
- `vite`

## Convenciones operativas

- todas las instancias comparten el `.env` raíz,
- el frontend intenta instancias primarias y backups automáticamente,
- la base de datos es el elemento central de almacenamiento,
- las imágenes subidas se almacenan en `backend/storage/assets/` y `api/storage/assets/`.
