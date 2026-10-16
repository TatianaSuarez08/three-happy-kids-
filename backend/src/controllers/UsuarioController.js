import jwt from 'jsonwebtoken'; // Librería para generar y verificar tokens JWT
import { buildRolePermissions } from '../middleware/role.js';
import { hashPassword, verifyPasswordAndUpgrade } from '../services/passwordService.js';
import { findUserByEmail, findUserProfile, createUser, updateUserProfile, updatePasswordHash } from '../models/UsuarioModel.js';

export const resolveProfileImagePath = (file, fallbackValue = null) => {
  if (file?.filename) {
    return `/assets/foto_de_perfil/${file.filename}`;
  }

  if (typeof fallbackValue === 'string') {
    const normalized = fallbackValue.trim();
    return normalized || null;
  }

  return fallbackValue || null;
};

// Genera un token JWT con información pública del usuario y expiración
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
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );
};

// Controlador para registrar un nuevo usuario
export const registerUser = async (req, res) => {
  try {
    const {
      nombre_usuario,
      email,
      password,
      confirmar_password,
      primer_nombre,
      primer_apellido,
      numero_documento,
      id_tipo_documento,
      telefono,
      direccion,
      ciudad,
      foto_perfil
    } = req.body;
    const fotoPerfilPath = resolveProfileImagePath(req.file, foto_perfil);
    
    // Validaciones básicas
    if (!nombre_usuario || !email || !password || !confirmar_password) {
      return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }

    if (password !== confirmar_password) {
      return res.status(400).json({ error: 'Las contraseñas no coinciden' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    if (nombre_usuario.length < 3) {
      return res.status(400).json({ error: 'El nombre de usuario debe tener al menos 3 caracteres' });
    }

    if (!primer_nombre?.trim() || primer_nombre.trim().length > 50) {
      return res.status(400).json({ error: 'El primer nombre es obligatorio y debe tener máximo 50 caracteres' });
    }
    if (!primer_apellido?.trim() || primer_apellido.trim().length > 50) {
      return res.status(400).json({ error: 'El primer apellido es obligatorio y debe tener máximo 50 caracteres' });
    }
    const documentNumber = String(numero_documento || '').trim();
    if (!/^\d{6,19}$/.test(documentNumber) || BigInt(documentNumber) > 9223372036854775807n) {
      return res.status(400).json({ error: 'El número de documento no es válido' });
    }
    const documentTypeId = Number.parseInt(id_tipo_documento, 10);
    if (!Number.isInteger(documentTypeId) || documentTypeId <= 0) {
      return res.status(400).json({ error: 'Selecciona un tipo de documento válido' });
    }
    if (telefono && (typeof telefono !== 'string' || telefono.trim().length > 20)) {
      return res.status(400).json({ error: 'El teléfono debe tener máximo 20 caracteres' });
    }
    if (direccion && (typeof direccion !== 'string' || direccion.trim().length > 150)) {
      return res.status(400).json({ error: 'La dirección debe tener máximo 150 caracteres' });
    }
    if (ciudad && (typeof ciudad !== 'string' || ciudad.trim().length > 60)) {
      return res.status(400).json({ error: 'La ciudad debe tener máximo 60 caracteres' });
    }
    if (fotoPerfilPath && (typeof fotoPerfilPath !== 'string' || fotoPerfilPath.trim().length > 255)) {
      return res.status(400).json({ error: 'La foto de perfil no es válida' });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Formato de email inválido' });
    }

    const usuarioExistente = await findUserByEmail(email);
    if (usuarioExistente) {
      return res.status(409).json({ error: 'El email ya está registrado' });
    }

    const hashedPassword = await hashPassword(password);

    const nuevoUsuario = await createUser({
      nombre_usuario,
      email,
      contrasena: hashedPassword,
      telefono: telefono?.trim() || null,
      foto_perfil: fotoPerfilPath?.trim() || null,
      idioma: 'es',
      cliente: {
        primer_nombre: primer_nombre.trim(),
        primer_apellido: primer_apellido.trim(),
        numero_documento: documentNumber,
        id_tipo_documento: documentTypeId,
        direccion: direccion?.trim() || null,
        ciudad: ciudad?.trim() || null
      }
    });

    const token = generateToken(nuevoUsuario);

    res.status(201).json({
      success: true,
      message: 'Usuario registrado correctamente',
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
      return res.status(409).json({ error: 'El nombre de usuario, email o documento ya existe' });
    }
    if (error.code === 'INVALID_DOCUMENT_TYPE') return res.status(400).json({ error: error.message });
    
    res.status(500).json({ error: 'Error al registrar el usuario' });
  }
};

// Controlador para el login de usuarios existentes
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Formato de email inválido' });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const passwordCheck = await verifyPasswordAndUpgrade(password, user.passwordHash);
    if (!passwordCheck.valid) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    if (passwordCheck.upgradedHash) await updatePasswordHash(user.id, passwordCheck.upgradedHash);

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

export const updateMyProfile = async (req, res) => {
  try {
    const { nombre, email, telefono, password, direccion } = req.body;
    const fotoPerfilPath = resolveProfileImagePath(req.file, req.body.foto_perfil ?? null);
    if (!nombre || nombre.trim().length < 3) return res.status(400).json({ error: 'El nombre debe tener al menos 3 caracteres' });
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'El correo no es válido' });
    if (password !== undefined && password.length < 6) return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    if (direccion !== undefined && (typeof direccion !== 'string' || !direccion.trim() || direccion.trim().length > 150)) {
      return res.status(400).json({ error: 'La dirección no es válida' });
    }
    if (fotoPerfilPath && (typeof fotoPerfilPath !== 'string' || fotoPerfilPath.trim().length > 255)) {
      return res.status(400).json({ error: 'La foto de perfil no es válida' });
    }

    const hashedPassword = password ? await hashPassword(password) : undefined;
    const updated = await updateUserProfile({
      id: req.user.id,
      nombre: nombre.trim(),
      email: email.trim().toLowerCase(),
      telefono: telefono?.trim() || null,
      hashedPassword,
      direccion: direccion?.trim(),
      foto_perfil: req.file || req.body.foto_perfil !== undefined ? fotoPerfilPath?.trim() || null : undefined
    });
    if (!updated) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json({
      success: true,
      message: 'Perfil actualizado correctamente',
      user: {
        fotoPerfil: fotoPerfilPath || null
      }
    });
  } catch (error) {
    console.error('Error al actualizar el perfil:', error);
    if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'El correo ya está registrado' });
    if (error.code === 'CLIENT_PROFILE_NOT_FOUND') return res.status(400).json({ error: error.message });
    res.status(500).json({ error: 'No se pudo actualizar el perfil' });
  }
};
