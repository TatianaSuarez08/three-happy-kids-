# Base de datos MySQL

## Tablas usadas

- `usuario`: `id`, `nombre_usuario`, `contrasena`, `correo`, `activo`, `idioma`.
- `rol`: `id`, `nombre_rol`.
- `usuario_rol`: relación entre usuarios y roles.

La consulta de usuario está en `Back-end/src/models/UsuarioModel.js`. Obtiene la contraseña almacenada como `salt:hash` y consulta los roles asociados.

## Preparar usuarios de prueba

1. Crea o selecciona la base:

```sql
CREATE DATABASE IF NOT EXISTS happykids;
USE happykids;
```

2. Asegúrate de que existan las tablas requeridas.
3. Ejecuta `DOCUMENTACION/sql/USUARIOS_SHA2_SETUP.sql`.

Usuarios de prueba definidos por el script:

- Cliente: `cliente@example.com` / `cliente123`.
- Administrador: `admin@example.com` / `admin123`.

Los hashes incluidos corresponden a esas contraseñas y no deben usarse en producción.

## Verificar roles

```sql
SELECT u.id, u.correo, u.activo, GROUP_CONCAT(r.nombre_rol) AS roles
FROM usuario u
LEFT JOIN usuario_rol ur ON u.id = ur.id_usuario
LEFT JOIN rol r ON ur.id_rol = r.id
GROUP BY u.id;
```

## Problemas frecuentes

- `Access denied`: revisa `DB_USER` y `DB_PASSWORD` en `Back-end/.env`.
- `No database selected`: usa `USE happykids;`.
- `Cannot connect to database`: inicia MySQL y revisa host, usuario y base.
- `Credenciales inválidas`: comprueba que el usuario esté activo, tenga rol y que la contraseña corresponda al hash.
