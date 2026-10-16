-- Historial append-only de operaciones logísticas del pedido.
-- Requiere las tablas entrega y usuario existentes.
CREATE TABLE pedido_historial_operacion (
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

-- El historial es de auditoría; no se recomienda eliminarlo al revertir.
