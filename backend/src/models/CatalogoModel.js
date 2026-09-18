import pool from '../db.js';

export const findActiveCategories = async () => {
  const [rows] = await pool.query(
    `SELECT id AS id_categoria, nombre_categoria AS nombre
     FROM categoria
     WHERE estado = 'Activo'
     ORDER BY nombre_categoria`
  );

  return rows;
};