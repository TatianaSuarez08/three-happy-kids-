import { pool } from '../db.js';

export const getHealth = async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ ok: true });
  } catch (error) {
    console.error('Health check de base de datos falló:', error.message);
    res.status(503).json({ ok: false, error: 'Base de datos no disponible' });
  }
};