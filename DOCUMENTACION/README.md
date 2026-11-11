# Documentación de HappyKids

Este índice identifica la guía vigente del monorepo. La documentación se basa en los archivos actuales bajo `frontend/`, `backend/`, `API/` y `DOCUMENTACION/sql/`; no implica que se haya inspeccionado una base de datos en ejecución ni un despliegue externo.

## Guía vigente

1. [Introducción y alcance](01_INTRODUCCION.md)
2. [Arquitectura y comunicación](02_ARQUITECTURA.md)
3. [Instalación, configuración y pruebas](03_INSTALACION.md)
4. [Frontend React](04_FRONTEND.md)
5. [Backend Express principal](05_BACKEND.md)
6. [Cliente y comportamiento de la API](06_API.md)
7. [Esquema de base de datos](07_BASE_DE_DATOS.md)
8. [Autenticación y permisos](08_AUTENTICACION_Y_SEGURIDAD.md)
9. [Módulos funcionales](09_FUNCIONALIDADES.md)
10. [Referencia de endpoints](10_API_ENDPOINTS.md)
11. [Notas de despliegue](11_DESPLIEGUE.md)
12. [Mantenimiento y verificación](12_MANTENIMIENTO.md)
13. [Esquema, datos de ejemplo y migraciones](sql/README.md)

## Componentes del repositorio

- `frontend/`: interfaz React/Vite y pruebas de caja negra con Cypress.
- `backend/`: servicio Express principal, pruebas Jest y acceso MySQL.
- `API/`: segunda instancia Express y su suite `node --test`. No tiene paridad completa con todas las rutas del backend principal.
- `DOCUMENTACION/sql/DataBaseHappyKids_CORREGIDA.sql`: DDL de referencia incluido en el repositorio. Describe el esquema previsto para instalaciones nuevas; no certifica el estado de una base de datos externa o ya existente.

## Archivos históricos y referencias

Los demás documentos Markdown se conservan como material de cambios, diagnósticos, migraciones o versiones anteriores. Pueden describir estados previos y no sustituyen la guía vigente enlazada arriba. En particular, los archivos `01_Resumen_Proyecto.md`, `02-AUTENTICACION-SHA2-Y-JWT.md`, `03_Base_Datos.md`, `04-BASE-DE-DATOS.md`, `05-CONSUMO-DE-LA-API-Y-SISTEMA.md`, `06-DIAGNOSTICO-BASE-DE-DATOS-Y-DASHBOARD.md` y `10_Roles_y_Permisos.md` contienen afirmaciones desactualizadas; se añadieron avisos y enlaces a la documentación vigente. Antes de seguir cualquier instrucción histórica, comprueba que coincida con el código y el esquema del entorno. No se eliminó documentación durante esta revisión.

## Seguridad de la documentación

No consultes ni publiques el `.env` local. La configuración de ejemplo contiene placeholders; los secretos y credenciales reales deben mantenerse fuera de Git y de esta documentación.
