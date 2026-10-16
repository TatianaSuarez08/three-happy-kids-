# Autenticación, bcrypt y JWT

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

## bcrypt

Las contraseñas se procesan mediante `bcryptjs` en el servicio central:

```js
const hash = await bcrypt.hash(password, 12);
```

La base de datos guarda el hash bcrypt completo, que ya contiene su salt. En el login se utiliza `bcrypt.compare(password, hash)`. La contraseña original nunca se guarda.

El número de rondas se configura con `BCRYPT_SALT_ROUNDS` y usa 12 por defecto.

## Inicio de sesión

El frontend envía `POST /login`:

```json
{
  "email": "usuario@example.com",
  "password": "123456"
}
```

El backend busca el usuario, verifica que esté activo, comprueba bcrypt y genera un JWT válido durante 8 horas. La respuesta incluye `token` y los datos públicos del usuario con `roles`.

## Perfiles de prueba

Estos perfiles se crean con `DOCUMENTACION/sql/sql_insert_test_users.sql` y sirven únicamente para probar el sistema en desarrollo:

| Perfil | Nombre de usuario | Correo | Contraseña | Rol |
|---|---|---|---|---|
| Cliente | `cliente_test` | `cliente@example.com` | `cliente123` | `cliente` |
| Administrador | `admin_test` | `admin@example.com` | `admin123` | `administrador` |

### Acceso del cliente

El cliente puede entrar al catálogo, utilizar favoritos y carrito, confirmar compras y consultar `/mis-pedidos`.

### Acceso del administrador

El administrador puede utilizar todas las funciones de compra del cliente y además acceder a:

- `/admin/dashboard`
- `/admin/productos`
- `/admin/inventario`
- `/admin/pedidos`
- `/admin/usuarios`

Si estos usuarios no existen en la base de datos, ejecuta primero el script SQL indicado arriba y después inicia sesión desde `http://localhost:5173/login`.

> Estas credenciales son públicas dentro de la documentación porque son perfiles de prueba. No las uses en producción ni las conviertas en cuentas reales.

## Errores identificables

El frontend muestra mensajes distintos según el problema:

- `400`: faltan datos, email inválido o contraseñas diferentes.
- `401`: correo o contraseña incorrectos.
- `403`: usuario inactivo.
- `409`: email o nombre de usuario ya registrados.
- `500`: error interno o problema de conexión con MySQL.
- Error de red: la API no está iniciada o no responde en `http://localhost:3001`.

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
