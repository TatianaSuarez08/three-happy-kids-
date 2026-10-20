-- Flujo incremental de preparación, mensajería, novedades y evidencias.
-- Es seguro volver a ejecutar este script: las tablas se crean solo si faltan.
-- Ejecutar contra la base HappyKids antes de desplegar el backend actualizado.

-- Conserva los estados heredados ('Por recoger' incluido) y agrega el resultado
-- de entrega fallida. Revise antes cualquier estado adicional del entorno destino.
ALTER TABLE entrega
    MODIFY estado ENUM('Pendiente', 'Por recoger', 'En camino', 'Entregado', 'Cancelado', 'Entrega fallida')
    NOT NULL DEFAULT 'Pendiente';

CREATE TABLE IF NOT EXISTS pedido_flujo (
    id_factura INT NOT NULL PRIMARY KEY,
    estado_preparacion ENUM(
        'Pendiente',
        'Asignado',
        'En preparación',
        'Novedad',
        'Listo para despacho'
    ) NOT NULL DEFAULT 'Pendiente',
    id_bodeguero INT NULL,
    fecha_asignacion_bodega DATETIME NULL,
    fecha_preparacion DATETIME NULL,
    id_mensajero INT NULL,
    fecha_asignacion_mensajero DATETIME NULL,
    estado_entrega ENUM(
        'Pendiente',
        'Asignado',
        'En camino',
        'Entrega fallida',
        'Entregado',
        'Cancelado'
    ) NOT NULL DEFAULT 'Pendiente',
    evidencia_path VARCHAR(255) NULL,
    evidencia_fecha DATETIME NULL,
    evidencia_usuario INT NULL,
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_pedido_flujo_factura
        FOREIGN KEY (id_factura) REFERENCES factura(id) ON DELETE RESTRICT,
    CONSTRAINT fk_pedido_flujo_bodeguero
        FOREIGN KEY (id_bodeguero) REFERENCES usuario(id) ON DELETE RESTRICT,
    CONSTRAINT fk_pedido_flujo_mensajero
        FOREIGN KEY (id_mensajero) REFERENCES usuario(id) ON DELETE RESTRICT,
    CONSTRAINT fk_pedido_flujo_evidencia_usuario
        FOREIGN KEY (evidencia_usuario) REFERENCES usuario(id) ON DELETE RESTRICT,
    INDEX idx_pedido_flujo_bodega (estado_preparacion, id_bodeguero),
    INDEX idx_pedido_flujo_mensajeria (estado_preparacion, estado_entrega, id_mensajero)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS pedido_preparacion_detalle (
    id_factura INT NOT NULL,
    id_producto INT NOT NULL,
    encontrado BOOLEAN NOT NULL,
    cantidad_preparada INT NOT NULL,
    observacion VARCHAR(1000) NOT NULL DEFAULT '',
    id_bodeguero INT NOT NULL,
    actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id_factura, id_producto),
    CONSTRAINT fk_pedido_preparacion_factura
        FOREIGN KEY (id_factura) REFERENCES factura(id) ON DELETE RESTRICT,
    CONSTRAINT fk_pedido_preparacion_producto
        FOREIGN KEY (id_producto) REFERENCES producto(id) ON DELETE RESTRICT,
    CONSTRAINT fk_pedido_preparacion_bodeguero
        FOREIGN KEY (id_bodeguero) REFERENCES usuario(id) ON DELETE RESTRICT,
    CONSTRAINT chk_pedido_preparacion_cantidad
        CHECK (cantidad_preparada >= 0)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS pedido_novedad (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_factura INT NOT NULL,
    id_producto INT NULL,
    etapa ENUM('Bodega', 'Mensajería') NOT NULL,
    tipo VARCHAR(60) NOT NULL,
    descripcion VARCHAR(1000) NOT NULL,
    estado ENUM('Pendiente', 'Resuelta', 'Cerrada') NOT NULL DEFAULT 'Pendiente',
    decision VARCHAR(1000) NULL,
    id_reporta INT NOT NULL,
    id_resuelve INT NULL,
    creada_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    resuelta_en DATETIME NULL,
    CONSTRAINT fk_pedido_novedad_factura
        FOREIGN KEY (id_factura) REFERENCES factura(id) ON DELETE RESTRICT,
    CONSTRAINT fk_pedido_novedad_producto
        FOREIGN KEY (id_producto) REFERENCES producto(id) ON DELETE RESTRICT,
    CONSTRAINT fk_pedido_novedad_reporta
        FOREIGN KEY (id_reporta) REFERENCES usuario(id) ON DELETE RESTRICT,
    CONSTRAINT fk_pedido_novedad_resuelve
        FOREIGN KEY (id_resuelve) REFERENCES usuario(id) ON DELETE RESTRICT,
    INDEX idx_pedido_novedad_estado (estado, etapa, creada_en),
    INDEX idx_pedido_novedad_factura (id_factura, creada_en)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS pedido_historial (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_factura INT NOT NULL,
    id_usuario INT NOT NULL,
    evento VARCHAR(80) NOT NULL,
    observacion VARCHAR(1000) NOT NULL DEFAULT '',
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_pedido_historial_factura
        FOREIGN KEY (id_factura) REFERENCES factura(id) ON DELETE RESTRICT,
    CONSTRAINT fk_pedido_historial_usuario
        FOREIGN KEY (id_usuario) REFERENCES usuario(id) ON DELETE RESTRICT,
    INDEX idx_pedido_historial_factura (id_factura, creado_en)
) ENGINE=InnoDB;
