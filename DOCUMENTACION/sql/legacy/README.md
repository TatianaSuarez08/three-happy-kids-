# SQL legacy

`DataBaseHappyKids.sql` es el esquema histórico del proyecto. Se conserva únicamente para referencia y no debe utilizarse para instalaciones nuevas.

La fuente de verdad vigente es `../DataBaseHappyKids_CORREGIDA.sql`.

`dml_historico.sql` conserva el conjunto antiguo de productos, inventario y pedidos, pero no debe ejecutarse: usaba IDs consecutivos y operaciones no idempotentes. Se han omitido del archivo las contraseñas ficticias en texto plano. La carga de prueba vigente está en `../dml.sql`.
