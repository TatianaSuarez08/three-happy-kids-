-- ===========================================
-- ROLES
-- ===========================================

INSERT INTO rol (nombre_rol) VALUES
('Administrador'),
('Cliente'),
('Bodeguero'),
('Mensajero');

-- ===========================================
-- TIPOS DE DOCUMENTO
-- ===========================================

INSERT INTO tipo_documento (sigla, nombre_documento) VALUES
('CC', 'Cédula de Ciudadanía'),
('TI', 'Tarjeta de Identidad'),
('CE', 'Cédula de Extranjería'),
('PP', 'Pasaporte');

-- ===========================================
-- CARGOS
-- ===========================================

INSERT INTO cargo (nombre_cargo) VALUES
('Administrador'),
('Bodeguero'),
('Mensajero');

-- ===========================================
-- TALLAS
-- ===========================================

INSERT INTO talla (nombre_talla) VALUES
('2'),
('4'),
('6'),
('8'),
('10'),
('12'),
('14'),
('16');

-- ===========================================
-- COLORES
-- ===========================================

INSERT INTO color (nombre_color) VALUES
('Rojo'),
('Azul'),
('Negro'),
('Blanco'),
('Gris'),
('Verde'),
('Rosado'),
('Amarillo'),
('Morado'),
('Naranja');

-- ===========================================
-- CATEGORÍAS
-- ===========================================

INSERT INTO categoria (nombre_categoria, descripcion) VALUES
('Camisetas', 'Camisetas infantiles'),
('Pantalones', 'Pantalones infantiles'),
('Chaquetas', 'Chaquetas infantiles'),
('Vestidos', 'Vestidos infantiles'),
('Conjuntos', 'Conjuntos infantiles'),
('Pijamas', 'Pijamas infantiles'),
('Zapatos', 'Calzado infantil'),
('Accesorios', 'Accesorios para niños');

-- ===========================================
-- USUARIOS
-- Contraseña temporal para pruebas
-- ===========================================

INSERT INTO usuario (nombre_usuario, contrasena, correo) VALUES
('admin','Admin123*','admin@happykids.com'),
('bodega01','Bodega123*','bodega01@happykids.com'),
('bodega02','Bodega123*','bodega02@happykids.com'),
('mensajero01','Mensajero123*','mensajero01@happykids.com'),
('mensajero02','Mensajero123*','mensajero02@happykids.com'),

('juan.rodriguez','Cliente123*','juan.rodriguez@gmail.com'),
('maria.gomez','Cliente123*','maria.gomez@gmail.com'),
('carlos.perez','Cliente123*','carlos.perez@gmail.com'),
('laura.martinez','Cliente123*','laura.martinez@gmail.com'),
('andres.sanchez','Cliente123*','andres.sanchez@gmail.com'),
('valentina.rojas','Cliente123*','valentina.rojas@gmail.com'),
('camila.torres','Cliente123*','camila.torres@gmail.com'),
('sebastian.ruiz','Cliente123*','sebastian.ruiz@gmail.com'),
('isabella.moreno','Cliente123*','isabella.moreno@gmail.com'),
('daniel.castro','Cliente123*','daniel.castro@gmail.com');

-- ===========================================
-- 1 = Administrador
-- 2 = Cliente
-- 3 = Bodeguero
-- 4 = Mensajero
-- ===========================================

INSERT INTO usuario_rol (id_usuario,id_rol) VALUES

(1,1),

(2,3),
(3,3),

(4,4),
(5,4),

(6,2),
(7,2),
(8,2),
(9,2),
(10,2),
(11,2),
(12,2),
(13,2),
(14,2),
(15,2);


-- ===========================================
-- CLIENTES
-- id_usuario del 6 al 15
-- ===========================================

