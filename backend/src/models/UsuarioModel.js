import pool from '../db.js'; // Importa el pool de conexiones creado en db.js

// Busca un usuario por su correo en la tabla `usuario` (nueva estructura) y devuelve
// un objeto que incluye los datos del usuario y un array `roles` con sus roles.
export const findUserByEmail = async (email) => {
  // Buscar el usuario por correo (columna `correo`)
  const [users] = await pool.execute(
    'SELECT id, nombre_usuario AS nombre, contrasena AS password, correo AS email, telefono, foto_perfil AS fotoPerfil, activo, idioma FROM usuario WHERE correo = ?',
    [email]
  );

  const user = users[0];
  if (!user) return undefined;

  // Validar que el usuario esté activo
  if (!user.activo) {
    throw new Error('El usuario está inactivo');
  }

  // Obtener los roles asociados al usuario a través de usuario_rol -> rol
  const [rolesRows] = await pool.execute(
    `SELECT r.nombre_rol
     FROM rol r
     JOIN usuario_rol ur ON r.id = ur.id_rol
     WHERE ur.id_usuario = ?`,
    [user.id]
  );

  // Mapear a un array de nombres de rol
  const roles = rolesRows.map((r) => r.nombre_rol);

  // Devolver usuario con la propiedad `roles`
  return { id: user.id, nombre: user.nombre, email: user.email, telefono: user.telefono, fotoPerfil: user.fotoPerfil, password: user.password, activo: !!user.activo, idioma: user.idioma, roles };
};

export const findUserProfile = async (id) => {
  const [rows] = await pool.execute(
    `SELECT u.id, u.nombre_usuario AS nombre, u.correo AS email, u.telefono,
            u.foto_perfil AS fotoPerfil, u.activo, u.idioma,
            COALESCE(GROUP_CONCAT(r.nombre_rol ORDER BY r.nombre_rol SEPARATOR ', '), 'Sin rol') AS rol
     FROM usuario u
     LEFT JOIN usuario_rol ur ON ur.id_usuario = u.id
     LEFT JOIN rol r ON r.id = ur.id_rol
     WHERE u.id = ?
     GROUP BY u.id, u.nombre_usuario, u.correo, u.telefono, u.foto_perfil, u.activo, u.idioma`,
    [id]
  );
  return rows[0] ? { ...rows[0], estado: rows[0].activo ? 'Activo' : 'Inactivo' } : null;
};

export const updateUserProfilePhoto = async (id, photoPath) => {
  const [result] = await pool.execute(
    'UPDATE usuario SET foto_perfil = ? WHERE id = ?',
    [photoPath, id]
  );
  return result.affectedRows > 0;
};

export const updatePassword = async (id, passwordHash) => {
  await pool.execute('UPDATE usuario SET contrasena = ? WHERE id = ?', [passwordHash, id]);
};

export const listActiveDocumentTypes = async () => {
  const [rows] = await pool.execute(
    `SELECT id, sigla, nombre_documento AS nombre
     FROM tipo_documento
     WHERE estado = 'Activo'
     ORDER BY nombre_documento`
  );
  return rows;
};

// Crea un nuevo usuario en la base de datos con rol 'cliente' por defecto
export const createUser = async (userData) => {
  const {
    nombre_usuario,
    email,
    contrasena,
    idioma = 'es',
    primer_nombre,
    primer_apellido,
    numero_documento,
    id_tipo_documento,
    telefono = null,
    direccion = null,
    ciudad = null
  } = userData;
  const connection = await pool.getConnection();
  let transactionStarted = false;

  try {
    await connection.beginTransaction();
    transactionStarted = true;

    const [insertResult] = await connection.execute(
      'INSERT INTO usuario (nombre_usuario, contrasena, correo, activo, idioma) VALUES (?, ?, ?, 1, ?)',
      [nombre_usuario, contrasena, email, idioma]
    );

    const userId = insertResult.insertId;

    const [roleResult] = await connection.execute(
      `INSERT INTO rol (nombre_rol) VALUES ('Cliente')
       ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id)`
    );
    const roleId = roleResult.insertId;

    await connection.execute(
      'INSERT INTO usuario_rol (id_usuario, id_rol) VALUES (?, ?)',
      [userId, roleId]
    );

    await connection.execute(
      `INSERT INTO cliente
         (primer_nombre, primer_apellido, numero_documento, telefono, direccion,
          ciudad, id_usuario, id_tipo_documento)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        primer_nombre,
        primer_apellido,
        numero_documento,
        telefono,
        direccion,
        ciudad,
        userId,
        id_tipo_documento
      ]
    );

    await connection.commit();
    transactionStarted = false;

    return {
      id: userId,
      nombre: nombre_usuario,
      email: email,
      telefono,
      idioma: idioma,
      activo: true,
      roles: ['cliente']
    };

  } catch (error) {
    if (transactionStarted) await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};
