-- Agrega el registro persistente de reportes administrativos de actividad.
-- Ejecutar una sola vez en bases existentes antes de desplegar el backend actualizado.

CREATE TABLE IF NOT EXISTS admin_reporte_actividad (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_administrador INT NOT NULL,
    id_usuario_reportado INT NOT NULL,
    rol_reportado VARCHAR(50) NOT NULL,
    actividad_id VARCHAR(64) NOT NULL,
    id_factura INT NULL,
    motivo VARCHAR(150) NOT NULL,
    descripcion VARCHAR(1000) NOT NULL,
    estado ENUM('Pendiente', 'En revisión', 'Cerrado') NOT NULL DEFAULT 'Pendiente',
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_admin_reporte_administrador
        FOREIGN KEY (id_administrador) REFERENCES usuario(id) ON DELETE RESTRICT,
    CONSTRAINT fk_admin_reporte_usuario
        FOREIGN KEY (id_usuario_reportado) REFERENCES usuario(id) ON DELETE RESTRICT,
    CONSTRAINT fk_admin_reporte_factura
        FOREIGN KEY (id_factura) REFERENCES factura(id) ON DELETE RESTRICT,
    INDEX idx_admin_reporte_estado (estado, creado_en),
    INDEX idx_admin_reporte_usuario (id_usuario_reportado, creado_en),
    INDEX idx_admin_reporte_factura (id_factura)
) ENGINE=InnoDB;
