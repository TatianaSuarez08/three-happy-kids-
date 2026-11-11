# 8. Autenticación, autorización y controles

## Registro y credenciales

`POST /registro` es público y crea una cuenta de cliente. El formulario envía nombre de usuario, correo, nombres, documento, tipo de documento y contraseña/confirmación; los campos opcionales de contacto se validan también. `GET /tipos-documento` entrega las opciones activas que necesita el formulario.

Las contraseñas nuevas se guardan usando `bcryptjs`. Para mantener compatibilidad, el login reconoce hashes heredados `salt:hash` basados en SHA-256; después de una autenticación correcta los reemplaza por bcrypt. Por tanto, SHA-256 no es el formato utilizado para nuevas contraseñas.

## Sesión JWT

`POST /login` valida credenciales y devuelve un token junto con un perfil público del usuario. El JWT se firma con `JWT_SECRET`, expira en ocho horas e incluye identidad, correo, nombre, roles y permisos derivados de los roles.

El frontend guarda la sesión en `localStorage` cuando se selecciona “Recordarme” y en `sessionStorage` cuando no. El registro guarda una sesión persistente. Las solicitudes autenticadas envían:

```http
Authorization: Bearer <token>
```

El texto entre corchetes es una forma del contrato, no un token real. Nunca publiques tokens, contraseñas, hashes privados ni valores de `.env`.

## Recuperación de contraseña y correo

`POST /recuperar-contrasena` valida el formato del correo, pero devuelve el mismo mensaje para cuentas existentes e inexistentes. La ruta limita solicitudes por IP; además, cada usuario tiene un periodo mínimo de espera entre correos. Para usuarios activos genera 32 bytes aleatorios, guarda solo su SHA-256 y envía el token original por correo. El token vence a los 20 minutos y una solicitud nueva reemplaza el anterior.

`POST /restablecer-contrasena` recibe el token y las dos contraseñas. El backend verifica expiración, uso previo y estado activo del usuario dentro de una transacción; actualiza el hash de contraseña con el mismo `bcryptjs` existente y marca el token como usado. Los fallos de SMTP no revierten un cambio ya realizado.

La tabla adicional `recuperacion_contrasena` se debe crear manualmente con `DOCUMENTACION/sql/MIGRACION_RECUPERACION_CONTRASENA.sql`. Las cuentas públicas siguen asignándose solo al rol Cliente. La notificación de empleados no envía contraseñas; utiliza las credenciales que el administrador haya indicado por otro canal. La configuración SMTP se describe en [instalación](03_INSTALACION.md).

## Autenticación y autorización del backend

`autenticacion.js` verifica el JWT con el secreto del servicio y asigna su payload a `req.user`. Si falta o no es válido, devuelve `401`.

`role.js` normaliza los roles y permisos incluidos/asociados al usuario. `permitRoles(...)` concede acceso si coincide al menos un rol o permiso permitido por la ruta; la denegación responde `403`. Los roles funcionales son `administrador`, `bodeguero`, `mensajero` y `cliente`. El detalle de permisos por endpoint está en [API y endpoints](10_API_ENDPOINTS.md).

La protección de pantalla en `frontend/src/components/ProtectedRoute.jsx` mejora la navegación, pero no sustituye la verificación del token/permiso en el servidor. El catálogo y el detalle de producto son públicos tanto en la ruta React como en el backend.

## Otras protecciones relacionadas

- **CORS:** Express toma orígenes permitidos de `CORS_ORIGIN`; el ejemplo de entorno incluye los puertos locales de Vite.
- **Idempotencia:** en solicitudes mutantes con `Idempotency-Key`, el middleware guarda hash y respuesta para gestionar reintentos; véase [API](06_API.md).
- **Archivos:** uploads usan middleware dedicado y nombres/rutas gestionados por `subidaImagen.js`; las rutas protegidas mantienen sus guardas de autenticación/rol.
- **Validación:** formularios React y controladores backend validan los datos en sus capas respectivas. La validación del cliente no reemplaza la del servidor.

No se ejecutó una auditoría de seguridad ni se inspeccionó el `.env` local; esta descripción explica los mecanismos visibles en el código y no certifica una configuración de despliegue.
