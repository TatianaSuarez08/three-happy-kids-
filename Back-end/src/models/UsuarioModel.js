import pool from '../db.js'; // Importa el pool de conexiones creado en db.js

// Busca un usuario por su correo en la tabla `usuario` (nueva estructura) y devuelve
// un objeto que incluye los datos del usuario y un array `roles` con sus roles.
export const findUserByEmail = async (email) => {
  // Buscar el usuario por correo (columna `correo`)
  const [users] = await pool.execute(
    'SELECT id, nombre_usuario AS nombre, contrasena AS password, correo AS email, activo, idioma FROM usuario WHERE correo = ?',
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
  return { id: user.id, nombre: user.nombre, email: user.email, password: user.password, activo: !!user.activo, idioma: user.idioma, roles };
};

// Crea un nuevo usuario en la base de datos con rol 'cliente' por defecto
export const createUser = async (userData) => {
  const { nombre_usuario, email, contrasena, idioma = 'es' } = userData;

  try {
    // 1. Insertar el usuario
    const [insertResult] = await pool.execute(
      'INSERT INTO usuario (nombre_usuario, contrasena, correo, activo, idioma) VALUES (?, ?, ?, 1, ?)',
      [nombre_usuario, contrasena, email, idioma]
    );

    const userId = insertResult.insertId;

    // 2. Obtener o crear el rol 'cliente'
    const [rolRows] = await pool.execute(
      'SELECT id FROM rol WHERE nombre_rol = ?',
      ['cliente']
    );

    let roleId;
    if (rolRows.length === 0) {
      // Si no existe el rol, crearlo
      const [roleInsert] = await pool.execute(
        'INSERT INTO rol (nombre_rol) VALUES (?)',
        ['cliente']
      );
      roleId = roleInsert.insertId;
    } else {
      roleId = rolRows[0].id;
    }

    // 3. Asignar el rol 'cliente' al usuario
    await pool.execute(
      'INSERT INTO usuario_rol (id_usuario, id_rol) VALUES (?, ?)',
      [userId, roleId]
    );

    // 4. Retornar el usuario creado
    return {
      id: userId,
      nombre: nombre_usuario,
      email: email,
      idioma: idioma,
      activo: true,
      roles: ['cliente']
    };

  } catch (error) {
    // Re-lanzar el error para que el controlador lo maneje
    throw error;
  }
};

// Nota: la creación de usuarios y asignación de roles queda fuera del alcance
// actual (backend centrado en inicio de sesión). Para crear/administrar usuarios
// deberías implementar endpoints y lógica que inserten en `usuario` y `usuario_rol`.
