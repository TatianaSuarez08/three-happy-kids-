-- Crea el almacenamiento mínimo para enlaces de restablecimiento de contraseña.
-- Ejecutar manualmente en la base happykids después de verificar el esquema y antes
-- de desplegar las rutas de recuperación. No modifica ni elimina tablas existentes.

USE happykids;

CREATE TABLE IF NOT EXISTS recuperacion_contrasena (
    id_usuario INT NOT NULL,
    token_hash CHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
    creado_en DATETIME NOT NULL,
    expira_en DATETIME NOT NULL,
    usado_en DATETIME NULL,
    PRIMARY KEY (id_usuario),
    UNIQUE KEY uq_recuperacion_contrasena_token_hash (token_hash),
    CONSTRAINT fk_recuperacion_contrasena_usuario
        FOREIGN KEY (id_usuario) REFERENCES usuario(id)
        ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;
