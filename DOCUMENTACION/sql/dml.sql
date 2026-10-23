-- Datos ficticios para comprobar relaciones en una base de pruebas.
-- No elimina filas existentes; agrega una recepcion demo de 3 unidades al
-- inventario solo una vez. Las claves foraneas se resuelven
-- por claves unicas de los ejemplos, nunca por IDs consecutivos.
-- Antes de ejecutarlo, confirma que la conexion apunta a una base de pruebas.
-- Las contrasenas son hashes SHA-256 en formato legado compatible con el
-- backend; al autenticarse correctamente, la aplicacion los migra a bcrypt.
-- Este archivo no contiene contrasenas en texto plano ni credenciales para uso real.

USE happykids;
START TRANSACTION;

INSERT IGNORE INTO rol (nombre_rol) VALUES
    ('Administrador'),
    ('Cliente'),
    ('Bodeguero'),
    ('Mensajero');

INSERT IGNORE INTO tipo_documento (sigla, nombre_documento) VALUES
    ('CC', 'Cedula de ciudadania');

INSERT IGNORE INTO cargo (nombre_cargo) VALUES
    ('Administrador'),
    ('Bodeguero'),
    ('Mensajero');

INSERT IGNORE INTO talla (nombre_talla) VALUES
    ('2'), ('4'), ('6'), ('8'), ('10'), ('12');

INSERT IGNORE INTO color (nombre_color) VALUES
    ('Azul'), ('Rojo'), ('Rosado'), ('Negro'), ('Blanco'), ('Verde');

INSERT IGNORE INTO categoria (nombre_categoria, descripcion) VALUES
    ('Ropa infantil demo', 'Categoria ficticia para datos de prueba'),
    ('Camisetas demo', 'Camisetas infantiles ficticias'),
    ('Pantalones demo', 'Pantalones infantiles ficticios'),
    ('Chaquetas demo', 'Chaquetas infantiles ficticias'),
    ('Vestidos demo', 'Vestidos infantiles ficticios'),
    ('Conjuntos demo', 'Conjuntos infantiles ficticios'),
    ('Pijamas demo', 'Pijamas infantiles ficticias'),
    ('Buzos demo', 'Buzos infantiles ficticios'),
    ('Accesorios demo', 'Accesorios infantiles ficticios');

INSERT IGNORE INTO usuario (nombre_usuario, contrasena, correo, activo, idioma) VALUES
    ('demo_admin_happykids', '4314032fab0158615f76a60ee8454abe:f934ddc5738cd2ee372cb814af769974712acbf26db583441d40824892bc52a8', 'demo.admin@happykids.invalid', TRUE, 'es'),
    ('demo_cliente_happykids', '15a78f08777fc96ed270f97a254ebdd8:c946f8f7b1ad720fba8e99291ff7785a980e68c43dd264fc4f523faee2f58214', 'demo.cliente@happykids.invalid', TRUE, 'es'),
    ('demo_bodega_happykids', '11e9724737d9c60e25192ccbb5f64e9e:14f2d33fb70060c4768eac08058433d5763dce9db4b4c4a5d9231070cbac7e77', 'demo.bodega@happykids.invalid', TRUE, 'es'),
    ('demo_mensajero_happykids', '20b630190d4c72117b47b4df1d3933f6:f8f86de34330178c7d1996ffb6859d9803f1e9d493d88bb0f4b357307a3007c4', 'demo.mensajero@happykids.invalid', TRUE, 'es');

INSERT IGNORE INTO usuario_rol (id_usuario, id_rol)
SELECT u.id, r.id
FROM usuario u
JOIN rol r ON r.nombre_rol = 'Administrador'
WHERE u.correo = 'demo.admin@happykids.invalid';

INSERT IGNORE INTO usuario_rol (id_usuario, id_rol)
SELECT u.id, r.id
FROM usuario u
JOIN rol r ON r.nombre_rol = 'Cliente'
WHERE u.correo = 'demo.cliente@happykids.invalid';

INSERT IGNORE INTO usuario_rol (id_usuario, id_rol)
SELECT u.id, r.id
FROM usuario u
JOIN rol r ON r.nombre_rol = 'Bodeguero'
WHERE u.correo = 'demo.bodega@happykids.invalid';

INSERT IGNORE INTO usuario_rol (id_usuario, id_rol)
SELECT u.id, r.id
FROM usuario u
JOIN rol r ON r.nombre_rol = 'Mensajero'
WHERE u.correo = 'demo.mensajero@happykids.invalid';

INSERT IGNORE INTO cliente
    (primer_nombre, primer_apellido, numero_documento, telefono, direccion,
     ciudad, id_usuario, id_tipo_documento)
SELECT
    'Cliente', 'Demo', 9999000001, '3000000001', 'Direccion de prueba',
    'Bogota', u.id, td.id
FROM usuario u
JOIN tipo_documento td ON td.sigla = 'CC'
WHERE u.correo = 'demo.cliente@happykids.invalid'
  AND NOT EXISTS (
      SELECT 1 FROM cliente c WHERE c.id_usuario = u.id
  );

INSERT IGNORE INTO empleado (nombre, apellido, id_usuario, id_cargo)
SELECT 'Admin', 'Demo', u.id, c.id
FROM usuario u
JOIN cargo c ON c.nombre_cargo = 'Administrador'
WHERE u.correo = 'demo.admin@happykids.invalid';

INSERT IGNORE INTO empleado (nombre, apellido, id_usuario, id_cargo)
SELECT 'Bodega', 'Demo', u.id, c.id
FROM usuario u
JOIN cargo c ON c.nombre_cargo = 'Bodeguero'
WHERE u.correo = 'demo.bodega@happykids.invalid';

INSERT IGNORE INTO empleado (nombre, apellido, id_usuario, id_cargo)
SELECT 'Mensajero', 'Demo', u.id, c.id
FROM usuario u
JOIN cargo c ON c.nombre_cargo = 'Mensajero'
WHERE u.correo = 'demo.mensajero@happykids.invalid';

INSERT IGNORE INTO producto
    (nombre_producto, descripcion, precio_compra, precio_venta, marca,
     id_categoria, id_talla, id_color)
SELECT
    '[DEMO] Camiseta infantil azul', 'Producto ficticio de prueba',
    20000.00, 42000.00, 'HappyKids Demo', cat.id, t.id, col.id
FROM categoria cat
JOIN talla t ON t.nombre_talla = '8'
JOIN color col ON col.nombre_color = 'Azul'
WHERE cat.nombre_categoria = 'Ropa infantil demo';

INSERT IGNORE INTO producto
    (nombre_producto, descripcion, precio_compra, precio_venta, marca,
     id_categoria, id_talla, id_color)
SELECT
    '[DEMO] Pantalon infantil azul', 'Segundo producto ficticio de prueba',
    30000.00, 58000.00, 'HappyKids Demo', cat.id, t.id, col.id
