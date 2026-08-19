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
# Backend Three Happy Kids

La guía única del proyecto está en [DOCUMENTACION/README.md](../DOCUMENTACION/README.md).

Para configurar y ejecutar el backend, consulta:

- `DOCUMENTACION/01-INICIO-Y-CONFIGURACION.md`
- `DOCUMENTACION/02-AUTENTICACION-SHA2-Y-JWT.md`
- `DOCUMENTACION/04-BASE-DE-DATOS.md`

Inicio rápido:

```bash
npm install
npm run dev
```

El backend usa las rutas actuales `POST /registro`, `POST /login` y `GET /me`.
