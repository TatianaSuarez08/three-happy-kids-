# 18. Backend

## Estado actual

El backend está compuesto por Express, rutas, controladores, modelos y middleware.

## Archivos principales

- [Back-end/index.js](../Back-end/index.js)
- [Back-end/src/db.js](../Back-end/src/db.js)
- [Back-end/src/controllers/UsuarioController.js](../Back-end/src/controllers/UsuarioController.js)
- [Back-end/src/controllers/ProductoController.js](../Back-end/src/controllers/ProductoController.js)
- [Back-end/src/controllers/PedidoController.js](../Back-end/src/controllers/PedidoController.js)
- [Back-end/src/models/UsuarioModel.js](../Back-end/src/models/UsuarioModel.js)
- [Back-end/src/models/ProductoModel.js](../Back-end/src/models/ProductoModel.js)
- [Back-end/src/models/PedidoModel.js](../Back-end/src/models/PedidoModel.js)

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
