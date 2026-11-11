# HappyKids

HappyKids es una aplicación web de comercio electrónico para productos infantiles. Este monorepo reúne la interfaz React, el servicio Express principal, una segunda instancia Express y los archivos SQL y guías del proyecto.

## Arquitectura

- `frontend/`: React 19, React Router y Vite.
- `backend/`: servicio Express principal; expone las rutas tanto bajo `/api/v1` como sin prefijo.
- `API/`: servicio Express adicional, con rutas bajo `/api/v1`. Su conjunto de rutas no es equivalente al del servicio principal, por lo que no cubre todos los flujos si se usa como respaldo.
- `DOCUMENTACION/`: documentación técnica, esquema SQL y scripts de datos de ejemplo.

El frontend envía las solicitudes a `VITE_BACKEND_URL` y, ante fallos de red, timeout o estados HTTP 502/503/504, intenta `VITE_API_BACKUP_URL`. Ambas instancias se configuran para usar MySQL; la instancia `API/` tiene diferencias de cobertura funcional descritas en la documentación.

## Requisitos

- Node.js y npm, en versiones compatibles con las dependencias de cada paquete.
- MySQL compatible con el esquema de [`DOCUMENTACION/sql/DataBaseHappyKids_CORREGIDA.sql`](DOCUMENTACION/sql/DataBaseHappyKids_CORREGIDA.sql).
- Credenciales de MySQL y un secreto JWT configurados localmente.

## Configuración e instalación

1. Copia `.env.example` a `.env` en la raíz y configura los valores locales. No compartas ni versionas secretos.
2. Instala las dependencias:

   ```bash
   npm run install:all
   ```

3. En una base aislada de desarrollo, prepara el esquema siguiendo [`DOCUMENTACION/03_INSTALACION.md`](DOCUMENTACION/03_INSTALACION.md) y [`DOCUMENTACION/sql/README.md`](DOCUMENTACION/sql/README.md). El archivo `dml.sql` carga datos de demostración; no lo ejecutes en producción.

## Inicio local

Abre una terminal por servicio:

```bash
cd backend
npm run dev
```

```bash
cd API
npm run dev
```

```bash
cd frontend
npm run dev
```

Por defecto, el backend usa el puerto 3000 (`PORT`), `API/` el 3001 (`API_PORT`) y Vite el 5173. La instancia `API/` es opcional para el uso local principal. Las tareas de VS Code del repositorio no inician esa instancia.

## Pruebas y verificaciones

- `npm run verify:all`: pruebas Jest del backend principal, lint y build de frontend. No ejecuta las pruebas de `API/` ni Cypress.
- `npm --prefix backend test`: Jest; también genera cobertura.
- `npm --prefix API test`: pruebas Node.js del paquete `API/`.
- `npm --prefix frontend run test:e2e`: Cypress; requiere que Vite ya esté disponible en el puerto 5173.

## Documentación

Empieza por la [documentación técnica y funcional](DOCUMENTACION/README.md), que enlaza arquitectura, instalación, módulos, API, base de datos y pruebas.
