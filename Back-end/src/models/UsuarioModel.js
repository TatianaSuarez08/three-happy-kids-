import pool from '../db.js'; // Importa el pool de conexiones creado en db.js

// Busca un usuario por su correo en la tabla `usuario` (nueva estructura) y devuelve
// un objeto que incluye los datos del usuario y un array `roles` con sus roles.
export const findUserByEmail = async (email) => {
  // Buscar el usuario por correo (columna `correo`)
  const [users] = await pool.execute(
    'SELECT id, nombre_usuario AS nombre, contrasena AS password, correo AS email, activo FROM usuario WHERE correo = ?',
    [email]
  );

  const user = users[0];
  if (!user) return undefined;

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
  return { id: user.id, nombre: user.nombre, email: user.email, password: user.password, activo: !!user.activo, roles };
};

// Nota: la creación de usuarios y asignación de roles queda fuera del alcance
// actual (backend centrado en inicio de sesión). Para crear/administrar usuarios
// deberías implementar endpoints y lógica que inserten en `usuario` y `usuario_rol`.
