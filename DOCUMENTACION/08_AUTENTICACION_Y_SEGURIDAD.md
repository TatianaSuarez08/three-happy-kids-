# 08. Autenticación y seguridad

## Mecanismo real

La autenticación del proyecto usa JWT firmado con `jsonwebtoken` y la clave `JWT_SECRET` del `.env` raíz.

El token se genera en `backend/src/controllers/UsuarioController.js` con:

```js
jwt.sign(
  {
    id: user.id,
    email: user.email,
    nombre: user.nombre,
    roles: user.roles || [],
    permissions
  },
  env.JWT_SECRET,
  { expiresIn: '8h' }
)
```

## Flujo de login

1. El usuario envía `email` y `password` a `POST /login`.
2. El backend busca el usuario por correo.
3. Verifica contraseña usando `verifyPassword()`.
4. Si la contraseña es legacy (SHA-256 + salt), la migra a bcrypt.
5. Genera JWT de sesión.
6. Devuelve `user` y `token` al cliente.

## Verificación de contraseña

La lógica real está en `backend/src/utils/password.js`.

- si el hash empieza con `$2a$`, `$2b$` o `$2y$`, usa bcrypt,
- si no, asume hash legacy Sha-256 con salt,
- y valida con `crypto.createHash('sha256').update(salt + password).digest('hex')`.

Esto significa que el proyecto admite tanto contraseñas nuevas en bcrypt como contraseñas antiguas con salt SHA-256.

## Middleware de autenticación

`backend/src/middleware/autenticacion.js` valida:

```http
Authorization: Bearer <token>
```

Si no se envía el header o el token falla, responde `401`.

## Roles y permisos

Los permisos se calculan con `backend/src/middleware/role.js` usando los roles del usuario.

Roles reales definidos en el código:

- administrador
- bodeguero
- mensajero
- cliente

Permisos por rol:

- administrador: usuarios, productos, inventario, pedidos, dashboard
- bodeguero: inventario y pedidos de operación
- mensajero: pedidos, entregas
- cliente: catálogo, carrito, pedidos propios, compra

Los endpoints usan `permitRoles(...)` para restringir acceso.

## Protección de rutas

Ejemplo real:

```js
router.get('/dashboard', auth, permitRoles('administrador', { permission: 'dashboard:read' }), getDashboard);
```

Esto exige:

- token válido,
- y que el usuario tenga el role o permiso requerido.

## Seguridad HTTP

Se aplica:

- CORS con `CORS_ORIGIN`
- JSON parsing
- no se usa sesión de servidor en la implementación revisada
- JWT en cliente para autenticación por estado stateless

## Variables sensibles

Las configuraciones sensibles reales se encuentran en `.env` raíz:

- `JWT_SECRET`
- `DB_PASSWORD`
- `DB_USER`

Nunca deben incluirse en documentación pública ni en repositorios sin control de acceso.

## Seguridad adicional implementada

### Idempotencia

El sistema evita reejecuciones duplicadas de mutaciones con `Idempotency-Key`.

### Validación de datos de entrada

Se validan:

- email
- longitud mínima de contraseña
- longitud mínima de nombre de usuario
- IDs numéricos válidos
- roles permitidos
- stock suficiente
- formatos de imágenes

### Manejo de archivos

`subidaImagen.js` valida mime types permitidos:

- `image/jpeg`
- `image/png`
- `image/webp`
- `image/gif`

Tamaño máximo: 5 MB por archivo.

## Observaciones importantes

La documentación debe señalar que el sistema usa autenticación basada en JWT y no en cookies con sesión del lado del servidor. Todas las verificaciones de permiso dependen del token y de la información incluida en el payload.