FROM categoria cat
JOIN talla t ON t.nombre_talla = '8'
JOIN color col ON col.nombre_color = 'Azul'
WHERE cat.nombre_categoria = 'Ropa infantil demo';

INSERT IGNORE INTO producto
    (nombre_producto, descripcion, precio_compra, precio_venta, marca,
     id_categoria, id_talla, id_color)
SELECT
    CONCAT('[DEMO] ', estilo.nombre, ' talla ', t.nombre_talla),
    CONCAT(estilo.descripcion, ' - talla ', t.nombre_talla),
    estilo.precio_compra,
    estilo.precio_venta + CAST(t.nombre_talla AS UNSIGNED) * 100,
    'HappyKids Demo',
    cat.id,
    t.id,
    col.id
FROM (
    SELECT 1 AS numero, 'Camiseta infantil' AS nombre, 'Camisetas demo' AS categoria,
           'Camiseta de algodon para pruebas' AS descripcion, 20000.00 AS precio_compra, 42000.00 AS precio_venta, 'Azul' AS color
    UNION ALL SELECT 2, 'Pantalon infantil', 'Pantalones demo', 'Pantalon infantil para pruebas', 30000.00, 58000.00, 'Rojo'
    UNION ALL SELECT 3, 'Chaqueta infantil', 'Chaquetas demo', 'Chaqueta infantil para pruebas', 50000.00, 85000.00, 'Rosado'
    UNION ALL SELECT 4, 'Vestido infantil', 'Vestidos demo', 'Vestido infantil para pruebas', 35000.00, 69000.00, 'Negro'
    UNION ALL SELECT 5, 'Conjunto infantil', 'Conjuntos demo', 'Conjunto infantil para pruebas', 42000.00, 78000.00, 'Blanco'
    UNION ALL SELECT 6, 'Pijama infantil', 'Pijamas demo', 'Pijama infantil para pruebas', 26000.00, 49000.00, 'Verde'
    UNION ALL SELECT 7, 'Buzo infantil', 'Buzos demo', 'Buzo infantil para pruebas', 38000.00, 65000.00, 'Azul'
    UNION ALL SELECT 8, 'Accesorio infantil', 'Accesorios demo', 'Accesorio infantil para pruebas', 10000.00, 22000.00, 'Rojo'
) AS estilo
JOIN categoria cat ON cat.nombre_categoria = estilo.categoria
JOIN talla t ON t.nombre_talla IN ('2', '4', '6', '8', '10', '12')
JOIN color col ON col.nombre_color = estilo.color;

INSERT IGNORE INTO inventario
    (cantidad_disponible, cantidad_minima, id_producto)
SELECT 25, 5, p.id
FROM producto p
WHERE p.nombre_producto LIKE '[DEMO] %';

INSERT IGNORE INTO favorito (id_usuario, id_producto)
SELECT u.id, p.id
FROM usuario u
JOIN producto p ON p.nombre_producto IN (
    '[DEMO] Camiseta infantil azul',
    '[DEMO] Pantalon infantil azul',
    '[DEMO] Vestido infantil talla 8',
    '[DEMO] Pijama infantil talla 6'
)
WHERE u.correo = 'demo.cliente@happykids.invalid';

INSERT IGNORE INTO carrito
    (fecha_creacion, fecha_actualizacion, estado, id_cliente)
SELECT demo.fecha, demo.fecha, demo.estado, c.id
FROM (
    SELECT DATE('2026-09-01') AS fecha, 'Activo' AS estado
    UNION ALL SELECT '2026-09-02', 'Finalizado'
    UNION ALL SELECT '2026-09-03', 'Activo'
    UNION ALL SELECT '2026-09-04', 'Cancelado'
    UNION ALL SELECT '2026-09-05', 'Finalizado'
    UNION ALL SELECT '2026-09-06', 'Activo'
    UNION ALL SELECT '2026-09-07', 'Activo'
    UNION ALL SELECT '2026-09-08', 'Finalizado'
    UNION ALL SELECT '2026-09-09', 'Activo'
    UNION ALL SELECT '2026-09-10', 'Finalizado'
) AS demo
JOIN usuario u ON u.correo = 'demo.cliente@happykids.invalid'
JOIN cliente c ON c.id_usuario = u.id
WHERE NOT EXISTS (
    SELECT 1 FROM carrito existente
    WHERE existente.id_cliente = c.id
      AND existente.fecha_creacion = demo.fecha
);

INSERT IGNORE INTO detalle_carrito
    (cantidad, precio, subtotal, id_carrito, id_producto)
SELECT demo.cantidad, p.precio_venta, demo.cantidad * p.precio_venta, car.id, p.id
FROM (
    SELECT DATE('2026-09-01') AS fecha, '[DEMO] Camiseta infantil azul' AS producto, 2 AS cantidad
    UNION ALL SELECT '2026-09-01', '[DEMO] Pantalon infantil azul', 1
    UNION ALL SELECT '2026-09-02', '[DEMO] Vestido infantil talla 8', 1
    UNION ALL SELECT '2026-09-02', '[DEMO] Buzo infantil talla 6', 2
    UNION ALL SELECT '2026-09-03', '[DEMO] Pijama infantil talla 4', 1
    UNION ALL SELECT '2026-09-03', '[DEMO] Accesorio infantil talla 10', 2
    UNION ALL SELECT '2026-09-04', '[DEMO] Chaqueta infantil talla 8', 1
    UNION ALL SELECT '2026-09-04', '[DEMO] Conjunto infantil talla 6', 1
    UNION ALL SELECT '2026-09-05', '[DEMO] Camiseta infantil talla 10', 2
    UNION ALL SELECT '2026-09-05', '[DEMO] Pantalon infantil talla 12', 1
    UNION ALL SELECT '2026-09-06', '[DEMO] Vestido infantil talla 4', 1
    UNION ALL SELECT '2026-09-06', '[DEMO] Pijama infantil talla 8', 2
    UNION ALL SELECT '2026-09-07', '[DEMO] Buzo infantil talla 10', 1
    UNION ALL SELECT '2026-09-07', '[DEMO] Accesorio infantil talla 6', 2
    UNION ALL SELECT '2026-09-08', '[DEMO] Chaqueta infantil talla 12', 1
    UNION ALL SELECT '2026-09-08', '[DEMO] Conjunto infantil talla 2', 1
    UNION ALL SELECT '2026-09-09', '[DEMO] Camiseta infantil talla 6', 2
    UNION ALL SELECT '2026-09-09', '[DEMO] Pantalon infantil talla 8', 1
    UNION ALL SELECT '2026-09-10', '[DEMO] Vestido infantil talla 10', 1
    UNION ALL SELECT '2026-09-10', '[DEMO] Pijama infantil talla 12', 2
) AS demo
JOIN usuario u ON u.correo = 'demo.cliente@happykids.invalid'
JOIN cliente c ON c.id_usuario = u.id
JOIN carrito car ON car.id_cliente = c.id AND car.fecha_creacion = demo.fecha
JOIN producto p ON p.nombre_producto = demo.producto;