INSERT INTO cliente
(primer_nombre, primer_apellido, numero_documento, telefono, direccion, ciudad, id_usuario, id_tipo_documento)
VALUES
('Juan','Rodríguez',1012456789,'3001111111','Cra 10 #15-20','Bogotá',6,1),
('María','Gómez',1012456790,'3001111112','Cra 12 #20-18','Bogotá',7,1),
('Carlos','Pérez',1012456791,'3001111113','Calle 80 #15-30','Bogotá',8,1),
('Laura','Martínez',1012456792,'3001111114','Cra 45 #100-25','Bogotá',9,1),
('Andrés','Sánchez',1012456793,'3001111115','Calle 120 #10-15','Bogotá',10,1),
('Valentina','Rojas',1012456794,'3001111116','Cra 7 #40-22','Bogotá',11,1),
('Camila','Torres',1012456795,'3001111117','Calle 50 #25-18','Bogotá',12,1),
('Sebastián','Ruiz',1012456796,'3001111118','Cra 30 #45-70','Bogotá',13,1),
('Isabella','Moreno',1012456797,'3001111119','Cra 60 #90-12','Bogotá',14,1),
('Daniel','Castro',1012456798,'3001111120','Calle 26 #70-10','Bogotá',15,1);

-- ===========================================
-- EMPLEADOS
-- ===========================================

INSERT INTO empleado
(nombre, apellido, salario, id_usuario, id_cargo)
VALUES
('Carlos','López',3500000,1,1),
('Jhon','Ramírez',1800000,2,2),
('Paula','Vargas',1800000,3,2),
('Luis','García',1700000,4,3),
('Diana','Suárez',1700000,5,3);

-- ===========================================
-- PROVEEDORES
-- ===========================================

INSERT INTO proveedor
(nombre,correo,telefono,direccion,nit,contacto)
VALUES
('Confecciones Andinas SAS','ventas@andinas.com','6013001000','Bogotá','900111111-1','Carlos Díaz'),
('Moda Infantil Colombia','info@modainfantil.com','6013001001','Bogotá','900222222-2','Sandra López'),
('Kids Fashion SAS','ventas@kidsfashion.com','6013001002','Medellín','900333333-3','Laura Gómez'),
('Pequeños Gigantes','contacto@pg.com','6013001003','Cali','900444444-4','Diego Ruiz'),
('Textiles Bogotá SAS','ventas@textilesbogota.com','6013001004','Bogotá','900555555-5','Andrea Torres');

-- ===========================================
-- PRODUCTOS
-- ===========================================

INSERT INTO producto
(nombre_producto,descripcion,precio_compra,precio_venta,marca,imagen_producto,id_categoria,id_talla,id_color)
VALUES
('Camiseta Avengers','Camiseta estampada',25000,42000,'Marvel','avengers.jpg',1,4,2),
('Camiseta Minnie','Camiseta Minnie Mouse',24000,41000,'Disney','minnie.jpg',1,3,7),
('Jean Niño Azul','Jean clásico',40000,65000,'HappyKids','jean.jpg',2,5,2),
('Jean Negro','Jean negro',42000,68000,'HappyKids','jean2.jpg',2,6,3),
('Chaqueta Impermeable','Chaqueta infantil',60000,95000,'HappyKids','chaqueta.jpg',3,6,5),
('Vestido Floral','Vestido niña',50000,82000,'HappyKids','vestido.jpg',4,5,7),
('Conjunto Deportivo','Conjunto deportivo',58000,90000,'Nike Kids','conjunto.jpg',5,6,3),
('Pijama Dinosaurios','Pijama algodón',35000,56000,'HappyKids','pijama.jpg',6,4,6),
('Tenis Blancos','Tenis deportivos',70000,110000,'Adidas Kids','tenis.jpg',7,5,4),
('Gorra Kids','Gorra infantil',15000,28000,'HappyKids','gorra.jpg',8,4,2),

