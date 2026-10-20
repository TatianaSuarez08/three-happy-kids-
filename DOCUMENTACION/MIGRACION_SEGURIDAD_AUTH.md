# Migracion de autenticacion

## Contraseñas

Las contraseñas nuevas se almacenan con `bcryptjs` y el costo se controla con `BCRYPT_ROUNDS` (12 por defecto).

Las cuentas existentes con formato heredado `salt:hash` siguen funcionando: después de un login correcto, el backend reemplaza ese valor por un hash bcrypt. No se guardan contraseñas en texto plano.

## JWT

`JWT_SECRET` es obligatorio. El backend no inicia si falta y ya no existe el fallback público `secretkey`.

## Operación

1. Crear o ajustar el archivo `.env` raíz del proyecto con las variables reales de backend y frontend.
2. Definir un `JWT_SECRET` aleatorio y rotarlo si el valor anterior estuvo publicado.
3. Mantener `backend/.env` fuera del repositorio.
4. Permitir que los usuarios existentes inicien sesión una vez para completar la migración de su hash.
