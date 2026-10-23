import pool from '../db.js';

const cartQuery = `
  SELECT
    p.id,
    p.nombre_producto AS nombre,
    p.descripcion,
    p.precio_venta AS precioVenta,
    p.imagen_producto AS imagen,
    p.id_talla AS idTalla,
    t.nombre_talla AS talla,
    p.id_color AS idColor,
    co.nombre_color AS color,
    dc.cantidad,
    dc.precio,
    dc.cantidad * p.precio_venta AS subtotal,
    COALESCE(i.cantidad_disponible, 0) AS stock
  FROM detalle_carrito dc
  JOIN carrito c ON c.id = dc.id_carrito
  JOIN cliente cl ON cl.id = c.id_cliente
  JOIN producto p ON p.id = dc.id_producto
  JOIN talla t ON t.id = p.id_talla
  JOIN color co ON co.id = p.id_color
  JOIN inventario i ON i.id_producto = p.id
  WHERE cl.id_usuario = ? AND c.estado = 'Activo'
  ORDER BY dc.id`;

const findClientId = async (connection, userId) => {
  const [clients] = await connection.execute(
    'SELECT id FROM cliente WHERE id_usuario = ?',
    [userId]
  );
  if (clients[0]) return clients[0].id;

  const [result] = await connection.execute(
    `INSERT INTO cliente
       (primer_nombre, primer_apellido, numero_documento, telefono, id_usuario, id_tipo_documento)
     SELECT
       SUBSTRING_INDEX(TRIM(u.nombre_usuario), ' ', 1),
       CASE
         WHEN INSTR(TRIM(u.nombre_usuario), ' ') > 0
         THEN SUBSTRING_INDEX(TRIM(u.nombre_usuario), ' ', -1)
         ELSE 'Sin apellido'
       END,
       900000000000 + u.id,
       u.telefono,
       u.id,
       td.id
     FROM usuario u
     CROSS JOIN (SELECT id FROM tipo_documento ORDER BY id LIMIT 1) td
     WHERE u.id = ?
       AND NOT EXISTS (SELECT 1 FROM cliente WHERE id_usuario = ?)`,
    [userId, userId]
  );

  if (result.affectedRows === 0) return null;

  const [createdClients] = await connection.execute(
    'SELECT id FROM cliente WHERE id_usuario = ?',
    [userId]
  );
  return createdClients[0]?.id || null;
};

const findActiveCartId = async (connection, userId, create = false) => {
  const clientId = await findClientId(connection, userId);
  if (!clientId) return null;

  const [carts] = await connection.execute(
    `SELECT id FROM carrito
     WHERE id_cliente = ? AND estado = 'Activo'
     ORDER BY id DESC LIMIT 1`,
    [clientId]
  );
  if (carts[0]) return carts[0].id;
  if (!create) return null;

  const [result] = await connection.execute(
    'INSERT INTO carrito (id_cliente) VALUES (?)',
    [clientId]
  );
  return result.insertId;
};

export const findCartByUser = async (userId) => {
  const [rows] = await pool.execute(cartQuery, [userId]);
  return rows;
};

export const addCartItem = async (userId, productId, quantity) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [products] = await connection.execute(
      `SELECT p.id, p.precio_venta AS precio,
              COALESCE(i.cantidad_disponible, 0) AS stock
       FROM producto p
       JOIN inventario i ON i.id_producto = p.id
       WHERE p.id = ? AND p.estado = 'Activo'
       FOR UPDATE`,
      [productId]
    );
    const product = products[0];
    if (!product) {
      await connection.rollback();
      return null;
    }
    if (product.stock < quantity) {
      const error = new Error(`Solo hay ${product.stock} unidades disponibles de este producto`);
      error.code = 'INSUFFICIENT_STOCK';
      throw error;
    }

    const cartId = await findActiveCartId(connection, userId, true);
    if (!cartId) {
      const error = new Error('El usuario no tiene un perfil de cliente');
      error.code = 'CLIENT_NOT_FOUND';
      throw error;
    }

    const [existingItems] = await connection.execute(
      `SELECT cantidad FROM detalle_carrito
       WHERE id_carrito = ? AND id_producto = ?
       FOR UPDATE`,
      [cartId, productId]
    );
    if ((Number(existingItems[0]?.cantidad) || 0) + quantity > product.stock) {
      const error = new Error(`Solo hay ${product.stock} unidades disponibles de este producto`);
      error.code = 'INSUFFICIENT_STOCK';
      throw error;
    }

    await connection.execute(
      `INSERT INTO detalle_carrito (cantidad, precio, subtotal, id_carrito, id_producto)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         cantidad = cantidad + VALUES(cantidad),
         precio = VALUES(precio),
         subtotal = subtotal + VALUES(subtotal)`,
      [quantity, product.precio, Number(product.precio) * quantity, cartId, productId]
    );
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
  return findCartByUser(userId);
};

export const updateCartItem = async (userId, productId, quantity) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [products] = await connection.execute(
      `SELECT p.precio_venta AS precio,
              COALESCE(i.cantidad_disponible, 0) AS stock
       FROM producto p
       LEFT JOIN inventario i ON i.id_producto = p.id
       WHERE p.id = ? AND p.estado = 'Activo'
       FOR UPDATE`,
      [productId]
    );
    if (!products[0]) {
      await connection.rollback();
      return null;
    }
    if (products[0].stock < quantity) {
      const error = new Error(`Solo hay ${products[0].stock} unidades disponibles de este producto`);
      error.code = 'INSUFFICIENT_STOCK';
      throw error;
    }

    const [result] = await connection.execute(
      `UPDATE detalle_carrito dc
       JOIN carrito c ON c.id = dc.id_carrito AND c.estado = 'Activo'
       JOIN cliente cl ON cl.id = c.id_cliente AND cl.id_usuario = ?
       SET dc.cantidad = ?, dc.precio = ?, dc.subtotal = ? * ?
       WHERE dc.id_producto = ?`,
      [userId, quantity, products[0].precio, quantity, products[0].precio, productId]
    );
    if (result.affectedRows === 0) {
      await connection.rollback();
      return null;
    }
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
  return findCartByUser(userId);
};

export const removeCartItem = async (userId, productId) => {
  await pool.execute(
    `DELETE dc FROM detalle_carrito dc
     JOIN carrito c ON c.id = dc.id_carrito AND c.estado = 'Activo'
     JOIN cliente cl ON cl.id = c.id_cliente AND cl.id_usuario = ?
     WHERE dc.id_producto = ?`,
    [userId, productId]
  );
  return findCartByUser(userId);
};

export const clearCart = async (userId) => {
  await pool.execute(
    `DELETE dc FROM detalle_carrito dc
     JOIN carrito c ON c.id = dc.id_carrito AND c.estado = 'Activo'
     JOIN cliente cl ON cl.id = c.id_cliente
     WHERE cl.id_usuario = ?`,
    [userId]
  );
  return [];
};