('Buso Unicornio','Buso niña',42000,69000,'HappyKids','buso1.jpg',1,5,7),
('Buso Spiderman','Buso niño',42000,69000,'Marvel','buso2.jpg',1,5,2),
('Leggins Rosados','Leggins',25000,43000,'HappyKids','leggins.jpg',2,4,7),
('Short Deportivo','Short niño',22000,39000,'HappyKids','short.jpg',2,4,3),
('Chaqueta Jean','Chaqueta jean',65000,98000,'HappyKids','cj.jpg',3,6,2),
('Vestido Elegante','Vestido fiesta',70000,115000,'HappyKids','vf.jpg',4,6,7),
('Conjunto Casual','Conjunto algodón',45000,72000,'HappyKids','cc.jpg',5,4,5),
('Pijama Princesas','Pijama Disney',38000,59000,'Disney','pp.jpg',6,4,7),
('Botas Lluvia','Botas impermeables',55000,85000,'HappyKids','botas.jpg',7,5,2),
('Medias Infantiles','Medias x3',8000,15000,'HappyKids','medias.jpg',8,3,4),

('Camiseta Sonic','Camiseta niño',26000,43000,'Sega','sonic.jpg',1,4,2),
('Pantalón Jogger','Jogger infantil',36000,59000,'HappyKids','jogger.jpg',2,5,3),
('Chaqueta Escolar','Chaqueta escolar',58000,89000,'HappyKids','escolar.jpg',3,6,5),
('Vestido Primavera','Vestido colorido',52000,83000,'HappyKids','primavera.jpg',4,5,8),
('Conjunto Mickey','Conjunto Disney',60000,95000,'Disney','mickey.jpg',5,5,2),
('Pijama Ositos','Pijama suave',34000,54000,'HappyKids','ositos.jpg',6,4,9),
('Sandalias','Sandalias infantiles',30000,48000,'HappyKids','sandalias.jpg',7,4,10),
('Maleta Escolar','Maleta niños',65000,98000,'HappyKids','maleta.jpg',8,4,2),
('Camiseta Batman','Camiseta DC',26000,43000,'DC','batman.jpg',1,5,3),
('Jean Gris','Jean gris',39000,64000,'HappyKids','jeangris.jpg',2,6,5);

-- ===========================================
-- INVENTARIO
-- ===========================================

INSERT INTO inventario
(cantidad_disponible,cantidad_minima,id_producto)
VALUES
(50,10,1),
(45,10,2),
(40,10,3),
(35,10,4),
(30,10,5),
(28,10,6),
(26,10,7),
(45,10,8),
(20,5,9),
(60,15,10),
(32,10,11),
(40,10,12),
(50,10,13),
(38,10,14),
(25,5,15),
(20,5,16),
(45,10,17),
(35,10,18),
(30,10,19),
(70,20,20),
(40,10,21),
(35,10,22),
(28,10,23),
(22,5,24),
(36,10,25),
(48,10,26),
(25,5,27),
(18,5,28),
(33,10,29),
(27,10,30);


-- ===========================================
-- COMPRAS
-- ===========================================

INSERT INTO compra
(fecha_compra,total,id_proveedor)
VALUES
('2026-01-10',1250000,1),
('2026-01-18',980000,2),
('2026-02-05',1560000,3),
('2026-02-20',870000,4),
('2026-03-02',1320000,5),
('2026-03-18',940000,1),
('2026-04-08',1180000,2),
('2026-04-22',1490000,3),
('2026-05-10',1010000,4),
('2026-05-28',1640000,5);

-- ===========================================
-- DETALLE DE COMPRAS
-- ===========================================

INSERT INTO detalle_compra
(id_compra,id_producto,cantidad,precio,subtotal)
VALUES

-- Compra 1
(1,1,20,25000,500000),
(1,2,15,24000,360000),
(1,3,10,39000,390000),

-- Compra 2
(2,4,12,42000,504000),
(2,5,8,59500,476000),

-- Compra 3
(3,6,15,50000,750000),
(3,7,9,58000,522000),
(3,8,5,57600,288000),

-- Compra 4
(4,9,6,70000,420000),
(4,10,15,15000,225000),
(4,11,5,45000,225000),

-- Compra 5
(5,12,10,42000,420000),
(5,13,20,25000,500000),
(5,14,10,40000,400000),

-- Compra 6
(6,15,8,65000,520000),
(6,16,4,70000,280000),
(6,17,2,70000,140000),

-- Compra 7
(7,18,10,38000,380000),
(7,19,6,55000,330000),
(7,20,30,10000,300000),

