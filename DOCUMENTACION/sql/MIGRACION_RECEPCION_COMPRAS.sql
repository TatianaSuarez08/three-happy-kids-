-- Extiende el historial de novedades existente para permitir reportes vinculados
-- a compras y conserva cada recepción parcial sin reemplazar datos históricos.
-- Ejecutar una sola vez contra HappyKids antes de desplegar el backend actualizado.

ALTER TABLE pedido_novedad
    MODIFY id_factura INT NULL,
    MODIFY etapa ENUM('Bodega', 'Mensajería', 'Recepción') NOT NULL,
    ADD COLUMN id_compra INT NULL AFTER id_factura,
    ADD COLUMN id_detalle_compra INT NULL AFTER id_compra,
    ADD COLUMN cantidad INT NULL AFTER descripcion,
    ADD CONSTRAINT fk_pedido_novedad_compra
        FOREIGN KEY (id_compra) REFERENCES compra(id) ON DELETE RESTRICT,
    ADD CONSTRAINT fk_pedido_novedad_detalle_compra
        FOREIGN KEY (id_detalle_compra) REFERENCES detalle_compra(id) ON DELETE RESTRICT,
    ADD CONSTRAINT chk_pedido_novedad_origen
        CHECK (
            (id_factura IS NOT NULL AND id_compra IS NULL)
            OR (id_factura IS NULL AND id_compra IS NOT NULL)
        ),
    ADD INDEX idx_pedido_novedad_compra (id_compra, creada_en);

CREATE TABLE IF NOT EXISTS compra_recepcion (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_compra INT NOT NULL,
    id_usuario INT NOT NULL,
    clave_idempotencia VARCHAR(128) NOT NULL UNIQUE,
    recibida_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_compra_recepcion_compra
        FOREIGN KEY (id_compra) REFERENCES compra(id) ON DELETE RESTRICT,
    CONSTRAINT fk_compra_recepcion_usuario
        FOREIGN KEY (id_usuario) REFERENCES usuario(id) ON DELETE RESTRICT,
    INDEX idx_compra_recepcion_compra (id_compra, recibida_en)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS compra_recepcion_detalle (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_recepcion BIGINT NOT NULL,
    id_detalle_compra INT NOT NULL,
    cantidad_recibida INT NOT NULL,
    cantidad_danada INT NOT NULL DEFAULT 0,
    CONSTRAINT fk_compra_recepcion_detalle_recepcion
        FOREIGN KEY (id_recepcion) REFERENCES compra_recepcion(id) ON DELETE RESTRICT,
    CONSTRAINT fk_compra_recepcion_detalle_compra
        FOREIGN KEY (id_detalle_compra) REFERENCES detalle_compra(id) ON DELETE RESTRICT,
    CONSTRAINT chk_compra_recepcion_cantidades
        CHECK (
            cantidad_recibida > 0
            AND cantidad_danada >= 0
            AND cantidad_danada <= cantidad_recibida
        ),
    INDEX idx_compra_recepcion_detalle (id_detalle_compra, id_recepcion)
) ENGINE=InnoDB;
