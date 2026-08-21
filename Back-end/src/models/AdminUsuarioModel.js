import crypto from 'crypto';
import pool from '../db.js';

const rolesAdministrativos = ['Administrador', 'Bodeguero', 'Mensajero'];

export const createAdminUser = async ({ nombre, apellido, correo, password, rol }) => {
  if (!rolesAdministrativos.includes(rol)) {
    const error = new Error('El rol seleccionado no está permitido para este apartado');
    error.code = 'INVALID_ROLE';
    throw error;
  }

  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.createHash('sha256').update(salt + password).digest('hex');
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();
    const [userResult] = await connection.execute(
      `INSERT INTO usuario (nombre_usuario, contrasena, correo, activo, idioma)
       VALUES (?, ?, ?, 1, 'es')`,
      [nombre, `${salt}:${hash}`, correo]
    );
    const [roleRows] = await connection.execute(
      'SELECT id FROM rol WHERE LOWER(nombre_rol) = LOWER(?)',
      [rol]
    );
    if (roleRows.length === 0) {
      const error = new Error('El rol seleccionado no existe en la base de datos');
      error.code = 'ROLE_NOT_FOUND';
      throw error;
    }
    await connection.execute(
      'INSERT INTO usuario_rol (id_usuario, id_rol) VALUES (?, ?)',
      [userResult.insertId, roleRows[0].id]
    );
    const [cargoRows] = await connection.execute(
      'SELECT id FROM cargo WHERE LOWER(nombre_cargo) = LOWER(?) AND estado = \'Activo\'',
      [rol]
    );
    if (cargoRows.length === 0) {
      const error = new Error('El cargo seleccionado no existe o está inactivo');
      error.code = 'CARGO_NOT_FOUND';
      throw error;
    }
    await connection.execute(
      'INSERT INTO empleado (nombre, apellido, id_usuario, id_cargo) VALUES (?, ?, ?, ?)',
      [nombre, apellido, userResult.insertId, cargoRows[0].id]
    );
    await connection.commit();
    return { id: userResult.insertId, nombre, apellido, correo, rol, estado: 'Activo', telefono: '' };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export const findUsers = async () => {
  const [rows] = await pool.query(
    `SELECT
       u.id,
       u.nombre_usuario AS nombre,
      COALESCE(e.apellido, '') AS apellido,
       u.correo,
       u.activo,
       COALESCE(c.telefono, '') AS telefono,
      COALESCE(e.id_cargo, 0) AS id_cargo,
      COALESCE(cargo.nombre_cargo, '') AS cargo,
       COALESCE(GROUP_CONCAT(r.nombre_rol ORDER BY r.nombre_rol SEPARATOR ', '), 'Sin rol') AS rol
     FROM usuario u
     LEFT JOIN cliente c ON c.id_usuario = u.id
    LEFT JOIN empleado e ON e.id_usuario = u.id
    LEFT JOIN cargo ON cargo.id = e.id_cargo
     LEFT JOIN usuario_rol ur ON ur.id_usuario = u.id
     LEFT JOIN rol r ON r.id = ur.id_rol
    GROUP BY u.id, u.nombre_usuario, e.apellido, u.correo, u.activo, c.telefono, e.id_cargo, cargo.nombre_cargo
     ORDER BY u.id DESC`
  );

  return rows.map((user) => ({
    ...user,
    estado: user.activo ? 'Activo' : 'Inactivo'
  }));
};

export const updateUserStatus = async (id, active) => {
  const [result] = await pool.execute(
    'UPDATE usuario SET activo = ? WHERE id = ?',
    [active ? 1 : 0, id]
  );

  return result.affectedRows > 0;
};

export const updateAdminUser = async ({ id, nombre, apellido, correo, password, rol }) => {
  if (!rolesAdministrativos.includes(rol)) {
    const error = new Error('El rol seleccionado no está permitido para este apartado');
    error.code = 'INVALID_ROLE';
    throw error;
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [existingUsers] = await connection.execute('SELECT id FROM usuario WHERE id = ?', [id]);
    if (existingUsers.length === 0) {
      await connection.rollback();
      return false;
    }
    const userValues = [nombre, correo];
    let userQuery = 'UPDATE usuario SET nombre_usuario = ?, correo = ?';
    if (password) {
      const salt = crypto.randomBytes(16).toString('hex');
      const hash = crypto.createHash('sha256').update(salt + password).digest('hex');
      userQuery += ', contrasena = ?';
      userValues.push(`${salt}:${hash}`);
    }
    userQuery += ' WHERE id = ?';
    userValues.push(id);
    await connection.execute(userQuery, userValues);

    const [roleRows] = await connection.execute(
      'SELECT id FROM rol WHERE LOWER(nombre_rol) = LOWER(?)',
      [rol]
    );
    if (roleRows.length === 0) {
      const error = new Error('El rol seleccionado no existe en la base de datos');
      error.code = 'ROLE_NOT_FOUND';
      throw error;
    }
    await connection.execute('DELETE FROM usuario_rol WHERE id_usuario = ?', [id]);
    await connection.execute(
      'INSERT INTO usuario_rol (id_usuario, id_rol) VALUES (?, ?)',
      [id, roleRows[0].id]
    );
    const [cargoRows] = await connection.execute(
      'SELECT id FROM cargo WHERE LOWER(nombre_cargo) = LOWER(?) AND estado = \'Activo\'',
      [rol]
    );
    if (cargoRows.length === 0) {
      const error = new Error('El cargo seleccionado no existe o está inactivo');
      error.code = 'CARGO_NOT_FOUND';
      throw error;
    }
    const [employeeResult] = await connection.execute(
      'UPDATE empleado SET nombre = ?, apellido = ?, id_cargo = ? WHERE id_usuario = ?',
      [nombre, apellido, cargoRows[0].id, id]
    );
    if (employeeResult.affectedRows === 0) {
      await connection.execute(
        'INSERT INTO empleado (nombre, apellido, id_usuario, id_cargo) VALUES (?, ?, ?, ?)',
        [nombre, apellido, id, cargoRows[0].id]
      );
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

export const deactivateUser = async (id) => {
  const [users] = await pool.execute('SELECT id FROM usuario WHERE id = ?', [id]);
  if (users.length === 0) return false;
  await pool.execute('UPDATE usuario SET activo = 0 WHERE id = ?', [id]);
  return true;
};