-- Compra 8
(8,21,15,26000,390000),
(8,22,12,36000,432000),
(8,23,8,58000,464000),
(8,24,4,51000,204000),

-- Compra 9
(9,25,8,60000,480000),
(9,26,10,34000,340000),
(9,27,5,38000,190000),

-- Compra 10
(10,28,10,65000,650000),
(10,29,15,26000,390000),
(10,30,10,39000,390000);


-- ===========================================
-- CARRITOS
-- ===========================================

INSERT INTO carrito
(fecha_creacion, fecha_actualizacion, estado, id_cliente)
VALUES
('2026-06-01','2026-06-01','Activo',1),
('2026-06-02','2026-06-02','Finalizado',2),
('2026-06-03','2026-06-03','Activo',3),
('2026-06-04','2026-06-04','Cancelado',4),
('2026-06-05','2026-06-05','Finalizado',5),
('2026-06-06','2026-06-06','Activo',6),
('2026-06-07','2026-06-07','Activo',7),
('2026-06-08','2026-06-08','Finalizado',8),
('2026-06-09','2026-06-09','Activo',9),
('2026-06-10','2026-06-10','Finalizado',10);

-- ===========================================
-- DETALLE CARRITO
-- ===========================================

INSERT INTO detalle_carrito
(cantidad, precio, subtotal, id_carrito, id_producto)
VALUES

-- Carrito 1
(2,42000,84000,1,1),
(1,65000,65000,1,3),
(1,56000,56000,1,8),

-- Carrito 2
(1,82000,82000,2,6),
(2,28000,56000,2,10),
(1,110000,110000,2,9),

-- Carrito 3
(3,43000,129000,3,21),
(2,59000,118000,3,22),
(1,98000,98000,3,15),

-- Carrito 4
(1,69000,69000,4,11),
(2,43000,86000,4,13),
(1,48000,48000,4,27),

-- Carrito 5
(1,115000,115000,5,16),
(1,72000,72000,5,17),
(2,15000,30000,5,20),

-- Carrito 6
(2,43000,86000,6,29),
(1,64000,64000,6,30),
(1,59000,59000,6,18),

-- Carrito 7
(2,41000,82000,7,2),
(1,68000,68000,7,4),
(1,89000,89000,7,23),

-- Carrito 8
(1,95000,95000,8,25),
(2,54000,108000,8,26),
(1,98000,98000,8,28),

-- Carrito 9
(1,90000,90000,9,7),
(2,43000,86000,9,12),
(1,85000,85000,9,19),

-- Carrito 10
(2,39000,78000,10,14),
(1,83000,83000,10,24),
(2,42000,84000,10,1);


-- ===========================================
-- FACTURAS
-- ===========================================

INSERT INTO factura
(fecha,total,id_cliente,id_empleado)
VALUES
('2026-06-02',205000,1,1),
('2026-06-03',248000,2,1),
('2026-06-05',345000,3,1),
('2026-06-08',203000,4,1),
('2026-06-10',217000,5,1),
('2026-06-12',209000,6,1),
('2026-06-15',239000,7,1),
('2026-06-18',301000,8,1),
('2026-06-20',261000,9,1),
('2026-06-22',245000,10,1),
('2026-06-24',184000,2,1),
('2026-06-26',296000,5,1),
('2026-06-27',187000,6,1),
('2026-06-29',332000,8,1),
('2026-06-30',274000,10,1);

-- ===========================================
-- DETALLE PEDIDO
-- ===========================================

INSERT INTO detalle_pedido
(id_factura,id_producto,cantidad,precio_unitario,subtotal)
VALUES

-- Factura 1
(1,1,2,42000,84000),
(1,3,1,65000,65000),
(1,8,1,56000,56000),

-- Factura 2
(2,6,1,82000,82000),
(2,9,1,110000,110000),
(2,10,2,28000,56000),

-- Factura 3
(3,21,3,43000,129000),
(3,22,2,59000,118000),
(3,15,1,98000,98000),

-- Factura 4
(4,11,1,69000,69000),
(4,13,2,43000,86000),
(4,27,1,48000,48000),

