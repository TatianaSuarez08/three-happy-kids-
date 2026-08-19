-- Usuarios de prueba para Three Happy Kids.
-- Ejecutar después de crear las tablas usuario, rol y usuario_rol.
USE happykids;

INSERT INTO rol (nombre_rol) VALUES ('cliente'), ('administrador')
ON DUPLICATE KEY UPDATE nombre_rol = nombre_rol;

INSERT INTO usuario (nombre_usuario, contrasena, correo, activo, idioma)
VALUES ('cliente_test', '15a78f08777fc96ed270f97a254ebdd8:c946f8f7b1ad720fba8e99291ff7785a980e68c43dd264fc4f523faee2f58214', 'cliente@example.com', 1, 'es')
ON DUPLICATE KEY UPDATE contrasena = VALUES(contrasena), activo = VALUES(activo);

INSERT INTO usuario (nombre_usuario, contrasena, correo, activo, idioma)
VALUES ('admin_test', '4314032fab0158615f76a60ee8454abe:f934ddc5738cd2ee372cb814af769974712acbf26db583441d40824892bc52a8', 'admin@example.com', 1, 'es')
ON DUPLICATE KEY UPDATE contrasena = VALUES(contrasena), activo = VALUES(activo);

DELETE FROM usuario_rol WHERE id_usuario = (SELECT id FROM usuario WHERE correo = 'cliente@example.com');
INSERT INTO usuario_rol (id_usuario, id_rol)
SELECT u.id, r.id FROM usuario u, rol r
WHERE u.correo = 'cliente@example.com' AND r.nombre_rol = 'cliente';

DELETE FROM usuario_rol WHERE id_usuario = (SELECT id FROM usuario WHERE correo = 'admin@example.com');
INSERT INTO usuario_rol (id_usuario, id_rol)
SELECT u.id, r.id FROM usuario u, rol r
WHERE u.correo = 'admin@example.com' AND r.nombre_rol = 'administrador';

SELECT u.id, u.nombre_usuario, u.correo, u.activo, GROUP_CONCAT(r.nombre_rol) AS roles
FROM usuario u
LEFT JOIN usuario_rol ur ON u.id = ur.id_usuario
LEFT JOIN rol r ON ur.id_rol = r.id
GROUP BY u.id
ORDER BY u.id;
