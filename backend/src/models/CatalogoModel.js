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

export const findActiveDocumentTypes = async () => {
  const [rows] = await pool.query(
    `SELECT id, sigla, nombre_documento
     FROM tipo_documento
     WHERE estado = 'Activo'
     ORDER BY nombre_documento`
  );

  return rows;
};