-- Factura 5
(5,16,1,115000,115000),
(5,17,1,72000,72000),
(5,20,2,15000,30000),

-- Factura 6
(6,29,2,43000,86000),
(6,30,1,64000,64000),
(6,18,1,59000,59000),

-- Factura 7
(7,2,2,41000,82000),
(7,4,1,68000,68000),
(7,23,1,89000,89000),

-- Factura 8
(8,25,1,95000,95000),
(8,26,2,54000,108000),
(8,28,1,98000,98000),

-- Factura 9
(9,7,1,90000,90000),
(9,12,2,43000,86000),
(9,19,1,85000,85000),

-- Factura 10
(10,14,2,39000,78000),
(10,24,1,83000,83000),
(10,1,2,42000,84000),

-- Factura 11
(11,5,1,95000,95000),
(11,13,1,43000,43000),
(11,10,2,23000,46000),

-- Factura 12
(12,6,2,82000,164000),
(12,9,1,110000,110000),
(12,20,1,22000,22000),

-- Factura 13
(13,8,1,56000,56000),
(13,21,1,43000,43000),
(13,27,2,44000,88000),

-- Factura 14
(14,25,2,95000,190000),
(14,16,1,115000,115000),
(14,20,1,27000,27000),

-- Factura 15
(15,3,2,65000,130000),
(15,17,2,72000,144000);

-- ===========================================
-- PAGOS
-- ===========================================

INSERT INTO pago
(metodo_pago,fecha_pago,total,numero_transaccion,observacion,id_factura)
VALUES
('Tarjeta','2026-06-02',205000,'TRX100001','Pago aprobado',1),
('Nequi','2026-06-03',248000,'TRX100002','Pago aprobado',2),
('Transferencia','2026-06-05',345000,'TRX100003','Pago aprobado',3),
('Efectivo','2026-06-08',203000,'TRX100004','Pago en tienda',4),
('Daviplata','2026-06-10',217000,'TRX100005','Pago aprobado',5),
('Tarjeta','2026-06-12',209000,'TRX100006','Pago aprobado',6),
('Nequi','2026-06-15',239000,'TRX100007','Pago aprobado',7),
('Transferencia','2026-06-18',301000,'TRX100008','Pago aprobado',8),
('Efectivo','2026-06-20',261000,'TRX100009','Pago recibido',9),
('Daviplata','2026-06-22',245000,'TRX100010','Pago aprobado',10),
('Tarjeta','2026-06-24',184000,'TRX100011','Pago aprobado',11),
('Nequi','2026-06-26',296000,'TRX100012','Pago aprobado',12),
('Transferencia','2026-06-27',187000,'TRX100013','Pago aprobado',13),
('Efectivo','2026-06-29',332000,'TRX100014','Pago recibido',14),
('Tarjeta','2026-06-30',274000,'TRX100015','Pago aprobado',15);

-- ===========================================
-- ENTREGAS
-- ===========================================

INSERT INTO entrega
(fecha_entrega,estado,empresa_transportadora,numero_guia,id_factura)
VALUES
('2026-06-04','Entregado','Servientrega','GUIA1001',1),
('2026-06-05','Entregado','Interrapidísimo','GUIA1002',2),
('2026-06-07','Entregado','Coordinadora','GUIA1003',3),
('2026-06-10','Entregado','Servientrega','GUIA1004',4),
('2026-06-12','Entregado','Interrapidísimo','GUIA1005',5),
('2026-06-14','Entregado','Coordinadora','GUIA1006',6),
('2026-06-17','Entregado','Servientrega','GUIA1007',7),
('2026-06-20','Entregado','Interrapidísimo','GUIA1008',8),
('2026-06-22','Entregado','Coordinadora','GUIA1009',9),
('2026-06-24','Entregado','Servientrega','GUIA1010',10),
('2026-06-26','En camino','Interrapidísimo','GUIA1011',11),
('2026-06-28','En camino','Coordinadora','GUIA1012',12),
('2026-06-29','Pendiente','Servientrega','GUIA1013',13),
('2026-07-01','Pendiente','Interrapidísimo','GUIA1014',14),
('2026-07-02','Pendiente','Coordinadora','GUIA1015',15);


