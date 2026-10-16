import pool from '../db.js';
import { persistEvidenceImage, removeEvidenceImage } from '../services/evidenciaEntregaService.js';
import {
  getWarehouseOrderState,
  validatePreparationChecklist,
  validatePreparation,
  validatePreparationDecision
} from '../services/preparacionPedidoService.js';

export const allowedDeliveryTransitions = Object.freeze({
  Pendiente: Object.freeze(['Cancelado']),
  'Por recoger': Object.freeze(['En camino']),
  'En camino': Object.freeze(['Entregado']),
  Entregado: Object.freeze([]),
  Cancelado: Object.freeze([])
});

const pedidosBaseQuery = `
  SELECT
    f.id,
    DATE_FORMAT(f.fecha, '%Y-%m-%d') AS fecha,
    f.total,
    f.estado AS estadoFactura,
    e.id AS idEntrega,
    e.estado AS estadoEntrega,
    a.fecha_asignacion AS fechaAsignacion,
    CASE
      WHEN f.estado = 'Anulada' OR e.estado = 'Cancelado' THEN 'Cancelado'
      WHEN e.estado = 'Pendiente' AND latestOperation.operacion = 'PreparacionIniciada' THEN 'En preparación'
      WHEN e.estado = 'Pendiente' AND latestOperation.operacion = 'AlistamientoIncompleto' THEN 'Incidencia'
      ELSE COALESCE(e.estado, 'Pendiente')
    END AS estado,
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
  LEFT JOIN asignacion_entrega a ON a.id_entrega = e.id AND a.estado = 'Activa'
  LEFT JOIN pedido_historial_operacion latestOperation
    ON latestOperation.id = (
      SELECT MAX(latest.id)
      FROM pedido_historial_operacion latest
      WHERE latest.id_entrega = e.id
    )
  LEFT JOIN pago p ON p.id_factura = f.id
`;

export const sanitizeCourierOrder = (order) => {
  const { correo, telefono, pago, incidencia, ...delivery } = order;
  return delivery;
};

const stripCourierPersonalData = (orders) => orders.map(sanitizeCourierOrder);

