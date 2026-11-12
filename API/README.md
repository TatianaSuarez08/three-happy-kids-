# API proxy

`API/` es un proxy Express opcional. Reenvía las solicitudes al backend principal sin duplicar controladores, autenticación ni lógica de negocio. Las rutas, los query params, headers (incluidos JWT e `Idempotency-Key`), cuerpos JSON y formularios multipart se conservan; los archivos estáticos también se sirven desde el backend.

## Configuración

Configura primero en el `.env` raíz. `API/.env` se usa como respaldo para valores que no estén definidos en el archivo raíz:

```env
API_PORT=3001
API_BACKEND_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:5173,http://127.0.0.1:5173
```

El proxy no necesita credenciales de base de datos ni `JWT_SECRET`: el backend valida el token y accede a MySQL.

## Ejecución y pruebas

```bash
npm --prefix backend run dev
npm --prefix API run dev
```

Al abrir el proyecto en VS Code, la tarea automática `Happy Kids: API` inicia este servicio junto con frontend y backend. También puedes iniciar los comandos manualmente en terminales separadas. API escucha por defecto en `http://localhost:3001` y reenvía al backend en `http://localhost:3000`.

Prueba el reenvío HTTP y los demás tests del paquete con:

```bash
npm --prefix API test
```

La colección está en [`postman/ThreeHappyKids.postman_collection.json`](postman/ThreeHappyKids.postman_collection.json) y el entorno local en [`postman/ThreeHappyKids.postman_environment.json`](postman/ThreeHappyKids.postman_environment.json). Importa ambos, inicia backend y proxy, y usa `Listar tipos de documento` antes de `Registro`. El login o registro guarda el JWT en la variable de colección `token`.

La lista autoritativa de rutas y permisos está en [`DOCUMENTACION/10_API_ENDPOINTS.md`](../DOCUMENTACION/10_API_ENDPOINTS.md).
