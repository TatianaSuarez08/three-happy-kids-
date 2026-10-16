-- Migración incremental para registrar intentos de alistamiento de pedidos.
-- No ajusta inventario: el stock se descuenta al crear el pedido.
-- Requiere que las tablas de asignación/evidencia estén creadas por las migraciones anteriores.

CREATE TABLE alistamiento_pedido (
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

CREATE TABLE detalle_alistamiento_pedido (
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

-- Reversión solo después de exportar/decidir descartar el historial:
-- DROP TABLE detalle_alistamiento_pedido;
-- DROP TABLE alistamiento_pedido;