INSERT IGNORE INTO proveedor (nombre, correo, telefono, direccion, nit, contacto) VALUES
    ('Proveedor Demo Uno', 'proveedor1@happykids.invalid', '3000000101', 'Bogota', '900000001-1', 'Contacto Demo Uno'),
    ('Proveedor Demo Dos', 'proveedor2@happykids.invalid', '3000000102', 'Medellin', '900000002-2', 'Contacto Demo Dos'),
    ('Proveedor Demo Tres', 'proveedor3@happykids.invalid', '3000000103', 'Cali', '900000003-3', 'Contacto Demo Tres'),
    ('Proveedor Demo Cuatro', 'proveedor4@happykids.invalid', '3000000104', 'Bogota', '900000004-4', 'Contacto Demo Cuatro'),
    ('Proveedor Demo Cinco', 'proveedor5@happykids.invalid', '3000000105', 'Cali', '900000005-5', 'Contacto Demo Cinco');

INSERT IGNORE INTO compra (fecha_compra, total, id_proveedor)
SELECT demo.fecha, SUM(linea.cantidad * p.precio_compra), prov.id
FROM (
    SELECT 1 AS numero, DATE('2026-08-01') AS fecha, 'proveedor1@happykids.invalid' AS correo
    UNION ALL SELECT 2, '2026-08-02', 'proveedor2@happykids.invalid'
    UNION ALL SELECT 3, '2026-08-03', 'proveedor3@happykids.invalid'
    UNION ALL SELECT 4, '2026-08-04', 'proveedor4@happykids.invalid'
    UNION ALL SELECT 5, '2026-08-05', 'proveedor5@happykids.invalid'
) AS demo
JOIN (
    SELECT 1 AS numero, '[DEMO] Camiseta infantil talla 2' AS producto, 10 AS cantidad
    UNION ALL SELECT 1, '[DEMO] Pantalon infantil talla 4', 8
    UNION ALL SELECT 2, '[DEMO] Chaqueta infantil talla 6', 6
    UNION ALL SELECT 2, '[DEMO] Vestido infantil talla 8', 8
    UNION ALL SELECT 3, '[DEMO] Conjunto infantil talla 10', 7
    UNION ALL SELECT 3, '[DEMO] Pijama infantil talla 12', 10
    UNION ALL SELECT 4, '[DEMO] Buzo infantil talla 2', 8
    UNION ALL SELECT 4, '[DEMO] Accesorio infantil talla 4', 12
    UNION ALL SELECT 5, '[DEMO] Camiseta infantil talla 6', 10
    UNION ALL SELECT 5, '[DEMO] Chaqueta infantil talla 10', 5
) AS linea ON linea.numero = demo.numero
JOIN producto p ON p.nombre_producto = linea.producto
JOIN proveedor prov ON prov.correo = demo.correo
WHERE NOT EXISTS (
    SELECT 1 FROM compra existente
    WHERE existente.id_proveedor = prov.id
      AND existente.fecha_compra = demo.fecha
)
GROUP BY demo.fecha, prov.id;

INSERT IGNORE INTO detalle_compra
    (id_compra, id_producto, cantidad, precio, subtotal)
SELECT co.id, p.id, linea.cantidad, p.precio_compra, linea.cantidad * p.precio_compra
FROM (
    SELECT 1 AS numero, DATE('2026-08-01') AS fecha, 'proveedor1@happykids.invalid' AS correo
    UNION ALL SELECT 2, '2026-08-02', 'proveedor2@happykids.invalid'
    UNION ALL SELECT 3, '2026-08-03', 'proveedor3@happykids.invalid'
    UNION ALL SELECT 4, '2026-08-04', 'proveedor4@happykids.invalid'
    UNION ALL SELECT 5, '2026-08-05', 'proveedor5@happykids.invalid'
) AS demo
JOIN (
    SELECT 1 AS numero, '[DEMO] Camiseta infantil talla 2' AS producto, 10 AS cantidad
    UNION ALL SELECT 1, '[DEMO] Pantalon infantil talla 4', 8
    UNION ALL SELECT 2, '[DEMO] Chaqueta infantil talla 6', 6
    UNION ALL SELECT 2, '[DEMO] Vestido infantil talla 8', 8
    UNION ALL SELECT 3, '[DEMO] Conjunto infantil talla 10', 7
    UNION ALL SELECT 3, '[DEMO] Pijama infantil talla 12', 10
    UNION ALL SELECT 4, '[DEMO] Buzo infantil talla 2', 8
    UNION ALL SELECT 4, '[DEMO] Accesorio infantil talla 4', 12
    UNION ALL SELECT 5, '[DEMO] Camiseta infantil talla 6', 10
    UNION ALL SELECT 5, '[DEMO] Chaqueta infantil talla 10', 5
) AS linea ON linea.numero = demo.numero
JOIN proveedor prov ON prov.correo = demo.correo
JOIN compra co ON co.id_proveedor = prov.id AND co.fecha_compra = demo.fecha
JOIN producto p ON p.nombre_producto = linea.producto
WHERE co.total = (
    SELECT SUM(detalle.cantidad * producto.precio_compra)
    FROM (
        SELECT 1 AS numero, '[DEMO] Camiseta infantil talla 2' AS producto, 10 AS cantidad
        UNION ALL SELECT 1, '[DEMO] Pantalon infantil talla 4', 8
        UNION ALL SELECT 2, '[DEMO] Chaqueta infantil talla 6', 6
        UNION ALL SELECT 2, '[DEMO] Vestido infantil talla 8', 8
        UNION ALL SELECT 3, '[DEMO] Conjunto infantil talla 10', 7
        UNION ALL SELECT 3, '[DEMO] Pijama infantil talla 12', 10
        UNION ALL SELECT 4, '[DEMO] Buzo infantil talla 2', 8
        UNION ALL SELECT 4, '[DEMO] Accesorio infantil talla 4', 12
        UNION ALL SELECT 5, '[DEMO] Camiseta infantil talla 6', 10
        UNION ALL SELECT 5, '[DEMO] Chaqueta infantil talla 10', 5
    ) AS detalle
    JOIN producto ON producto.nombre_producto = detalle.producto
    WHERE detalle.numero = demo.numero
);

INSERT IGNORE INTO factura (fecha, total, estado, id_cliente, id_empleado)
SELECT
    '2020-01-01', 100000.00, 'Pagada', c.id, e.id
FROM cliente c
JOIN usuario uc ON uc.id = c.id_usuario
JOIN usuario ua ON ua.correo = 'demo.admin@happykids.invalid'
JOIN empleado e ON e.id_usuario = ua.id
WHERE uc.correo = 'demo.cliente@happykids.invalid'
  AND NOT EXISTS (
      SELECT 1
      FROM factura f
      WHERE f.id_cliente = c.id
        AND f.fecha = '2020-01-01'
        AND f.total = 100000.00
  );

