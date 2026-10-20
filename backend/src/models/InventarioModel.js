import pool from '../db.js';

export const findInventoryByProductId = async (productId) => {
  const [rows] = await pool.execute(
    `SELECT id, cantidad_disponible AS stock, cantidad_minima AS stockMinimo, fecha_actualizacion
     FROM inventario
     WHERE id_producto = ?`,
    [productId]
  );

  return rows[0] || null;
};

export const findInventoryMovementsByProductId = async (productId) => {
  const [rows] = await pool.execute(
    `SELECT
       m.id,
       m.id_producto,
       m.tipo,
       m.cantidad,
       m.delta,
       m.motivo,
       m.referencia,
       m.fecha_movimiento,
       COALESCE(u.nombre_usuario, 'Sistema') AS usuario
     FROM inventario_movimiento m
     LEFT JOIN usuario u ON u.id = m.id_usuario
     WHERE m.id_producto = ?
     ORDER BY m.fecha_movimiento DESC, m.id DESC`,
    [productId]
  );

  return rows;
};

export const adjustInventory = async ({ productId, tipo, cantidad, delta, motivo, referencia, usuarioId }) => {
  const normalizedTipo = String(tipo || 'ajuste').trim().toLowerCase();
  const numericCantidad = Number(cantidad);
  const numericDelta = Number(delta);

  if (!Number.isInteger(productId) || productId <= 0) {
    const error = new Error('El producto no es válido');
    error.code = 'INVALID_PRODUCT';
    throw error;
  }

  if (!['entrada', 'salida', 'ajuste'].includes(normalizedTipo)) {
    const error = new Error('El tipo de movimiento no es válido');
    error.code = 'INVALID_MOVEMENT_TYPE';
    throw error;
  }

  const finalDelta = Number.isFinite(numericDelta) ? numericDelta : normalizedTipo === 'salida' ? -Math.abs(Number(numericCantidad || 0)) : Math.abs(Number(numericCantidad || 0));

  if (!Number.isFinite(finalDelta)) {
    const error = new Error('El valor del movimiento no es válido');
    error.code = 'INVALID_DELTA';
    throw error;
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [productRows] = await connection.execute(
      'SELECT id FROM producto WHERE id = ?',
      [productId]
    );

    if (productRows.length === 0) {
      const error = new Error('Producto no encontrado');
      error.code = 'PRODUCT_NOT_FOUND';
      throw error;
    }

    const [inventoryRows] = await connection.execute(
      'SELECT cantidad_disponible FROM inventario WHERE id_producto = ?',
      [productId]
    );

    const currentStock = inventoryRows[0]?.cantidad_disponible ?? 0;
    const nextStock = currentStock + finalDelta;

    if (nextStock < 0) {
      const error = new Error('No hay suficiente stock para esta salida');
      error.code = 'INSUFFICIENT_STOCK';
      throw error;
    }

    await connection.execute(
      `INSERT INTO inventario (id_producto, cantidad_disponible, cantidad_minima, fecha_actualizacion)
       VALUES (?, ?, 0, CURRENT_DATE)
       ON DUPLICATE KEY UPDATE
         cantidad_disponible = VALUES(cantidad_disponible),
         fecha_actualizacion = CURRENT_DATE`,
      [productId, nextStock]
    );

    const movementQuantity = Math.abs(finalDelta);
    const [movementResult] = await connection.execute(
      `INSERT INTO inventario_movimiento
        (id_producto, tipo, cantidad, delta, motivo, referencia, id_usuario, fecha_movimiento)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        productId,
        normalizedTipo,
        movementQuantity,
        finalDelta,
        motivo || 'Ajuste de inventario',
        referencia || null,
        usuarioId || null
      ]
    );

    await connection.commit();

    return {
      id: movementResult.insertId,
      productId,
      tipo: normalizedTipo,
      cantidad: movementQuantity,
      delta: finalDelta,
      stockActual: nextStock,
      motivo: motivo || 'Ajuste de inventario',
      referencia: referencia || null
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};
