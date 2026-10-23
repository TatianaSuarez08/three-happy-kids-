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
    p.metodo_pago AS pago,
    e.fecha_entrega AS fechaEntrega,
    pf.estado_preparacion AS estadoPreparacion,
    pf.estado_entrega AS estadoEntrega,
    pf.evidencia_path AS evidencia,
    pf.evidencia_fecha AS fechaEvidencia
  FROM factura f
  JOIN cliente c ON c.id = f.id_cliente
  JOIN usuario u ON u.id = c.id_usuario
  LEFT JOIN entrega e ON e.id_factura = f.id
  LEFT JOIN pago p ON p.id_factura = f.id
  LEFT JOIN pedido_flujo pf ON pf.id_factura = f.id
`;

const cargarDetalles = async (orders) => {
  if (orders.length === 0) return orders;

  const ids = orders.map((order) => order.id);
  const placeholders = ids.map(() => '?').join(', ');
  const [[details], [history]] = await Promise.all([
    pool.execute(
    `SELECT
       dp.id_factura,
         dp.id_producto AS idProducto,
         dp.cantidad,
         dp.precio_unitario AS precio,
         dp.subtotal,
         pr.nombre_producto AS nombre,
         t.nombre_talla AS talla,
         c.nombre_color AS color
       FROM detalle_pedido dp
       JOIN producto pr ON pr.id = dp.id_producto
       JOIN talla t ON t.id = pr.id_talla
       JOIN color c ON c.id = pr.id_color
     WHERE dp.id_factura IN (${placeholders})
     ORDER BY dp.id_factura DESC, pr.nombre_producto`,
    ids
    ),
    pool.execute(
      `SELECT h.id, h.id_factura AS idPedido, h.evento, h.observacion,
              h.creado_en AS fecha,
              COALESCE(NULLIF(CONCAT_WS(' ', e.nombre, e.apellido), ''), u.nombre_usuario) AS usuario,
              COALESCE((
                SELECT GROUP_CONCAT(r.nombre_rol ORDER BY r.nombre_rol SEPARATOR ', ')
                FROM usuario_rol ur
                JOIN rol r ON r.id = ur.id_rol
                WHERE ur.id_usuario = u.id
              ), 'Sin rol') AS rol
       FROM pedido_historial h
       JOIN usuario u ON u.id = h.id_usuario
       LEFT JOIN empleado e ON e.id_usuario = u.id
       WHERE h.id_factura IN (${placeholders})
       ORDER BY h.creado_en, h.id`,
      ids
    )
  ]);

  const detailsByOrder = new Map();
  details.forEach((detail) => {
    const current = detailsByOrder.get(detail.id_factura) || [];
    current.push(detail);
    detailsByOrder.set(detail.id_factura, current);
  });

  const historyByOrder = new Map();
  history.forEach((event) => {
    const current = historyByOrder.get(event.idPedido) || [];
    current.push(event);
    historyByOrder.set(event.idPedido, current);
  });

  return orders.map((order) => ({
    ...order,
    cliente: `${order.primer_nombre} ${order.primer_apellido}`.trim(),
    productos: detailsByOrder.get(order.id) || [],
    historial: historyByOrder.get(order.id) || []
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
    const consolidatedItems = new Map();
    for (const item of productos) {
      const productId = item?.id;
      const quantity = item?.cantidad;
      if (!Number.isSafeInteger(productId) || productId <= 0
        || !Number.isSafeInteger(quantity) || quantity <= 0) {
        const error = new Error('Los productos o cantidades del pedido no son válidos');
        error.code = 'INVALID_ORDER_ITEMS';
        throw error;
      }
      const consolidatedQuantity = (consolidatedItems.get(productId) || 0) + quantity;
      if (!Number.isSafeInteger(consolidatedQuantity)) {
        const error = new Error('La cantidad solicitada no es válida');
        error.code = 'INVALID_ORDER_ITEMS';
        throw error;
      }
      consolidatedItems.set(productId, consolidatedQuantity);
    }

    const [carts] = await connection.execute(
      `SELECT c.id
       FROM carrito c
       WHERE c.id_cliente = ? AND c.estado = 'Activo'
       ORDER BY c.id DESC
       LIMIT 1 FOR UPDATE`,
      [clientId]
    );
    if (carts[0]) {
      const [cartItems] = await connection.execute(
        `SELECT id_producto AS id, cantidad
         FROM detalle_carrito
         WHERE id_carrito = ?
         FOR UPDATE`,
        [carts[0].id]
      );
      if (cartItems.length > 0) {
        const expectedItems = new Map(cartItems.map((item) => [Number(item.id), Number(item.cantidad)]));
        const sameCart = expectedItems.size === consolidatedItems.size
          && [...expectedItems].every(([id, quantity]) => consolidatedItems.get(id) === quantity);
        if (!sameCart) {
          const error = new Error('El carrito cambió. Actualízalo antes de confirmar el pedido.');
          error.code = 'CART_CHANGED';
          throw error;
        }
      }
    }

    const normalizedPayment = {
      efectivo: 'Efectivo',
      transferencia: 'Transferencia',
      nequi: 'Nequi',
      daviplata: 'Daviplata'
    }[pago];
    const detailRows = [];
    let total = 0;

    for (const [productId, quantity] of consolidatedItems) {
      const [rows] = await connection.execute(
        `SELECT p.id, p.precio_venta AS precio, i.cantidad_disponible AS stock
         FROM producto p
         JOIN inventario i ON i.id_producto = p.id
         WHERE p.id = ? AND p.estado = 'Activo' FOR UPDATE`,
        [productId]
      );
      const product = rows[0];
      if (!product || product.stock < quantity) {
        const error = new Error(`Stock insuficiente para el producto ${productId}`);
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
    await connection.execute(
      `INSERT INTO pedido_flujo (id_factura) VALUES (?)`,
      [invoice.insertId]
    );
    await connection.execute(
      `INSERT INTO pedido_historial (id_factura, id_usuario, evento, observacion)
       VALUES (?, ?, 'Pedido recibido', 'Pendiente de preparación')`,
      [invoice.insertId, userId]
    );
    if (carts[0]) {
      await connection.execute(
        `UPDATE carrito SET estado = 'Finalizado'
         WHERE id = ? AND estado = 'Activo'`,
        [carts[0].id]
      );
    }
    await connection.commit();
    return invoice.insertId;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export const updateOrderStatus = async (id, status, userId) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();
    const [orders] = await connection.execute(
      'SELECT id, estado FROM factura WHERE id = ? FOR UPDATE',
      [id]
    );
    if (orders.length === 0) {
      await connection.rollback();
      return false;
    }
    const [flows] = await connection.execute(
      'SELECT estado_entrega FROM pedido_flujo WHERE id_factura = ? FOR UPDATE',
      [id]
    );
    const [deliveries] = await connection.execute(
      'SELECT estado FROM entrega WHERE id_factura = ? FOR UPDATE',
      [id]
    );
    const currentDeliveryStatus = flows[0]?.estado_entrega || deliveries[0]?.estado || 'Pendiente';
    if (status !== 'Cancelado' || currentDeliveryStatus === 'Entregado'
      || currentDeliveryStatus === 'En camino' || orders[0].estado === 'Anulada') {
      const error = new Error('El pedido no puede cambiarse a ese estado desde Administración');
      error.code = 'ORDER_STATUS_CONFLICT';
      throw error;
    }

    await connection.execute(
      `UPDATE entrega SET estado = 'Cancelado' WHERE id_factura = ?`,
      [id]
    );
    await connection.execute(`UPDATE factura SET estado = 'Anulada' WHERE id = ?`, [id]);
    await connection.execute(
      `UPDATE pedido_flujo SET estado_entrega = 'Cancelado' WHERE id_factura = ?`,
      [id]
    );
    await connection.execute(
      `INSERT INTO pedido_historial (id_factura, id_usuario, evento)
       VALUES (?, ?, 'Pedido cancelado por Administración')`,
      [id, userId]
    );

    await connection.commit();
    return true;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};
