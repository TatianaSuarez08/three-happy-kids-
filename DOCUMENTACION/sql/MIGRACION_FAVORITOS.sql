-- Ejecutar una vez sobre una base happykids existente.
-- El carrito ya existe y se relaciona mediante cliente -> usuario.

USE happykids;

CREATE TABLE IF NOT EXISTS favorito (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_producto INT NOT NULL,
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_favorito_usuario_producto UNIQUE (id_usuario, id_producto),
    CONSTRAINT fk_favorito_usuario
        FOREIGN KEY (id_usuario) REFERENCES usuario(id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_favorito_producto
        FOREIGN KEY (id_producto) REFERENCES producto(id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    INDEX idx_favorito_usuario (id_usuario)
) ENGINE=InnoDB;