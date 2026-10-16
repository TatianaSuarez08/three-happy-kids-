-- Selección exclusiva de pedidos de Bodega y reportes revisables por Administración.
-- Requiere entrega, factura, usuario, producto, detalle_alistamiento_pedido
-- y pedido_historial_operacion creados previamente.

CREATE TABLE asignacion_preparacion (
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

CREATE TABLE novedad_bodega (
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
