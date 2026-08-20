# Consumo de la API y sistema utilizado

## 1. Resumen del sistema

Three Happy Kids utiliza una arquitectura cliente-servidor separada:

- **Frontend:** React 19 con Vite.
- **Backend:** Node.js con Express 4 y módulos ES (`type: module`).
- **Base de datos:** MySQL, mediante `mysql2/promise` y un pool de conexiones.
- **Comunicación:** API REST que recibe y devuelve JSON.
- **Autenticación:** JWT con expiración de 8 horas.
- **Contraseñas:** SHA-256, perteneciente a la familia SHA-2, combinado con un `salt` aleatorio.
- **Control de acceso:** roles `cliente` y `administrador`.
- **CORS:** permite al frontend de desarrollo `http://localhost:5173` consumir el backend.

El frontend y el backend se ejecutan como procesos independientes. Durante el desarrollo, Vite sirve la aplicación web en el puerto `5173` y Express expone la API en el puerto `3000`.

## 2. Configuración de la URL de la API

El frontend obtiene la dirección del backend desde la variable de entorno `VITE_BACKEND_URL`:

```env
VITE_BACKEND_URL=http://localhost:3000
```

Si la variable no existe, el código utiliza automáticamente:

```text
http://localhost:3000
```

La variable debe configurarse en el entorno del frontend, normalmente en `Front-end/.env`. No debe incluirse una barra final si se quieren evitar URLs como `//login`.

Para iniciar el sistema:

```bash
cd Back-end
npm install
npm run dev
```

En otra terminal:

```bash
cd Front-end
npm install
npm run dev
```

## 3. Endpoints disponibles

La API se monta en la raíz del backend, por lo que las rutas se consumen directamente desde la URL base.

### `GET /`

Comprueba que el backend está activo.

Respuesta correcta:

```json
{
  "success": true,
  "message": "API de Express con MySQL lista"
}
```

### `POST /registro`

Crea una cuenta nueva. El usuario recibe el rol `cliente` por defecto y el backend devuelve un JWT, por lo que puede iniciar sesión inmediatamente.

Cabecera:

```http
Content-Type: application/json
```

Cuerpo:

```json
{
  "nombre_usuario": "usuario",
  "email": "usuario@example.com",
  "password": "123456",
  "confirmar_password": "123456"
}
```

Respuesta correcta, código `201`:

```json
{
  "success": true,
  "message": "Usuario registrado correctamente",
  "user": {
    "id": 1,
    "nombre": "usuario",
    "email": "usuario@example.com",
    "idioma": "es",
    "roles": ["cliente"]
  },
  "token": "jwt_generado_por_el_backend"
}
```

Validaciones principales:

- Todos los campos son obligatorios.
- La contraseña y su confirmación deben coincidir.
- La contraseña debe tener al menos 6 caracteres.
- El nombre de usuario debe tener al menos 3 caracteres.
- El email debe tener un formato válido.
- El email o el nombre de usuario no pueden estar repetidos.

### `POST /login`

Autentica un usuario existente.

Cabecera:

```http
Content-Type: application/json
```

Cuerpo:

```json
{
  "email": "usuario@example.com",
  "password": "123456"
}
```

Respuesta correcta, código `200`:

```json
{
  "success": true,
  "message": "Login exitoso",
  "user": {
    "id": 1,
    "nombre": "usuario",
    "email": "usuario@example.com",
    "idioma": "es",
    "roles": ["cliente"]
  },
  "token": "jwt_generado_por_el_backend"
}
```

El token incluye el email, el nombre, los roles y una duración de 8 horas. La contraseña nunca se devuelve en la respuesta.

### `GET /me`

Devuelve la información incluida en el JWT del usuario autenticado.

Cabeceras:

```http
Authorization: Bearer jwt_generado_por_el_backend
```

Respuesta correcta:

```json
{
  "user": {
    "email": "usuario@example.com",
    "nombre": "usuario",
    "roles": ["cliente"],
    "iat": 1730000000,
    "exp": 1730028800
  }
}
```

El endpoint responde `401` si falta el token, no utiliza el formato `Bearer <token>` o el JWT no es válido o ha expirado.

## 4. Cómo se consume desde React

El login construye la URL a partir de la variable de entorno y usa `fetch`:

```js
const BACKEND = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

const response = await fetch(`${BACKEND}/login`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email,
    password
  })
});

const data = await response.json();

if (!response.ok) {
  throw new Error(data.error || 'Error en el login');
}
```