const cargarDetalles = async (orders) => {
  if (orders.length === 0) return orders;

  const ids = orders.map((order) => order.id);
  const placeholders = ids.map(() => '?').join(', ');
  const [details] = await pool.execute(
    `SELECT
       dp.id_factura,
       dp.id_producto AS idProducto,
       dp.cantidad,
       dp.precio_unitario AS precio,
       dp.subtotal,
       pr.nombre_producto AS nombre,
       t.nombre_talla AS talla,
       c.nombre_color AS color,
       COALESCE(i.cantidad_disponible, 0) AS existenciasDisponibles
     FROM detalle_pedido dp
     JOIN producto pr ON pr.id = dp.id_producto
     LEFT JOIN talla t ON t.id = pr.id_talla
     LEFT JOIN color c ON c.id = pr.id_color
     LEFT JOIN inventario i ON i.id_producto = pr.id
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
  const latestEvents = await getLatestOrderOperations(orders.map(({ idEntrega }) => idEntrega));
  const ordersWithIncidents = orders.map((order) => {
    const latestEvent = latestEvents.get(Number(order.idEntrega));
    return {
      ...order,
      incidencia: latestEvent?.operacion === 'AlistamientoIncompleto'
        ? latestEvent.observaciones
        : null
    };
  });
  return cargarDetalles(ordersWithIncidents);
};

const findOrdersByDeliveryStatus = async (deliveryStatus, requireCompletedPreparation = false) => {
  const deliveryStatuses = Array.isArray(deliveryStatus) ? deliveryStatus : [deliveryStatus];
  const statusPlaceholders = deliveryStatuses.map(() => '?').join(', ');
  const preparationClause = requireCompletedPreparation
    ? `AND EXISTS (
         SELECT 1
         FROM alistamiento_pedido ap
         WHERE ap.id_entrega = e.id AND ap.resultado = 'Completo'
       )`
    : '';
  const [orders] = await pool.execute(
    `${pedidosBaseQuery}
     WHERE f.estado IN ('Pendiente', 'Pagada')
       AND e.estado IN (${statusPlaceholders})
       ${preparationClause}
     ORDER BY f.fecha ASC, f.id ASC`,
    deliveryStatuses
  );
  return cargarDetalles(orders);
};

const getLatestOrderOperations = async (deliveryIds) => {
  if (deliveryIds.length === 0) return new Map();
  const placeholders = deliveryIds.map(() => '?').join(', ');
  const [events] = await pool.execute(
    `SELECT
       h.idEntrega,
       h.operacion,
       h.estadoAnterior,
       h.estadoNuevo,
       h.observaciones,
       h.fechaHora,
       u.nombre_usuario AS responsable
     FROM (
       SELECT
         h.id AS id,
         h.id_entrega AS idEntrega,
         h.operacion,
         h.estado_anterior AS estadoAnterior,
         h.estado_nuevo AS estadoNuevo,
         h.observaciones,
         h.fecha_hora AS fechaHora,
         h.id_usuario AS idUsuario
       FROM pedido_historial_operacion h
       JOIN (
         SELECT id_entrega, MAX(id) AS id
         FROM pedido_historial_operacion
         WHERE id_entrega IN (${placeholders})
         GROUP BY id_entrega
       ) latest ON latest.id = h.id
     ) h
     JOIN usuario u ON u.id = h.idUsuario`,
    deliveryIds
  );
  return new Map(events.map((event) => [Number(event.idEntrega), event]));
};

export const findOrdersForPreparation = async (userId) => {
  const orders = await findOrdersByDeliveryStatus('Pendiente');
  if (orders.length === 0) return orders;
  const latestEvents = await getLatestOrderOperations(orders.map(({ idEntrega }) => idEntrega));
  const deliveryIds = orders.map(({ idEntrega }) => idEntrega);
  const placeholders = deliveryIds.map(() => '?').join(', ');
  const [claims] = await pool.execute(
    `SELECT ap.idEntrega, ap.id AS idAsignacionPreparacion,
            ap.idBodeguero, u.nombre_usuario AS bodeguero,
            ap.fechaAsignacion
     FROM (
       SELECT id, id_entrega AS idEntrega, id_bodeguero AS idBodeguero,
              fecha_asignacion AS fechaAsignacion
       FROM asignacion_preparacion
       WHERE estado = 'Activa' AND id_entrega IN (${placeholders})
     ) ap
     JOIN usuario u ON u.id = ap.idBodeguero`,
    deliveryIds
  );
  const [openIssues] = await pool.execute(
    `SELECT nb.id_entrega AS idEntrega,
            GROUP_CONCAT(
              CONCAT(p.nombre_producto, ' (', nb.tipo, '): ', nb.descripcion)
              ORDER BY nb.id SEPARATOR '; '
            ) AS incidencia
     FROM novedad_bodega nb
     JOIN producto p ON p.id = nb.id_producto
     WHERE nb.id_entrega IN (${placeholders}) AND nb.estado <> 'Resuelto'
     GROUP BY nb.id_entrega`,
    deliveryIds
  );
  const claimsByDelivery = new Map(claims.map((claim) => [Number(claim.idEntrega), claim]));
  const issuesByDelivery = new Map(openIssues.map((issue) => [Number(issue.idEntrega), issue]));
  return orders.map((order) => {
    const latestEvent = latestEvents.get(Number(order.idEntrega));
    const claim = claimsByDelivery.get(Number(order.idEntrega));
    const issue = issuesByDelivery.get(Number(order.idEntrega));
    return {
      ...order,
      ...latestEvent,
      ...claim,
      seleccionadoPorMi: Boolean(claim) && Number(claim.idBodeguero) === Number(userId),
      estadoBodega: issue || latestEvent?.operacion === 'AlistamientoIncompleto'
        ? 'Incidencia'
        : claim
          ? latestEvent?.operacion === 'PreparacionIniciada'
            ? 'En preparación'
            : 'Seleccionado por Bodega'
          : getWarehouseOrderState({
            deliveryStatus: order.estadoEntrega,
            latestOperation: latestEvent?.operacion
          }),
      incidencia: issue?.incidencia || (latestEvent?.operacion === 'AlistamientoIncompleto'
        ? latestEvent.observaciones
        : null)
    };
  });
};

export const findPreparedOrders = async () => {
  const orders = await findOrdersByDeliveryStatus(['Por recoger', 'En camino', 'Entregado'], true);
  if (orders.length === 0) return orders;

  const deliveryIds = orders.map(({ idEntrega }) => idEntrega);
  const placeholders = deliveryIds.map(() => '?').join(', ');
  const [preparations] = await pool.execute(
    `SELECT
       ap.id_entrega AS idEntrega,
       ap.fecha_hora AS fechaPreparacion,
       ap.observaciones AS observacionesPreparacion,
       preparer.nombre_usuario AS responsablePreparacion,
       COUNT(da.id_producto) AS lineasPreparadas,
       SUM(da.cantidad_solicitada) AS cantidadSolicitada,
       SUM(da.cantidad_preparada) AS cantidadPreparada,
       GROUP_CONCAT(DISTINCT NULLIF(da.observaciones, '') SEPARATOR '; ') AS observacionesLineas,
       courier.nombre_usuario AS mensajeroAsignado,
       assignment.fecha_asignacion AS fechaAsignacion,
       assignment.id AS idAsignacion,
       assignment.id_mensajero AS idMensajero,
       assignment.estado AS estadoAsignacion
     FROM alistamiento_pedido ap
     JOIN usuario preparer ON preparer.id = ap.id_usuario
     JOIN detalle_alistamiento_pedido da ON da.id_alistamiento = ap.id
     LEFT JOIN asignacion_entrega assignment
       ON assignment.id_entrega = ap.id_entrega
       AND assignment.id = (
         SELECT MAX(previous.id)
         FROM asignacion_entrega previous
         WHERE previous.id_entrega = ap.id_entrega
           AND previous.estado IN ('Activa', 'Finalizada')
       )
     LEFT JOIN usuario courier ON courier.id = assignment.id_mensajero
     WHERE ap.id IN (
       SELECT MAX(latest.id)
       FROM alistamiento_pedido latest
       WHERE latest.resultado = 'Completo'
         AND latest.id_entrega IN (${placeholders})
       GROUP BY latest.id_entrega
     )
     GROUP BY
       ap.id, ap.id_entrega, ap.fecha_hora, ap.observaciones,
       preparer.nombre_usuario, courier.nombre_usuario, assignment.fecha_asignacion,
       assignment.id, assignment.id_mensajero, assignment.estado`,
    deliveryIds
  );
  const preparationByDelivery = new Map(
    preparations.map((preparation) => [Number(preparation.idEntrega), preparation])
  );
  const latestEvents = await getLatestOrderOperations(deliveryIds);

  return orders.flatMap((order) => {
    const preparation = preparationByDelivery.get(Number(order.idEntrega));
    if (!preparation) return [];
    const latestEvent = latestEvents.get(Number(order.idEntrega));
    const assigned = preparation.estadoAsignacion === 'Activa';
    return [{
      ...order,
      ...preparation,
      ...latestEvent,
      estadoBodega: getWarehouseOrderState({
        deliveryStatus: order.estadoEntrega,
        assigned
      }),
      estadoEnvio: getWarehouseOrderState({
        deliveryStatus: order.estadoEntrega,
        assigned
      }),
      resumenAlistamiento: `${preparation.lineasPreparadas} producto(s), ${preparation.cantidadPreparada}/${preparation.cantidadSolicitada} unidad(es) preparadas`,
      observacionesPreparacion: [
        preparation.observacionesPreparacion,
        preparation.observacionesLineas
      ].filter(Boolean).join(' · ') || null
    }];
  });
};

export const findOrderOperationHistory = async (orderId) => {
  const [events] = await pool.execute(
    `SELECT
       h.id,
       h.operacion,
       h.estado_anterior AS estadoAnterior,
       h.estado_nuevo AS estadoNuevo,
       h.observaciones,
       h.fecha_hora AS fechaHora,
       h.id_usuario AS idUsuario,
       u.nombre_usuario AS responsable
     FROM pedido_historial_operacion h
     JOIN entrega e ON e.id = h.id_entrega
     JOIN factura f ON f.id = e.id_factura
     JOIN usuario u ON u.id = h.id_usuario
     WHERE f.id = ?
     ORDER BY h.fecha_hora, h.id`,
    [orderId]
  );
  return events;
};

export const findPreparationIssues = async ({ userId = null } = {}) => {
  const filters = userId === null ? '' : 'WHERE nb.id_bodeguero = ?';
  const values = userId === null ? [] : [userId];
  const [issues] = await pool.execute(
    `SELECT nb.id, nb.idEntrega, nb.idProducto, nb.idBodeguero,
            nb.tipo, nb.descripcion, nb.estado, nb.respuestaAdministracion,
            nb.fechaReporte, nb.fechaRespuesta,
            f.id AS idPedido, DATE_FORMAT(f.fecha, '%Y-%m-%d') AS fechaPedido,
            CONCAT(c.primer_nombre, ' ', c.primer_apellido) AS cliente,
            p.nombre_producto AS producto,
            reporter.nombre_usuario AS bodeguero,
            nb.idAdministradorRespuesta,
            administrator.nombre_usuario AS administrador
     FROM (
       SELECT id, id_entrega AS idEntrega, id_producto AS idProducto,
              id_bodeguero AS idBodeguero, tipo, descripcion, estado,
              respuesta_administracion AS respuestaAdministracion,
              fecha_reporte AS fechaReporte, fecha_respuesta AS fechaRespuesta,
              id_administrador_respuesta AS idAdministradorRespuesta
       FROM novedad_bodega
     ) nb
     JOIN entrega e ON e.id = nb.idEntrega
     JOIN factura f ON f.id = e.id_factura
     JOIN cliente c ON c.id = f.id_cliente
     JOIN producto p ON p.id = nb.idProducto
     JOIN usuario reporter ON reporter.id = nb.idBodeguero
     LEFT JOIN usuario administrator ON administrator.id = nb.idAdministradorRespuesta
     ${filters}
     ORDER BY FIELD(nb.estado, 'Pendiente', 'En revisión', 'Rechazado', 'Resuelto'),
              nb.fechaReporte DESC, nb.id DESC`,
    values
  );
  return issues;
};

export const findPreparationIssuesForOrder = async ({ orderId, userId }) => {
  const [issues] = await pool.execute(
    `SELECT nb.id, nb.idProducto, nb.tipo, nb.descripcion, nb.estado,
            nb.respuestaAdministracion AS respuestaAdministracion,
            nb.fechaReporte, nb.fechaRespuesta,
            p.nombre_producto AS producto,
            administrator.nombre_usuario AS administrador
     FROM novedad_bodega nb
     JOIN entrega e ON e.id = nb.id_entrega
     JOIN factura f ON f.id = e.id_factura
     JOIN producto p ON p.id = nb.id_producto
     LEFT JOIN usuario administrator ON administrator.id = nb.id_administrador_respuesta
     JOIN asignacion_preparacion ap ON ap.id_entrega = e.id
     WHERE f.id = ? AND ap.id_bodeguero = ?
     ORDER BY nb.fecha_reporte DESC, nb.id DESC`,
    [orderId, userId]
  );
  return issues;
};

export const updatePreparationIssue = async ({ issueId, administratorId, status, response }) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [rows] = await connection.execute(
      `SELECT nb.id, nb.id_entrega AS idEntrega, nb.estado,
              f.id AS idPedido
       FROM novedad_bodega nb
       JOIN entrega e ON e.id = nb.id_entrega
       JOIN factura f ON f.id = e.id_factura
       WHERE nb.id = ?
       FOR UPDATE`,
      [issueId]
    );
    const issue = rows[0];
    if (!issue) {
      await connection.rollback();
      return false;
    }
    if (issue.estado === 'Resuelto') {
      const error = new Error('Una novedad resuelta no se puede volver a abrir');
      error.code = 'PREPARATION_ISSUE_CLOSED';
      throw error;
    }

    await connection.execute(
      `UPDATE novedad_bodega
       SET estado = ?, respuesta_administracion = ?, id_administrador_respuesta = ?,
           fecha_respuesta = CURRENT_TIMESTAMP(6)
       WHERE id = ?`,
      [status, response, administratorId, issueId]
    );
    await insertOrderOperation(connection, {
      deliveryId: issue.idEntrega,
      userId: administratorId,
      operation: 'NovedadBodegaActualizada',
      previousStatus: issue.estado,
      nextStatus: status,
      observations: response
    });
    await connection.commit();
    return true;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
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

export const findOrdersByCourier = async (userId) => {
  return findCourierDeliveries(userId);
};

export const findAvailableDeliveries = async () => {
  const [orders] = await pool.query(
    `${pedidosBaseQuery}
     WHERE f.estado IN ('Pendiente', 'Pagada')
       AND e.estado = 'Por recoger'
       AND EXISTS (
         SELECT 1 FROM alistamiento_pedido ap
         WHERE ap.id_entrega = e.id AND ap.resultado = 'Completo'
       )
       AND NOT EXISTS (
         SELECT 1 FROM asignacion_entrega a
         WHERE a.id_entrega = e.id AND a.estado = 'Activa'
       )
     ORDER BY f.fecha ASC, f.id ASC`
  );
  return stripCourierPersonalData(await cargarDetalles(orders));
};

export const findCourierDeliveries = async (userId) => {
  const [orders] = await pool.execute(
    `SELECT
       f.id,
       DATE_FORMAT(f.fecha, '%Y-%m-%d') AS fecha,
       f.total,
       f.estado AS estadoFactura,
       e.id AS idEntrega,
       e.estado AS estadoEntrega,
       a.fecha_asignacion AS fechaAsignacion,
       e.estado AS estado,
       c.primer_nombre,
       c.primer_apellido,
       c.direccion,
       c.ciudad
     FROM factura f
     JOIN cliente c ON c.id = f.id_cliente
     JOIN entrega e ON e.id_factura = f.id
     JOIN asignacion_entrega a
       ON a.id_entrega = e.id AND a.id_mensajero = ? AND a.estado IN ('Activa', 'Finalizada')
     WHERE f.estado <> 'Anulada'
     ORDER BY a.fecha_asignacion DESC`,
    [userId]
  );
  return cargarDetalles(orders);
};

export const findAssignmentHistory = async (orderId, userId, isAdministrator) => {
  const [orders] = await pool.execute(
    `${pedidosBaseQuery} WHERE f.id = ?`,
    [orderId]
  );
  if (orders.length === 0) return null;

  const [assignments] = await pool.execute(
    `SELECT
       ah.id,
       ah.id_mensajero AS idMensajero,
       courier.nombre_usuario AS mensajero,
       ah.fecha_asignacion AS fechaAsignacion,
       ah.fecha_finalizacion AS fechaFinalizacion,
       ah.estado,
       ah.motivo_reasignacion AS motivoReasignacion,
       ah.id_usuario_reasignacion AS idUsuarioReasignacion,
       actor.nombre_usuario AS usuarioReasignacion
     FROM asignacion_entrega ah
     JOIN usuario courier ON courier.id = ah.id_mensajero
     LEFT JOIN usuario actor ON actor.id = ah.id_usuario_reasignacion
     WHERE ah.id_entrega = ?
     ORDER BY ah.fecha_asignacion, ah.id`,
    [orders[0].idEntrega]
  );

  if (!isAdministrator && !assignments.some((assignment) => Number(assignment.idMensajero) === Number(userId))) {
    const error = new Error('No tienes permiso para consultar el historial de este pedido');
    error.code = 'ASSIGNMENT_HISTORY_FORBIDDEN';
    throw error;
  }

  const [order] = await cargarDetalles(orders);
  if (isAdministrator) return { order, assignments };

  return { order: sanitizeCourierOrder(order), assignments };
};

const canViewOrderEvidence = async (executor, orderId, userId, roles) => {
  if (roles.includes('administrador')) return true;

  const [access] = await executor.execute(
    `SELECT
       EXISTS(
         SELECT 1
         FROM cliente c
         JOIN factura f ON f.id_cliente = c.id
         JOIN entrega e ON e.id_factura = f.id
         WHERE f.id = ? AND c.id_usuario = ?
       ) AS esClientePropietario,
       EXISTS(
         SELECT 1
         FROM asignacion_entrega a
         JOIN entrega e ON e.id = a.id_entrega
         JOIN factura f ON f.id = e.id_factura
         WHERE f.id = ? AND a.id_mensajero = ?
       ) AS esMensajeroRelacionado`,
    [orderId, userId, orderId, userId]
  );
  return Boolean(
    (roles.includes('cliente') && access[0]?.esClientePropietario)
    || (roles.includes('mensajero') && access[0]?.esMensajeroRelacionado)
  );
};

export const findDeliveryEvidence = async (orderId, userId, roles = []) => {
  const [orders] = await pool.execute(
    'SELECT id FROM factura WHERE id = ?',
    [orderId]
  );
  if (orders.length === 0) return null;
  if (!await canViewOrderEvidence(pool, orderId, userId, roles)) {
    const error = new Error('No tienes permiso para consultar las evidencias de este pedido');
    error.code = 'DELIVERY_EVIDENCE_FORBIDDEN';
    throw error;
  }

  const [evidence] = await pool.execute(
    `SELECT
       ee.id,
       ee.tipo_mime AS mimeType,
       ee.tamano_bytes AS size,
       ee.fecha_confirmacion AS confirmedAt
     FROM evidencia_entrega ee
     JOIN entrega e ON e.id = ee.id_entrega
     JOIN factura f ON f.id = e.id_factura
     WHERE f.id = ?
     ORDER BY ee.fecha_confirmacion DESC, ee.id DESC`,
    [orderId]
  );
  return evidence.map(({ id, ...record }) => ({
    id,
    ...record,
    imageUrl: `/evidencias/${id}/archivo`
  }));
};

export const findDeliveryEvidenceImage = async (evidenceId, userId, roles = []) => {
  const [evidence] = await pool.execute(
    `SELECT
       ee.id,
       ee.ruta_archivo AS relativePath,
       ee.tipo_mime AS mimeType,
       f.id AS orderId
     FROM evidencia_entrega ee
     JOIN entrega e ON e.id = ee.id_entrega
     JOIN factura f ON f.id = e.id_factura
     WHERE ee.id = ?`,
    [evidenceId]
  );
  if (evidence.length === 0) return null;
  if (!await canViewOrderEvidence(pool, evidence[0].orderId, userId, roles)) {
    const error = new Error('No tienes permiso para consultar esta evidencia');
    error.code = 'DELIVERY_EVIDENCE_FORBIDDEN';
    throw error;
  }
  return evidence[0];
};

export const confirmDeliveryWithEvidence = async ({ orderId, courierId, buffer }) => {
  const connection = await pool.getConnection();
  let savedImage = null;
  let commitStarted = false;

  try {
    await connection.beginTransaction();
    const order = await getLockedDelivery(connection, orderId);
    if (!order) {
      await connection.rollback();
      return false;
    }
    if (order.estadoFactura === 'Anulada' || order.estadoEntrega !== 'En camino') {
      const error = new Error('Solo se puede confirmar un pedido que esté En camino');
      error.code = 'ORDER_INVALID_TRANSITION';
      throw error;
    }

    const assignment = await getActiveAssignment(connection, order.idEntrega);
    if (!assignment || Number(assignment.idMensajero) !== Number(courierId)) {
      const error = new Error('El pedido no está asignado a tu usuario');
      error.code = 'ORDER_ASSIGNMENT_FORBIDDEN';
      throw error;
    }

    savedImage = await persistEvidenceImage(buffer, {
      directory: process.env.DELIVERY_IMAGES_DIR
    });
    await connection.execute(
      `INSERT INTO evidencia_entrega
        (id_entrega, id_asignacion, id_mensajero, ruta_archivo, tipo_mime, tamano_bytes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        order.idEntrega,
        assignment.id,
        courierId,
        savedImage.relativePath,
        savedImage.mimeType,
        savedImage.size
      ]
    );
    await connection.execute(
      `UPDATE entrega SET estado = 'Entregado', fecha_entrega = CURRENT_DATE WHERE id = ?`,
      [order.idEntrega]
    );
    await connection.execute(
      `UPDATE asignacion_entrega
       SET estado = 'Finalizada', fecha_finalizacion = CURRENT_TIMESTAMP(6)
       WHERE id = ? AND estado = 'Activa'`,
      [assignment.id]
    );
    await insertOrderOperation(connection, {
      deliveryId: order.idEntrega,
      userId: courierId,
      operation: 'EntregaConfirmada',
      previousStatus: 'En camino',
      nextStatus: 'Entregado'
    });

    commitStarted = true;
    await connection.commit();
    return true;
  } catch (error) {
    try {
      await connection.rollback();
    } catch (rollbackError) {
      console.error('No se pudo revertir la transacción de evidencia:', rollbackError);
    }
    if (savedImage && !commitStarted) {
      try {
        await removeEvidenceImage(savedImage.filename, {
          directory: process.env.DELIVERY_IMAGES_DIR
        });
      } catch (cleanupError) {
        console.error('No se pudo retirar el archivo de una confirmación fallida:', cleanupError);
      }
    }
    throw error;
  } finally {
    connection.release();
  }
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
      await connection.execute(
        `INSERT INTO inventario_movimiento
          (id_producto, tipo, cantidad, delta, motivo, referencia, id_usuario, fecha_movimiento)
         VALUES (?, 'salida', ?, ?, 'Venta de pedido', ?, ?, NOW())`,
        [detail.id, detail.quantity, -detail.quantity, `Pedido #${invoice.insertId}`, userId || null]
      );
    }

    await connection.execute(
      `INSERT INTO pago (metodo_pago, total, id_factura) VALUES (?, ?, ?)`,
      [normalizedPayment, total, invoice.insertId]
    );
    const [delivery] = await connection.execute(
      `INSERT INTO entrega (estado, id_factura) VALUES ('Pendiente', ?)`,
      [invoice.insertId]
    );
    await insertOrderOperation(connection, {
      deliveryId: delivery.insertId,
      userId,
      operation: 'PedidoCreado',
      previousStatus: null,
      nextStatus: 'Pendiente'
    });
    await connection.commit();
    return invoice.insertId;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const getLockedDelivery = async (connection, orderId) => {
  const [rows] = await connection.execute(
    `SELECT f.id, f.estado AS estadoFactura, e.id AS idEntrega, e.estado AS estadoEntrega
     FROM factura f
     JOIN entrega e ON e.id_factura = f.id
     WHERE f.id = ?
     FOR UPDATE`,
    [orderId]
  );
  return rows[0] || null;
};