INSERT IGNORE INTO detalle_pedido
    (id_factura, id_producto, cantidad, precio_unitario, subtotal)
SELECT f.id, p.id, 1, 42000.00, 42000.00
FROM factura f
JOIN cliente c ON c.id = f.id_cliente
JOIN usuario u ON u.id = c.id_usuario
JOIN producto p ON p.nombre_producto = '[DEMO] Camiseta infantil azul'
WHERE u.correo = 'demo.cliente@happykids.invalid'
  AND f.fecha = '2020-01-01'
  AND f.total = 100000.00;

INSERT IGNORE INTO detalle_pedido
    (id_factura, id_producto, cantidad, precio_unitario, subtotal)
SELECT f.id, p.id, 1, 58000.00, 58000.00
FROM factura f
JOIN cliente c ON c.id = f.id_cliente
JOIN usuario u ON u.id = c.id_usuario
JOIN producto p ON p.nombre_producto = '[DEMO] Pantalon infantil azul'
WHERE u.correo = 'demo.cliente@happykids.invalid'
  AND f.fecha = '2020-01-01'
  AND f.total = 100000.00;

INSERT IGNORE INTO pago
    (metodo_pago, fecha_pago, total, numero_transaccion, observacion, id_factura)
SELECT 'Transferencia', f.fecha, f.total, 'DEMO-HK-ORDER-001',
       'Pago ficticio de demostracion', f.id
FROM factura f
JOIN cliente c ON c.id = f.id_cliente
JOIN usuario u ON u.id = c.id_usuario
WHERE u.correo = 'demo.cliente@happykids.invalid'
  AND f.fecha = '2020-01-01'
  AND f.total = 100000.00
  AND NOT EXISTS (SELECT 1 FROM pago pg WHERE pg.id_factura = f.id);

INSERT IGNORE INTO entrega
    (estado, empresa_transportadora, numero_guia, id_factura)
SELECT 'Pendiente', 'Transportadora Demo', 'DEMO-HK-GUIA-001', f.id
FROM factura f
JOIN cliente c ON c.id = f.id_cliente
JOIN usuario u ON u.id = c.id_usuario
WHERE u.correo = 'demo.cliente@happykids.invalid'
  AND f.fecha = '2020-01-01'
  AND f.total = 100000.00;

INSERT IGNORE INTO pedido_flujo (id_factura)
SELECT f.id
FROM factura f
JOIN cliente c ON c.id = f.id_cliente
JOIN usuario u ON u.id = c.id_usuario
WHERE u.correo = 'demo.cliente@happykids.invalid'
  AND f.fecha = '2020-01-01'
  AND f.total = 100000.00;

INSERT INTO pedido_historial (id_factura, id_usuario, evento, observacion)
SELECT f.id, u.id, 'Pedido de demostracion', 'Registro ficticio para verificar el flujo'
FROM factura f
JOIN cliente c ON c.id = f.id_cliente
JOIN usuario uc ON uc.id = c.id_usuario
JOIN usuario u ON u.correo = 'demo.cliente@happykids.invalid'
WHERE uc.correo = 'demo.cliente@happykids.invalid'
  AND f.fecha = '2020-01-01'
  AND f.total = 100000.00
  AND NOT EXISTS (
      SELECT 1
      FROM pedido_historial h
      WHERE h.id_factura = f.id
        AND h.evento = 'Pedido de demostracion'
  );

-- Veinte pedidos adicionales con dos productos cada uno.
INSERT IGNORE INTO factura (fecha, total, estado, id_cliente, id_empleado)
SELECT demo.fecha, SUM(linea.cantidad * p.precio_venta), 'Pagada', c.id, e.id
FROM (
    SELECT DATE('2026-10-01') AS fecha, 1 AS numero
    UNION ALL SELECT '2026-10-02', 2
    UNION ALL SELECT '2026-10-03', 3
    UNION ALL SELECT '2026-10-04', 4
    UNION ALL SELECT '2026-10-05', 5
    UNION ALL SELECT '2026-10-06', 6
    UNION ALL SELECT '2026-10-07', 7
    UNION ALL SELECT '2026-10-08', 8
    UNION ALL SELECT '2026-10-09', 9
    UNION ALL SELECT '2026-10-10', 10
    UNION ALL SELECT '2026-10-11', 11
    UNION ALL SELECT '2026-10-12', 12
    UNION ALL SELECT '2026-10-13', 13
    UNION ALL SELECT '2026-10-14', 14
    UNION ALL SELECT '2026-10-15', 15
    UNION ALL SELECT '2026-10-16', 16
    UNION ALL SELECT '2026-10-17', 17
    UNION ALL SELECT '2026-10-18', 18
    UNION ALL SELECT '2026-10-19', 19
    UNION ALL SELECT '2026-10-20', 20
) AS demo
JOIN (
    SELECT 1 AS numero, '[DEMO] Camiseta infantil talla 2' AS producto, 2 AS cantidad
    UNION ALL SELECT 1, '[DEMO] Pantalon infantil talla 4', 1
    UNION ALL SELECT 2, '[DEMO] Chaqueta infantil talla 6', 1
    UNION ALL SELECT 2, '[DEMO] Vestido infantil talla 8', 1
    UNION ALL SELECT 3, '[DEMO] Conjunto infantil talla 10', 1
    UNION ALL SELECT 3, '[DEMO] Pijama infantil talla 12', 2
    UNION ALL SELECT 4, '[DEMO] Buzo infantil talla 2', 1
    UNION ALL SELECT 4, '[DEMO] Accesorio infantil talla 4', 2
    UNION ALL SELECT 5, '[DEMO] Camiseta infantil talla 6', 1
    UNION ALL SELECT 5, '[DEMO] Pantalon infantil talla 8', 2
    UNION ALL SELECT 6, '[DEMO] Chaqueta infantil talla 10', 1
    UNION ALL SELECT 6, '[DEMO] Vestido infantil talla 12', 1
    UNION ALL SELECT 7, '[DEMO] Conjunto infantil talla 2', 2
    UNION ALL SELECT 7, '[DEMO] Pijama infantil talla 4', 1
    UNION ALL SELECT 8, '[DEMO] Buzo infantil talla 6', 1
    UNION ALL SELECT 8, '[DEMO] Accesorio infantil talla 8', 3
    UNION ALL SELECT 9, '[DEMO] Camiseta infantil talla 10', 1
    UNION ALL SELECT 9, '[DEMO] Pantalon infantil talla 12', 1
    UNION ALL SELECT 10, '[DEMO] Chaqueta infantil talla 2', 1
    UNION ALL SELECT 10, '[DEMO] Vestido infantil talla 4', 2
    UNION ALL SELECT 11, '[DEMO] Conjunto infantil talla 6', 1
    UNION ALL SELECT 11, '[DEMO] Pijama infantil talla 8', 1
    UNION ALL SELECT 12, '[DEMO] Buzo infantil talla 10', 2
    UNION ALL SELECT 12, '[DEMO] Accesorio infantil talla 12', 1
    UNION ALL SELECT 13, '[DEMO] Camiseta infantil talla 4', 1
    UNION ALL SELECT 13, '[DEMO] Pantalon infantil talla 6', 1
    UNION ALL SELECT 14, '[DEMO] Chaqueta infantil talla 8', 1
    UNION ALL SELECT 14, '[DEMO] Vestido infantil talla 10', 1
    UNION ALL SELECT 15, '[DEMO] Conjunto infantil talla 12', 1
    UNION ALL SELECT 15, '[DEMO] Pijama infantil talla 2', 2
    UNION ALL SELECT 16, '[DEMO] Buzo infantil talla 4', 1
    UNION ALL SELECT 16, '[DEMO] Accesorio infantil talla 6', 2
    UNION ALL SELECT 17, '[DEMO] Camiseta infantil talla 8', 2
    UNION ALL SELECT 17, '[DEMO] Pantalon infantil talla 10', 1
    UNION ALL SELECT 18, '[DEMO] Chaqueta infantil talla 12', 1
    UNION ALL SELECT 18, '[DEMO] Vestido infantil talla 2', 1
    UNION ALL SELECT 19, '[DEMO] Conjunto infantil talla 4', 1
    UNION ALL SELECT 19, '[DEMO] Pijama infantil talla 6', 1
    UNION ALL SELECT 20, '[DEMO] Buzo infantil talla 8', 1
    UNION ALL SELECT 20, '[DEMO] Accesorio infantil talla 10', 2
) AS linea ON linea.numero = demo.numero
JOIN producto p ON p.nombre_producto = linea.producto
JOIN usuario u ON u.correo = 'demo.cliente@happykids.invalid'
JOIN cliente c ON c.id_usuario = u.id
JOIN usuario admin_user ON admin_user.correo = 'demo.admin@happykids.invalid'
JOIN empleado e ON e.id_usuario = admin_user.id
WHERE NOT EXISTS (
    SELECT 1 FROM factura existente
    WHERE existente.id_cliente = c.id
      AND existente.fecha = demo.fecha
)
GROUP BY demo.fecha, c.id, e.id;

