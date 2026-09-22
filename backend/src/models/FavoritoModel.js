import pool from '../db.js';

const favoritosQuery = `
  SELECT
    p.id,
    p.nombre_producto AS nombre,
    p.descripcion,
    p.precio_venta AS precioVenta,
    p.imagen_producto AS imagen,
    p.estado,
    f.creado_en AS favoritoCreadoEn
  FROM favorito f
  JOIN producto p ON p.id = f.id_producto
  WHERE f.id_usuario = ?`;

export const findFavoritesByUser = async (userId) => {
  const [rows] = await pool.execute(favoritosQuery, [userId]);
  return rows;
};

export const addFavorite = async (userId, productId) => {
  const [products] = await pool.execute(
    "SELECT id FROM producto WHERE id = ? AND estado = 'Activo'",
    [productId]
  );
  if (products.length === 0) return null;

  await pool.execute(
    'INSERT IGNORE INTO favorito (id_usuario, id_producto) VALUES (?, ?)',
    [userId, productId]
  );
  const [rows] = await pool.execute(
    `${favoritosQuery} AND f.id_producto = ? ORDER BY f.creado_en DESC, f.id DESC`,
    [userId, productId]
  );
  return rows[0] || null;
};

export const removeFavorite = async (userId, productId) => {
  const [result] = await pool.execute(
    'DELETE FROM favorito WHERE id_usuario = ? AND id_producto = ?',
    [userId, productId]
  );
  return result.affectedRows > 0;
};
