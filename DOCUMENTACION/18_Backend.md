# 18. Backend

## Estado actual

El backend está compuesto por Express, rutas, controladores, modelos y middleware.

## Archivos principales

- [backend/index.js](../backend/index.js)
- [backend/src/db.js](../backend/src/db.js)
- [backend/src/controllers/UsuarioController.js](../backend/src/controllers/UsuarioController.js)
- [backend/src/controllers/ProductoController.js](../backend/src/controllers/ProductoController.js)
- [backend/src/controllers/PedidoController.js](../backend/src/controllers/PedidoController.js)
- [backend/src/models/UsuarioModel.js](../backend/src/models/UsuarioModel.js)
- [backend/src/models/ProductoModel.js](../backend/src/models/ProductoModel.js)
- [backend/src/models/PedidoModel.js](../backend/src/models/PedidoModel.js)

## Observaciones

- El backend ya integra la capa de datos con MySQL.
- Existe lógica de autenticación, roles, validación y endpoints.
- La API funciona para las operaciones principales del sistema.

## Problemas principales

- La arquitectura no contempla permisos granulares.
- No existe trazabilidad formal de inventario.
- Faltan endpoints específicos para bodeguero y logística.

## Recomendación

Se recomienda normalizar la API en dominios reales del negocio y aumentar la trazabilidad de cada operación.
