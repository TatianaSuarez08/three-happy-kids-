import pool from '../db.js';
import { validatePreparationChecklist } from '../services/preparacionPedidoService.js';
import { validateCourierTransition } from '../services/pedidoWorkflowService.js';

const workflowError = (code, message) => Object.assign(new Error(message), { code });

const ensureWorkflowRows = async (connection) => {
  await connection.execute(`
    INSERT IGNORE INTO pedido_flujo (id_factura, estado_preparacion, estado_entrega)
    SELECT
      f.id,
      CASE WHEN e.estado IN ('Por recoger', 'Entregado', 'En camino') THEN 'Listo para despacho' ELSE 'Pendiente' END,
      CASE
        WHEN e.estado IN ('Pendiente', 'En camino', 'Entregado', 'Cancelado', 'Entrega fallida') THEN e.estado
        ELSE 'Pendiente'
      END
    FROM factura f
    LEFT JOIN entrega e ON e.id_factura = f.id
  `);
};

const orderQuery = `
  SELECT
    f.id,
    DATE_FORMAT(f.fecha, '%Y-%m-%d') AS fecha,
    f.total,
    f.estado AS estadoFactura,
    CONCAT(c.primer_nombre, ' ', c.primer_apellido) AS cliente,
    u.correo,
    c.telefono,
    c.direccion,
    c.ciudad,
    pf.estado_preparacion AS estadoPreparacion,
    pf.id_bodeguero AS idBodeguero,
    pf.fecha_asignacion_bodega AS fechaAsignacionBodega,
    pf.fecha_preparacion AS fechaPreparacion,
    pf.id_mensajero AS idMensajero,
    pf.fecha_asignacion_mensajero AS fechaAsignacionMensajero,
    pf.estado_entrega AS estadoEntrega,
    pf.evidencia_path AS evidencia,
    pf.evidencia_fecha AS fechaEvidencia
  FROM factura f
  JOIN cliente c ON c.id = f.id_cliente
  JOIN usuario u ON u.id = c.id_usuario
  JOIN pedido_flujo pf ON pf.id_factura = f.id
  LEFT JOIN entrega e ON e.id_factura = f.id
`;

