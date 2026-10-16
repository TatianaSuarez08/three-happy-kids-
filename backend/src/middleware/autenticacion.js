import jwt from 'jsonwebtoken';
import pool from '../db.js';

// Middleware que verifica el token JWT enviado en el header Authorization: Bearer <token>
export default async function auth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  const token = authHeader.split(' ')[1];
  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido' });
  }

  try {
    const [users] = await pool.execute('SELECT activo FROM usuario WHERE id = ?', [payload.id]);
    if (users.length === 0 || !users[0].activo) {
      return res.status(401).json({ error: 'La sesión ya no está activa' });
    }

    req.user = payload;
    next();
  } catch (error) {
    console.error('Error al validar el estado de la sesión:', error);
    res.status(500).json({ error: 'No se pudo validar la sesión' });
  }
}