-- Usuarios de prueba para Three Happy Kids.
-- Ejecutar después de crear las tablas usuario, rol y usuario_rol.
USE happykids;

INSERT INTO rol (nombre_rol) VALUES
('Administrador'),
('Cliente'),
('Bodeguero'),
('Mensajero')
ON DUPLICATE KEY UPDATE nombre_rol = nombre_rol;

INSERT INTO usuario (nombre_usuario, contrasena, correo, activo, idioma)
VALUES ('cliente_test', '15a78f08777fc96ed270f97a254ebdd8:c946f8f7b1ad720fba8e99291ff7785a980e68c43dd264fc4f523faee2f58214', 'cliente@example.com', 1, 'es')
ON DUPLICATE KEY UPDATE contrasena = VALUES(contrasena), activo = VALUES(activo);

INSERT INTO usuario (nombre_usuario, contrasena, correo, activo, idioma)
VALUES ('admin_test', '4314032fab0158615f76a60ee8454abe:f934ddc5738cd2ee372cb814af769974712acbf26db583441d40824892bc52a8', 'admin@example.com', 1, 'es')
ON DUPLICATE KEY UPDATE contrasena = VALUES(contrasena), activo = VALUES(activo);

INSERT INTO usuario (nombre_usuario, contrasena, correo, activo, idioma)
VALUES ('bodeguero_test', '11e9724737d9c60e25192ccbb5f64e9e:14f2d33fb70060c4768eac08058433d5763dce9db4b4c4a5d9231070cbac7e77', 'bodeguero@example.com', 1, 'es')
ON DUPLICATE KEY UPDATE contrasena = VALUES(contrasena), activo = VALUES(activo);

INSERT INTO usuario (nombre_usuario, contrasena, correo, activo, idioma)
VALUES ('mensajero_test', '20b630190d4c72117b47b4df1d3933f6:f8f86de34330178c7d1996ffb6859d9803f1e9d493d88bb0f4b357307a3007c4', 'mensajero@example.com', 1, 'es')
ON DUPLICATE KEY UPDATE contrasena = VALUES(contrasena), activo = VALUES(activo);

DELETE FROM usuario_rol WHERE id_usuario = (SELECT id FROM usuario WHERE correo = 'cliente@example.com');
INSERT INTO usuario_rol (id_usuario, id_rol)
SELECT u.id, r.id FROM usuario u, rol r
WHERE u.correo = 'cliente@example.com' AND r.nombre_rol = 'Cliente';

DELETE FROM usuario_rol WHERE id_usuario = (SELECT id FROM usuario WHERE correo = 'admin@example.com');
INSERT INTO usuario_rol (id_usuario, id_rol)
SELECT u.id, r.id FROM usuario u, rol r
WHERE u.correo = 'admin@example.com' AND r.nombre_rol = 'Administrador';

DELETE FROM usuario_rol WHERE id_usuario = (SELECT id FROM usuario WHERE correo = 'bodeguero@example.com');
INSERT INTO usuario_rol (id_usuario, id_rol)
SELECT u.id, r.id FROM usuario u, rol r
WHERE u.correo = 'bodeguero@example.com' AND r.nombre_rol = 'Bodeguero';

DELETE FROM usuario_rol WHERE id_usuario = (SELECT id FROM usuario WHERE correo = 'mensajero@example.com');
INSERT INTO usuario_rol (id_usuario, id_rol)
SELECT u.id, r.id FROM usuario u, rol r
WHERE u.correo = 'mensajero@example.com' AND r.nombre_rol = 'Mensajero';

SELECT u.id, u.nombre_usuario, u.correo, u.activo, GROUP_CONCAT(r.nombre_rol) AS roles
FROM usuario u
LEFT JOIN usuario_rol ur ON u.id = ur.id_usuario
LEFT JOIN rol r ON ur.id_rol = r.id
GROUP BY u.id
ORDER BY u.id;
