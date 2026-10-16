-- Script de referencia para usuarios de prueba.
-- Las contraseñas de prueba se almacenan como hashes bcrypt.

USE happykids;

INSERT INTO rol (nombre_rol)
VALUES ('cliente'), ('administrador')
ON DUPLICATE KEY UPDATE nombre_rol = nombre_rol;

INSERT INTO usuario (nombre_usuario, contrasena, correo, activo, idioma)
VALUES ('cliente_test', '$2b$12$UH6CkIil1lBloqcSjqrnuepo5ot0dpaFx1HHDe6MH7ZN1bJoXqrEi', 'cliente@example.com', 1, 'es')
ON DUPLICATE KEY UPDATE contrasena = VALUES(contrasena), activo = VALUES(activo);

INSERT INTO usuario (nombre_usuario, contrasena, correo, activo, idioma)
VALUES ('admin_test', '$2b$12$WNRzj4xO4T9bB.LWrp08suOe6btUaUSMJsnX4wXEREtTYmh6urguG', 'admin@example.com', 1, 'es')
ON DUPLICATE KEY UPDATE contrasena = VALUES(contrasena), activo = VALUES(activo);

DELETE FROM usuario_rol WHERE id_usuario = (SELECT id FROM usuario WHERE correo = 'cliente@example.com');
INSERT INTO usuario_rol (id_usuario, id_rol)
SELECT u.id, r.id FROM usuario u, rol r
WHERE u.correo = 'cliente@example.com' AND r.nombre_rol = 'cliente';

DELETE FROM usuario_rol WHERE id_usuario = (SELECT id FROM usuario WHERE correo = 'admin@example.com');
INSERT INTO usuario_rol (id_usuario, id_rol)
SELECT u.id, r.id FROM usuario u, rol r
WHERE u.correo = 'admin@example.com' AND r.nombre_rol = 'administrador';
