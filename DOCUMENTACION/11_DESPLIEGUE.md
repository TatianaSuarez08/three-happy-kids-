# 11. Despliegue: configuración y límites

Este documento describe los requisitos visibles en el repositorio y recomendaciones operativas generales. No representa un despliegue existente: no se revisaron servidores, secretos, dominio, proxy, red ni una base de producción.

## Elementos que necesita una instalación

- Runtime Node.js/npm compatible con los paquetes.
- MySQL compatible con el DDL versionado.
- Variables de entorno de conexión, `JWT_SECRET`, CORS y URLs del frontend.
- Almacenamiento persistente y con permisos para los archivos que sube Express.
- HTTPS y un origen de frontend limitado en `CORS_ORIGIN` para un entorno público.

Usa solo variables reales del entorno de destino; no copies credenciales o secretos a este documento. La configuración y valores locales se explican en [Instalación](03_INSTALACION.md).

## Construir y arrancar

El frontend se compila con:

```bash
cd frontend
npm run build
```

Los servicios Express se inician desde sus respectivos paquetes con `npm start` o `npm run dev`. Para despliegue, configura el proceso que ejecuta `backend/` con `PORT` y la base MySQL del entorno. `API/` es un servicio separado con `API_PORT`; no está sincronizado en todas sus rutas y no debe anunciarse como reemplazo íntegro o alta disponibilidad del backend.

## Base de datos y archivos

Antes de poner una instancia en uso, verifica que el esquema y migraciones aprobados correspondan a esa base. El arranque del backend comprueba la conexión y asegura `api_idempotency`, pero no ejecuta el resto de los SQL. El DDL usa `CREATE TABLE IF NOT EXISTS`, que no actualiza tablas preexistentes.

Los uploads requieren que las ubicaciones configuradas en `subidaImagen.js` sean persistentes y escribibles. La imagen se entrega mediante las rutas estáticas de Express. No se verificó aquí ninguna ruta de almacenamiento de producción.

## Verificaciones antes de exponer el servicio

1. Ejecuta las pruebas backend y API que correspondan, lint/build del frontend y Cypress con un entorno de prueba.
2. Verifica `GET /api/v1/health`, CORS desde el origen previsto y comunicación con MySQL.
3. Prueba los roles y rutas protegidas con cuentas de prueba autorizadas.
4. Comprueba persistencia de imágenes y copias de seguridad/restauración de MySQL.
5. Valida URLs de frontend; no asumas que `API/` tiene todas las rutas del servicio principal.

No hay un proveedor, dominio ni valores de producción definidos en la configuración de ejemplo.
