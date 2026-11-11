# Frontend HappyKids

Aplicación de tienda construida con React y Vite. Las rutas de pantalla están en `src/App.jsx`; los servicios HTTP de `src/services/` llaman a la API versionada `/api/v1`.

## Requisitos y ejecución

Instala las dependencias desde esta carpeta y ejecuta Vite:

```bash
npm install
npm run dev
```

Vite lee las variables `VITE_*` del `.env` situado en la raíz del repositorio. Si no se configuran `VITE_BACKEND_URL` y `VITE_API_BACKUP_URL`, el cliente usa `http://localhost:3000` y `http://localhost:3001`, respectivamente.

## Verificaciones

```bash
npm run lint
npm run build
npm run test:e2e
```

Cypress espera que el frontend esté disponible en `http://localhost:5173`; el comando `test:e2e` no inicia el servidor. Las pruebas interceptan las solicitudes de API que necesitan.

Consulta la [guía del proyecto](../DOCUMENTACION/README.md) para la configuración completa, la arquitectura y los módulos funcionales.
