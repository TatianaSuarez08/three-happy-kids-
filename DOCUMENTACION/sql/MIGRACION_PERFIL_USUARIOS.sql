USE happykids;

-- Ejecutar una sola vez sobre una base existente. No elimina datos ni tablas.
ALTER TABLE usuario
    ADD COLUMN IF NOT EXISTS telefono VARCHAR(20) NULL AFTER correo,
    ADD COLUMN IF NOT EXISTS foto_perfil VARCHAR(255) NULL AFTER telefono;
