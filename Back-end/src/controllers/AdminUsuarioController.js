import { createAdminUser, deactivateUser, findUsers, updateAdminUser, updateUserStatus } from '../models/AdminUsuarioModel.js';

const rolesAdministrativos = ['Administrador', 'Bodeguero', 'Mensajero'];

export const createUser = async (req, res) => {
  const { nombre, apellido, correo, password, rol } = req.body;
  if (!nombre || !apellido || !correo || !password || !rol) {
    return res.status(400).json({ error: 'Nombre, apellido, correo, contraseña y rol son obligatorios' });
  }
  if (nombre.trim().length < 3) return res.status(400).json({ error: 'El nombre debe tener al menos 3 caracteres' });
  if (apellido.trim().length < 2) return res.status(400).json({ error: 'El apellido debe tener al menos 2 caracteres' });
  if (password.length < 6) return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
  if (!rolesAdministrativos.includes(rol)) return res.status(400).json({ error: 'Solo se pueden crear usuarios administrativos' });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) return res.status(400).json({ error: 'El correo no es válido' });

  try {
    const user = await createAdminUser({ nombre: nombre.trim(), apellido: apellido.trim(), correo: correo.trim().toLowerCase(), password, rol });
    res.status(201).json({ success: true, message: 'Usuario creado correctamente', user });
  } catch (error) {
    console.error('Error al crear usuario:', error);
    if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'El nombre de usuario o correo ya existe' });
    if (error.code === 'INVALID_ROLE' || error.code === 'ROLE_NOT_FOUND' || error.code === 'CARGO_NOT_FOUND') return res.status(400).json({ error: error.message });
    res.status(500).json({ error: 'No se pudo crear el usuario' });
  }
};

export const getUsers = async (_req, res) => {
  try {
    const users = await findUsers();
    res.json({ success: true, users });
  } catch (error) {
    console.error('Error al consultar usuarios:', error);
    res.status(500).json({ error: 'No se pudieron consultar los usuarios' });
  }
};

export const changeUserStatus = async (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  const { activo } = req.body;

  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: 'El ID del usuario no es válido' });
  }
  if (typeof activo !== 'boolean') {
    return res.status(400).json({ error: 'El estado del usuario no es válido' });
  }

  if (id === req.user.id && !activo) {
    return res.status(400).json({ error: 'No puedes desactivar tu propio usuario administrador' });
  }

  try {
    const updated = await updateUserStatus(id, activo);
    if (!updated) return res.status(404).json({ error: 'Usuario no encontrado' });

    res.json({ success: true, message: 'Estado del usuario actualizado correctamente' });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({ error: 'No se pudo actualizar el estado del usuario' });
  }
};

export const editUser = async (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  const { nombre, apellido, correo, password, rol } = req.body;
  if (!Number.isInteger(id)) return res.status(400).json({ error: 'El ID del usuario no es válido' });
  if (!nombre || !apellido || !correo || !rol) return res.status(400).json({ error: 'Nombre, apellido, correo y rol son obligatorios' });
  if (nombre.trim().length < 3) return res.status(400).json({ error: 'El nombre debe tener al menos 3 caracteres' });
  if (apellido.trim().length < 2) return res.status(400).json({ error: 'El apellido debe tener al menos 2 caracteres' });
  if (password && password.length < 6) return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
  if (!rolesAdministrativos.includes(rol)) return res.status(400).json({ error: 'Solo se pueden usar roles administrativos' });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) return res.status(400).json({ error: 'El correo no es válido' });

  try {
    const updated = await updateAdminUser({ id, nombre: nombre.trim(), apellido: apellido.trim(), correo: correo.trim().toLowerCase(), password, rol });
    if (!updated) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json({ success: true, message: 'Usuario actualizado correctamente' });
  } catch (error) {
    console.error('Error al editar usuario:', error);
    if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'El nombre de usuario o correo ya existe' });
    if (error.code === 'INVALID_ROLE' || error.code === 'ROLE_NOT_FOUND' || error.code === 'CARGO_NOT_FOUND') return res.status(400).json({ error: error.message });
    res.status(500).json({ error: 'No se pudo editar el usuario' });
  }
};

export const removeUser = async (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  if (!Number.isInteger(id)) return res.status(400).json({ error: 'El ID del usuario no es válido' });
  if (id === req.user.id) return res.status(400).json({ error: 'No puedes eliminar tu propio usuario administrador' });

  try {
    const removed = await deactivateUser(id);
    if (!removed) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json({ success: true, message: 'Usuario eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ error: 'No se pudo eliminar el usuario' });
  }
};
