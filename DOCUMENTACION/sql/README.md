# Archivos SQL de HappyKids

## Archivos vigentes

- `DataBaseHappyKids_CORREGIDA.sql`: DDL fuente de verdad. Define las tablas de usuarios y roles, catálogo, clientes/empleados, inventario, carritos, compras, pedidos, pagos, entregas, el flujo persistente de pedidos, recepción de compras, reportes administrativos y la tabla de idempotencia requerida por el backend.
- `dml.sql`: datos ficticios de prueba, sin definición de tablas. Incluye 50 productos, 10 carritos con detalles, 5 compras de proveedor con detalles, 20 pedidos adicionales con dos productos cada uno (más el pedido base), pagos, entregas en varios estados, preparación, historial, novedades de pedido y una recepción parcial de compra con unidades dañadas y un reporte administrativo asociado. Mantiene los cuatro usuarios de demostración.
- `MIGRACION_FLUJO_PEDIDOS.sql` y otras `MIGRACION_*.sql`: cambios incrementales para bases ya existentes. No sustituyen el respaldo previo ni modifican el comportamiento de `CREATE TABLE IF NOT EXISTS` del DDL.
- `USUARIOS_SHA2_SETUP.sql` y `sql_insert_test_users.sql`: archivos obsoletos conservados como avisos; no ejecutarlos.
- `legacy/`: versiones históricas. No ejecutar en instalaciones nuevas.

## Orden para una base de pruebas limpia

1. Usa un servidor/instancia de desarrollo o una base aislada, nunca producción. El DDL selecciona `happykids`; para aislar las pruebas, haz una copia local de ambos scripts y cambia `happykids` por un nombre de prueba en sus sentencias `CREATE DATABASE` y `USE`.
2. Ejecuta primero la copia de `DataBaseHappyKids_CORREGIDA.sql`.
3. Ejecuta después la copia de `dml.sql`.
4. Revisa los `SELECT` finales del DML: deben mostrar los cuatro roles, un resumen de cantidades, pedidos ficticios y el ejemplo de recepción/reporte. Para la recepción demo se espera ver 4 unidades recibidas, 1 dañada y un movimiento de inventario de +3; el reporte debe quedar asociado a la actividad de la novedad.

Ejemplo para una instancia aislada en la que se haya conservado el nombre `happykids`:

```sh
mysql -u root -p < DOCUMENTACION/sql/DataBaseHappyKids_CORREGIDA.sql
mysql -u root -p < DOCUMENTACION/sql/dml.sql
```

No ejecutes estos comandos contra una instancia compartida o de producción. El DDL crea objetos que faltan, pero no altera tablas que ya existan. Para actualizar un esquema existente, inspecciona y aplica las migraciones necesarias por separado, con respaldo.

## Compatibilidad y límites

- El esquema usa InnoDB, `utf8mb4`, `CHECK`, expresiones de fecha por defecto y `CREATE TABLE IF NOT EXISTS`; se requiere MySQL 8.0.16 o posterior (o una versión compatible que aplique `CHECK`).
- `entrega.estado` mantiene `Por recoger`, estado legado documentado en una instancia previa, y agrega `Entrega fallida`. La migración del flujo debe preservar los estados específicos adicionales que pueda tener otra instalación.
- Los usuarios ficticios llevan hashes en el formato SHA-256 legado que acepta temporalmente el backend y que se convierte a bcrypt al autenticar. No se incluyen contraseñas de prueba en texto plano.
- El DML usa consultas por claves únicas y una transacción; no ejecuta `DELETE`. Además de insertar datos ficticios, suma 3 unidades de inventario para la recepción demo una sola vez, protegida por su movimiento de referencia. La fila de factura de ejemplo usa un cliente de correo reservado en `.invalid`.
- La recepción demo usa la clave fija `DEMO-HK-RCP-001` y evita duplicar su detalle, movimiento de inventario, novedad y reporte al volver a ejecutar el DML. Solo genera datos de demostración; ejecútalo exclusivamente en una base aislada.
- `legacy/dml_historico.sql` se conserva como referencia de los productos y pedidos antiguos, no como seed ejecutable. Se quitaron sus contraseñas ficticias en texto plano.

## Validación

Los archivos deben revisarse en un motor MySQL compatible antes de su despliegue. El DML contiene escenarios de demostración y consultas de verificación; estos no son resultados de una ejecución ya realizada. Si no se dispone de una instancia MySQL local, la inspección estática no sustituye la ejecución de DDL/DML ni la verificación de las restricciones foráneas.
