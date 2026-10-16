-- Migración incremental para MySQL 5.7.6+.
-- Ejecutar manualmente en la base HappyKids tras realizar una copia de seguridad.
-- No marca automáticamente ningún pedido como preparado o entregado.

ALTER TABLE entrega
    MODIFY COLUMN estado ENUM(
        'Pendiente',
        'Por recoger',
        'En camino',
        'Entregado',
        'Cancelado'
    ) NOT NULL DEFAULT 'Pendiente';

CREATE TABLE asignacion_entrega (
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
    INDEX idx_asignacion_entrega_estado (id_entrega, estado),
    INDEX idx_asignacion_mensajero_estado (id_mensajero, estado),
    CONSTRAINT fk_asignacion_entrega_entrega
        FOREIGN KEY (id_entrega) REFERENCES entrega(id),
    CONSTRAINT fk_asignacion_entrega_mensajero
        FOREIGN KEY (id_mensajero) REFERENCES usuario(id),
    CONSTRAINT fk_asignacion_entrega_actor
        FOREIGN KEY (id_usuario_reasignacion) REFERENCES usuario(id)
) ENGINE=InnoDB;
