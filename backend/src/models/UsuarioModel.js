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

export const findActiveUserForPasswordReset = async (email) => {
  const [rows] = await pool.execute(
    `SELECT id, nombre_usuario AS nombre, correo AS email
     FROM usuario
     WHERE correo = ? AND activo = 1`,
    [email]
  );
  return rows[0];
};

export const savePasswordResetToken = async (userId, tokenHash) => {
  const connection = await pool.getConnection();
  let transactionStarted = false;

  try {
    await connection.beginTransaction();
    transactionStarted = true;

    const [users] = await connection.execute(
      'SELECT id FROM usuario WHERE id = ? AND activo = 1 FOR UPDATE',
      [userId]
    );
    if (users.length === 0) {
      await connection.rollback();
      transactionStarted = false;
      return false;
    }

    const [tokens] = await connection.execute(
      `SELECT creado_en > DATE_SUB(UTC_TIMESTAMP(), INTERVAL 1 MINUTE) AS en_espera
       FROM recuperacion_contrasena
       WHERE id_usuario = ?
       FOR UPDATE`,
      [userId]
    );
    if (tokens[0]?.en_espera) {
      await connection.commit();
      transactionStarted = false;
      return false;
    }

    await connection.execute(
      `INSERT INTO recuperacion_contrasena
         (id_usuario, token_hash, creado_en, expira_en, usado_en)
       VALUES (?, ?, UTC_TIMESTAMP(), DATE_ADD(UTC_TIMESTAMP(), INTERVAL 20 MINUTE), NULL)
       ON DUPLICATE KEY UPDATE
         token_hash = VALUES(token_hash),
         creado_en = VALUES(creado_en),
         expira_en = VALUES(expira_en),
         usado_en = NULL`,
      [userId, tokenHash]
    );
    await connection.commit();
    transactionStarted = false;
    return true;
  } catch (error) {
    if (transactionStarted) await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export const consumePasswordResetToken = async (tokenHash, passwordHash) => {
  const connection = await pool.getConnection();
  let transactionStarted = false;

  try {
    await connection.beginTransaction();
    transactionStarted = true;

    const [tokenOwners] = await connection.execute(
      'SELECT id_usuario FROM recuperacion_contrasena WHERE token_hash = ?',
      [tokenHash]
    );
    const userId = tokenOwners[0]?.id_usuario;
    if (!userId) {
      await connection.rollback();
      transactionStarted = false;
      return null;
    }

    const [users] = await connection.execute(
      `SELECT id, nombre_usuario AS nombre, correo AS email
       FROM usuario
       WHERE id = ? AND activo = 1
       FOR UPDATE`,
      [userId]
    );
    const user = users[0];
    if (!user) {
      await connection.rollback();
      transactionStarted = false;
      return null;
    }

    const [tokens] = await connection.execute(
      `SELECT id_usuario
       FROM recuperacion_contrasena
       WHERE id_usuario = ?
         AND token_hash = ?
         AND usado_en IS NULL
         AND expira_en > UTC_TIMESTAMP()
       FOR UPDATE`,
      [userId, tokenHash]
    );
    if (tokens.length === 0) {
      await connection.rollback();
      transactionStarted = false;
      return null;
    }

    await connection.execute(
      'UPDATE usuario SET contrasena = ? WHERE id = ?',
      [passwordHash, userId]
    );
    await connection.execute(
      `UPDATE recuperacion_contrasena
       SET usado_en = UTC_TIMESTAMP()
       WHERE id_usuario = ? AND token_hash = ? AND usado_en IS NULL`,
      [userId, tokenHash]
    );
    await connection.commit();
    transactionStarted = false;
    return { id: userId, nombre: user.nombre, email: user.email };
  } catch (error) {
    if (transactionStarted) await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
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
