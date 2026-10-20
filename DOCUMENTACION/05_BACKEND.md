# 05. Backend

## Propósito

El backend es la instancia principal de negocio del sistema. Tiene la responsabilidad de:

- autenticar usuarios,
- validar permisos por rol,
- consultar y modificar MySQL,
- servir rutas para catálogo, usuarios, pedidos, inventario, productos y dashboard,
- servir imágenes y responder a operaciones del frontend,
- y actuar como la capa principal de servicio del sistema.

## Estructura real

```text
backend/src/
├── config/
│   └── env.js
├── controllers/
├── middleware/
│   ├── autenticacion.js
│   ├── idempotencia.js
│   ├── role.js
│   └── subidaImagen.js
├── models/
├── routes/
├── utils/
├── db.js
```

## Entrada principal

El punto de inicio es `backend/index.js`.

Se configuran:

- Express,
- CORS,
- JSON parsing,
- logger HTTP,
- idempotencia,
- archivos estáticos de imágenes,
- y las rutas de negocio.

## Configuración ambiente

Se importa `env.js` desde `backend/src/config/env.js`:

```js
PORT: process.env.PORT || '3000'
JWT_SECRET: process.env.JWT_SECRET
DB_HOST: process.env.DB_HOST
DB_USER: process.env.DB_USER
DB_PASSWORD: process.env.DB_PASSWORD || ''
DB_DATABASE: process.env.DB_DATABASE
CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173'
```

Si falta `JWT_SECRET`, el backend lanza error al iniciar.

## Base de datos

La conexión a MySQL se gestiona en `backend/src/db.js` con `mysql2/promise` y un pool. La función `verifyDatabaseConnection()` valida que MySQL responda con `SELECT 1` y crea la tabla `api_idempotency` si no existe.

## Middleware principales

### `autenticacion.js`

Verifica que el token venga en:

```http
Authorization: Bearer <token>
```

Si no existe o es inválido, responde `401`.

### `role.js`

Construye permisos a partir de roles y valida acceso con `permitRoles(...)`.

Los roles y permisos reales implementados incluyen:

- administrador
- bodeguero
- mensajero
- cliente

### `idempotencia.js`

Se ejecuta para métodos mutantes (`POST`, `PUT`, `PATCH`, `DELETE`).

Registra en la tabla `api_idempotency`:

- `idempotency_key`
- `request_hash`
- `status`
- `response_status`
- `response_body`
- `created_at`
- `updated_at`

Si la clave ya existe y la petición coincide, responde con la misma respuesta; si difiere, responde `409`.

## Rutas del backend

### Usuarios

- `POST /registro`
- `POST /login`
- `GET /me`
- `PUT /me/foto`

### Productos

- `GET /productos-publicos`
- `GET /productos-publicos/:id`
- `GET /colores`
- `GET /productos`
- `GET /productos/:id`
- `POST /productos`
- `PUT /productos/:id`
- `DELETE /productos/:id`

### Pedidos

- `GET /pedidos`
- `POST /pedidos`
- `PUT /pedidos/:id/estado`
- `GET /mis-pedidos`

### Carrito

- `GET /carrito`
- `POST /carrito`
- `PUT /carrito/:productId`
- `DELETE /carrito/:productId`
- `DELETE /carrito`

### Favoritos

- `GET /favoritos`
- `POST /favoritos`
- `DELETE /favoritos/:productId`

### Dashboard

- `GET /dashboard`

### Inventario

- `GET /inventario/:id/historial`
- `POST /inventario/movimiento`

### Logística

- `GET /logistica`

### Administración de usuarios

- `GET /usuarios`
- `POST /usuarios`
- `PUT /usuarios/:id`
- `PUT /usuarios/:id/estado`
- `DELETE /usuarios/:id`

### Salud

- `GET /health`

## Controladores clave

- `UsuarioController.js`: registro, login, perfil, foto
- `ProductoController.js`: alta, edición, validación y baja lógica
- `PedidoController.js`: creación y actualización de pedidos
- `CarritoController.js`: gestión del carrito autenticado
- `FavoritoController.js`: favoritos por usuario
- `AdminUsuarioController.js`: cuentas administrativas
- `DashboardController.js`: métricas del sistema
- `InventarioController.js`: historial y movimientos
- `HealthController.js`: verificación de la BD
- `CatalogoController.js`: categorías activas

## Seguridad y validaciones

El backend aplica validaciones reales de:

- email válido,
- contraseñas congruentes,
- longitud mínima,
- roles permitidos,
- stock suficiente en pedidos,
- IDs numéricos válidos,
- y versión de usuario activo/inactivo.

En cuanto a autenticación:

- usa `jsonwebtoken`
- firma el JWT con `JWT_SECRET`
- expira en 8 horas
- incluye `id`, `email`, `nombre`, `roles`, `permissions`

## Manejo de errores

El backend responde con códigos reales como:

- `400` para datos inválidos
- `401` para token faltante o inválido
- `403` para permisos insuficientes
- `404` para recursos inexistentes
- `409` para colisiones o conflictos
- `500` para errores del servidor
- `503` si base de datos no disponible

## Observaciones importantes

- No existe una API REST pública separada en el backend principal: la capa pública se expone en la instancia `api/` con prefijo `/api/v1`.
- El backend principal y la API redundante comparten lógica y esquema de base de datos.
- La duplicación de ejecución se intenta evitar con `Idempotency-Key` y la tabla `api_idempotency`.
