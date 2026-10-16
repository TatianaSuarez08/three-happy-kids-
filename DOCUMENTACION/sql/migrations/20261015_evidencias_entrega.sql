-- Migración incremental para MySQL 5.7.6+.
-- Aplicar después de 20261015_asignaciones_mensajeros.sql.
-- Ejecutar manualmente después de una copia de seguridad; no modifica pedidos existentes.

ALTER TABLE asignacion_entrega
    ADD CONSTRAINT uq_asignacion_evidencia
        UNIQUE (id, id_entrega, id_mensajero);

CREATE TABLE evidencia_entrega (
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

-- Reversión (solo si aún no hay evidencias que deban conservarse):
-- DROP TABLE evidencia_entrega;
-- ALTER TABLE asignacion_entrega DROP INDEX uq_asignacion_evidencia;
