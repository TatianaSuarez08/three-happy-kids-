# 01. Introducción

## Propósito del sistema

Three Happy Kids es una solución de comercio electrónico para la venta de productos infantiles. El sistema permite a los clientes explorar catálogo, añadir productos al carrito, guardar favoritos, registrar una compra y consultar el historial de pedidos; además contempla un panel administrativo para gestionar usuarios, productos, inventario y pedidos.

La implementación real se organiza como un monorepo con tres capas principales:

- Frontend: aplicación React + Vite en `frontend/`
- Backend principal: instancia de Express en `backend/`
- API redundante: instancia de Express en `api/` usada como respaldo
- Base de datos: MySQL en la base `happykids`

## Problema que resuelve

El proyecto resuelve la necesidad de gestionar una tienda digital con:

- catálogo público y detalle de producto,
- autenticación con sesión JWT,
- gestión de usuarios por roles,
- stock e inventario,
- flujo de compra y pedidos,
- control administrativo,
- manejo de imágenes de productos y perfil,
- y una capa de redundancia para continuidad del servicio.

## Alcance funcional

El alcance actual documentado por el código incluye:

- registro e inicio de sesión,
- perfiles, foto de perfil, roles de usuario,
- catálogo y categorías,
- productos con imagen, talla, color, estado e precio,
- favoritos,
- carrito de compras,
- creación de pedidos con validación de stock,
- actualización de estado de pedidos,
- administración de usuarios y productos,
- manejo de inventario y movimientos,
- dashboard administrativo,
- salud de la base de datos,
- y estrategia de failover entre backend y API.

## Público objetivo

- clientes para comprar en línea,
- administradores para operar catálogo y usuarios,
- bodegueros para manejar stock e inventario,
- mensajeros para consultar y actualizar entregas,
- y operadores del sistema para mantener la aplicación en producción.

## Estado real del proyecto

La documentación de este repositorio debe basarse en el código actual, no en una versión histórica. En la práctica, el proyecto cuenta con:

- rutas protegidas por JWT,
- validación de permisos por rol,
- control de stock en la creación de pedidos,
- uso de MySQL con pool de conexiones,
- y un cliente frontend que intenta el backend primario y la API de respaldo de forma automática.

## Requisitos para entender el proyecto

Para comprender la aplicación es necesario revisar, al menos:

- `backend/index.js`
- `api/index.js`
- `backend/src/routes/`
- `backend/src/controllers/`
- `backend/src/models/`
- `backend/src/middleware/`
- `frontend/src/services/apiClient.js`
- `frontend/src/App.jsx`
- `documentacion/sql/DataBaseHappyKids_CORREGIDA.sql`
- `.env` raíz

## Convención de documentación

La documentación activa de producción está en esta carpeta. Los archivos antiguos y específicos del proceso de desarrollo se conservan como referencia histórica y no deben considerarse la fuente de verdad si contradicen el código actual.
