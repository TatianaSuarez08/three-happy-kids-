import crypto from 'crypto'; // Para hashear con SHA2
import jwt from 'jsonwebtoken'; // Librería para generar y verificar tokens JWT
import { findUserByEmail, createUser } from '../models/UsuarioModel.js'; // Funciones del modelo de usuario

// Función para hashear contraseña con SHA2 + SALT
const hashPassword = (password) => {
  const salt = crypto.randomBytes(16).toString('hex'); // Generar salt aleatorio
  const hash = crypto.createHash('sha256').update(salt + password).digest('hex'); // SHA2 del salt + contraseña
  return `${salt}:${hash}`; // Guardar salt:hash juntos
};

// Función para verificar contraseña
const verifyPassword = (password, storedHash) => {
  const [salt, hash] = storedHash.split(':'); // Separar salt del hash
  const computedHash = crypto.createHash('sha256').update(salt + password).digest('hex'); // Calcular hash con el salt
  return hash === computedHash; // Comparar hashes
};

// Genera un token JWT con información pública del usuario y expiración
const generateToken = (user) => {
  return jwt.sign(
    { email: user.email, nombre: user.nombre, roles: user.roles || [] },
    process.env.JWT_SECRET || 'secretkey',
    { expiresIn: '8h' }
  );
};

// Controlador para registrar un nuevo usuario
export const registerUser = async (req, res) => {
  try {
    const { nombre_usuario, email, password, confirmar_password } = req.body;
    
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

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Formato de email inválido' });
    }

    // Verificar si el email ya existe
    const usuarioExistente = await findUserByEmail(email);
    if (usuarioExistente) {
      return res.status(409).json({ error: 'El email ya está registrado' });
    }

    // Hashear la contraseña con SHA2 + SALT
    const hashedPassword = hashPassword(password);

    // Crear el usuario en la base de datos
    const nuevoUsuario = await createUser({
      nombre_usuario,
      email,
      contrasena: hashedPassword,
      idioma: 'es'
    });

    // Generar token
    const token = generateToken(nuevoUsuario);

    // Responder con éxito
    res.status(201).json({
      success: true,
      message: 'Usuario registrado correctamente',
      user: {
        id: nuevoUsuario.id,
        nombre: nuevoUsuario.nombre,
        email: nuevoUsuario.email,
        idioma: nuevoUsuario.idioma,
        roles: nuevoUsuario.roles || []
      },
      token
    });

  } catch (error) {
    console.error('Error en registro:', error);
    
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'El nombre de usuario o email ya existe' });
    }
    
    res.status(500).json({ error: 'Error al registrar el usuario' });
  }
};

// Controlador para el login de usuarios existentes
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    
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

    // Verificar contraseña con SHA2
    const isValidPassword = verifyPassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = generateToken(user);
    
    res.json({ 
      success: true,
      message: 'Login exitoso', 
      user: { 
        id: user.id,
        nombre: user.nombre, 
        email: user.email, 
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
