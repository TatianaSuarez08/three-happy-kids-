import jwt from 'jsonwebtoken'; // Librería para generar y verificar tokens JWT
import { buildRolePermissions } from '../middleware/role.js';
import { env } from '../config/env.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { findUserByEmail, findUserProfile, updatePassword, updateUserProfilePhoto, createUser, listActiveDocumentTypes } from '../models/UsuarioModel.js'; // Funciones del modelo de usuario
import { sendWelcomeEmail } from '../services/emailService.js';

// Firma el JWT de ocho horas con identidad y roles; los permisos derivados los consumen los middleware de acceso.
const generateToken = (user) => {
  const permissions = buildRolePermissions(user.roles || []);

  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      nombre: user.nombre,
      roles: user.roles || [],
      permissions
    },
    env.JWT_SECRET,
    { expiresIn: '8h' }
  );
};

// Controlador para registrar un nuevo usuario
export const registerUser = async (req, res) => {
  try {
    const body = req.body || {};
    const nombreUsuario = typeof body.nombre_usuario === 'string' ? body.nombre_usuario.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const primerNombre = typeof body.primer_nombre === 'string' ? body.primer_nombre.trim() : '';
    const primerApellido = typeof body.primer_apellido === 'string' ? body.primer_apellido.trim() : '';
    const numeroDocumento = typeof body.numero_documento === 'string' || typeof body.numero_documento === 'number'
      ? String(body.numero_documento).trim()
      : '';
    const idTipoDocumento = Number(body.id_tipo_documento);
    const password = body.password;
    const confirmarPassword = body.confirmar_password;
    const telefono = typeof body.telefono === 'string' ? body.telefono.trim() : '';
    const direccion = typeof body.direccion === 'string' ? body.direccion.trim() : '';
    const ciudad = typeof body.ciudad === 'string' ? body.ciudad.trim() : '';

    // Validaciones básicas
    if (!nombreUsuario || !email || !password || !confirmarPassword
      || !primerNombre || !primerApellido || !numeroDocumento || !body.id_tipo_documento) {
      return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }

    if (password !== confirmarPassword) {
      return res.status(400).json({ error: 'Las contraseñas no coinciden' });
    }

    if (typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    if (nombreUsuario.length < 3 || nombreUsuario.length > 50
      || !/^[\p{L}\p{M}][\p{L}\p{M} .'_-]{2,49}$/u.test(nombreUsuario)) {
      return res.status(400).json({ error: 'El nombre solo puede contener letras, espacios, puntos, guiones, guiones bajos o apóstrofes y debe tener entre 3 y 50 caracteres' });
    }

    const personNamePattern = /^[\p{L}\p{M}][\p{L}\p{M} '-]{0,49}$/u;
    if (!personNamePattern.test(primerNombre) || !personNamePattern.test(primerApellido)) {
      return res.status(400).json({ error: 'El nombre y apellido solo pueden contener letras, espacios, apóstrofes o guiones y tener hasta 50 caracteres' });
    }

    if (!/^\d{1,19}$/.test(numeroDocumento)
      || BigInt(numeroDocumento) > 9223372036854775807n) {
      return res.status(400).json({ error: 'El número de documento debe contener solo dígitos y ser válido' });
    }

    if (!Number.isSafeInteger(idTipoDocumento) || idTipoDocumento < 1) {
      return res.status(400).json({ error: 'Selecciona un tipo de documento válido' });
    }

    if (telefono.length > 20 || direccion.length > 150 || ciudad.length > 60) {
      return res.status(400).json({ error: 'Revisa la longitud del teléfono, dirección o ciudad' });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email.length > 100 || !emailRegex.test(email)) {
      return res.status(400).json({ error: 'Formato de email inválido' });
    }

    // Verificar si el email ya existe
    let usuarioExistente;
    try {
      usuarioExistente = await findUserByEmail(email);
    } catch (error) {
      if (error.message !== 'El usuario está inactivo') throw error;
      usuarioExistente = true;
    }
    if (usuarioExistente) {
      return res.status(409).json({ error: 'El email ya está registrado' });
    }

    // Guardar contraseñas nuevas con bcrypt.
    const hashedPassword = await hashPassword(password);

    // Crear el usuario en la base de datos
    const nuevoUsuario = await createUser({
      nombre_usuario: nombreUsuario,
      email,
      contrasena: hashedPassword,
      idioma: 'es',
      primer_nombre: primerNombre,
      primer_apellido: primerApellido,
      numero_documento: numeroDocumento,
      id_tipo_documento: idTipoDocumento,
      telefono: telefono || null,
      direccion: direccion || null,
      ciudad: ciudad || null
    });

    // Generar token
    const token = generateToken(nuevoUsuario);

    let emailSent = false;
    try {
      await sendWelcomeEmail({
        to: nuevoUsuario.email,
        name: `${primerNombre} ${primerApellido}`
      });
      emailSent = true;
    } catch (error) {
      console.error('No se pudo enviar el correo de bienvenida:', error.message);
    }

    // Responder con éxito
    res.status(201).json({
      success: true,
      message: 'Usuario registrado correctamente',
      emailSent,
      user: {
        id: nuevoUsuario.id,
        nombre: nuevoUsuario.nombre,
        email: nuevoUsuario.email,
        telefono: nuevoUsuario.telefono,
        fotoPerfil: nuevoUsuario.fotoPerfil,
        idioma: nuevoUsuario.idioma,
        roles: nuevoUsuario.roles || []
      },
      token
    });

  } catch (error) {
    console.error('Error en registro:', error);
    
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'El nombre de usuario, correo o documento ya está registrado' });
    }

    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ error: 'El tipo de documento seleccionado ya no está disponible' });
    }
    
    res.status(500).json({ error: 'Error al registrar el usuario' });
  }
};

