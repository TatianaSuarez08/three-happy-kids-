# 04. Frontend

## Tecnologías usadas

- React 19
- Vite
- React Router DOM
- Bootstrap 5
- Bootstrap Icons
- variables de entorno para conexión a backend

## Estructura principal

```text
frontend/src/
├── App.jsx
├── main.jsx
├── components/
├── context/
├── pages/
├── services/
├── styles/
```

## Routing principal

El enrutamiento central está en `frontend/src/App.jsx` y define rutas para:

- cliente
- administrador
- bodeguero
- mensajero
- autenticación
- acceso no autorizado

Principales rutas:

- `/` -> portada / entrada principal
- `/login` -> inicio de sesión
- `/registro` -> registro
- `/catalogo` -> catálogo
- `/producto/:id` -> detalle
- `/carrito` -> carrito
- `/favoritos` -> favoritos
- `/mis-pedidos` -> pedidos del usuario
- `/admin/dashboard` -> dashboard administración
- `/admin/inventario` -> gestión de productos
- `/admin/pedidos` -> pedidos administrativos
- `/admin/usuarios` -> gestión de usuarios
- `/bodeguero/*` -> módulos de bodeguero
- `/mensajeria/*` -> módulos de mensajero

## Protección de rutas

La protección se hace con `ProtectedRoute.jsx`:

- lee token desde `localStorage` o `sessionStorage`,
- valida `user.roles` para permitir acceso por role,
- redirige a `/login` si no hay token,
- redirige a `/no-autorizado` si no tiene permisos.

## Manejo de sesión

El frontend guarda sesión con:

- `token`
- `user`
- `userRoles`

La función `getSessionToken()` en `frontend/src/services/httpClient.js` elige `localStorage` si existe un token; de lo contrario usa `sessionStorage`.

## Cliente HTTP central

El archivo `frontend/src/services/apiClient.js` es la pieza clave:

- intenta backend y API backup,
- usa `Authorization` con el JWT,
- añade `Idempotency-Key` para operaciones mutantes,
- envía la petición a `/api/v1/...`,
- reintenta errores de red o `502/503/504`.

## Servicios del frontend

Dentro de `frontend/src/services/` existen módulos para:

- autenticación
- consumo de salud,
- clientes HTTP para rutas específicas

El servicio de autenticación real es:

- `authService.js`: login, registro y health check

## Estado y UX

El frontend no tiene un store global complejo en el código revisado; la sesión se maneja a través de almacenamiento local del navegador y de rutas protegidas. La navegación y permisos se basan principalmente en:

- roles del usuario,
- JWT y token guardado,
- redirecciones por `ProtectedRoute`.

## Archivos importantes

- `frontend/src/App.jsx`
- `frontend/src/components/ProtectedRoute.jsx`
- `frontend/src/services/apiClient.js`
- `frontend/src/services/httpClient.js`
- `frontend/src/services/authService.js`

## Consideraciones de producción

- la aplicación debe correr con `VITE_BACKEND_URL` y `VITE_API_BACKUP_URL` configuradas,
- no se debe confiar en rutas hardcodeadas sin entorno,
- la sesión debe protegerse con HTTPS en producción,
- el frontend debe apuntar siempre a la instancia activa del backend o la API de respaldo.
