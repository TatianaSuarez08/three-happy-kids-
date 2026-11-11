# 4. Frontend React

## Estructura

```text
frontend/src/
├── App.jsx                 # rutas de pantalla y guardas por rol
├── main.jsx                # montaje de React y proveedores globales
├── components/             # navegación, rutas protegidas y UI compartida
├── context/                # carrito, favoritos y tema
├── pages/                  # vistas públicas y módulos por rol
├── services/               # solicitudes HTTP agrupadas por funcionalidad
└── styles/                 # estilos globales, componentes y páginas
```

Los grupos de `pages/` son `publicas`, `cliente`, `administracion`, `bodeguero` y `mensajeria`. Componentes compartidos relevantes incluyen `Nav`, `ProtectedRoute`, `NoAutorizado`, `ProductImage`, `EmptyState` y `StatusBadge`.

## Navegación y permisos de pantalla

Las rutas se declaran en `src/App.jsx`. El acceso a las rutas protegidas lo controla `ProtectedRoute.jsx` con la presencia del token y los roles guardados en el navegador. La autorización del cliente es una restricción de interfaz; el backend vuelve a validar el JWT y los permisos en cada endpoint.

| Grupo | Rutas | Acceso de pantalla |
|---|---|---|
| Público | `/`, `/login`, `/registro`, `/recuperar-pass`, `/no-autorizado`, `/catalogo`, `/cliente/catalogo`, `/producto/:id` | Sin guarda de rol. |
| Compra y perfil | `/carrito`, `/confirmar-compra`, `/favoritos`, `/mis-pedidos`, `/perfil` | Token y cualquiera de los roles admitidos en `App.jsx`. |
| Administración | `/admin/dashboard`, `/admin/inventario`, `/admin/compras`, `/admin/actividad-empleados`, `/admin/pedidos`, `/admin/novedades-pedidos`, `/admin/agregar-producto`, `/admin/editar-producto/:id`, `/admin/usuarios`, `/admin/crear-usuario`, `/admin/editar-usuario/:id` | Administrador. `/admin` redirige al dashboard y `/bodega` conserva una ruta de inventario para administrador. |
| Bodega | `/bodeguero`, `/bodeguero/inventario`, `/bodeguero/pedidos`, `/bodeguero/movimientos`, `/bodeguero/compras` | Bodeguero. |
| Mensajería | `/mensajeria`, `/mensajeria/entregas`, `/mensajeria/ruta`, `/mensajeria/evidencias`, `/mensajeria/novedades`, `/mensajeria/historial`, `/mensajeria/perfil` | Mensajero. |

El componente de entrada puede redirigir una sesión de mensajero o bodeguero a su panel. Los roles del frontend se normalizan (por ejemplo, `admin` a `administrador`); la firma y vigencia del token solo se comprueban en Express.

## Estado, contextos y hooks

`main.jsx` registra proveedores de tema, carrito y favoritos. Sus hooks de consumo son `useTheme`, `useCarrito` y `useFavoritos`. El carrito y los favoritos se sincronizan con los servicios cuando cambia la sesión; el carrito serializa operaciones para reducir actualizaciones concurrentes fuera de orden. El contexto no reemplaza la persistencia del servidor.

## Servicios y API

`src/services/` separa las llamadas a autenticación, catálogo/productos, carrito, favoritos, pedidos, inventario, logística/dashboard y usuarios. Normalmente delegan en `apiClient.js`, que:

- agrega el prefijo `/api/v1` y el token Bearer cuando existe;
- genera o usa `Idempotency-Key` en métodos mutantes;
- aplica un timeout de 20 segundos;
- intenta la URL principal y luego la URL alternativa ante error de red, timeout o HTTP 502/503/504.

Otros errores HTTP (por ejemplo 400 o 404) se devuelven como error sin reintentar en la siguiente instancia. La instancia `API/` no tiene todas las rutas del servicio principal, por lo que el fallback no garantiza todos los flujos. La descarga de evidencia usa una petición `fetch` directa en `pedidoService.js`, no `apiClient`.

## Sesión y formularios

La aplicación lee token y perfil desde `localStorage` o `sessionStorage`. El login elige dónde guardar la sesión según “Recordarme”; el registro guarda sesión persistente. Los formularios de login y registro realizan validaciones del lado del cliente y los controladores vuelven a validar los datos. El evento de ventana `happykids:session-changed` permite a contextos y navegación reaccionar a cambios de sesión.

## Variables de entorno

Vite configura `envDir` para leer el `.env` raíz. Variables opcionales:

- `VITE_BACKEND_URL`, por defecto `http://localhost:3000`.
- `VITE_API_BACKUP_URL`, por defecto `http://localhost:3001`.

No se requiere que estén definidas para esos valores locales predeterminados. Consulta [instalación](03_INSTALACION.md).