// Expone solo los tipos activos que el formulario público de registro ofrece al usuario.
export const getDocumentTypes = async (_req, res) => {
  try {
    const documentTypes = await listActiveDocumentTypes();
    res.json({ success: true, documentTypes });
  } catch (error) {
    console.error('Error al consultar los tipos de documento:', error);
    res.status(500).json({ error: 'No se pudieron consultar los tipos de documento' });
  }
};

// Controlador para el login de usuarios existentes
export const loginUser = async (req, res) => {
  try {
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const { password } = req.body;
    
    // Validación básica: email y password son obligatorios
    if (!email || !password) {
      return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Formato de email inválido' });
    }

    const user = await findUserByEmail(email); // Busca el usuario por email
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // verifyPassword acepta bcrypt y el formato heredado; este último se actualiza tras validar el login.
    const passwordResult = await verifyPassword(password, user.password);
    if (!passwordResult.valid) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    if (passwordResult.legacy) {
      await updatePassword(user.id, await hashPassword(password));
    }

    const token = generateToken(user);
    
    res.json({ 
      success: true,
      message: 'Login exitoso', 
      user: { 
        id: user.id,
        nombre: user.nombre, 
        email: user.email,
        telefono: user.telefono,
        fotoPerfil: user.fotoPerfil,
        idioma: user.idioma,
        roles: user.roles || [] 
      }, 
      token 
    });
  } catch (error) {
    console.error('Error en login:', error);
    
    if (error.message === 'El usuario está inactivo') {
      return res.status(403).json({ error: 'El usuario está inactivo' });
    }

    res.status(500).json({ error: 'Error en el login' });
  }
};

export const getMyProfile = async (req, res) => {
  try {
    const profile = await findUserProfile(req.user.id);
    if (!profile) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json({ success: true, user: profile });
  } catch (error) {
    console.error('Error al consultar el perfil:', error);
    res.status(500).json({ error: 'No se pudo consultar el perfil' });
  }
};

export const updateMyProfilePhoto = async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Selecciona una imagen de perfil' });

  try {
    const photoPath = `/assets/foto_de_perfil/${req.file.filename}`;
    const updated = await updateUserProfilePhoto(req.user.id, photoPath);
    if (!updated) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json({ success: true, message: 'Foto de perfil actualizada correctamente', fotoPerfil: photoPath });
  } catch (error) {
    console.error('Error al actualizar la foto de perfil:', error);
    res.status(500).json({ error: 'No se pudo actualizar la foto de perfil' });
  }
};