INSERT IGNORE INTO detalle_pedido
    (id_factura, id_producto, cantidad, precio_unitario, subtotal)
SELECT f.id, p.id, linea.cantidad, p.precio_venta,
       linea.cantidad * p.precio_venta
FROM (
    SELECT DATE('2026-10-01') AS fecha, 1 AS numero
    UNION ALL SELECT '2026-10-02', 2
    UNION ALL SELECT '2026-10-03', 3
    UNION ALL SELECT '2026-10-04', 4
    UNION ALL SELECT '2026-10-05', 5
    UNION ALL SELECT '2026-10-06', 6
    UNION ALL SELECT '2026-10-07', 7
    UNION ALL SELECT '2026-10-08', 8
    UNION ALL SELECT '2026-10-09', 9
    UNION ALL SELECT '2026-10-10', 10
    UNION ALL SELECT '2026-10-11', 11
    UNION ALL SELECT '2026-10-12', 12
    UNION ALL SELECT '2026-10-13', 13
    UNION ALL SELECT '2026-10-14', 14
    UNION ALL SELECT '2026-10-15', 15
    UNION ALL SELECT '2026-10-16', 16
    UNION ALL SELECT '2026-10-17', 17
    UNION ALL SELECT '2026-10-18', 18
    UNION ALL SELECT '2026-10-19', 19
    UNION ALL SELECT '2026-10-20', 20
) AS demo
JOIN (
    SELECT 1 AS numero, '[DEMO] Camiseta infantil talla 2' AS producto, 2 AS cantidad
    UNION ALL SELECT 1, '[DEMO] Pantalon infantil talla 4', 1
    UNION ALL SELECT 2, '[DEMO] Chaqueta infantil talla 6', 1
    UNION ALL SELECT 2, '[DEMO] Vestido infantil talla 8', 1
    UNION ALL SELECT 3, '[DEMO] Conjunto infantil talla 10', 1
    UNION ALL SELECT 3, '[DEMO] Pijama infantil talla 12', 2
    UNION ALL SELECT 4, '[DEMO] Buzo infantil talla 2', 1
    UNION ALL SELECT 4, '[DEMO] Accesorio infantil talla 4', 2
    UNION ALL SELECT 5, '[DEMO] Camiseta infantil talla 6', 1
    UNION ALL SELECT 5, '[DEMO] Pantalon infantil talla 8', 2
    UNION ALL SELECT 6, '[DEMO] Chaqueta infantil talla 10', 1
    UNION ALL SELECT 6, '[DEMO] Vestido infantil talla 12', 1
    UNION ALL SELECT 7, '[DEMO] Conjunto infantil talla 2', 2
    UNION ALL SELECT 7, '[DEMO] Pijama infantil talla 4', 1
    UNION ALL SELECT 8, '[DEMO] Buzo infantil talla 6', 1
    UNION ALL SELECT 8, '[DEMO] Accesorio infantil talla 8', 3
    UNION ALL SELECT 9, '[DEMO] Camiseta infantil talla 10', 1
    UNION ALL SELECT 9, '[DEMO] Pantalon infantil talla 12', 1
    UNION ALL SELECT 10, '[DEMO] Chaqueta infantil talla 2', 1
    UNION ALL SELECT 10, '[DEMO] Vestido infantil talla 4', 2
    UNION ALL SELECT 11, '[DEMO] Conjunto infantil talla 6', 1
    UNION ALL SELECT 11, '[DEMO] Pijama infantil talla 8', 1
    UNION ALL SELECT 12, '[DEMO] Buzo infantil talla 10', 2
    UNION ALL SELECT 12, '[DEMO] Accesorio infantil talla 12', 1
    UNION ALL SELECT 13, '[DEMO] Camiseta infantil talla 4', 1
    UNION ALL SELECT 13, '[DEMO] Pantalon infantil talla 6', 1
    UNION ALL SELECT 14, '[DEMO] Chaqueta infantil talla 8', 1
    UNION ALL SELECT 14, '[DEMO] Vestido infantil talla 10', 1
    UNION ALL SELECT 15, '[DEMO] Conjunto infantil talla 12', 1
    UNION ALL SELECT 15, '[DEMO] Pijama infantil talla 2', 2
    UNION ALL SELECT 16, '[DEMO] Buzo infantil talla 4', 1
    UNION ALL SELECT 16, '[DEMO] Accesorio infantil talla 6', 2
    UNION ALL SELECT 17, '[DEMO] Camiseta infantil talla 8', 2
    UNION ALL SELECT 17, '[DEMO] Pantalon infantil talla 10', 1
    UNION ALL SELECT 18, '[DEMO] Chaqueta infantil talla 12', 1
    UNION ALL SELECT 18, '[DEMO] Vestido infantil talla 2', 1
    UNION ALL SELECT 19, '[DEMO] Conjunto infantil talla 4', 1
    UNION ALL SELECT 19, '[DEMO] Pijama infantil talla 6', 1
    UNION ALL SELECT 20, '[DEMO] Buzo infantil talla 8', 1
    UNION ALL SELECT 20, '[DEMO] Accesorio infantil talla 10', 2
) AS linea ON linea.numero = demo.numero
JOIN usuario u ON u.correo = 'demo.cliente@happykids.invalid'
JOIN cliente c ON c.id_usuario = u.id
JOIN factura f ON f.id_cliente = c.id AND f.fecha = demo.fecha
JOIN producto p ON p.nombre_producto = linea.producto;

