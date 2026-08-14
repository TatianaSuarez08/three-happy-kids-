-- Script SQL para crear usuarios de prueba con SHA2
-- IMPORTANTE: Las contraseñas están hasheadas con SHA2 + SALT

-- 1. Insertar roles básicos (si no existen)
INSERT INTO rol (nombre_rol) 
VALUES ('cliente'), ('administrador')
ON DUPLICATE KEY UPDATE nombre_rol = nombre_rol;

-- 2. Insertar usuario CLIENTE de prueba
-- Contraseña: cliente123
-- Hash SHA2: EJECUTA generate_hashes.js para obtener el hash
INSERT INTO usuario (nombre_usuario, contrasena, correo, activo, idioma) 
VALUES (
  'cliente_test',
  'a1b2c3d4e5f6g7h8:abc123def456xyz789...',
  'cliente@example.com',
  1,
  'es'
)
ON DUPLICATE KEY UPDATE 
  contrasena = VALUES(contrasena),
  activo = VALUES(activo);

-- 3. Insertar usuario ADMIN de prueba
-- Contraseña: admin123
-- Hash SHA2: EJECUTA generate_hashes.js para obtener el hash
INSERT INTO usuario (nombre_usuario, contrasena, correo, activo, idioma) 
VALUES (
  'admin_test',
  'x1y2z3a4b5c6d7e8:xyz789abc123def456...',
  'admin@example.com',
  1,
  'es'
)
ON DUPLICATE KEY UPDATE 
  contrasena = VALUES(contrasena),
  activo = VALUES(activo);

-- 4. Asignar rol CLIENTE al primer usuario
DELETE FROM usuario_rol WHERE id_usuario = (SELECT id FROM usuario WHERE correo = 'cliente@example.com');
INSERT INTO usuario_rol (id_usuario, id_rol)
SELECT u.id, r.id FROM usuario u, rol r
WHERE u.correo = 'cliente@example.com' AND r.nombre_rol = 'cliente';

-- 5. Asignar rol ADMINISTRADOR al segundo usuario
DELETE FROM usuario_rol WHERE id_usuario = (SELECT id FROM usuario WHERE correo = 'admin@example.com');
INSERT INTO usuario_rol (id_usuario, id_rol)
SELECT u.id, r.id FROM usuario u, rol r
WHERE u.correo = 'admin@example.com' AND r.nombre_rol = 'administrador';

-- 6. Verificar usuarios creados
SELECT 
  u.id,
  u.nombre_usuario,
  u.correo,
  u.activo,
  GROUP_CONCAT(r.nombre_rol) as roles
FROM usuario u
LEFT JOIN usuario_rol ur ON u.id = ur.id_usuario
LEFT JOIN rol r ON ur.id_rol = r.id
GROUP BY u.id;

-- =====================================================
-- USUARIOS DE PRUEBA CREADOS:
-- =====================================================
-- Cliente:
--   Email: cliente@example.com
--   Contraseña: cliente123
--   Rol: cliente
--
-- Administrador:
--   Email: admin@example.com
--   Contraseña: admin123
--   Rol: administrador
-- =====================================================
