import pool from '../db.js';

const pedidosBaseQuery = `
  SELECT
    f.id,
    DATE_FORMAT(f.fecha, '%Y-%m-%d') AS fecha,
    f.total,
    f.estado AS estadoFactura,
    COALESCE(e.estado, CASE f.estado
      WHEN 'Anulada' THEN 'Cancelado'
      WHEN 'Pagada' THEN 'Pendiente'
      ELSE 'Pendiente'
    END) AS estado,
    c.primer_nombre,
    c.primer_apellido,
    u.correo,
    c.telefono,
    c.direccion,
    c.ciudad,
    p.metodo_pago AS pago
  FROM factura f
  JOIN cliente c ON c.id = f.id_cliente
  JOIN usuario u ON u.id = c.id_usuario
  LEFT JOIN entrega e ON e.id_factura = f.id
  LEFT JOIN pago p ON p.id_factura = f.id
`;

const cargarDetalles = async (orders) => {
  if (orders.length === 0) return orders;

  const ids = orders.map((order) => order.id);
  const placeholders = ids.map(() => '?').join(', ');
  const [details] = await pool.execute(
    `SELECT
       dp.id_factura,
       dp.cantidad,
       dp.precio_unitario AS precio,
       dp.subtotal,
       pr.nombre_producto AS nombre
     FROM detalle_pedido dp
     JOIN producto pr ON pr.id = dp.id_producto
     WHERE dp.id_factura IN (${placeholders})
     ORDER BY dp.id_factura DESC, pr.nombre_producto`,
    ids
  );

  const detailsByOrder = new Map();
  details.forEach((detail) => {
    const current = detailsByOrder.get(detail.id_factura) || [];
    current.push(detail);
    detailsByOrder.set(detail.id_factura, current);
  });

  return orders.map((order) => ({
    ...order,
    cliente: `${order.primer_nombre} ${order.primer_apellido}`.trim(),
    productos: detailsByOrder.get(order.id) || []
  }));
};

export const findOrders = async () => {
  const [orders] = await pool.query(`${pedidosBaseQuery} ORDER BY f.id DESC`);
  return cargarDetalles(orders);
};

export const findOrdersByUser = async (userId) => {
  const [orders] = await pool.execute(
    `${pedidosBaseQuery} WHERE c.id_usuario = ? ORDER BY f.id DESC`,
    [userId]
  );
  return cargarDetalles(orders);
};

export const findOrdersByEmail = async (email) => {
  const [orders] = await pool.execute(
    `${pedidosBaseQuery} WHERE u.correo = ? ORDER BY f.id DESC`,
    [email]
  );
  return cargarDetalles(orders);
};

export const createOrder = async ({ userId, userEmail, direccion, ciudad, telefono, pago, productos }) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();
    const [clients] = userId
      ? await connection.execute('SELECT id FROM cliente WHERE id_usuario = ?', [userId])
      : await connection.execute(
        `SELECT c.id
         FROM cliente c
         JOIN usuario u ON u.id = c.id_usuario
         WHERE u.correo = ?`,
        [userEmail]
      );
    if (clients.length === 0) {
      const error = new Error('El usuario no tiene un perfil de cliente');
      error.code = 'CLIENT_NOT_FOUND';
      throw error;
    }

    const clientId = clients[0].id;
    const normalizedPayment = {
      efectivo: 'Efectivo',
      transferencia: 'Transferencia',
      nequi: 'Nequi',
      daviplata: 'Daviplata',
      tarjeta: 'Tarjeta'
    }[pago] || pago;
    const detailRows = [];
    let total = 0;

    for (const item of productos) {
      const [rows] = await connection.execute(
        `SELECT p.id, p.precio_venta AS precio, i.cantidad_disponible AS stock
         FROM producto p
         JOIN inventario i ON i.id_producto = p.id
         WHERE p.id = ? AND p.estado = 'Activo' FOR UPDATE`,
        [item.id]
      );
      const product = rows[0];
      const quantity = Number.parseInt(item.cantidad, 10);
      if (!product || !Number.isInteger(quantity) || quantity <= 0 || product.stock < quantity) {
        const error = new Error(`Stock insuficiente para el producto ${item.id}`);
        error.code = 'INSUFFICIENT_STOCK';
        throw error;
      }

      const subtotal = Number(product.precio) * quantity;
      total += subtotal;
      detailRows.push({ ...product, quantity, subtotal });
    }

    await connection.execute(
      'UPDATE cliente SET direccion = ?, ciudad = ?, telefono = ? WHERE id = ?',
      [direccion, ciudad, telefono, clientId]
    );
    const [invoice] = await connection.execute(
      `INSERT INTO factura (total, estado, id_cliente)
       VALUES (?, 'Pendiente', ?)`,
      [total, clientId]
    );

    for (const detail of detailRows) {
      await connection.execute(
        `INSERT INTO detalle_pedido (id_factura, id_producto, cantidad, precio_unitario, subtotal)
         VALUES (?, ?, ?, ?, ?)`,
        [invoice.insertId, detail.id, detail.quantity, detail.precio, detail.subtotal]
      );
      await connection.execute(
        'UPDATE inventario SET cantidad_disponible = cantidad_disponible - ?, fecha_actualizacion = CURRENT_DATE WHERE id_producto = ?',
        [detail.quantity, detail.id]
      );
    }

    await connection.execute(
      `INSERT INTO pago (metodo_pago, total, id_factura) VALUES (?, ?, ?)`,
      [normalizedPayment, total, invoice.insertId]
    );
    await connection.execute(
      `INSERT INTO entrega (estado, id_factura) VALUES ('Pendiente', ?)`,
      [invoice.insertId]
    );
    await connection.commit();
    return invoice.insertId;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export const updateOrderStatus = async (id, status) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();
    const [orders] = await connection.execute('SELECT id FROM factura WHERE id = ?', [id]);
    if (orders.length === 0) return false;

    await connection.execute(
      `INSERT INTO entrega (estado, id_factura)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE estado = VALUES(estado)`,
      [status, id]
    );

    if (status === 'Cancelado') {
      await connection.execute(`UPDATE factura SET estado = 'Anulada' WHERE id = ?`, [id]);
    }

    await connection.commit();
    return true;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};
