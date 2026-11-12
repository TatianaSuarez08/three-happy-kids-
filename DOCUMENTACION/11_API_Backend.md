# 11. Backend, API y Postman

## Arquitectura

- `backend/` es la única fuente de rutas de negocio, validación, JWT, permisos y acceso a MySQL.
- `API/` escucha en `API_PORT` (3001) y reenvía todas las solicitudes al backend configurado por `API_BACKEND_URL` (por defecto `http://localhost:3000`). No mantiene una copia activa de la lógica de negocio.
- El frontend usa `VITE_BACKEND_URL` (3000) y puede intentar `VITE_API_BACKUP_URL` (3001) ante fallos de red o 502/503/504. El proxy debe apuntar al mismo backend y no es una segunda instancia de alta disponibilidad.

## Configuración y ejecución

Configura en el `.env` raíz (tiene prioridad sobre `API/.env`):

```env
PORT=3000
API_PORT=3001
API_BACKEND_URL=http://localhost:3000
JWT_SECRET=<secreto local del backend>
DB_HOST=localhost
DB_USER=<usuario local>
DB_PASSWORD=<contraseña local>
DB_DATABASE=happykids
```

Inicia `npm --prefix backend run dev` y `npm --prefix API run dev` en terminales separadas. El proxy no requiere secreto JWT ni credenciales de MySQL; el backend conserva la validación del token y la conexión a datos. Consulta [`10_API_ENDPOINTS.md`](10_API_ENDPOINTS.md) para métodos, rutas y permisos.

## Postman

Importa `API/postman/ThreeHappyKids.postman_collection.json` y `API/postman/ThreeHappyKids.postman_environment.json`. El entorno usa el proxy (`baseUrl=http://localhost:3001`) y construye `apiBase` con `/api/v1`. Ejecuta `Listar tipos de documento` antes de `Registro`; `Login` o `Registro` guarda el JWT de respuesta en la variable de colección `token`. Los endpoints protegidos usan Bearer automáticamente.

La colección incluye ejemplos de formatos reales; algunas operaciones administrativas o de flujo requieren IDs existentes, roles adecuados, datos preparados o archivos seleccionados. No representa credenciales reales ni crea entidades de referencia automáticamente.
