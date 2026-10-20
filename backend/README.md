# Backend (Three Happy Kids)

Instalación y uso mínimo para el backend de inicio de sesión.

Requisitos:
- Node.js
- MySQL y una base de datos con tabla `Usuarios` que contenga columnas `nombre, email, password, role`.

Variables de entorno (`.env`, no se versiona; usa `.env.example`):
- `PORT` (opcional)
- `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_DATABASE`
- `JWT_SECRET` (obligatorio; el servidor no inicia sin él)
- `BCRYPT_ROUNDS` (opcional, por defecto `12`)

Ejecutar en desarrollo:

```bash
cd backend
npm install
npm run dev
```

Endpoints relevantes:
- `POST /login` — body: `{ "email": "...", "password": "..." }` — devuelve `token` y `user`.
- `GET /me` — header `Authorization: Bearer <token>` — devuelve `user` (payload del token).

Si la tabla `Usuarios` no contiene la columna `role`, aplica la migración en `db-migrations/001-add-role-to-usuarios.sql`.
# Backend Three Happy Kids

La guía única del proyecto está en [documentacion/README.md](../documentacion/README.md).

Para configurar y ejecutar el backend, consulta:

- `documentacion/01-INICIO-Y-CONFIGURACION.md`
- `documentacion/02-AUTENTICACION-SHA2-Y-JWT.md`
- `documentacion/04-BASE-DE-DATOS.md`

Inicio rápido:

```bash
npm install
npm run dev
```

El backend expone rutas versionadas bajo `/api/v1` y mantiene las rutas sin prefijo temporalmente por compatibilidad. Las contraseñas nuevas usan bcrypt; las antiguas `salt:hash` se migran al primer login correcto.
