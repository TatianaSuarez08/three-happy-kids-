# 11. Despliegue y producción

## Requisitos para producción

Antes de desplegar, se requiere:

- servidor Node.js 20+
- MySQL 8.x o compatible
- entorno seguro para variables de entorno
- dominio o proxy reverso para frontend
- balanceador o enrutamiento para backend/API
- almacenamiento persistente para imágenes subidas
- HTTPS para todo el acceso público

## Variables mínimas de entorno

```env
PORT=3000
API_PORT=3001
DB_HOST=prod-db-host
DB_USER=app_user
DB_PASSWORD=***
DB_DATABASE=happykids
JWT_SECRET=***
CORS_ORIGIN=https://tu-dominio.com
VITE_BACKEND_URL=https://api-principal.tu-dominio.com
VITE_API_BACKUP_URL=https://api-backup.tu-dominio.com
```

> Las credenciales reales no se deben guardar en documentación ni en archivos públicos.

## Preparación del backend

Se debe:

1. instalar dependencias con `npm install`,
2. cargar `.env` con valores de producción,
3. asegurar que la base de datos exista y esté migrada,
4. asegurar que la carpeta de imágenes exista y sea escribible,
5. verificar `JWT_SECRET` y `DB_PASSWORD` en entorno seguro.

## Preparación de la API

La API debe ejecutarse con la misma configuración de entorno que el backend principal, más su puerto de respaldo. La instancia debe apuntar al mismo esquema MySQL y a los mismos archivos de imagen.

## Preparación del frontend

El frontend debe compilar con:

```bash
cd frontend
npm install
npm run build
```

El resultado de build se sirve con un servidor web estático o un reverse proxy.

## Directrices de seguridad

En producción se recomienda:

- HTTPS obligatorio,
- `JWT_SECRET` robusta y almacenada en gestor de secretos,
- `DB_PASSWORD` no embebida en código,
- `CORS_ORIGIN` restringido al dominio real,
- limitar acceso a `/admin` y `/usuarios` a roles adecuados,
- no exponer mensajes internos de error al cliente,
- y revisar archivos de imagen y uploads con límites de tamaño.

## Base de datos en producción

Se debe asegurar:

- conexión persistente y segura,
- backups regulares,
- índices adecuados y monitoreo de consumo,
- correcto esquema `DataBaseHappyKids_CORREGIDA.sql`,
- y permisos mínimos para el usuario de app.

## Failover y servicio continuo

El proyecto implementa failover con dos instancias equivalentes:

- backend principal
- API backup

El frontend intenta responder por su orden configurado. En despliegue real, esto requiere que ambas instancias compartan:

- mismo código,
- mismas dependencias,
- mismo esquema de base de datos,
- y mismo entorno de configuración.

## Verificaciones previas al despliegue

Antes de dejarlo en producción se debe verificar:

- MySQL responde,
- backend y API arrancan sin errores,
- salud responde `ok: true`,
- login funciona con JWT,
- rutas protegidas responden `401`/`403` cuando corresponde,
- productos y pedidos se crean con stock validado,
- idempotencia funciona para reintentos,
- frontend usa la URL correcta según el entorno,
- y se eliminan o restringen mensajes de error internos.

## Recomendación operativa

La arquitectura actual es cognosciblemente un diseño de alta disponibilidad simple, no un sistema de balanceo avanzado ni replicación transaccional de base de datos. Para producción, se recomienda mantener:

- monitorización de backend y API,
- validación de fallos por logs,
- backups automáticos de MySQL,
- observabilidad de latencia y errores HTTP,
- y revisión periódica del estado de la tabla `api_idempotency`.