El registro sigue el mismo patrón, pero llama a `/registro` y envía los cuatro campos del formulario.

Para consultar un endpoint protegido, se obtiene el token del almacenamiento elegido y se agrega al header:

```js
const storage = localStorage.getItem('token')
  ? localStorage
  : sessionStorage;

const token = storage.getItem('token');

const response = await fetch(`${BACKEND}/me`, {
  headers: {
    Authorization: `Bearer ${token}`
  }
});
```

## 5. Uso de la API dentro del frontend

La aplicación no hace llamadas a la API desde todas las pantallas. El consumo actual está organizado así:

| Parte del frontend | Uso de la API | Resultado en la aplicación |
|---|---|---|
| `Iniciosesion.jsx` | `POST /login` | Valida al usuario, guarda la sesión y redirige según el rol. |
| `Registro.jsx` | `POST /registro` | Crea la cuenta, guarda el token y muestra el modal de registro correcto. |
| `ProtectedRoute.jsx` | Lee el token guardado | Decide si la persona puede entrar a una ruta protegida. |
| `Nav.jsx` | Lee usuario y roles guardados | Muestra el menú correspondiente y permite cerrar sesión. |
| `CarritoContext.jsx` | No llama a la API actualmente | Guarda carrito y cantidades en `localStorage`. |
| `FavoritosContext.jsx` | No llama a la API actualmente | Guarda favoritos en `localStorage`. |
| `page-MisPedidos.jsx` | No llama a la API actualmente | Muestra datos de pedidos de ejemplo. |

El flujo de una petición desde el frontend es el siguiente:

1. La persona completa un formulario en una pantalla React.
2. El componente valida los datos básicos antes de enviarlos.
3. `fetch` envía una petición HTTP al backend con un cuerpo JSON.
4. El componente espera la respuesta y la convierte con `response.json()`.
5. Si `response.ok` es falso, muestra el mensaje de error correspondiente.
6. Si la respuesta es correcta, guarda los datos de sesión y actualiza la navegación.

Ejemplo simplificado del flujo de registro:

```js
const response = await fetch(`${BACKEND}/registro`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    nombre_usuario,
    email,
    password,
    confirmar_password
  })
});

const data = await response.json();

if (!response.ok) {
  setError(data.error || 'No se pudo crear la cuenta');
  return;
}

localStorage.setItem('token', data.token);
localStorage.setItem('user', JSON.stringify(data.user));
```

Por tanto, la API se utiliza actualmente como fuente de autenticación y usuarios. El catálogo, el carrito, favoritos y pedidos todavía no están conectados a endpoints de productos o compras del backend.

## 6. Relación entre la API y el diseño de la interfaz

El diseño visual se adapta al resultado de cada petición. La API no solo entrega datos: también determina los estados que la interfaz debe representar.

### Estado de carga

Mientras se envía `/login` o `/registro`, el componente activa `loading`:

- Deshabilita los campos y botones.
- Cambia el texto del botón a `Ingresando...` o `Registrando...`.
- Evita que se envíe el formulario varias veces.

Esto comunica visualmente que la aplicación está esperando al backend.

### Estado de error

Los errores de la API se muestran dentro del formulario mediante el estado `error`. La interfaz utiliza un bloque destacado con fondo rojo claro y texto contrastado para diferenciar un fallo de validación, credenciales incorrectas, usuario inactivo o backend desconectado.

Los códigos se traducen a mensajes comprensibles para la persona usuaria:

- `400`: datos incompletos o inválidos.
- `401`: correo, contraseña o token incorrectos.
- `403`: usuario inactivo o sin permisos.
- `409`: cuenta ya existente.
- `500`: problema del servidor o de MySQL.
- Error de red: el backend no está iniciado o no responde.

### Estado correcto

Cuando el registro finaliza correctamente, la interfaz no redirige de forma brusca. Muestra un modal accesible de confirmación con icono de éxito y un botón para ir al catálogo. En el login, la respuesta del backend determina la pantalla siguiente:

- Rol `administrador`: `/admin/dashboard`.
- Rol `cliente`: `/cliente/catalogo`.
- Sin un rol reconocido: `/`.

### Diseño según la sesión y el rol

El diseño de navegación cambia según los datos recibidos en `data.user.roles`:

- Un cliente ve inicio, catálogo y sus pedidos.
- Un administrador ve dashboard, productos, inventario, pedidos y usuarios.
- El administrador también conserva el acceso al catálogo, carrito, favoritos y compras.

