import pool from '../db.js'; // Importa el pool de conexiones creado en db.js

// Busca un usuario por su correo en la tabla `usuario` (nueva estructura) y devuelve
// un objeto que incluye los datos del usuario y un array `roles` con sus roles.
export const findUserByEmail = async (email) => {
  // Buscar el usuario por correo (columna `correo`)
  const [users] = await pool.execute(
    'SELECT id, nombre_usuario AS nombre, contrasena AS passwordHash, correo AS email, telefono, foto_perfil AS fotoPerfil, activo, idioma FROM usuario WHERE correo = ?',
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
  return { id: user.id, nombre: user.nombre, email: user.email, telefono: user.telefono, fotoPerfil: user.fotoPerfil, passwordHash: user.passwordHash, activo: !!user.activo, idioma: user.idioma, roles };
};

export const findUserProfile = async (id) => {
  const [rows] = await pool.execute(
        `SELECT u.id, u.nombre_usuario AS nombre, u.correo AS email, u.telefono,
          u.foto_perfil AS fotoPerfil, u.activo, u.idioma,
          c.direccion, (c.id IS NOT NULL) AS esCliente,
            COALESCE(GROUP_CONCAT(r.nombre_rol ORDER BY r.nombre_rol SEPARATOR ', '), 'Sin rol') AS rol
     FROM usuario u
         LEFT JOIN cliente c ON c.id_usuario = u.id
     LEFT JOIN usuario_rol ur ON ur.id_usuario = u.id
     LEFT JOIN rol r ON r.id = ur.id_rol
     WHERE u.id = ?
         GROUP BY u.id, u.nombre_usuario, u.correo, u.telefono, u.foto_perfil, u.activo, u.idioma, c.id, c.direccion`,
    [id]
  );
  return rows[0] ? { ...rows[0], estado: rows[0].activo ? 'Activo' : 'Inactivo' } : null;
};

export const updateUserProfile = async ({ id, nombre, email, telefono, hashedPassword, direccion, foto_perfil }) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();
    const [users] = await connection.execute('SELECT id FROM usuario WHERE id = ? FOR UPDATE', [id]);
    if (users.length === 0) {
      await connection.rollback();
      return false;
    }

    const values = [nombre, email, telefono];
    let query = 'UPDATE usuario SET nombre_usuario = ?, correo = ?, telefono = ?';
    if (hashedPassword) {
      query += ', contrasena = ?';
      values.push(hashedPassword);
    }
    if (foto_perfil !== undefined) {
      query += ', foto_perfil = ?';
      values.push(foto_perfil);
    }
    values.push(id);
    await connection.execute(`${query} WHERE id = ?`, values);

    if (direccion !== undefined) {
      const [clients] = await connection.execute('SELECT id FROM cliente WHERE id_usuario = ? FOR UPDATE', [id]);
      if (clients.length === 0) {
        const error = new Error('El usuario no tiene un perfil de cliente');
        error.code = 'CLIENT_PROFILE_NOT_FOUND';
        throw error;
      }
      await connection.execute('UPDATE cliente SET direccion = ?, telefono = ? WHERE id_usuario = ?', [direccion, telefono, id]);
    }

    await connection.commit();
    return true;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};
export const updatePasswordHash = async (id, hashedPassword) => {
  await pool.execute('UPDATE usuario SET contrasena = ? WHERE id = ?', [hashedPassword, id]);
};

// Crea un nuevo usuario en la base de datos con rol 'cliente' por defecto
export const createUser = async (userData) => {
  const {
    nombre_usuario,
    email,
    contrasena,
    telefono,
    foto_perfil,
    idioma = 'es',
    cliente
  } = userData;
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();
    const [documentTypes] = await connection.execute(
      `SELECT id FROM tipo_documento WHERE id = ? AND estado = 'Activo'`,
      [cliente.id_tipo_documento]
    );
    if (documentTypes.length === 0) {
      const error = new Error('El tipo de documento no existe o está inactivo');
      error.code = 'INVALID_DOCUMENT_TYPE';
      throw error;
    }

    // 1. Insertar el usuario
    const [insertResult] = await connection.execute(
      'INSERT INTO usuario (nombre_usuario, contrasena, correo, telefono, foto_perfil, activo, idioma) VALUES (?, ?, ?, ?, ?, 1, ?)',
      [nombre_usuario, contrasena, email, telefono || null, foto_perfil || null, idioma]
    );

    const userId = insertResult.insertId;

    // 2. Obtener o crear el rol 'cliente'
    const [rolRows] = await connection.execute(
      'SELECT id FROM rol WHERE nombre_rol = ?',
      ['cliente']
    );

    let roleId;
    if (rolRows.length === 0) {
      // Si no existe el rol, crearlo
      const [roleInsert] = await connection.execute(
        'INSERT INTO rol (nombre_rol) VALUES (?)',
        ['cliente']
      );
      roleId = roleInsert.insertId;
    } else {
      roleId = rolRows[0].id;
    }

    // 3. Asignar el rol 'cliente' al usuario
    await connection.execute(
      'INSERT INTO usuario_rol (id_usuario, id_rol) VALUES (?, ?)',
      [userId, roleId]
    );

    await connection.execute(
      `INSERT INTO cliente
        (primer_nombre, primer_apellido, numero_documento, telefono, direccion, ciudad, id_usuario, id_tipo_documento)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        cliente.primer_nombre,
        cliente.primer_apellido,
        cliente.numero_documento,
        telefono || null,
        cliente.direccion || null,
        cliente.ciudad || null,
        userId,
        cliente.id_tipo_documento
      ]
    );

    await connection.commit();
    // 4. Retornar el usuario creado
    return {
      id: userId,
      nombre: nombre_usuario,
      email: email,
      telefono: telefono || null,
      fotoPerfil: foto_perfil || null,
      idioma: idioma,
      activo: true,
      roles: ['cliente']
    };

  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};