const attachOrderDetails = async (connection, orders) => {
  if (!orders.length) return orders;

  const ids = orders.map(({ id }) => id);
  const placeholders = ids.map(() => '?').join(', ');
  const [products] = await connection.execute(
    `SELECT
       dp.id_factura AS idPedido,
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
  );
  const [history] = await connection.execute(
    `SELECT h.id, h.id_factura AS idPedido, h.evento, h.observacion, h.creado_en AS fecha,
            u.nombre_usuario AS usuario
     FROM pedido_historial h
     JOIN usuario u ON u.id = h.id_usuario
     WHERE h.id_factura IN (${placeholders})
     ORDER BY h.creado_en, h.id`,
    ids
  );
  const [preparationRows] = await connection.execute(
    `SELECT id_factura AS idPedido, id_producto AS idProducto, encontrado,
            observacion, cantidad_preparada AS cantidadPreparada
     FROM pedido_preparacion_detalle
     WHERE id_factura IN (${placeholders})`,
    ids
  );
  const [novelties] = await connection.execute(
    `SELECT n.id, n.id_factura AS idPedido, n.id_producto AS idProducto,
            n.etapa, n.tipo, n.descripcion, n.estado, n.decision,
            n.creada_en AS fecha, reporta.nombre_usuario AS reportadoPor
     FROM pedido_novedad n
     JOIN usuario reporta ON reporta.id = n.id_reporta
     WHERE n.id_factura IN (${placeholders})
     ORDER BY n.creada_en, n.id`,
    ids
  );

  const productsByOrder = new Map();
  const historyByOrder = new Map();
  const preparationByOrder = new Map();
  const noveltiesByOrder = new Map();
  products.forEach((product) => {
    const list = productsByOrder.get(product.idPedido) || [];
    list.push(product);
    productsByOrder.set(product.idPedido, list);
  });
  history.forEach((entry) => {
    const list = historyByOrder.get(entry.idPedido) || [];
    list.push(entry);
    historyByOrder.set(entry.idPedido, list);
  });
  preparationRows.forEach((entry) => {
    const list = preparationByOrder.get(entry.idPedido) || [];
    list.push(entry);
    preparationByOrder.set(entry.idPedido, list);
  });
  novelties.forEach((entry) => {
    const list = noveltiesByOrder.get(entry.idPedido) || [];
    list.push(entry);
    noveltiesByOrder.set(entry.idPedido, list);
  });

  return orders.map((order) => ({
    ...order,
    productos: productsByOrder.get(order.id) || [],
    historial: historyByOrder.get(order.id) || [],
    preparacion: preparationByOrder.get(order.id) || [],
    novedades: noveltiesByOrder.get(order.id) || []
  }));
};

const queryOrders = async (where, values = []) => {
  const connection = await pool.getConnection();
  try {
    await ensureWorkflowRows(connection);
    const [orders] = await connection.execute(
      `${orderQuery} ${where} ORDER BY f.fecha DESC, f.id DESC`,
      values
    );
    return await attachOrderDetails(connection, orders);
  } finally {
    connection.release();
  }
};

export const getAvailableWarehouseOrders = () => queryOrders(
  `WHERE f.estado IN ('Pendiente', 'Pagada')
   AND pf.estado_preparacion = 'Pendiente'
   AND pf.id_bodeguero IS NULL
   AND COALESCE(e.estado, 'Pendiente') <> 'Cancelado'`
);

export const getWarehouseOrders = (userId) => queryOrders(
  `WHERE pf.id_bodeguero = ?
   AND pf.estado_preparacion <> 'Listo para despacho'
   AND COALESCE(e.estado, 'Pendiente') <> 'Cancelado'`,
  [userId]
);

export const getAvailableCourierOrders = () => queryOrders(
  `WHERE pf.estado_preparacion = 'Listo para despacho'
   AND pf.estado_entrega = 'Pendiente'
   AND pf.id_mensajero IS NULL
   AND COALESCE(e.estado, 'Pendiente') <> 'Cancelado'
   AND NOT EXISTS (
     SELECT 1 FROM pedido_novedad n
     WHERE n.id_factura = f.id AND n.etapa = 'Bodega' AND n.estado = 'Pendiente'
   )`
);

export const getCourierOrders = (userId) => queryOrders(
  'WHERE pf.id_mensajero = ?',
  [userId]
);

const insertHistory = async (connection, invoiceId, userId, event, observation = '') => {
  await connection.execute(
    'INSERT INTO pedido_historial (id_factura, id_usuario, evento, observacion) VALUES (?, ?, ?, ?)',
    [invoiceId, userId, event, observation]
  );
};

export const assignWarehouseOrder = async (invoiceId, userId) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await ensureWorkflowRows(connection);
    const [result] = await connection.execute(
      `UPDATE pedido_flujo pf
       JOIN factura f ON f.id = pf.id_factura
       LEFT JOIN entrega e ON e.id_factura = f.id
       SET pf.id_bodeguero = ?, pf.fecha_asignacion_bodega = NOW(),
           pf.estado_preparacion = 'Asignado'
       WHERE pf.id_factura = ? AND pf.id_bodeguero IS NULL
         AND pf.estado_preparacion = 'Pendiente'
         AND f.estado IN ('Pendiente', 'Pagada')
         AND COALESCE(e.estado, 'Pendiente') <> 'Cancelado'`,
      [userId, invoiceId]
    );
    if (result.affectedRows !== 1) {
      const [orders] = await connection.execute(
        'SELECT id FROM factura WHERE id = ?',
        [invoiceId]
      );
      throw workflowError(
        orders.length ? 'ORDER_NOT_AVAILABLE' : 'ORDER_NOT_FOUND',
        orders.length ? 'El pedido ya no está disponible para asignación' : 'El pedido no existe'
      );
    }
    await insertHistory(connection, invoiceId, userId, 'Asignado a Bodega');
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export const savePreparation = async (invoiceId, userId, checklist) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await ensureWorkflowRows(connection);
    const [flows] = await connection.execute(
      `SELECT estado_preparacion FROM pedido_flujo
       WHERE id_factura = ? AND id_bodeguero = ? FOR UPDATE`,
      [invoiceId, userId]
    );
    if (!flows.length) throw workflowError('ORDER_NOT_ASSIGNED', 'El pedido no está asignado a tu usuario');
    if (!['Asignado', 'En preparación', 'Novedad'].includes(flows[0].estado_preparacion)) {
      throw workflowError('INVALID_ORDER_STATE', 'El pedido no admite cambios de preparación');
    }

    const [requested] = await connection.execute(
      `SELECT dp.id_producto AS idProducto, dp.cantidad, pr.nombre_producto AS nombre
       FROM detalle_pedido dp
       JOIN producto pr ON pr.id = dp.id_producto
       WHERE dp.id_factura = ?
       ORDER BY dp.id_producto FOR UPDATE`,
      [invoiceId]
    );
    const preparation = validatePreparationChecklist(requested, checklist);

    await connection.execute(
      `UPDATE pedido_flujo
       SET estado_preparacion = 'En preparación'
       WHERE id_factura = ?`,
      [invoiceId]
    );
    await insertHistory(connection, invoiceId, userId, 'Preparación actualizada');

    for (const line of preparation.lines) {
      await connection.execute(
        `INSERT INTO pedido_preparacion_detalle
           (id_factura, id_producto, encontrado, cantidad_preparada, observacion, id_bodeguero)
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE encontrado = VALUES(encontrado),
           cantidad_preparada = VALUES(cantidad_preparada),
           observacion = VALUES(observacion), id_bodeguero = VALUES(id_bodeguero)`,
        [invoiceId, line.productId, line.found, line.preparedQuantity, line.observation, userId]
      );
      if (!line.found) {
        const [existing] = await connection.execute(
          `SELECT id FROM pedido_novedad
           WHERE id_factura = ? AND id_producto = ? AND etapa = 'Bodega' AND estado = 'Pendiente'
           LIMIT 1`,
          [invoiceId, line.productId]
        );
        if (!existing.length) {
          await connection.execute(
            `INSERT INTO pedido_novedad
               (id_factura, id_producto, etapa, tipo, descripcion, id_reporta)
             VALUES (?, ?, 'Bodega', ?, ?, ?)`,
            [invoiceId, line.productId, line.issueType, line.observation, userId]
          );
        }
      }
    }

    if (!preparation.complete) {
      await connection.execute(
        `UPDATE pedido_flujo SET estado_preparacion = 'Novedad' WHERE id_factura = ?`,
        [invoiceId]
      );
      await insertHistory(connection, invoiceId, userId, 'Novedad de preparación registrada');
      await connection.commit();
      return { estadoPreparacion: 'Novedad' };
    }

    const [pending] = await connection.execute(
      `SELECT id FROM pedido_novedad
       WHERE id_factura = ? AND etapa = 'Bodega' AND estado = 'Pendiente'
       LIMIT 1`,
      [invoiceId]
    );
    if (pending.length) {
      throw workflowError('OPEN_NOVELTIES', 'Administración debe resolver las novedades antes del despacho');
    }

    await connection.execute(
      `UPDATE pedido_flujo
       SET estado_preparacion = 'Listo para despacho', fecha_preparacion = NOW()
       WHERE id_factura = ?`,
      [invoiceId]
    );
    await insertHistory(connection, invoiceId, userId, 'Listo para despacho');
    await connection.commit();
    return { estadoPreparacion: 'Listo para despacho' };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export const assignCourierOrder = async (invoiceId, userId) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await ensureWorkflowRows(connection);
    const [result] = await connection.execute(
      `UPDATE pedido_flujo pf
       JOIN factura f ON f.id = pf.id_factura
       LEFT JOIN entrega e ON e.id_factura = f.id
       SET pf.id_mensajero = ?, pf.fecha_asignacion_mensajero = NOW(),
           pf.estado_entrega = 'Asignado'
       WHERE pf.id_factura = ? AND pf.id_mensajero IS NULL
         AND pf.estado_preparacion = 'Listo para despacho'
         AND pf.estado_entrega = 'Pendiente'
         AND COALESCE(e.estado, 'Pendiente') <> 'Cancelado'
         AND NOT EXISTS (
           SELECT 1 FROM pedido_novedad n
           WHERE n.id_factura = f.id AND n.etapa = 'Bodega' AND n.estado = 'Pendiente'
         )`,
      [userId, invoiceId]
    );
    if (result.affectedRows !== 1) {
      const [orders] = await connection.execute('SELECT id FROM factura WHERE id = ?', [invoiceId]);
      throw workflowError(
        orders.length ? 'ORDER_NOT_AVAILABLE' : 'ORDER_NOT_FOUND',
        orders.length ? 'El pedido ya no está disponible para mensajería' : 'El pedido no existe'
      );
    }
    await insertHistory(connection, invoiceId, userId, 'Asignado a Mensajería');
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export const updateCourierOrderStatus = async (invoiceId, userId, status, observation = '') => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [flows] = await connection.execute(
      `SELECT estado_entrega, evidencia_path FROM pedido_flujo
       WHERE id_factura = ? AND id_mensajero = ? FOR UPDATE`,
      [invoiceId, userId]
    );
    if (!flows.length) throw workflowError('ORDER_NOT_ASSIGNED', 'El pedido no está asignado a tu usuario');
    const current = flows[0].estado_entrega;
    validateCourierTransition({
      currentStatus: current,
      nextStatus: status,
      hasEvidence: Boolean(flows[0].evidencia_path),
      observation
    });

    await connection.execute(
      `UPDATE pedido_flujo SET estado_entrega = ? WHERE id_factura = ?`,
      [status, invoiceId]
    );
    const deliveryStatus = status === 'Entrega fallida' ? 'Entrega fallida' : status;
    await connection.execute(
      `UPDATE entrega SET estado = ?, fecha_entrega = CASE WHEN ? = 'Entregado' THEN CURRENT_DATE ELSE fecha_entrega END
       WHERE id_factura = ?`,
      [deliveryStatus, status, invoiceId]
    );
    if (status === 'Entrega fallida') {
      await connection.execute(
        `INSERT INTO pedido_novedad
           (id_factura, etapa, tipo, descripcion, id_reporta)
         VALUES (?, 'Mensajería', 'Entrega fallida', ?, ?)`,
        [invoiceId, observation.trim(), userId]
      );
    }
    await insertHistory(connection, invoiceId, userId, status, observation.trim());
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export const saveDeliveryEvidence = async (invoiceId, userId, relativePath) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [flows] = await connection.execute(
      `SELECT estado_entrega, evidencia_path
       FROM pedido_flujo WHERE id_factura = ? AND id_mensajero = ? FOR UPDATE`,
      [invoiceId, userId]
    );
    if (!flows.length) throw workflowError('ORDER_NOT_ASSIGNED', 'El pedido no está asignado a tu usuario');
    if (flows[0].estado_entrega === 'Entregado') {
      throw workflowError('INVALID_ORDER_STATE', 'La evidencia no se puede cambiar después de finalizar la entrega');
    }
    if (flows[0].evidencia_path) {
      throw workflowError('EVIDENCE_ALREADY_SAVED', 'Este pedido ya tiene una evidencia guardada');
    }
    await connection.execute(
      `UPDATE pedido_flujo
       SET evidencia_path = ?, evidencia_fecha = NOW(), evidencia_usuario = ?
       WHERE id_factura = ?`,
      [relativePath, userId, invoiceId]
    );
    await insertHistory(connection, invoiceId, userId, 'Evidencia de entrega guardada');
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export const getDeliveryEvidence = async (invoiceId, userId, isAdmin) => {
  const [rows] = await pool.execute(
    `SELECT pf.evidencia_path AS evidencia
     FROM pedido_flujo pf
     WHERE pf.id_factura = ?
       AND pf.evidencia_path IS NOT NULL
       AND (? = 1 OR pf.id_mensajero = ?)`,
    [invoiceId, isAdmin ? 1 : 0, userId]
  );
  if (!rows.length) throw workflowError('EVIDENCE_NOT_FOUND', 'No hay evidencia disponible para este pedido');
  return rows[0].evidencia;
};

export const getOrderNovelties = async () => {
  const [rows] = await pool.execute(
    `SELECT n.id, n.id_factura AS idPedido, n.id_producto AS idProducto,
            pr.nombre_producto AS producto, n.etapa, n.tipo, n.descripcion,
            n.estado, n.decision, n.creada_en AS fecha,
            reporta.nombre_usuario AS reportadoPor,
            resuelve.nombre_usuario AS resueltoPor,
            CONCAT(c.primer_nombre, ' ', c.primer_apellido) AS cliente
     FROM pedido_novedad n
     JOIN factura f ON f.id = n.id_factura
     JOIN cliente c ON c.id = f.id_cliente
     LEFT JOIN producto pr ON pr.id = n.id_producto
     JOIN usuario reporta ON reporta.id = n.id_reporta
     LEFT JOIN usuario resuelve ON resuelve.id = n.id_resuelve
     ORDER BY (n.estado = 'Pendiente') DESC, n.creada_en DESC`
  );
  return rows;
};

export const resolveOrderNovelty = async (noveltyId, adminId, decision) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [result] = await connection.execute(
      `UPDATE pedido_novedad
       SET estado = 'Resuelta', decision = ?, id_resuelve = ?, resuelta_en = NOW()
       WHERE id = ? AND estado = 'Pendiente'`,
      [decision, adminId, noveltyId]
    );
    if (result.affectedRows !== 1) {
      const [rows] = await connection.execute('SELECT id FROM pedido_novedad WHERE id = ?', [noveltyId]);
      throw workflowError(
        rows.length ? 'NOVELTY_ALREADY_RESOLVED' : 'NOVELTY_NOT_FOUND',
        rows.length ? 'La novedad ya fue atendida' : 'La novedad no existe'
      );
    }
    const [rows] = await connection.execute(
      'SELECT id_factura FROM pedido_novedad WHERE id = ?',
      [noveltyId]
    );
    await insertHistory(connection, rows[0].id_factura, adminId, 'Novedad resuelta', decision);
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};