INSERT IGNORE INTO pago
    (metodo_pago, fecha_pago, total, numero_transaccion, observacion, id_factura)
SELECT
    CASE MOD(DAY(f.fecha), 5)
        WHEN 0 THEN 'Tarjeta'
        WHEN 1 THEN 'Transferencia'
        WHEN 2 THEN 'Nequi'
        WHEN 3 THEN 'Daviplata'
        ELSE 'Efectivo'
    END,
    f.fecha,
    f.total,
    CONCAT('DEMO-HK-', DATE_FORMAT(f.fecha, '%m%d')),
    'Pago ficticio de pedido de demostracion',
    f.id
FROM factura f
JOIN cliente c ON c.id = f.id_cliente
JOIN usuario u ON u.id = c.id_usuario
WHERE u.correo = 'demo.cliente@happykids.invalid'
  AND f.fecha BETWEEN '2026-10-01' AND '2026-10-20'
  AND NOT EXISTS (SELECT 1 FROM pago existente WHERE existente.id_factura = f.id);

INSERT IGNORE INTO entrega (fecha_entrega, estado, empresa_transportadora, numero_guia, id_factura)
SELECT
    NULL,
    CASE MOD(DAY(f.fecha), 4)
        WHEN 0 THEN 'En camino'
        WHEN 1 THEN 'Pendiente'
        WHEN 2 THEN 'Por recoger'
        ELSE 'Entrega fallida'
    END,
    'Transportadora Demo',
    CONCAT('DEMO-GUIA-', DATE_FORMAT(f.fecha, '%m%d')),
    f.id
FROM factura f
JOIN cliente c ON c.id = f.id_cliente
JOIN usuario u ON u.id = c.id_usuario
WHERE u.correo = 'demo.cliente@happykids.invalid'
  AND f.fecha BETWEEN '2026-10-01' AND '2026-10-20';

INSERT IGNORE INTO pedido_flujo
    (id_factura, estado_preparacion, id_bodeguero, fecha_asignacion_bodega,
     fecha_preparacion, id_mensajero, fecha_asignacion_mensajero, estado_entrega)
SELECT
    f.id,
    CASE WHEN e.estado IN ('Por recoger', 'En camino', 'Entrega fallida') THEN 'Listo para despacho' ELSE 'Pendiente' END,
    CASE WHEN e.estado IN ('Por recoger', 'En camino', 'Entrega fallida') THEN bodega.id ELSE NULL END,
    CASE WHEN e.estado IN ('Por recoger', 'En camino', 'Entrega fallida') THEN f.fecha ELSE NULL END,
    CASE WHEN e.estado IN ('Por recoger', 'En camino', 'Entrega fallida') THEN f.fecha ELSE NULL END,
    CASE WHEN e.estado IN ('En camino', 'Entrega fallida') THEN mensajero.id ELSE NULL END,
    CASE WHEN e.estado IN ('En camino', 'Entrega fallida') THEN f.fecha ELSE NULL END,
    CASE
        WHEN e.estado IN ('En camino', 'Entrega fallida') THEN e.estado
        ELSE 'Pendiente'
    END
FROM factura f
JOIN cliente c ON c.id = f.id_cliente
JOIN usuario cliente_user ON cliente_user.id = c.id_usuario
JOIN entrega e ON e.id_factura = f.id
JOIN usuario bodega ON bodega.correo = 'demo.bodega@happykids.invalid'
JOIN usuario mensajero ON mensajero.correo = 'demo.mensajero@happykids.invalid'
WHERE cliente_user.correo = 'demo.cliente@happykids.invalid'
  AND f.fecha BETWEEN '2026-10-01' AND '2026-10-20';

INSERT IGNORE INTO pedido_preparacion_detalle
    (id_factura, id_producto, encontrado, cantidad_preparada, observacion, id_bodeguero)
SELECT f.id, p.id, TRUE, dp.cantidad, '', bodega.id
FROM factura f
JOIN detalle_pedido dp ON dp.id_factura = f.id
JOIN producto p ON p.id = dp.id_producto
JOIN entrega e ON e.id_factura = f.id
    AND e.estado IN ('Por recoger', 'En camino', 'Entrega fallida')
JOIN cliente c ON c.id = f.id_cliente
JOIN usuario cliente_user ON cliente_user.id = c.id_usuario
JOIN usuario bodega ON bodega.correo = 'demo.bodega@happykids.invalid'
WHERE cliente_user.correo = 'demo.cliente@happykids.invalid'
  AND f.fecha BETWEEN '2026-10-01' AND '2026-10-20';

INSERT INTO pedido_historial (id_factura, id_usuario, evento, observacion)
SELECT f.id, u.id, 'Pedido de demostracion', 'Pedido ficticio con detalles, pago y entrega'
FROM factura f
JOIN cliente c ON c.id = f.id_cliente
JOIN usuario cliente_user ON cliente_user.id = c.id_usuario
JOIN usuario u ON u.correo = 'demo.cliente@happykids.invalid'
WHERE cliente_user.correo = 'demo.cliente@happykids.invalid'
  AND f.fecha BETWEEN '2026-10-01' AND '2026-10-20'
  AND NOT EXISTS (
      SELECT 1 FROM pedido_historial h
      WHERE h.id_factura = f.id AND h.evento = 'Pedido de demostracion'
  );

INSERT INTO pedido_historial (id_factura, id_usuario, evento, observacion)
SELECT f.id, u.id, CONCAT('Entrega: ', e.estado), 'Estado inicial ficticio de la entrega'
FROM factura f
JOIN cliente c ON c.id = f.id_cliente
JOIN usuario cliente_user ON cliente_user.id = c.id_usuario
JOIN usuario u ON u.correo = 'demo.mensajero@happykids.invalid'
JOIN entrega e ON e.id_factura = f.id
WHERE cliente_user.correo = 'demo.cliente@happykids.invalid'
  AND f.fecha BETWEEN '2026-10-01' AND '2026-10-20'
  AND NOT EXISTS (
      SELECT 1 FROM pedido_historial h
      WHERE h.id_factura = f.id
        AND h.evento = CONCAT('Entrega: ', e.estado)
  );

