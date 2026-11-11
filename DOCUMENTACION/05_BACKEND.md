# 5. Backend Express principal

## Organización

```text
backend/
├── index.js
└── src/
    ├── config/       # carga y normalización de configuración
    ├── routes/       # métodos HTTP, paths y middleware de cada módulo
    ├── controllers/  # validación de entrada y respuestas HTTP
    ├── services/     # correo centralizado y reglas de flujos
    ├── models/       # acceso SQL a MySQL
    ├── middleware/   # JWT, permisos, idempotencia y archivos
    ├── utils/        # utilidades, entre ellas contraseñas
    └── db.js         # pool MySQL y verificación de conexión
```

La estructura agrupa un controlador, un modelo y un router por funcionalidad cuando corresponde; los flujos de preparación/entrega y algunos comportamientos de negocio se separan en servicios. `index.js` es el punto de composición del servicio.

## Arranque y configuración

`backend/index.js` configura CORS, parseadores JSON y URL-encoded, Morgan, idempotencia, archivos estáticos y routers. Monta los routers tanto bajo `/api/v1` como en la raíz sin prefijo. `GET /` responde el estado de la aplicación.

El cargador de `src/config/env.js` busca primero el `.env` raíz y después `backend/.env`; `JWT_SECRET` es obligatorio. `src/db.js` usa `mysql2/promise` con un pool y verifica MySQL con `SELECT 1`. Al iniciar, asegura la existencia de `api_idempotency`. Estas operaciones no aplican las demás migraciones del esquema.

## Capas y responsabilidad

1. **Router:** vincula método/path con autenticación, permisos, carga de archivos y controlador.
2. **Controlador:** valida los datos de solicitud, coordina servicio/modelo y construye la respuesta JSON/código HTTP.
3. **Servicio:** implementa procesos de varios pasos o reglas compartidas, por ejemplo transiciones de pedido, preparación o evidencia.
4. **Modelo:** ejecuta consultas SQL y transacciones en MySQL.

Controladores principales: usuario/autenticación, recuperación de contraseña, producto/catálogo, carrito, favoritos, pedido/flujo de pedido, administración de usuarios, dashboard, inventario, logística y salud. Los modelos del mismo dominio manejan las tablas indicadas en [base de datos](07_BASE_DE_DATOS.md).

## Middleware

- `autenticacion.js` exige `Authorization: Bearer <JWT>` y adjunta el payload validado a `req.user`.
- `role.js` normaliza roles y permisos y autoriza cuando coincide al menos un rol o permiso configurado en la ruta.
- `idempotencia.js` actúa en métodos mutantes solo cuando existe `Idempotency-Key`; registra hash y respuesta para repetición segura, y rechaza claves demasiado largas o asociadas a un cuerpo distinto.
- `rateLimit.js` limita por IP las solicitudes públicas de recuperación de contraseña.
- `subidaImagen.js` configura almacenamiento y filtros de imágenes de producto, perfil y evidencia.

La autenticación, el mapeo de permisos y los roles se detallan en [Autenticación y permisos](08_AUTENTICACION_Y_SEGURIDAD.md).

## Módulos de rutas

| Dominio | Router | Responsabilidad |
|---|---|---|
| Usuario y autenticación | `UsuarioRoute.js` | Registro, login, recuperación de contraseña, tipos de documento, perfil y foto. |
| Catálogo y productos | `CatalogoRoute.js`, `ProductoRoute.js` | Categorías y consulta/administración de productos. |
| Compra del cliente | `CarritoRoute.js`, `FavoritoRoute.js`, `PedidoRoute.js` | Carrito, favoritos y pedidos. |
| Administración | `AdminUsuarioRoute.js`, `DashboardRoute.js` | Usuarios administrativos y métricas. |
| Inventario/abastecimiento | `InventarioRoute.js` | Movimientos/actividad, compras de proveedor y recepciones. |
| Preparación y entrega | `PedidoFlujoRoute.js` | Asignación y flujo de bodega/mensajería, evidencias y novedades. |
| Logística y salud | `LogisticaRoute.js`, `HealthRoute.js` | Resumen logístico y estado de MySQL. |

La referencia de métodos, paths y guardas está en [API y endpoints](10_API_ENDPOINTS.md).

## Reglas y persistencia relevantes

- El registro guarda contraseña nueva con bcrypt; el login también reconoce hashes heredados y, si son válidos, los actualiza al formato bcrypt.
- `PasswordRecoveryController.js` emite respuestas genéricas para evitar enumerar cuentas, genera tokens aleatorios de un solo uso y coordina su expiración, hash y consumo transaccional con `UsuarioModel.js`.
- `emailService.js` configura Nodemailer de forma perezosa y comparte plantillas HTML/texto para bienvenida, recuperación, cambio de contraseña y notificación a empleados. Un fallo de correo no revierte la creación de una cuenta ni un cambio de contraseña ya confirmado.
- El registro público sigue creando únicamente Clientes. La creación administrativa de personal envía una notificación sin incluir la contraseña introducida.
- Crear un pedido valida stock y coordina factura, líneas, inventario, pago y entrega.
- La preparación en bodega y la entrega del mensajero se persisten en tablas de flujo, historial y novedades.
- Los modelos acceden a MySQL; el esquema de referencia es `DOCUMENTACION/sql/DataBaseHappyKids_CORREGIDA.sql`.
- La tabla `recuperacion_contrasena` se añade mediante el script manual `DOCUMENTACION/sql/MIGRACION_RECUPERACION_CONTRASENA.sql`; no se crea al iniciar Express. Las variables SMTP están en la guía de [instalación](03_INSTALACION.md).

No se ejecutaron migraciones ni consultas sobre una instancia MySQL real durante esta revisión.

## Pruebas

Las pruebas Jest del backend principal están en `backend/src/routes/tests/`, organizadas por grupos funcionales. Se ejecutan con `npm test` dentro de `backend/`; el script también genera `backend/coverage/`. El script de la raíz `verify:all` ejecuta estas pruebas antes del lint/build del frontend, no las pruebas del paquete `API/` ni Cypress.
