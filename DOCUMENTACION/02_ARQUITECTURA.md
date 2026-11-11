# 2. Arquitectura del sistema

## Diagrama de comunicación

```text
Navegador
  └─ React + React Router (Vite, puerto 5173)
       └─ servicios de frontend / apiClient
            ├─ backend principal (puerto 3000, /api/v1) ──┐
            └─ API adicional (puerto 3001, /api/v1; cobertura parcial) ─┴── MySQL (DB_DATABASE)
```

El diagrama representa la configuración local por defecto. Los dos procesos Express usan variables de entorno propias; que ambos se conecten a la misma instancia/base MySQL depende de que sus valores de configuración coincidan.

## Frontend

`frontend/src/main.jsx` monta React y sus proveedores globales. `App.jsx` declara las rutas de pantalla; los grupos de páginas se encuentran bajo `src/pages/`, los componentes compartidos en `src/components/`, el estado compartido en `src/context/` y las llamadas por módulo en `src/services/`.

Los servicios de frontend delegan normalmente en `apiClient.js`, que agrega `/api/v1`, el token Bearer cuando existe y una clave de idempotencia para operaciones mutantes. La excepción relevante es la descarga de evidencia en `pedidoService.js`, que realiza una petición `fetch` directa.

## Backend Express principal

La entrada es `backend/index.js`. Configura CORS, parseo JSON y URL-encoded, registro HTTP, middleware de idempotencia, archivos estáticos de imágenes y routers. Monta esos routers en `/api/v1` y también en `/` para conservar rutas sin prefijo.

La ruta pasa por el router del módulo, middleware de autenticación/autorización cuando corresponde, controlador y modelo/servicio. El acceso a MySQL se centraliza en `backend/src/db.js`, usando `mysql2/promise` y un pool.

## Instancia `API/`

`API/index.js` inicia un segundo proceso, con prefijo `/api/v1` y puerto predeterminado `API_PORT=3001`. Comparte patrones y parte de la implementación con `backend/`, pero no todas sus rutas están sincronizadas; por tanto, no es un sustituto completo del backend principal.

El cliente frontend intenta primero `VITE_BACKEND_URL` y después `VITE_API_BACKUP_URL`. Reintenta ante errores de red, timeout y respuestas HTTP 502, 503 o 504. Las respuestas HTTP distintas, incluidas rutas inexistentes (404), se devuelven como error sin probar otra instancia. El mecanismo es un fallback secuencial del cliente, no balanceo de carga ni replicación de datos.

## Base de datos y flujo de información

Los modelos ejecutan consultas SQL contra la base indicada por `DB_DATABASE`; el esquema SQL de referencia crea/usa `happykids`. Los controladores orquestan validaciones y flujos de negocio. Operaciones como la creación del pedido usan transacciones para mantener coordinados factura, detalles, stock, pago y entrega; los procesos de bodega/mensajería guardan además preparación, responsables, novedades e historial en tablas de flujo.

`api_idempotency` registra solicitudes mutantes que llegan con `Idempotency-Key` y permite reproducir respuestas ya completadas o rechazar el uso conflictivo de la misma clave.

## Configuración

Backend, instancia `API/` y Vite cargan variables desde el `.env` raíz; revisa además los cargadores de entorno y `.env.example` de cada paquete. No se debe consultar ni documentar el `.env` local. Ver [instalación y configuración](03_INSTALACION.md).
