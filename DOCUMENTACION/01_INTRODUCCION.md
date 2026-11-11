# 1. Descripción general

## Qué es HappyKids

HappyKids es una aplicación web de comercio electrónico para productos infantiles. El repositorio es un monorepo con una aplicación de navegador, un servicio Express principal, una instancia Express adicional y scripts SQL para el esquema y datos de demostración.

## Objetivo y alcance funcional

El sistema reúne los procesos que efectivamente aparecen en el código:

- **Cliente:** consulta el catálogo y el detalle público de productos; con sesión puede administrar carrito y favoritos, confirmar compras, consultar pedidos y actualizar su perfil.
- **Administrador:** consulta el dashboard y administra productos, usuarios, pedidos, compras y novedades.
- **Bodega:** consulta inventario y movimientos, recibe compras, toma pedidos disponibles y registra la preparación y sus novedades.
- **Mensajería:** consulta entregas disponibles o asignadas, actualiza estados, reporta novedades y adjunta evidencia fotográfica de entrega.

El proyecto no implementa un proveedor de pago en línea externo. El checkout y el registro de pago se documentan según el flujo interno y las tablas existentes, no como una transacción con una pasarela.

## Tecnologías

- Frontend: React 19, React Router, Vite, Bootstrap y Bootstrap Icons.
- Backend principal y servicio adicional: Node.js y Express.
- Persistencia: MySQL mediante `mysql2/promise`.
- Autenticación: JWT; `bcryptjs` para contraseñas nuevas y verificación/migración de hashes heredados.
- Verificación: Jest en `backend/`, Node.js `node:test` en `API/` y Cypress en `frontend/`.

Las versiones instaladas/declaradas dependen de los `package.json` de cada paquete. La configuración de ejecución se documenta en [Instalación](03_INSTALACION.md).

## Componentes y relación

El navegador usa `frontend/src/services/apiClient.js` para enviar solicitudes HTTP a `/api/v1`. La URL principal predeterminada es `http://localhost:3000`; se puede configurar una segunda URL, predeterminada a `http://localhost:3001`, como alternativa. `backend/` expone las rutas versionadas y las antiguas rutas sin prefijo. `API/` es otro proceso Express, pero sus rutas no cubren todos los casos del backend principal.

El backend principal organiza las solicitudes entre routers, controladores, modelos y servicios; los modelos consultan la base `happykids` mediante un pool MySQL. La definición de esquema del repositorio es `DOCUMENTACION/sql/DataBaseHappyKids_CORREGIDA.sql`.

## Límites de esta descripción

La documentación describe el código y SQL versionados en el repositorio. No se inspeccionó el `.env` local, no se consultó una base MySQL activa y no se verificó un entorno de producción.

## Lecturas relacionadas

- [Arquitectura](02_ARQUITECTURA.md)
- [Frontend](04_FRONTEND.md)
- [Backend](05_BACKEND.md)
- [Módulos funcionales](09_FUNCIONALIDADES.md)
- [Base de datos](07_BASE_DE_DATOS.md)