`ProtectedRoute` evita mostrar páginas administrativas cuando no existe un token o cuando el rol no coincide. En ese caso redirige a `/login` o `/no-autorizado`, respectivamente.

### Estilos utilizados en autenticación

Las pantallas de login y registro se construyen con las clases definidas en `Front-end/src/styles/global.css`:

- `.login-page`: centra la pantalla y aplica el fondo degradado claro.
- `.login-card`: crea el panel principal del formulario.
- `.login-field`: organiza etiquetas y campos.
- `.btn-ingresar`: representa la acción principal.
- `.login-error`: comunica errores del backend o de validación.
- `.login-modal-overlay` y `.login-modal`: muestran el resultado correcto del registro.

La intención del diseño es mantener un flujo sencillo: formulario centrado, acciones claras, feedback inmediato y navegación condicionada por la sesión. Los estados de la API se reflejan visualmente sin exponer detalles técnicos innecesarios.

## 7. Dónde se guarda la sesión

El formulario de login permite elegir entre dos comportamientos:

- **Recordarme activado:** guarda `token`, `user`, `usuario` y `userRoles` en `localStorage`.
- **Recordarme desactivado:** guarda esos valores en `sessionStorage`, que se limpia al cerrar la pestaña.

El componente `ProtectedRoute` comprueba que exista un token antes de mostrar una ruta protegida. También compara los roles almacenados con los roles permitidos por la ruta.

Al cerrar sesión, `Nav.jsx` elimina los datos de `localStorage` y `sessionStorage` y redirige a `/login`.

## 8. Autenticación y roles en el backend

El middleware `autenticacion.js` hace lo siguiente:

1. Lee `req.headers.authorization`.
2. Comprueba que empiece por `Bearer `.
3. Extrae el JWT.
4. Lo valida con `JWT_SECRET`.
5. Guarda el contenido validado en `req.user`.
6. Continúa con `next()` si el token es válido.

El middleware `role.js` está preparado para comprobar que el usuario tenga alguno de los roles permitidos. Actualmente, las rutas administrativas del frontend se protegen con `ProtectedRoute` y el rol `administrador`. Las operaciones de usuarios implementadas en el backend son todavía las de registro, login y consulta de `/me`.

## 9. Cómo se procesan las contraseñas

En el registro, el backend genera un `salt` aleatorio y calcula:

```text
SHA-256(salt + contraseña)
```

La base de datos guarda el valor con el formato:

```text
salt:hash
```

En el login, el backend separa el `salt`, calcula nuevamente el hash con la contraseña recibida y compara ambos hashes. La contraseña original no se guarda.

La conexión con MySQL utiliza las variables de entorno:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_DATABASE=happykids
```

## 10. Códigos de respuesta habituales

| Código | Significado |
|---|---|
| `200` | Consulta o login correcto. |
| `201` | Usuario creado correctamente. |
| `400` | Faltan datos o los datos no cumplen las validaciones. |
| `401` | Credenciales incorrectas o token ausente/inválido. |
| `403` | Usuario inactivo o sin permisos suficientes. |
| `409` | El email o nombre de usuario ya existe. |
| `500` | Error interno del backend o de conexión con MySQL. |

Los errores se devuelven normalmente con esta estructura:

```json
{
  "error": "Descripción del error"
}
```

## 11. Situación actual de compras y catálogo

Las pantallas de catálogo, carrito y favoritos funcionan actualmente en el frontend. `CarritoContext.jsx` y `FavoritosContext.jsx` almacenan sus datos en `localStorage`.

La pantalla `MisPedidos` contiene datos de ejemplo y la interfaz de administración tiene sus vistas, pero en el backend actual no existen endpoints REST para productos, inventario, pedidos, favoritos o compras. Por eso no debe documentarse todavía una llamada como `POST /pedidos` o `GET /productos` como si ya estuviera disponible.

Para conectar esas funciones a MySQL será necesario crear posteriormente sus rutas, controladores, modelos y llamadas `fetch` correspondientes.

## 12. Recomendaciones para producción

- Cambiar `JWT_SECRET` por una clave privada y larga.
- No utilizar las credenciales de prueba en producción.
- Configurar `CORS_ORIGIN` con el dominio real del frontend.
- Usar HTTPS.
- Preferir cookies `HttpOnly` y `Secure` para el JWT en lugar de almacenamiento accesible desde JavaScript.
- Sustituir SHA-256 con salt por un algoritmo específico para contraseñas, como Argon2 o bcrypt, al evolucionar el sistema.
- Validar y limitar las peticiones del API en el servidor.
