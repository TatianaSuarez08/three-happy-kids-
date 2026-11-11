# 3. Instalación, configuración y pruebas

## Requisitos

- Node.js `20.19+` o `22.12+` y npm; el requisito de Vite 8 es `^20.19.0 || >=22.12.0` y Nodemailer 10 requiere Node.js 20 o posterior.
- MySQL compatible con el esquema; la guía SQL indica MySQL 8.0.16 o posterior, o un motor compatible que aplique las restricciones `CHECK`.
- Cliente MySQL o MySQL Workbench para preparar una base de desarrollo.

El repositorio no fija una versión única de Node.js mediante un `engines` común. Consulta también los requisitos de las dependencias instaladas.

## Variables de entorno

1. Copia `.env.example` de la raíz como `.env`.
2. Completa localmente la conexión MySQL (`DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_DATABASE`) y define un `JWT_SECRET` aleatorio.
3. Ajusta, si hace falta, `PORT`, `API_PORT`, `CORS_ORIGIN`, `VITE_BACKEND_URL` y `VITE_API_BACKUP_URL`.
4. Para correos, configura `MAIL_HOST`, `MAIL_PORT`, `MAIL_SECURE`, `MAIL_USER`, `MAIL_PASS`, `MAIL_FROM` y `FRONTEND_URL`. Para SMTP con STARTTLS suele usarse el puerto 587 y `MAIL_SECURE=false`; para TLS implícito, el puerto 465 y `MAIL_SECURE=true`. Sigue los valores de tu proveedor.

No escribas valores reales de secretos en documentación ni los compartas. Los valores del archivo `.env.example` son solo configuración local ilustrativa.

El cargador del backend principal busca primero el `.env` raíz y después `backend/.env`; `API/` también carga el `.env` raíz y puede usar `backend/.env` como respaldo (su `.env.example` no implica que el cargador lea `API/.env`). Vite carga las variables `VITE_*` desde la raíz (`envDir` en `frontend/vite.config.js`), no desde `frontend/.env`. No publiques credenciales SMTP; `MAIL_USER` y `MAIL_PASS` deben configurarse juntos, salvo que el servidor local no requiera autenticación.

Valores predeterminados en código:

| Servicio | Variable | Predeterminado |
|---|---|---|
| Backend principal | `PORT` | `3000` |
| Servicio `API/` | `API_PORT` | `3001` |
| Vite | configuración de Vite | `5173` |
| URL principal del cliente | `VITE_BACKEND_URL` | `http://localhost:3000` |
| URL alternativa del cliente | `VITE_API_BACKUP_URL` | `http://localhost:3001` |

| Variable | Propósito |
|---|---|
| `MAIL_HOST`, `MAIL_PORT`, `MAIL_SECURE` | Host SMTP, puerto y modo TLS |
| `MAIL_USER`, `MAIL_PASS` | Autenticación SMTP; ambos se configuran juntos |
| `MAIL_FROM` | Remitente mostrado en los mensajes |
| `FRONTEND_URL` | Origen del frontend usado en enlaces de acceso y recuperación |

El backend requiere `JWT_SECRET` para iniciar. Los servidores Express necesitan además las variables MySQL. CORS toma los orígenes permitidos de `CORS_ORIGIN`.

## Instalar dependencias

Desde la raíz del monorepo:

```bash
npm run install:all
```

El script instala por separado `API/`, `backend/` y `frontend/`. También es posible instalar dependencias con `npm install` dentro de cada una de esas carpetas.

## Preparar MySQL

El DDL de referencia es `DOCUMENTACION/sql/DataBaseHappyKids_CORREGIDA.sql`; define la base `happykids` y sus tablas. Ejecútalo con MySQL Workbench o el cliente MySQL en una instancia de desarrollo autorizada. El DDL usa `CREATE TABLE IF NOT EXISTS`: no actualiza tablas preexistentes.

Para poblar una base aislada con los datos de demostración, revisa `DOCUMENTACION/sql/README.md` y ejecuta `dml.sql` solo en esa base. No ejecutes archivos de datos de ejemplo en producción. Para un esquema ya existente, compara sus tablas con el DDL y evalúa por separado la migración necesaria; esta guía no ejecuta ni recomienda migraciones automáticas.

Para habilitar recuperación de contraseña en una base existente, revisa y ejecuta manualmente `DOCUMENTACION/sql/MIGRACION_RECUPERACION_CONTRASENA.sql` en la base `happykids` antes de desplegar el backend actualizado. El script crea únicamente la tabla de tokens; no se ejecuta automáticamente ni modifica datos de usuarios.

## Iniciar los servicios

Abre terminales separadas:

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

El backend principal es el servicio requerido para los flujos completos. `API/` es opcional en desarrollo y no tiene paridad total de rutas. Las tareas definidas en VS Code no inician esa instancia adicional.

Health checks:

- Backend: `GET http://localhost:3000/api/v1/health` (también se monta `GET /health`).
- `API/`: `GET http://localhost:3001/api/v1/health`.

El health check del backend consulta MySQL; no se ha verificado aquí una conexión con la base del usuario.

## Comandos de verificación

Desde la raíz:

```bash
npm run verify:all
```

Este comando ejecuta las pruebas Jest del backend principal y después el lint y build de frontend. No ejecuta las pruebas de `API/` ni Cypress.

Comandos específicos:

| Paquete | Comando | Alcance |
|---|---|---|
| `backend/` | `npm test` | Jest; genera reporte de cobertura en `backend/coverage/`. |
| `API/` | `npm test` | Pruebas del paquete con `node --test`. |
| `frontend/` | `npm run lint` | ESLint. |
| `frontend/` | `npm run build` | Compilación Vite. |
| `frontend/` | `npm run test:e2e` | Cypress; necesita Vite corriendo en `http://localhost:5173`. |

Las pruebas Cypress interceptan las solicitudes de API que usan sus escenarios. El comando de Cypress no inicia Vite. Más detalles: [Mantenimiento y pruebas](12_MANTENIMIENTO.md).
