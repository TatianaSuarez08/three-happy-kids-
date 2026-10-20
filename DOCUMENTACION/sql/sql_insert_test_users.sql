-- Script de referencia para usuarios de prueba.
-- Preferir USUARIOS_SHA2_SETUP.sql, que contiene hashes SHA-256 completos.
-- Este archivo conserva el flujo SQL, pero los hashes de ejemplo no son válidos.

USE happykids;

INSERT INTO rol (nombre_rol)
VALUES ('cliente'), ('administrador')
ON DUPLICATE KEY UPDATE nombre_rol = nombre_rol;

-- Sustituye los valores salt:hash por hashes reales antes de ejecutar.
INSERT INTO usuario (nombre_usuario, contrasena, correo, activo, idioma)
VALUES ('cliente_test', 'SUSTITUIR_SALT_HASH', 'cliente@example.com', 1, 'es')
ON DUPLICATE KEY UPDATE contrasena = VALUES(contrasena), activo = VALUES(activo);

INSERT INTO usuario (nombre_usuario, contrasena, correo, activo, idioma)
VALUES ('admin_test', 'SUSTITUIR_SALT_HASH', 'admin@example.com', 1, 'es')
ON DUPLICATE KEY UPDATE contrasena = VALUES(contrasena), activo = VALUES(activo);

DELETE FROM usuario_rol WHERE id_usuario = (SELECT id FROM usuario WHERE correo = 'cliente@example.com');
INSERT INTO usuario_rol (id_usuario, id_rol)
SELECT u.id, r.id FROM usuario u, rol r
WHERE u.correo = 'cliente@example.com' AND r.nombre_rol = 'cliente';

DELETE FROM usuario_rol WHERE id_usuario = (SELECT id FROM usuario WHERE correo = 'admin@example.com');
INSERT INTO usuario_rol (id_usuario, id_rol)
SELECT u.id, r.id FROM usuario u, rol r
WHERE u.correo = 'admin@example.com' AND r.nombre_rol = 'administrador';
