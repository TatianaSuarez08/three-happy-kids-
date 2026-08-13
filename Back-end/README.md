# Back-end (Three Happy Kids)

Instalación y uso mínimo para el backend de inicio de sesión.

Requisitos:
- Node.js
- MySQL y una base de datos con tabla `Usuarios` que contenga columnas `nombre, email, password, role`.

Variables de entorno (.env):
- `PORT` (opcional)
- `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_DATABASE`
- `JWT_SECRET` (recomendado)

Ejecutar en desarrollo:

```bash
cd Back-end
npm install
npm run dev
```

Endpoints relevantes:
- `POST /login` — body: `{ "email": "...", "password": "..." }` — devuelve `token` y `user`.
- `GET /me` — header `Authorization: Bearer <token>` — devuelve `user` (payload del token).

Si la tabla `Usuarios` no contiene la columna `role`, aplica la migración en `db-migrations/001-add-role-to-usuarios.sql`.
# Back-end Three Happy Kids

## Dependencias

```bash
npm install
```

## Iniciar servidor

```bash
npm run dev
```

## Rutas de autenticación

- `POST /api/auth/register`
- `POST /api/auth/login`

## Ejemplo de tabla SQL

```sql
CREATE TABLE Usuarios (
  id INT IDENTITY(1,1) PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(200) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at DATETIME2 DEFAULT GETDATE()
);
```