INSERT INTO pedido_novedad
    (id_factura, id_producto, etapa, tipo, descripcion, estado, decision,
     id_reporta, id_resuelve, resuelta_en)
SELECT
    f.id, p.id, 'Bodega', 'Otra novedad',
    'Novedad ficticia resuelta para demostrar el panel administrativo',
    'Resuelta', 'Caso de prueba revisado y cerrado',
    bodega.id, admin_user.id, f.fecha
FROM factura f
JOIN cliente c ON c.id = f.id_cliente
JOIN usuario cliente_user ON cliente_user.id = c.id_usuario
JOIN producto p ON p.nombre_producto = '[DEMO] Camiseta infantil talla 6'
JOIN usuario bodega ON bodega.correo = 'demo.bodega@happykids.invalid'
JOIN usuario admin_user ON admin_user.correo = 'demo.admin@happykids.invalid'
WHERE cliente_user.correo = 'demo.cliente@happykids.invalid'
  AND f.fecha = '2026-10-05'
  AND NOT EXISTS (
      SELECT 1 FROM pedido_novedad n
      WHERE n.id_factura = f.id
        AND n.tipo = 'Otra novedad'
        AND n.descripcion = 'Novedad ficticia resuelta para demostrar el panel administrativo'
  );

INSERT INTO pedido_novedad
    (id_factura, id_producto, etapa, tipo, descripcion, estado, id_reporta)
SELECT
    f.id, p.id, 'Mensajería', 'Entrega fallida',
    'No fue posible completar la entrega; ejemplo de incidencia para reintento',
    'Pendiente', mensajero.id
FROM factura f
JOIN cliente c ON c.id = f.id_cliente
JOIN usuario cliente_user ON cliente_user.id = c.id_usuario
JOIN entrega e ON e.id_factura = f.id AND e.estado = 'Entrega fallida'
JOIN producto p ON p.nombre_producto = '[DEMO] Pijama infantil talla 4'
JOIN usuario mensajero ON mensajero.correo = 'demo.mensajero@happykids.invalid'
WHERE cliente_user.correo = 'demo.cliente@happykids.invalid'
  AND f.fecha = '2026-10-07'
  AND NOT EXISTS (
      SELECT 1 FROM pedido_novedad n
      WHERE n.id_factura = f.id
        AND n.tipo = 'Entrega fallida'
        AND n.descripcion = 'No fue posible completar la entrega; ejemplo de incidencia para reintento'
  );

-- Recepcion parcial de compra para comprobar las tablas añadidas por las migraciones.
-- Se reciben 4 unidades de una linea de compra; 1 se reporta dañada y solo 3
-- se suman al inventario. La clave fija y las comprobaciones evitan duplicados
-- al volver a ejecutar este DML en la misma base de pruebas.
INSERT IGNORE INTO compra_recepcion (id_compra, id_usuario, clave_idempotencia)
SELECT co.id, bodega.id, 'DEMO-HK-RCP-001'
FROM compra co
JOIN proveedor prov ON prov.id = co.id_proveedor
JOIN usuario bodega ON bodega.correo = 'demo.bodega@happykids.invalid'
WHERE prov.correo = 'proveedor1@happykids.invalid'
  AND co.fecha_compra = '2026-08-01'
  AND NOT EXISTS (
      SELECT 1
      FROM compra_recepcion existente
      WHERE existente.clave_idempotencia = 'DEMO-HK-RCP-001'
  );

INSERT INTO compra_recepcion_detalle
    (id_recepcion, id_detalle_compra, cantidad_recibida, cantidad_danada)
SELECT r.id, dc.id, 4, 1
FROM compra_recepcion r
JOIN compra co ON co.id = r.id_compra
JOIN proveedor prov ON prov.id = co.id_proveedor
JOIN detalle_compra dc ON dc.id_compra = co.id
JOIN producto p ON p.id = dc.id_producto
WHERE r.clave_idempotencia = 'DEMO-HK-RCP-001'
  AND prov.correo = 'proveedor1@happykids.invalid'
  AND co.fecha_compra = '2026-08-01'
  AND p.nombre_producto = '[DEMO] Camiseta infantil talla 2'
  AND dc.cantidad >= 4
  AND NOT EXISTS (
      SELECT 1
      FROM compra_recepcion_detalle existente
      WHERE existente.id_recepcion = r.id
        AND existente.id_detalle_compra = dc.id
  );

INSERT INTO inventario (cantidad_disponible, cantidad_minima, id_producto)
SELECT 3, 0, p.id
FROM compra_recepcion r
JOIN compra co ON co.id = r.id_compra
JOIN detalle_compra dc ON dc.id_compra = co.id
JOIN producto p ON p.id = dc.id_producto
WHERE r.clave_idempotencia = 'DEMO-HK-RCP-001'
  AND p.nombre_producto = '[DEMO] Camiseta infantil talla 2'
  AND EXISTS (
      SELECT 1
      FROM compra_recepcion_detalle rd
      WHERE rd.id_recepcion = r.id
        AND rd.id_detalle_compra = dc.id
        AND rd.cantidad_recibida = 4
        AND rd.cantidad_danada = 1
  )
  AND NOT EXISTS (
      SELECT 1
      FROM inventario_movimiento m
      WHERE m.referencia = CONCAT('RECEPCION_COMPRA:', co.id, ':', r.id)
        AND m.motivo = 'Recepción de compra'
  )
ON DUPLICATE KEY UPDATE
    cantidad_disponible = cantidad_disponible + VALUES(cantidad_disponible),
    fecha_actualizacion = CURRENT_DATE;

INSERT INTO inventario_movimiento
    (id_producto, tipo, cantidad, delta, motivo, referencia, id_usuario, fecha_movimiento)
SELECT p.id, 'entrada', 3, 3, 'Recepción de compra',
       CONCAT('RECEPCION_COMPRA:', co.id, ':', r.id), bodega.id, NOW()
FROM compra_recepcion r
JOIN compra co ON co.id = r.id_compra
JOIN proveedor prov ON prov.id = co.id_proveedor
JOIN detalle_compra dc ON dc.id_compra = co.id
JOIN producto p ON p.id = dc.id_producto
JOIN usuario bodega ON bodega.id = r.id_usuario
WHERE r.clave_idempotencia = 'DEMO-HK-RCP-001'
  AND prov.correo = 'proveedor1@happykids.invalid'
  AND p.nombre_producto = '[DEMO] Camiseta infantil talla 2'
  AND EXISTS (
      SELECT 1
      FROM compra_recepcion_detalle rd
      WHERE rd.id_recepcion = r.id
        AND rd.id_detalle_compra = dc.id
        AND rd.cantidad_recibida = 4
        AND rd.cantidad_danada = 1
  )
  AND NOT EXISTS (
      SELECT 1
      FROM inventario_movimiento existente
      WHERE existente.referencia = CONCAT('RECEPCION_COMPRA:', co.id, ':', r.id)
        AND existente.motivo = 'Recepción de compra'
  );

