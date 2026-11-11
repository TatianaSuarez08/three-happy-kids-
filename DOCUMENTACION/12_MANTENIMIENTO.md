# 12. Mantenimiento y verificación

## Pruebas incluidas

### Backend principal: caja blanca

Los tests Jest de `backend/src/routes/tests/` están agrupados en `global/`, `bodega/` y `mensajeria/`. En conjunto cubren routers/controladores, health, acceso y permisos, autenticación/contraseñas/perfil, compras, preparación de pedidos, flujo de entrega y evidencias. Ejecuta desde la raíz:

```bash
npm --prefix backend test
```

El script `jest --coverage` produce salida de cobertura en `backend/coverage/`. El reporte resume el código instrumentado y ejecutado por las pruebas; no es una garantía de ausencia de defectos ni una prueba de integración con una base externa.

### Instancia `API/`

Sus pruebas están en `API/tests/` y se ejecutan con:

```bash
npm --prefix API test
```

El paquete usa el runner de pruebas integrado de Node.js (`node --test`). El comando raíz `npm run verify:all` no incluye esta suite.

### Frontend: caja negra

Las pruebas Cypress están en `frontend/cypress/e2e/`:

- `global/`: pantallas públicas, redirecciones y validación de acceso.
- `cliente/`: pantallas del cliente, catálogo/categorías y validación de registro.
- `administracion/`, `bodega/`, `mensajeria/`: pantallas de esos módulos por rol.

Se ejecutan con:

```bash
npm --prefix frontend run test:e2e
```

La configuración (`frontend/cypress.config.js`) fija `http://localhost:5173` y desactiva `supportFile`. Los specs importan `cypress/support/pantallas-helpers.js` directamente; `support/e2e.js` y `commands.js` no se cargan automáticamente. `fixtures/example.json` es un fixture de ejemplo y no lo usan los specs actuales. Cypress no inicia Vite; inicia primero `npm --prefix frontend run dev`. Los interceptores simulan respuestas de API; estas pruebas no verifican MySQL ni la disponibilidad real de Express.

### Verificación agregada

```bash
npm run verify:all
```

El script raíz corre la suite backend principal y después lint/build de frontend. No ejecuta API ni Cypress. Para cubrir todos los paquetes, ejecuta además los comandos anteriores en un entorno de prueba.

## Mantenimiento operativo

- Usa `GET /api/v1/health` para comprobar el servicio y su conexión MySQL; el backend principal conserva también el path sin prefijo `/health`.
- Revisa los logs de Express y los errores de red/HTTP del cliente al investigar fallos.
- Mantén secretos fuera de Git y confirma los valores de `CORS_ORIGIN`, bases URL y conexión a MySQL en el entorno que ejecuta cada proceso.
- Configura SMTP con las variables `MAIL_*` y `FRONTEND_URL` de `.env.example`. Para comprobar la conexión desde `backend/` con un servidor de pruebas configurado, ejecuta `node --input-type=module -e "import { verifyMailConnection } from './src/services/emailService.js'; await verifyMailConnection(); console.log('SMTP disponible');"`. No se verificó un servidor SMTP real durante esta implementación.
- Antes de desplegar las rutas de recuperación, revisa y aplica manualmente `DOCUMENTACION/sql/MIGRACION_RECUPERACION_CONTRASENA.sql`; no se ejecuta durante el arranque.
- Respalda MySQL antes de aplicar una migración manual. No ejecutes archivos `MIGRACION_*.sql` sin contrastar el estado de la base y el propósito del script.
- Conserva las carpetas de uploads en almacenamiento persistente.
- Revisa el crecimiento de `api_idempotency` según el proceso operativo aprobado; el repositorio no define un trabajo automático de limpieza.

No se ejecutaron migraciones, cambios en MySQL ni operaciones de limpieza durante esta revisión.