const getActivePreparationAssignment = async (connection, deliveryId) => {
  const [rows] = await connection.execute(
    `SELECT id, id_bodeguero AS idBodeguero
     FROM asignacion_preparacion
     WHERE id_entrega = ? AND estado = 'Activa'
     FOR UPDATE`,
    [deliveryId]
  );
  return rows[0] || null;
};

const insertOrderOperation = async (
  connection,
  { deliveryId, userId, operation, previousStatus, nextStatus, observations = null }
) => {
  await connection.execute(
    `INSERT INTO pedido_historial_operacion
      (id_entrega, operacion, estado_anterior, estado_nuevo, id_usuario, observaciones)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [deliveryId, operation, previousStatus, nextStatus, userId, observations]
  );
};

const getActiveAssignment = async (connection, deliveryId) => {
  const [rows] = await connection.execute(
    `SELECT id, id_mensajero AS idMensajero
     FROM asignacion_entrega
     WHERE id_entrega = ? AND estado = 'Activa'
     FOR UPDATE`,
    [deliveryId]
  );
  return rows[0] || null;
};

const hasCompletedPreparation = async (connection, deliveryId) => {
  const [rows] = await connection.execute(
    `SELECT id
     FROM alistamiento_pedido
     WHERE id_entrega = ? AND resultado = 'Completo'
     LIMIT 1
     FOR UPDATE`,
    [deliveryId]
  );
  return rows.length > 0;
};

const throwOrderUnavailable = (message = 'El pedido no está disponible para despacho') => {
  const error = new Error(message);
  error.code = 'ORDER_NOT_DISPATCHABLE';
  return error;
};

export const findPreparationHistory = async (orderId) => {
  const [history] = await pool.execute(
    `SELECT
       ap.id,
       ap.resultado,
       ap.observaciones,
       ap.fecha_hora AS fechaHora,
       ap.id_usuario AS idUsuario,
       u.nombre_usuario AS usuario
     FROM alistamiento_pedido ap
     JOIN entrega e ON e.id = ap.id_entrega
     JOIN factura f ON f.id = e.id_factura
     JOIN usuario u ON u.id = ap.id_usuario
     WHERE f.id = ?
     ORDER BY ap.fecha_hora DESC, ap.id DESC`,
    [orderId]
  );
  if (history.length === 0) return history;

  const ids = history.map(({ id }) => id);
  const placeholders = ids.map(() => '?').join(', ');
  const [lines] = await pool.execute(
    `SELECT
       da.id_alistamiento AS idAlistamiento,
       da.id_producto AS idProducto,
       p.nombre_producto AS nombre,
       da.cantidad_solicitada AS cantidadSolicitada,
       da.cantidad_preparada AS cantidadPreparada,
       da.observaciones
     FROM detalle_alistamiento_pedido da
     JOIN producto p ON p.id = da.id_producto
     WHERE da.id_alistamiento IN (${placeholders})
     ORDER BY da.id_alistamiento DESC, p.nombre_producto`,
    ids
  );
  const linesByAttempt = new Map();
  lines.forEach((line) => {
    const attemptLines = linesByAttempt.get(line.idAlistamiento) || [];
    attemptLines.push(line);
    linesByAttempt.set(line.idAlistamiento, attemptLines);
  });

  return history.map((attempt) => ({
    ...attempt,
    productos: linesByAttempt.get(attempt.id) || []
  }));
};

export const startOrderPreparation = async ({ orderId, userId }) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();
    const order = await getLockedDelivery(connection, orderId);
    if (!order) {
      await connection.rollback();
      return false;
    }
    if (!['Pendiente', 'Pagada'].includes(order.estadoFactura) || order.estadoEntrega !== 'Pendiente') {
      throw throwOrderUnavailable('Solo se puede iniciar la preparación de un pedido pendiente y no anulado');
    }
    if (await getActiveAssignment(connection, order.idEntrega)) {
      throw throwOrderUnavailable('El pedido ya tiene una asignación activa');
    }
    const preparationAssignment = await getActivePreparationAssignment(connection, order.idEntrega);
    if (preparationAssignment && Number(preparationAssignment.idBodeguero) !== Number(userId)) {
      const error = new Error('Este pedido ya fue seleccionado por otro bodeguero');
      error.code = 'PREPARATION_ALREADY_CLAIMED';
      throw error;
    }
    if (!preparationAssignment) {
      await connection.execute(
        `INSERT INTO asignacion_preparacion (id_entrega, id_bodeguero)
         VALUES (?, ?)`,
        [order.idEntrega, userId]
      );
    }

    const [latestEvents] = await connection.execute(
      `SELECT operacion, estado_nuevo
       FROM pedido_historial_operacion
       WHERE id_entrega = ?
       ORDER BY id DESC
       LIMIT 1
       FOR UPDATE`,
      [order.idEntrega]
    );
    if (latestEvents[0]?.operacion === 'PreparacionIniciada') {
      await connection.commit();
      return { alreadyStarted: true };
    }

    await insertOrderOperation(connection, {
      deliveryId: order.idEntrega,
      userId,
      operation: 'PreparacionIniciada',
      previousStatus: latestEvents[0]?.estado_nuevo || 'Pendiente',
      nextStatus: 'En preparación'
    });
    await connection.commit();
    return { alreadyStarted: false };
  } catch (error) {
    await connection.rollback();
    if (error.code === 'ER_DUP_ENTRY') {
      const conflict = new Error('Otro bodeguero seleccionó este pedido primero');
      conflict.code = 'PREPARATION_ALREADY_CLAIMED';
      throw conflict;
    }
    throw error;
  } finally {
    connection.release();
  }
};

export const markOrderPrepared = async ({ orderId, userId, submittedLines, ready, observation }) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();
    const order = await getLockedDelivery(connection, orderId);
    if (!order) {
      await connection.rollback();
      return false;
    }
    if (!['Pendiente', 'Pagada'].includes(order.estadoFactura) || order.estadoEntrega !== 'Pendiente') {
      throw throwOrderUnavailable('Solo se puede preparar un pedido pendiente y no anulado');
    }

    const activeAssignment = await getActiveAssignment(connection, order.idEntrega);
    if (activeAssignment) throw throwOrderUnavailable('El pedido ya tiene una asignación activa');
    const preparationAssignment = await getActivePreparationAssignment(connection, order.idEntrega);
    if (!preparationAssignment || Number(preparationAssignment.idBodeguero) !== Number(userId)) {
      const error = new Error('Solo el bodeguero que seleccionó este pedido puede modificar su preparación');
      error.code = 'PREPARATION_ASSIGNMENT_FORBIDDEN';
      throw error;
    }
    const [latestEvents] = await connection.execute(
      `SELECT operacion, estado_nuevo
       FROM pedido_historial_operacion
       WHERE id_entrega = ?
       ORDER BY id DESC
       LIMIT 1
       FOR UPDATE`,
      [order.idEntrega]
    );
    if (latestEvents[0]?.operacion !== 'PreparacionIniciada') {
      throw throwOrderUnavailable('Inicia la preparación antes de registrar el alistamiento');
    }

    const [requestedLines] = await connection.execute(
      `SELECT
         dp.id_producto AS idProducto,
         dp.cantidad,
         pr.nombre_producto AS nombre,
         COALESCE(i.cantidad_disponible, 0) AS existenciasDisponibles
       FROM detalle_pedido dp
       JOIN producto pr ON pr.id = dp.id_producto
       LEFT JOIN inventario i ON i.id_producto = pr.id
       WHERE dp.id_factura = ?
       ORDER BY dp.id_producto
       FOR UPDATE`,
      [orderId]
    );
    const usesChecklist = Array.isArray(submittedLines)
      && submittedLines.every((line) => typeof line?.encontrado === 'boolean');
    const preparation = usesChecklist
      ? validatePreparationChecklist(requestedLines, submittedLines)
      : typeof ready === 'boolean'
        ? validatePreparationDecision(requestedLines, ready, observation)
        : validatePreparation(requestedLines, submittedLines, observation);

    if (preparation.complete) {
      const [openIssues] = await connection.execute(
        `SELECT id
         FROM novedad_bodega
         WHERE id_entrega = ? AND estado <> 'Resuelto'
         LIMIT 1
         FOR UPDATE`,
        [order.idEntrega]
      );
      if (openIssues.length) {
        throw throwOrderUnavailable('Administración debe resolver todas las novedades antes de liberar el pedido');
      }
    } else if (usesChecklist) {
      const productIds = preparation.missingLines.map((line) => line.productId);
      const placeholders = productIds.map(() => '?').join(', ');
      const [openIssues] = await connection.execute(
        `SELECT id
         FROM novedad_bodega
         WHERE id_entrega = ? AND id_producto IN (${placeholders}) AND estado <> 'Resuelto'
         LIMIT 1
         FOR UPDATE`,
        [order.idEntrega, ...productIds]
      );
      if (openIssues.length) {
        const error = new Error('Administración debe responder la novedad abierta antes de reportar de nuevo el mismo producto');
        error.code = 'PREPARATION_ISSUE_OPEN';
        throw error;
      }
    }

    const [attempt] = await connection.execute(
      `INSERT INTO alistamiento_pedido (id_entrega, id_usuario, resultado, observaciones)
       VALUES (?, ?, ?, ?)`,
      [
        order.idEntrega,
        userId,
        preparation.complete ? 'Completo' : 'Incompleto',
        preparation.observation || null
      ]
    );
    for (const line of preparation.lines) {
      await connection.execute(
        `INSERT INTO detalle_alistamiento_pedido
          (id_alistamiento, id_factura, id_producto, cantidad_solicitada, cantidad_preparada, observaciones)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          attempt.insertId,
          orderId,
          line.productId,
          line.requestedQuantity,
          line.preparedQuantity,
          line.observation || null
        ]
      );
      if (usesChecklist && !line.found) {
        await connection.execute(
          `INSERT INTO novedad_bodega
            (id_entrega, id_alistamiento, id_producto, id_bodeguero, tipo, descripcion)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            order.idEntrega,
            attempt.insertId,
            line.productId,
            userId,
            line.issueType,
            line.observation
          ]
        );
      }
    }

    if (preparation.complete) {
      await connection.execute(
        `UPDATE entrega SET estado = 'Por recoger' WHERE id = ?`,
        [order.idEntrega]
      );
      await connection.execute(
        `UPDATE asignacion_preparacion
         SET estado = 'Finalizada', fecha_finalizacion = CURRENT_TIMESTAMP(6)
         WHERE id_entrega = ? AND id_bodeguero = ? AND estado = 'Activa'`,
        [order.idEntrega, userId]
      );
      await insertOrderOperation(connection, {
        deliveryId: order.idEntrega,
        userId,
        operation: 'AlistamientoCompleto',
        previousStatus: 'En preparación',
        nextStatus: 'Alistamiento completo',
        observations: preparation.observation || null
      });
      await insertOrderOperation(connection, {
        deliveryId: order.idEntrega,
        userId,
        operation: 'PedidoLiberado',
        previousStatus: 'Alistamiento completo',
        nextStatus: 'Por recoger',
        observations: 'Liberado para asignación por Mensajería'
      });
    } else {
      const missingNotes = preparation.missingLines
        .map((line) => `${line.productName}: ${line.observation || preparation.observation}`)
        .join('; ');
      await insertOrderOperation(connection, {
        deliveryId: order.idEntrega,
        userId,
        operation: 'AlistamientoIncompleto',
        previousStatus: 'En preparación',
        nextStatus: 'Pendiente',
        observations: usesChecklist
          ? `Novedad(es) reportada(s) a Administración: ${preparation.missingLines.map((line) => `${line.productName} (${line.issueType}): ${line.observation}`).join('; ')}`
          : typeof ready === 'boolean'
            ? `Novedad reportada a Administración: ${preparation.observation}`
          : [preparation.observation, missingNotes].filter(Boolean).join(' · ')
      });
    }
    await connection.commit();
    return {
      id: attempt.insertId,
      complete: preparation.complete,
      missingLines: preparation.missingLines,
      observation: preparation.observation
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export const assignDeliveryToCourier = async (orderId, courierId) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();
    const order = await getLockedDelivery(connection, orderId);
    if (!order) {
      await connection.rollback();
      return false;
    }
    if (order.estadoFactura === 'Anulada' || order.estadoEntrega === 'Entregado' || order.estadoEntrega === 'Cancelado') {
      throw throwOrderUnavailable('El pedido está cancelado o ya fue entregado');
    }
    if (await getActiveAssignment(connection, order.idEntrega)) {
      const error = new Error('El pedido ya está asignado a un mensajero');
      error.code = 'ORDER_ALREADY_ASSIGNED';
      throw error;
    }
    if (order.estadoEntrega !== 'Por recoger') {
      throw throwOrderUnavailable('El pedido todavía no está preparado para despacho');
    }

    if (!await hasCompletedPreparation(connection, order.idEntrega)) {
      throw throwOrderUnavailable('Bodega aún no ha registrado un alistamiento completo para este pedido');
    }

    await connection.execute(
      `INSERT INTO asignacion_entrega (id_entrega, id_mensajero, estado)
       VALUES (?, ?, 'Activa')`,
      [order.idEntrega, courierId]
    );
    await insertOrderOperation(connection, {
      deliveryId: order.idEntrega,
      userId: courierId,
      operation: 'PedidoAsignado',
      previousStatus: 'Por recoger',
      nextStatus: 'Asignado a Mensajería'
    });
    await connection.commit();
    return true;
  } catch (error) {
    await connection.rollback();
    if (error.code === 'ER_DUP_ENTRY') {
      const conflict = new Error('El pedido ya está asignado a un mensajero');
      conflict.code = 'ORDER_ALREADY_ASSIGNED';
      throw conflict;
    }
    throw error;
  } finally {
    connection.release();
  }
};

export const reassignDelivery = async (orderId, courierId, actorId, reason) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();
    const order = await getLockedDelivery(connection, orderId);
    if (!order) {
      await connection.rollback();
      return false;
    }
    if (order.estadoFactura === 'Anulada' || order.estadoEntrega !== 'Por recoger') {
      throw throwOrderUnavailable('Solo se puede reasignar un pedido preparado que aún no está en camino');
    }
    if (!await hasCompletedPreparation(connection, order.idEntrega)) {
      throw throwOrderUnavailable('Bodega aún no ha registrado un alistamiento completo para este pedido');
    }

    const previousAssignment = await getActiveAssignment(connection, order.idEntrega);
    if (!previousAssignment) {
      throw throwOrderUnavailable('El pedido no tiene una asignación activa para reasignar');
    }
    if (previousAssignment.idMensajero === courierId) {
      const error = new Error('El pedido ya está asignado a ese mensajero');
      error.code = 'ORDER_ALREADY_ASSIGNED';
      throw error;
    }

    const [couriers] = await connection.execute(
      `SELECT u.id
       FROM usuario u
       JOIN usuario_rol ur ON ur.id_usuario = u.id
       JOIN rol r ON r.id = ur.id_rol
       WHERE u.id = ? AND u.activo = 1 AND LOWER(r.nombre_rol) = 'mensajero'
       FOR UPDATE`,
      [courierId]
    );
    if (couriers.length === 0) {
      const error = new Error('El usuario de destino no es un mensajero activo');
      error.code = 'INVALID_COURIER';
      throw error;
    }

    await connection.execute(
      `UPDATE asignacion_entrega
       SET estado = 'Reasignada',
           fecha_finalizacion = CURRENT_TIMESTAMP(6),
           motivo_reasignacion = ?,
           id_usuario_reasignacion = ?
       WHERE id = ? AND estado = 'Activa'`,
      [reason, actorId, previousAssignment.id]
    );
    await connection.execute(
      `INSERT INTO asignacion_entrega (id_entrega, id_mensajero, estado)
       VALUES (?, ?, 'Activa')`,
      [order.idEntrega, courierId]
    );
    await insertOrderOperation(connection, {
      deliveryId: order.idEntrega,
      userId: actorId,
      operation: 'PedidoReasignado',
      previousStatus: 'Asignado a Mensajería',
      nextStatus: 'Asignado a Mensajería',
      observations: reason
    });
    await connection.commit();
    return true;
  } catch (error) {
    await connection.rollback();
    if (error.code === 'ER_DUP_ENTRY') {
      const conflict = new Error('El pedido ya tiene una asignación activa');
      conflict.code = 'ORDER_ALREADY_ASSIGNED';
      throw conflict;
    }
    throw error;
  } finally {
    connection.release();
  }
};

export const updateOrderStatus = async (id, status, userId, roles = []) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();
    const order = await getLockedDelivery(connection, id);
    if (!order) {
      await connection.rollback();
      return false;
    }

    const currentDeliveryStatus = order.estadoEntrega || 'Pendiente';
    if (order.estadoFactura === 'Anulada' || currentDeliveryStatus === 'Cancelado') {
      const error = new Error('Un pedido cancelado no se puede reabrir ni volver a cancelar');
      error.code = 'ORDER_ALREADY_CANCELLED';
      throw error;
    }

    if (!allowedDeliveryTransitions[currentDeliveryStatus]?.includes(status)) {
      const error = new Error(`No se puede cambiar el estado de ${currentDeliveryStatus} a ${status}`);
      error.code = 'ORDER_INVALID_TRANSITION';
      throw error;
    }

    const activeAssignment = await getActiveAssignment(connection, order.idEntrega);
    const isAdministrator = roles.includes('administrador');
    if (status === 'En camino') {
      if (!activeAssignment) {
        throw throwOrderUnavailable('El pedido debe estar asignado antes de iniciar la entrega');
      }
      if (!isAdministrator && Number(activeAssignment.idMensajero) !== Number(userId)) {
        const error = new Error('El pedido está asignado a otro mensajero');
        error.code = 'ORDER_ASSIGNMENT_FORBIDDEN';
        throw error;
      }
    }

    if (status === 'Entregado') {
      if (!activeAssignment) {
        throw throwOrderUnavailable('El pedido debe tener una asignación activa antes de confirmar la entrega');
      }
      if (!isAdministrator && Number(activeAssignment.idMensajero) !== Number(userId)) {
        const error = new Error('El pedido está asignado a otro mensajero');
        error.code = 'ORDER_ASSIGNMENT_FORBIDDEN';
        throw error;
      }
      const error = new Error('Se requiere evidencia de entrega antes de confirmar el pedido');
      error.code = 'DELIVERY_EVIDENCE_REQUIRED';
      throw error;
    }

    if (status === 'Cancelado') {
      if (currentDeliveryStatus !== 'Pendiente') {
        const error = new Error('Solo se puede cancelar un pedido que aún está pendiente');
        error.code = 'ORDER_CANNOT_CANCEL';
        throw error;
      }

      const [details] = await connection.execute(
        'SELECT id_producto, cantidad FROM detalle_pedido WHERE id_factura = ?',
        [id]
      );
      for (const detail of details) {
        await connection.execute(
          `INSERT INTO inventario (cantidad_disponible, cantidad_minima, id_producto, fecha_actualizacion)
           VALUES (?, 0, ?, CURRENT_DATE)
           ON DUPLICATE KEY UPDATE
             cantidad_disponible = cantidad_disponible + VALUES(cantidad_disponible),
             fecha_actualizacion = CURRENT_DATE`,
          [detail.cantidad, detail.id_producto]
        );
        await connection.execute(
          `INSERT INTO inventario_movimiento
            (id_producto, tipo, cantidad, delta, motivo, referencia, id_usuario, fecha_movimiento)
           VALUES (?, 'entrada', ?, ?, 'Cancelación de pedido pendiente', ?, ?, NOW())`,
          [detail.id_producto, detail.cantidad, detail.cantidad, `Pedido #${id}`, userId || null]
        );
      }
    }

    await connection.execute(
      `UPDATE entrega SET estado = ? WHERE id = ?`,
      [status, order.idEntrega]
    );
    await insertOrderOperation(connection, {
      deliveryId: order.idEntrega,
      userId,
      operation: status === 'Cancelado' ? 'PedidoCancelado' : 'EstadoActualizado',
      previousStatus: currentDeliveryStatus,
      nextStatus: status
    });

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