INSERT INTO pedido_novedad
    (id_factura, id_compra, id_detalle_compra, id_producto, etapa,
     tipo, descripcion, cantidad, id_reporta)
SELECT NULL, co.id, dc.id, p.id, 'Recepción', 'Dañado',
       'Registro ficticio: 1 unidad recibida dañada', 1, bodega.id
FROM compra_recepcion r
JOIN compra co ON co.id = r.id_compra
JOIN proveedor prov ON prov.id = co.id_proveedor
JOIN detalle_compra dc ON dc.id_compra = co.id
JOIN producto p ON p.id = dc.id_producto
JOIN usuario bodega ON bodega.id = r.id_usuario
WHERE r.clave_idempotencia = 'DEMO-HK-RCP-001'
  AND prov.correo = 'proveedor1@happykids.invalid'
  AND p.nombre_producto = '[DEMO] Camiseta infantil talla 2'
  AND EXISTS (
      SELECT 1
      FROM compra_recepcion_detalle rd
      WHERE rd.id_recepcion = r.id
        AND rd.id_detalle_compra = dc.id
        AND rd.cantidad_recibida = 4
        AND rd.cantidad_danada = 1
  )
  AND NOT EXISTS (
      SELECT 1
      FROM pedido_novedad existente
      WHERE existente.id_compra = co.id
        AND existente.id_detalle_compra = dc.id
        AND existente.tipo = 'Dañado'
        AND existente.descripcion = 'Registro ficticio: 1 unidad recibida dañada'
  );

INSERT INTO admin_reporte_actividad
    (id_administrador, id_usuario_reportado, rol_reportado, actividad_id,
     id_factura, motivo, descripcion)
SELECT administrador.id, n.id_reporta, 'Bodeguero',
       CONCAT('novedad-compra-', n.id), NULL,
       'Reporte de demostración de recepción',
       'Reporte ficticio vinculado a la novedad de unidades dañadas de la compra demo.'
FROM pedido_novedad n
JOIN compra co ON co.id = n.id_compra
JOIN proveedor prov ON prov.id = co.id_proveedor
JOIN usuario administrador ON administrador.correo = 'demo.admin@happykids.invalid'
WHERE prov.correo = 'proveedor1@happykids.invalid'
  AND co.fecha_compra = '2026-08-01'
  AND n.tipo = 'Dañado'
  AND n.descripcion = 'Registro ficticio: 1 unidad recibida dañada'
  AND NOT EXISTS (
      SELECT 1
      FROM admin_reporte_actividad existente
      WHERE existente.actividad_id = CONCAT('novedad-compra-', n.id)
        AND existente.motivo = 'Reporte de demostración de recepción'
  );

COMMIT;

-- Verificaciones: resumen de datos, pedidos y resultados esperados de recepción/reporte.
SELECT r.nombre_rol
FROM rol r
WHERE r.nombre_rol IN ('Administrador', 'Cliente', 'Bodeguero', 'Mensajero')
ORDER BY r.nombre_rol;

SELECT
    (SELECT COUNT(*) FROM producto WHERE nombre_producto LIKE '[DEMO] %') AS productos_demo,
    (SELECT COUNT(*)
     FROM carrito car
     JOIN cliente c ON c.id = car.id_cliente
     JOIN usuario u ON u.id = c.id_usuario
     WHERE u.correo = 'demo.cliente@happykids.invalid'
       AND car.fecha_creacion BETWEEN '2026-09-01' AND '2026-09-10') AS carritos_demo,
    (SELECT COUNT(*)
     FROM compra co
     JOIN proveedor prov ON prov.id = co.id_proveedor
     WHERE prov.correo LIKE 'proveedor%@happykids.invalid'
       AND co.fecha_compra BETWEEN '2026-08-01' AND '2026-08-05') AS compras_demo,
    (SELECT COUNT(*)
     FROM factura f
     JOIN cliente c ON c.id = f.id_cliente
     JOIN usuario u ON u.id = c.id_usuario
     WHERE u.correo = 'demo.cliente@happykids.invalid'
       AND f.fecha BETWEEN '2026-10-01' AND '2026-10-20') AS pedidos_adicionales_demo,
    (SELECT COUNT(*)
     FROM compra_recepcion
     WHERE clave_idempotencia = 'DEMO-HK-RCP-001') AS recepciones_demo,
    (SELECT COUNT(*)
     FROM admin_reporte_actividad
     WHERE motivo = 'Reporte de demostración de recepción') AS reportes_recepcion_demo;

SELECT
    r.clave_idempotencia,
    co.id AS id_compra,
    p.nombre_producto,
    rd.cantidad_recibida,
    rd.cantidad_danada,
    rd.cantidad_recibida - rd.cantidad_danada AS unidades_agregadas_a_inventario,
    m.delta AS movimiento_inventario,
    m.referencia
FROM compra_recepcion r
JOIN compra co ON co.id = r.id_compra
JOIN compra_recepcion_detalle rd ON rd.id_recepcion = r.id
JOIN detalle_compra dc ON dc.id = rd.id_detalle_compra
JOIN producto p ON p.id = dc.id_producto
LEFT JOIN inventario_movimiento m
    ON m.referencia = CONCAT('RECEPCION_COMPRA:', co.id, ':', r.id)
   AND m.id_producto = p.id
WHERE r.clave_idempotencia = 'DEMO-HK-RCP-001';

SELECT
    r.actividad_id,
    r.motivo,
    r.descripcion,
    r.estado,
    reportado.nombre_usuario AS usuario_reportado,
    administrador.nombre_usuario AS administrador
FROM admin_reporte_actividad r
JOIN usuario reportado ON reportado.id = r.id_usuario_reportado
JOIN usuario administrador ON administrador.id = r.id_administrador
WHERE r.motivo = 'Reporte de demostración de recepción';

SELECT
    f.id AS id_factura,
    f.fecha,
    f.estado AS estado_factura,
    f.total,
    u.correo AS cliente_demo,
    p.nombre_producto,
    dp.cantidad,
    dp.precio_unitario,
    e.estado AS estado_entrega,
    pf.estado_preparacion,
    pf.estado_entrega AS estado_flujo
FROM factura f
JOIN cliente c ON c.id = f.id_cliente
JOIN usuario u ON u.id = c.id_usuario
JOIN detalle_pedido dp ON dp.id_factura = f.id
JOIN producto p ON p.id = dp.id_producto
LEFT JOIN entrega e ON e.id_factura = f.id
LEFT JOIN pedido_flujo pf ON pf.id_factura = f.id
WHERE u.correo = 'demo.cliente@happykids.invalid'
  AND f.fecha BETWEEN '2020-01-01' AND '2026-10-20'
ORDER BY f.fecha, f.id, p.nombre_producto;
