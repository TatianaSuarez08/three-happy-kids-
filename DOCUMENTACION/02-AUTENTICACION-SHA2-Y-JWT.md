# Autenticación, SHA-2 y JWT

## Registro

El frontend envía `POST /registro` con:

```json
{
  "nombre_usuario": "usuario",
  "email": "usuario@example.com",
  "password": "123456",
  "confirmar_password": "123456"
}
```

`UsuarioController.js` valida los datos, genera el hash y crea el usuario. Los registros nuevos reciben el rol `cliente` por defecto.

## SHA-256 con salt

SHA-256 pertenece a la familia SHA-2 y se usa mediante el módulo nativo `crypto` de Node.js:

```js
const salt = crypto.randomBytes(16).toString('hex');
const hash = crypto.createHash('sha256')
  .update(salt + password)
  .digest('hex');
```

La base de datos guarda `salt:hash`. En el login, `verifyPassword` separa ambos valores, calcula de nuevo el hash con el mismo salt y compara el resultado. La contraseña original nunca se guarda.

No se necesita instalar una librería adicional para SHA-2. `mysql2`, `dotenv`, `express`, `cors` y `jsonwebtoken` complementan el flujo.

## Inicio de sesión

El frontend envía `POST /login`:

```json
{
  "email": "usuario@example.com",
  "password": "123456"
}
```

El backend busca el usuario, verifica que esté activo, comprueba SHA-256 y genera un JWT válido durante 8 horas. La respuesta incluye `token` y los datos públicos del usuario con `roles`.

## Perfiles de prueba

El seed vigente es `documentacion/sql/dml.sql`; crea cuatro perfiles ficticios, uno por rol, con hashes compatibles con la migración heredada. No publica contraseñas de prueba ni debe ejecutarse en producción. Para credenciales interactivas de desarrollo, crea los usuarios desde el flujo de registro o restablecimiento de contraseña de la aplicación.

### Acceso del cliente

El cliente puede entrar al catálogo, utilizar favoritos y carrito, confirmar compras y consultar `/mis-pedidos`.

### Acceso del administrador

El administrador puede utilizar todas las funciones de compra del cliente y además acceder a:

- `/admin/dashboard`
- `/admin/productos`
- `/admin/inventario`
- `/admin/pedidos`
- `/admin/usuarios`

Para cargar los perfiles ficticios, sigue el orden DDL → DML descrito en `documentacion/sql/README.md`.

## Errores identificables

El frontend muestra mensajes distintos según el problema:

- `400`: faltan datos, email inválido o contraseñas diferentes.
- `401`: correo o contraseña incorrectos.
- `403`: usuario inactivo.
- `409`: email o nombre de usuario ya registrados.
- `500`: error interno o problema de conexión con MySQL.
- Error de red: el backend no está iniciado o no responde en `http://localhost:3000`.

La contraseña nunca se muestra en los mensajes ni se guarda en el navegador. Los detalles técnicos se escriben en la consola del navegador y del backend para facilitar la revisión durante el desarrollo.

## Sesión elegida por el usuario

El formulario incluye `Recordarme en este dispositivo`:

- Marcado: sesión en `localStorage`, permanece al cerrar el navegador.
- Desmarcado: sesión en `sessionStorage`, termina al cerrar la pestaña.

Nunca se guarda la contraseña. `ProtectedRoute.jsx` y `Nav.jsx` leen ambos almacenamientos. `Cerrar sesión` elimina los datos de los dos y lleva a `/login`.

## Roles y seguridad

- `cliente`: catálogo, carrito, compra y sus pedidos.
- `administrador`: lo anterior más dashboard, productos, inventario, pedidos y usuarios.

`ProtectedRoute.jsx` protege las rutas del frontend. `autenticacion.js` valida el header `Authorization: Bearer <token>` en el backend. Para producción se recomienda proteger el secret JWT y usar una estrategia de cookies HttpOnly.
