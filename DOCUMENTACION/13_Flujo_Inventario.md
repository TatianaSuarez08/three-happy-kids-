# 13. Flujo de inventario

## Estado real

La tabla `inventario` almacena la cantidad disponible y la cantidad mínima por producto. Esto permite controlar stock actual y alertas de stock bajo.

## Archivos clave

- [DOCUMENTACION/sql/DataBaseHappyKids_CORREGIDA.sql](../DOCUMENTACION/sql/DataBaseHappyKids_CORREGIDA.sql)
- [Back-end/src/models/DashboardModel.js](../Back-end/src/models/DashboardModel.js)
- [Back-end/src/models/ProductoModel.js](../Back-end/src/models/ProductoModel.js)

## Problema principal

El sistema actual no tiene historial de movimientos. Esto significa que no se sabe:

- qué ocurrió,
- cuándo ocurrió,
- quién lo registró,
- por qué se hizo,
- si la salida/entrada corresponde a una compra, preparación, devolución o ajuste.

## Recomendación

Mantener `inventario` para la existencia actual y crear una entidad `movimientos_inventario` para la trazabilidad. Con eso se puede registrar:

- entrada
- salida
- ajuste
- devolución
- traslado
- corrección

Esto es clave para el módulo bodeguero y para administración.
