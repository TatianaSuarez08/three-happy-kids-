-- Esquema corregido de Three Happy Kids
-- Este archivo es independiente de DataBaseHappyKids.sql.
-- No elimina la base de datos ni incluye consultas de lectura ni datos de prueba.
-- Usar en una base de datos nueva o después de realizar una copia de seguridad.

CREATE DATABASE IF NOT EXISTS happykids
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE happykids;

CREATE TABLE IF NOT EXISTS rol (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_rol VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS usuario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_usuario VARCHAR(50) NOT NULL UNIQUE,
    contrasena VARCHAR(255) NOT NULL,
    correo VARCHAR(100) NOT NULL UNIQUE,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    idioma VARCHAR(10) NOT NULL DEFAULT 'es'
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS usuario_rol (
    id_usuario INT NOT NULL,
    id_rol INT NOT NULL,
    PRIMARY KEY (id_usuario, id_rol),
    CONSTRAINT fk_usuario_rol_usuario
        FOREIGN KEY (id_usuario) REFERENCES usuario(id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_usuario_rol_rol
        FOREIGN KEY (id_rol) REFERENCES rol(id)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS tipo_documento (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sigla VARCHAR(10) NOT NULL UNIQUE,
    nombre_documento VARCHAR(100) NOT NULL,
    estado ENUM('Activo', 'Inactivo') NOT NULL DEFAULT 'Activo'
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS cargo (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_cargo VARCHAR(50) NOT NULL UNIQUE,
    estado ENUM('Activo', 'Inactivo') NOT NULL DEFAULT 'Activo'
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS talla (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_talla VARCHAR(20) NOT NULL UNIQUE,
    estado ENUM('Activo', 'Inactivo') NOT NULL DEFAULT 'Activo'
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS color (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_color VARCHAR(30) NOT NULL UNIQUE,
    estado ENUM('Activo', 'Inactivo') NOT NULL DEFAULT 'Activo'
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS categoria (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_categoria VARCHAR(100) NOT NULL UNIQUE,
    descripcion VARCHAR(200),
    estado ENUM('Activo', 'Inactivo') NOT NULL DEFAULT 'Activo'
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS producto (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_producto VARCHAR(100) NOT NULL UNIQUE,
    descripcion VARCHAR(250),
    precio_compra DECIMAL(10,2),
    precio_venta DECIMAL(10,2) NOT NULL,
    marca VARCHAR(50),
    imagen_producto VARCHAR(255),
    id_categoria INT NOT NULL,
    id_talla INT NOT NULL,
    id_color INT NOT NULL,
    estado ENUM('Activo', 'Inactivo') NOT NULL DEFAULT 'Activo',
    CONSTRAINT fk_producto_categoria
        FOREIGN KEY (id_categoria) REFERENCES categoria(id),
    CONSTRAINT fk_producto_talla
        FOREIGN KEY (id_talla) REFERENCES talla(id),
    CONSTRAINT fk_producto_color
        FOREIGN KEY (id_color) REFERENCES color(id),
    CONSTRAINT chk_producto_precio_compra
        CHECK (precio_compra IS NULL OR precio_compra >= 0),
    CONSTRAINT chk_producto_precio_venta
        CHECK (precio_venta >= 0)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS cliente (
    id INT AUTO_INCREMENT PRIMARY KEY,
    primer_nombre VARCHAR(50) NOT NULL,
    primer_apellido VARCHAR(50) NOT NULL,
    numero_documento BIGINT NOT NULL UNIQUE,
    telefono VARCHAR(20),
    direccion VARCHAR(150),
    ciudad VARCHAR(60),
    fecha_registro DATE NOT NULL DEFAULT (CURRENT_DATE),
    id_usuario INT NOT NULL UNIQUE,
    id_tipo_documento INT NOT NULL,
    CONSTRAINT fk_cliente_usuario
        FOREIGN KEY (id_usuario) REFERENCES usuario(id),
    CONSTRAINT fk_cliente_tipo_documento
        FOREIGN KEY (id_tipo_documento) REFERENCES tipo_documento(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS empleado (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    apellido VARCHAR(50) NOT NULL,
    salario DECIMAL(10,2),
    estado ENUM('Activo', 'Inactivo') NOT NULL DEFAULT 'Activo',
    id_usuario INT NOT NULL UNIQUE,
    id_cargo INT NOT NULL,
    CONSTRAINT fk_empleado_usuario
        FOREIGN KEY (id_usuario) REFERENCES usuario(id),
    CONSTRAINT fk_empleado_cargo
        FOREIGN KEY (id_cargo) REFERENCES cargo(id),
    CONSTRAINT chk_empleado_salario
        CHECK (salario IS NULL OR salario >= 0)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS inventario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cantidad_disponible INT NOT NULL DEFAULT 0,
    cantidad_minima INT NOT NULL DEFAULT 0,
    fecha_actualizacion DATE NOT NULL DEFAULT (CURRENT_DATE),
    id_producto INT NOT NULL UNIQUE,
    CONSTRAINT fk_inventario_producto
        FOREIGN KEY (id_producto) REFERENCES producto(id),
    CONSTRAINT chk_inventario_cantidades
        CHECK (cantidad_disponible >= 0 AND cantidad_minima >= 0)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS carrito (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fecha_creacion DATE NOT NULL DEFAULT (CURRENT_DATE),
    fecha_actualizacion DATE NOT NULL DEFAULT (CURRENT_DATE),
    estado ENUM('Activo', 'Finalizado', 'Cancelado') NOT NULL DEFAULT 'Activo',
    id_cliente INT NOT NULL,
    CONSTRAINT fk_carrito_cliente
        FOREIGN KEY (id_cliente) REFERENCES cliente(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS detalle_carrito (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cantidad INT NOT NULL,
    precio DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    id_carrito INT NOT NULL,
    id_producto INT NOT NULL,
    CONSTRAINT uq_carrito_producto UNIQUE (id_carrito, id_producto),
    CONSTRAINT fk_detalle_carrito_carrito
        FOREIGN KEY (id_carrito) REFERENCES carrito(id),
    CONSTRAINT fk_detalle_carrito_producto
        FOREIGN KEY (id_producto) REFERENCES producto(id),
    CONSTRAINT chk_detalle_carrito_cantidad
        CHECK (cantidad > 0),
    CONSTRAINT chk_detalle_carrito_precio
        CHECK (precio >= 0),
    CONSTRAINT chk_detalle_carrito_subtotal
        CHECK (subtotal >= 0)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS proveedor (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(100) UNIQUE,
    telefono VARCHAR(20),
    direccion VARCHAR(150),
    nit VARCHAR(30),
    contacto VARCHAR(80),
    estado ENUM('Activo', 'Inactivo') NOT NULL DEFAULT 'Activo'
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS compra (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fecha_compra DATE NOT NULL DEFAULT (CURRENT_DATE),
    total DECIMAL(10,2) NOT NULL DEFAULT 0,
    estado ENUM('Pendiente', 'Pagada', 'Recibida', 'Cancelada') NOT NULL DEFAULT 'Pendiente',
    id_proveedor INT NOT NULL,
    CONSTRAINT fk_compra_proveedor
        FOREIGN KEY (id_proveedor) REFERENCES proveedor(id),
    CONSTRAINT chk_compra_total
        CHECK (total >= 0)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS detalle_compra (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_compra INT NOT NULL,
    id_producto INT NOT NULL,
    cantidad INT NOT NULL,
    precio DECIMAL(10,2) NOT NULL DEFAULT 0,
    subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
    CONSTRAINT uq_compra_producto UNIQUE (id_compra, id_producto),
    CONSTRAINT fk_detalle_compra_compra
        FOREIGN KEY (id_compra) REFERENCES compra(id),
    CONSTRAINT fk_detalle_compra_producto
        FOREIGN KEY (id_producto) REFERENCES producto(id),
    CONSTRAINT chk_detalle_compra_cantidad
        CHECK (cantidad > 0),
    CONSTRAINT chk_detalle_compra_precio
        CHECK (precio >= 0),
    CONSTRAINT chk_detalle_compra_subtotal
        CHECK (subtotal >= 0)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS factura (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fecha DATE NOT NULL DEFAULT (CURRENT_DATE),
    total DECIMAL(10,2) NOT NULL DEFAULT 0,
    estado ENUM('Pendiente', 'Pagada', 'Anulada') NOT NULL DEFAULT 'Pendiente',
    id_cliente INT NOT NULL,
    id_empleado INT NULL,
    CONSTRAINT fk_factura_cliente
        FOREIGN KEY (id_cliente) REFERENCES cliente(id),
    CONSTRAINT fk_factura_empleado
        FOREIGN KEY (id_empleado) REFERENCES empleado(id),
    CONSTRAINT chk_factura_total
        CHECK (total >= 0)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS detalle_pedido (
    id_factura INT NOT NULL,
    id_producto INT NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL DEFAULT 0,
    subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
    PRIMARY KEY (id_factura, id_producto),
    CONSTRAINT fk_detalle_pedido_factura
        FOREIGN KEY (id_factura) REFERENCES factura(id),
    CONSTRAINT fk_detalle_pedido_producto
        FOREIGN KEY (id_producto) REFERENCES producto(id),
    CONSTRAINT chk_detalle_pedido_cantidad
        CHECK (cantidad > 0),
    CONSTRAINT chk_detalle_pedido_precio
        CHECK (precio_unitario >= 0),
    CONSTRAINT chk_detalle_pedido_subtotal
        CHECK (subtotal >= 0)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS pago (
    id INT AUTO_INCREMENT PRIMARY KEY,
    metodo_pago ENUM('Efectivo', 'Tarjeta', 'Transferencia', 'Nequi', 'Daviplata') NOT NULL,
    fecha_pago DATE NOT NULL DEFAULT (CURRENT_DATE),
    total DECIMAL(10,2) NOT NULL DEFAULT 0,
    numero_transaccion VARCHAR(100),
    observacion VARCHAR(200),
    id_factura INT NOT NULL,
    CONSTRAINT fk_pago_factura
        FOREIGN KEY (id_factura) REFERENCES factura(id),
    CONSTRAINT chk_pago_total
        CHECK (total >= 0)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS entrega (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fecha_entrega DATE,
    estado ENUM('Pendiente', 'En camino', 'Entregado', 'Cancelado') NOT NULL DEFAULT 'Pendiente',
    empresa_transportadora VARCHAR(100),
    numero_guia VARCHAR(100),
    id_factura INT NOT NULL,
    CONSTRAINT uq_entrega_factura UNIQUE (id_factura),
    CONSTRAINT fk_entrega_factura
        FOREIGN KEY (id_factura) REFERENCES factura(id)
) ENGINE=InnoDB;
