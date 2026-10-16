-- Usuarios de prueba para Three Happy Kids con hashes bcrypt.
-- Ejecutar después de crear las tablas usuario, rol y usuario_rol.
USE happykids;

INSERT INTO rol (nombre_rol) VALUES
('Administrador'),
('Cliente'),
('Bodeguero'),
('Mensajero')
ON DUPLICATE KEY UPDATE nombre_rol = nombre_rol;

INSERT INTO usuario (nombre_usuario, contrasena, correo, activo, idioma)
VALUES ('cliente_test', '$2b$12$UH6CkIil1lBloqcSjqrnuepo5ot0dpaFx1HHDe6MH7ZN1bJoXqrEi', 'cliente@example.com', 1, 'es')
ON DUPLICATE KEY UPDATE contrasena = VALUES(contrasena), activo = VALUES(activo);

INSERT INTO usuario (nombre_usuario, contrasena, correo, activo, idioma)
VALUES ('admin_test', '$2b$12$WNRzj4xO4T9bB.LWrp08suOe6btUaUSMJsnX4wXEREtTYmh6urguG', 'admin@example.com', 1, 'es')
ON DUPLICATE KEY UPDATE contrasena = VALUES(contrasena), activo = VALUES(activo);

INSERT INTO usuario (nombre_usuario, contrasena, correo, activo, idioma)
VALUES ('bodeguero_test', '$2b$12$qODpF4Qfd8FEyFPypYEiou0IBclu2mrpDQb9zoyVEKPr7O5eLXYke', 'bodeguero@example.com', 1, 'es')
ON DUPLICATE KEY UPDATE contrasena = VALUES(contrasena), activo = VALUES(activo);

INSERT INTO usuario (nombre_usuario, contrasena, correo, activo, idioma)
VALUES ('mensajero_test', '$2b$12$7FUhhM5cqBTdmCVKYtsElOxGhKJr3Ls2ojw9uAr6uRtSmd6QzUXM6', 'mensajero@example.com', 1, 'es')
ON DUPLICATE KEY UPDATE contrasena = VALUES(contrasena), activo = VALUES(activo);

DELETE FROM usuario_rol WHERE id_usuario = (SELECT id FROM usuario WHERE correo = 'cliente@example.com');
INSERT INTO usuario_rol (id_usuario, id_rol)
SELECT u.id, r.id FROM usuario u, rol r
WHERE u.correo = 'cliente@example.com' AND r.nombre_rol = 'Cliente';

DELETE FROM usuario_rol WHERE id_usuario = (SELECT id FROM usuario WHERE correo = 'admin@example.com');
INSERT INTO usuario_rol (id_usuario, id_rol)
SELECT u.id, r.id FROM usuario u, rol r
WHERE u.correo = 'admin@example.com' AND r.nombre_rol = 'Administrador';

DELETE FROM usuario_rol WHERE id_usuario = (SELECT id FROM usuario WHERE correo = 'bodeguero@example.com');
INSERT INTO usuario_rol (id_usuario, id_rol)
SELECT u.id, r.id FROM usuario u, rol r
WHERE u.correo = 'bodeguero@example.com' AND r.nombre_rol = 'Bodeguero';

DELETE FROM usuario_rol WHERE id_usuario = (SELECT id FROM usuario WHERE correo = 'mensajero@example.com');
INSERT INTO usuario_rol (id_usuario, id_rol)
SELECT u.id, r.id FROM usuario u, rol r
WHERE u.correo = 'mensajero@example.com' AND r.nombre_rol = 'Mensajero';

SELECT u.id, u.nombre_usuario, u.correo, u.activo, GROUP_CONCAT(r.nombre_rol) AS roles
FROM usuario u
LEFT JOIN usuario_rol ur ON u.id = ur.id_usuario
LEFT JOIN rol r ON ur.id_rol = r.id
GROUP BY u.id
ORDER BY u.id;
