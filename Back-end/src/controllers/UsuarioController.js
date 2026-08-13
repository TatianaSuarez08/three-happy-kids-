import bcrypt from 'bcryptjs'; // Librería para hashear y comparar contraseñas
import jwt from 'jsonwebtoken'; // Librería para generar y verificar tokens JWT
import { findUserByEmail } from '../models/UsuarioModel.js'; // Función del modelo de usuario

// Genera un token JWT con información pública del usuario y expiración
// Incluye el `role` en el payload para control de acceso por roles
const generateToken = (user) => {
  return jwt.sign(
    { email: user.email, nombre: user.nombre, roles: user.roles || [] }, // Payload: incluir array de roles
    process.env.JWT_SECRET || 'secretkey', // Clave secreta para firmar el token (debe venir de ENV)
    { expiresIn: '8h' } // Tiempo de expiración del token
  );
};

// Controlador para registrar un nuevo usuario
// Nota: la funcionalidad de registro ha sido removida para mantener este backend
// enfocado únicamente en el inicio de sesión.

// Controlador para el login de usuarios existentes
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body; // Credenciales recibidas
    if (!email || !password) {
      // Validación básica: email y password son obligatorios
      return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }

    const user = await findUserByEmail(email); // Busca el usuario por email
    if (!user) {
      // Si no existe, credenciales inválidas
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const isValidPassword = bcrypt.compareSync(password, user.password); // Compara la contraseña proporcionada con la guardada
    if (!isValidPassword) {
      // Si la contraseña no coincide, credenciales inválidas
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = generateToken(user); // Genera token para sesión (incluye roles)
    // Devuelve mensaje, datos públicos del usuario y el token (incluye roles)
    res.json({ message: 'Login exitoso', user: { nombre: user.nombre, email: user.email, roles: user.roles || [] }, token });
  } catch (error) {
    console.error(error); // Log del error
    res.status(500).json({ error: 'Error en el login' }); // Respuesta genérica de error
  }
};
