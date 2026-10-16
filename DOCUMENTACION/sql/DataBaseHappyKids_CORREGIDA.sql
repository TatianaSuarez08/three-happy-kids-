-- Esquema corregido de Three Happy Kids
-- Incluye el esquema de pedidos, preparación, asignación, entrega e historial.
-- Los datos de ejemplo están en dml.sql y deben cargarse después de este archivo.
-- No elimina la base de datos ni sustituye migraciones para instalaciones existentes.

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
    telefono VARCHAR(20),
    foto_perfil VARCHAR(255),
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

CREATE TABLE IF NOT EXISTS inventario_movimiento (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_producto INT NOT NULL,
    tipo ENUM('entrada', 'salida', 'ajuste') NOT NULL DEFAULT 'ajuste',
    cantidad INT NOT NULL DEFAULT 0,
    delta INT NOT NULL DEFAULT 0,
    motivo VARCHAR(200) NOT NULL DEFAULT 'Ajuste de inventario',
    referencia VARCHAR(100),
    id_usuario INT NULL,
    fecha_movimiento DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_inventario_movimiento_producto
        FOREIGN KEY (id_producto) REFERENCES producto(id),
    CONSTRAINT fk_inventario_movimiento_usuario
        FOREIGN KEY (id_usuario) REFERENCES usuario(id),
    CONSTRAINT chk_inventario_movimiento_cantidad
        CHECK (cantidad >= 0),
    CONSTRAINT chk_inventario_movimiento_delta
        CHECK (delta <> 0)
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
    estado ENUM('Pendiente', 'Por recoger', 'En camino', 'Entregado', 'Cancelado') NOT NULL DEFAULT 'Pendiente',
    empresa_transportadora VARCHAR(100),
    numero_guia VARCHAR(100),
    id_factura INT NOT NULL,
    CONSTRAINT uq_entrega_factura UNIQUE (id_factura),
    CONSTRAINT fk_entrega_factura
        FOREIGN KEY (id_factura) REFERENCES factura(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS asignacion_entrega (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_entrega INT NOT NULL,
    id_mensajero INT NOT NULL,
    fecha_asignacion DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    fecha_finalizacion DATETIME(6),
    estado ENUM('Activa', 'Finalizada', 'Reasignada') NOT NULL DEFAULT 'Activa',
    motivo_reasignacion VARCHAR(255),
    id_usuario_reasignacion INT,
    id_entrega_activa INT GENERATED ALWAYS AS (
        CASE WHEN estado = 'Activa' THEN id_entrega ELSE NULL END
    ) STORED,
    CONSTRAINT uq_asignacion_entrega_activa UNIQUE (id_entrega_activa),
    CONSTRAINT uq_asignacion_evidencia UNIQUE (id, id_entrega, id_mensajero),
    INDEX idx_asignacion_entrega_estado (id_entrega, estado),
    INDEX idx_asignacion_mensajero_estado (id_mensajero, estado),
    CONSTRAINT fk_asignacion_entrega_entrega
        FOREIGN KEY (id_entrega) REFERENCES entrega(id),
    CONSTRAINT fk_asignacion_entrega_mensajero
        FOREIGN KEY (id_mensajero) REFERENCES usuario(id),
    CONSTRAINT fk_asignacion_entrega_actor
        FOREIGN KEY (id_usuario_reasignacion) REFERENCES usuario(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS evidencia_entrega (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_entrega INT NOT NULL,
    id_asignacion BIGINT NOT NULL,
    id_mensajero INT NOT NULL,
    ruta_archivo VARCHAR(255) NOT NULL UNIQUE,
    tipo_mime ENUM('image/jpeg', 'image/png', 'image/webp') NOT NULL,
    tamano_bytes INT UNSIGNED NOT NULL,
    fecha_confirmacion DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    INDEX idx_evidencia_entrega_fecha (id_entrega, fecha_confirmacion),
    INDEX idx_evidencia_mensajero_fecha (id_mensajero, fecha_confirmacion),
    CONSTRAINT fk_evidencia_entrega
        FOREIGN KEY (id_entrega) REFERENCES entrega(id),
    CONSTRAINT fk_evidencia_asignacion
        FOREIGN KEY (id_asignacion, id_entrega, id_mensajero)
        REFERENCES asignacion_entrega(id, id_entrega, id_mensajero),
    CONSTRAINT fk_evidencia_mensajero
        FOREIGN KEY (id_mensajero) REFERENCES usuario(id),
    CONSTRAINT chk_evidencia_tamano
        CHECK (tamano_bytes > 0)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS alistamiento_pedido (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_entrega INT NOT NULL,
    id_usuario INT NOT NULL,
    resultado ENUM('Incompleto', 'Completo') NOT NULL,
    observaciones TEXT,
    fecha_hora DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    INDEX idx_alistamiento_entrega_fecha (id_entrega, fecha_hora),
    INDEX idx_alistamiento_usuario_fecha (id_usuario, fecha_hora),
    CONSTRAINT fk_alistamiento_entrega
        FOREIGN KEY (id_entrega) REFERENCES entrega(id),
    CONSTRAINT fk_alistamiento_usuario
        FOREIGN KEY (id_usuario) REFERENCES usuario(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS detalle_alistamiento_pedido (
    id_alistamiento BIGINT NOT NULL,
    id_factura INT NOT NULL,
    id_producto INT NOT NULL,
    cantidad_solicitada INT NOT NULL,
    cantidad_preparada INT NOT NULL,
    observaciones VARCHAR(255),
    PRIMARY KEY (id_alistamiento, id_producto),
    INDEX idx_detalle_alistamiento_pedido_producto (id_factura, id_producto),
    CONSTRAINT fk_detalle_alistamiento_intento
        FOREIGN KEY (id_alistamiento) REFERENCES alistamiento_pedido(id),
    CONSTRAINT fk_detalle_alistamiento_detalle_pedido
        FOREIGN KEY (id_factura, id_producto)
        REFERENCES detalle_pedido(id_factura, id_producto),
    CONSTRAINT chk_alistamiento_cantidades
        CHECK (cantidad_solicitada > 0 AND cantidad_preparada >= 0
            AND cantidad_preparada <= cantidad_solicitada)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS asignacion_preparacion (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_entrega INT NOT NULL,
    id_bodeguero INT NOT NULL,
    fecha_asignacion DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    fecha_finalizacion DATETIME(6),
    estado ENUM('Activa', 'Finalizada') NOT NULL DEFAULT 'Activa',
    id_entrega_activa INT GENERATED ALWAYS AS (
        CASE WHEN estado = 'Activa' THEN id_entrega ELSE NULL END
    ) STORED,
    CONSTRAINT uq_preparacion_entrega_activa UNIQUE (id_entrega_activa),
    INDEX idx_preparacion_bodeguero_estado (id_bodeguero, estado),
    CONSTRAINT fk_preparacion_entrega
        FOREIGN KEY (id_entrega) REFERENCES entrega(id),
    CONSTRAINT fk_preparacion_bodeguero
        FOREIGN KEY (id_bodeguero) REFERENCES usuario(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS pedido_historial_operacion (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_entrega INT NOT NULL,
    operacion VARCHAR(60) NOT NULL,
    estado_anterior VARCHAR(60),
    estado_nuevo VARCHAR(60),
    id_usuario INT NOT NULL,
    fecha_hora DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    observaciones TEXT,
    INDEX idx_pedido_historial_entrega_fecha (id_entrega, fecha_hora, id),
    INDEX idx_pedido_historial_usuario_fecha (id_usuario, fecha_hora),
    CONSTRAINT fk_pedido_historial_entrega
        FOREIGN KEY (id_entrega) REFERENCES entrega(id),
    CONSTRAINT fk_pedido_historial_usuario
        FOREIGN KEY (id_usuario) REFERENCES usuario(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS novedad_bodega (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_entrega INT NOT NULL,
    id_alistamiento BIGINT NOT NULL,
    id_producto INT NOT NULL,
    id_bodeguero INT NOT NULL,
    tipo ENUM(
        'No encontrado',
        'Dañado',
        'Referencia incorrecta',
        'Talla incorrecta',
        'Color incorrecto',
        'Otra novedad'
    ) NOT NULL,
    descripcion VARCHAR(1000) NOT NULL,
    estado ENUM('Pendiente', 'En revisión', 'Resuelto', 'Rechazado') NOT NULL DEFAULT 'Pendiente',
    id_administrador_respuesta INT,
    respuesta_administracion VARCHAR(1000),
    fecha_reporte DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    fecha_respuesta DATETIME(6),
    id_entrega_producto_abierto VARCHAR(32) GENERATED ALWAYS AS (
        CASE
            WHEN estado IN ('Pendiente', 'En revisión') THEN CONCAT(id_entrega, ':', id_producto)
            ELSE NULL
        END
    ) STORED,
    CONSTRAINT uq_novedad_bodega_abierta UNIQUE (id_entrega_producto_abierto),
    INDEX idx_novedad_bodega_estado_fecha (estado, fecha_reporte),
    INDEX idx_novedad_bodega_responsable (id_bodeguero, fecha_reporte),
    CONSTRAINT fk_novedad_bodega_entrega
        FOREIGN KEY (id_entrega) REFERENCES entrega(id),
    CONSTRAINT fk_novedad_bodega_alistamiento
        FOREIGN KEY (id_alistamiento) REFERENCES alistamiento_pedido(id),
    CONSTRAINT fk_novedad_bodega_producto
        FOREIGN KEY (id_producto) REFERENCES producto(id),
    CONSTRAINT fk_novedad_bodega_usuario
        FOREIGN KEY (id_bodeguero) REFERENCES usuario(id),
    CONSTRAINT fk_novedad_bodega_administrador
        FOREIGN KEY (id_administrador_respuesta) REFERENCES usuario(id)
) ENGINE=InnoDB;
