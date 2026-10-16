import {
  assignDeliveryToCourier,
  confirmDeliveryWithEvidence,
  createOrder,
  findDeliveryEvidence,
  findDeliveryEvidenceImage,
  findAssignmentHistory,
  findAvailableDeliveries,
  findCourierDeliveries,
  findOrders,
  findOrdersByCourier,
  findOrdersByEmail,
  findOrdersByUser,
  findOrdersForPreparation,
  findPreparationIssues,
  findPreparationIssuesForOrder,
  findPreparedOrders,
  findOrderOperationHistory,
  findPreparationHistory,
  markOrderPrepared,
  reassignDelivery,
  startOrderPreparation,
  updatePreparationIssue,
  updateOrderStatus
} from '../models/PedidoModel.js';
import { deliveryImagesDirectory, getImageMetadata } from '../middleware/subidaImagen.js';

const allowedStatuses = ['Pendiente', 'En camino', 'Entregado', 'Cancelado'];

export const getOrders = async (req, res) => {
  try {
    const roles = (req.user.roles || []).map((role) => String(role).trim().toLowerCase());
    const orders = roles.includes('mensajero')
      ? await findOrdersByCourier(req.user.id)
      : await findOrders();
    res.json({ success: true, orders });
  } catch (error) {
    console.error('Error al consultar pedidos:', error);
    res.status(500).json({ error: 'No se pudieron consultar los pedidos' });
  }
};

const parseOrderId = (value) => {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
};

const sendModelError = (res, error) => {
  const conflictCodes = [
    'ORDER_NOT_DISPATCHABLE',
    'ORDER_ALREADY_ASSIGNED',
    'ORDER_INVALID_TRANSITION',
    'ORDER_CANNOT_CANCEL',
    'ORDER_ALREADY_CANCELLED',
    'DELIVERY_EVIDENCE_REQUIRED',
    'PREPARATION_ALREADY_CLAIMED',
    'PREPARATION_ISSUE_OPEN'
  ];
  if (conflictCodes.includes(error.code)) {
    return res.status(409).json({ error: error.message });
  }
  if (error.code === 'ASSIGNMENT_HISTORY_FORBIDDEN') {
    return res.status(403).json({ error: error.message });
  }
  if (error.code === 'DELIVERY_EVIDENCE_FORBIDDEN'
    || error.code === 'ORDER_ASSIGNMENT_FORBIDDEN'
    || error.code === 'PREPARATION_ASSIGNMENT_FORBIDDEN') {
    return res.status(403).json({ error: error.message });
  }
  if (error.code === 'INVALID_COURIER') {
    return res.status(400).json({ error: error.message });
  }
  if (error.code === 'PREPARATION_INVALID') {
    return res.status(400).json({ error: error.message });
  }
  console.error('Error al procesar la operación logística:', error);
  return res.status(500).json({ error: 'No se pudo completar la operación logística' });
};

export const getAvailableDeliveries = async (_req, res) => {
  try {
    const deliveries = await findAvailableDeliveries();
    res.json({ success: true, deliveries });
  } catch (error) {
    console.error('Error al consultar pedidos disponibles:', error);
    res.status(500).json({ error: 'No se pudieron consultar los pedidos disponibles' });
  }
};

export const getMyDeliveries = async (req, res) => {
  try {
    const deliveries = await findCourierDeliveries(req.user.id);
    res.json({ success: true, deliveries });
  } catch (error) {
    console.error('Error al consultar las entregas asignadas:', error);
    res.status(500).json({ error: 'No se pudieron consultar tus entregas' });
  }
};

export const prepareOrder = async (req, res) => {
  const id = parseOrderId(req.params.id);
  if (!id) return res.status(400).json({ error: 'El ID del pedido no es válido' });
  const usesDecisionFlow = typeof req.body?.listo === 'boolean';
  if (!usesDecisionFlow && !Array.isArray(req.body?.productos)) {
    return res.status(400).json({ error: 'Debes indicar si el pedido está listo o reportar sus novedades' });
  }

  try {
    const result = await markOrderPrepared({
      orderId: id,
      userId: req.user.id,
      submittedLines: req.body.productos,
      ready: usesDecisionFlow ? req.body.listo : undefined,
      observation: req.body.observaciones
    });
    if (!result) return res.status(404).json({ error: 'Pedido no encontrado' });
    if (!result.complete) {
      return res.json({
        success: true,
        complete: false,
        message: 'Las verificaciones y novedades quedaron registradas para revisión de Administración. El pedido sigue bloqueado para Envío.',
        attemptId: result.id,
        novedades: result.missingLines.map((line) => ({
          idProducto: line.productId,
          producto: line.productName,
          tipo: line.issueType || 'Otra novedad',
          descripcion: line.observation
        }))
      });
    }
    return res.json({
      success: true,
      complete: true,
      message: 'Alistamiento completo. El pedido está disponible para Mensajería.',
      attemptId: result.id
    });
  } catch (error) {
    return sendModelError(res, error);
  }
};

export const beginOrderPreparation = async (req, res) => {
  const id = parseOrderId(req.params.id);
  if (!id) return res.status(400).json({ error: 'El ID del pedido no es válido' });

  try {
    const result = await startOrderPreparation({ orderId: id, userId: req.user.id });
    if (!result) return res.status(404).json({ error: 'Pedido no encontrado' });
    return res.json({
      success: true,
      alreadyStarted: result.alreadyStarted,
      message: result.alreadyStarted
        ? 'El pedido ya estaba en preparación.'
        : 'Preparación iniciada.'
    });
  } catch (error) {
    return sendModelError(res, error);
  }
};

export const getOrdersForPreparation = async (req, res) => {
  try {
    const orders = await findOrdersForPreparation(req.user.id);
    return res.json({ success: true, orders });
  } catch (error) {
    console.error('Error al consultar pedidos pendientes de alistamiento:', error);
    return res.status(500).json({ error: 'No se pudieron consultar los pedidos pendientes de alistamiento' });
  }
};

export const getBodegaIssues = async (req, res) => {
  try {
    const roles = Array.isArray(req.user.roles)
      ? req.user.roles
      : [req.user.role || req.user.roles].filter(Boolean);
    const userId = roles.some((role) => String(role).trim().toLowerCase() === 'administrador')
      ? null
      : req.user.id;
    return res.json({ success: true, issues: await findPreparationIssues({ userId }) });
  } catch (error) {
    console.error('Error al consultar novedades de Bodega:', error);
    return res.status(500).json({ error: 'No se pudieron consultar las novedades de Bodega' });
  }
};

export const getBodegaOrderIssues = async (req, res) => {
  const id = parseOrderId(req.params.id);
  if (!id) return res.status(400).json({ error: 'El ID del pedido no es válido' });
  try {
    return res.json({
      success: true,
      issues: await findPreparationIssuesForOrder({ orderId: id, userId: req.user.id })
    });
  } catch (error) {
    console.error('Error al consultar las novedades del pedido de Bodega:', error);
    return res.status(500).json({ error: 'No se pudieron consultar las novedades del pedido' });
  }
};

export const respondToBodegaIssue = async (req, res) => {
  const id = parseOrderId(req.params.id);
  const status = req.body?.estado;
  const response = typeof req.body?.respuesta === 'string' ? req.body.respuesta.trim() : '';
  if (!id) return res.status(400).json({ error: 'El ID de la novedad no es válido' });
  if (!['En revisión', 'Resuelto', 'Rechazado'].includes(status)) {
    return res.status(400).json({ error: 'Selecciona un estado válido para la novedad' });
  }
  if (!response || response.length > 1000) {
    return res.status(400).json({ error: 'La respuesta es obligatoria y debe tener máximo 1000 caracteres' });
  }
  try {
    const updated = await updatePreparationIssue({
      issueId: id,
      administratorId: req.user.id,
      status,
      response
    });
    if (!updated) return res.status(404).json({ error: 'Novedad de Bodega no encontrada' });
    return res.json({ success: true, message: 'Respuesta de Administración guardada' });
  } catch (error) {
    if (error.code === 'PREPARATION_ISSUE_CLOSED') {
      return res.status(409).json({ error: error.message });
    }
    console.error('Error al responder una novedad de Bodega:', error);
    return res.status(500).json({ error: 'No se pudo guardar la respuesta de Administración' });
  }
};

export const getPreparedOrders = async (_req, res) => {
  try {
    const orders = await findPreparedOrders();
    return res.json({ success: true, orders });
  } catch (error) {
    console.error('Error al consultar pedidos preparados:', error);
    return res.status(500).json({ error: 'No se pudieron consultar los pedidos preparados' });
  }
};

export const getOrderPreparationHistory = async (req, res) => {
  const id = parseOrderId(req.params.id);
  if (!id) return res.status(400).json({ error: 'El ID del pedido no es válido' });
  try {
    const history = await findPreparationHistory(id);
    return res.json({ success: true, history });
  } catch (error) {
    console.error('Error al consultar el historial de alistamiento:', error);
    return res.status(500).json({ error: 'No se pudo consultar el historial de alistamiento' });
  }
};

export const getOrderOperationHistory = async (req, res) => {
  const id = parseOrderId(req.params.id);
  if (!id) return res.status(400).json({ error: 'El ID del pedido no es válido' });
  try {
    const history = await findOrderOperationHistory(id);
    return res.json({ success: true, history });
  } catch (error) {
    console.error('Error al consultar el historial de operaciones del pedido:', error);
    return res.status(500).json({ error: 'No se pudo consultar el historial de operaciones' });
  }
};

export const assignOrder = async (req, res) => {
  const id = parseOrderId(req.params.id);
  if (!id) return res.status(400).json({ error: 'El ID del pedido no es válido' });

  try {
    const assigned = await assignDeliveryToCourier(id, req.user.id);
    if (!assigned) return res.status(404).json({ error: 'Pedido no encontrado' });
    res.status(201).json({ success: true, message: 'Pedido asignado a tu ruta' });
  } catch (error) {
    return sendModelError(res, error);
  }
};

export const reassignOrder = async (req, res) => {
  const id = parseOrderId(req.params.id);
  const courierId = Number(req.body?.mensajeroId);
  const motivo = typeof req.body?.motivo === 'string' ? req.body.motivo.trim() : '';
  if (!id) return res.status(400).json({ error: 'El ID del pedido no es válido' });
  if (!Number.isInteger(courierId) || courierId <= 0) {
    return res.status(400).json({ error: 'El mensajero de destino no es válido' });
  }
  if (!motivo || motivo.length > 255) {
    return res.status(400).json({ error: 'El motivo de reasignación es obligatorio y debe tener máximo 255 caracteres' });
  }

  try {
    const reassigned = await reassignDelivery(id, courierId, req.user.id, motivo);
    if (!reassigned) return res.status(404).json({ error: 'Pedido no encontrado' });
    res.json({ success: true, message: 'Pedido reasignado correctamente' });
  } catch (error) {
    return sendModelError(res, error);
  }
};

export const getOrderAssignmentHistory = async (req, res) => {
  const id = parseOrderId(req.params.id);
  if (!id) return res.status(400).json({ error: 'El ID del pedido no es válido' });

  try {
    const roles = (req.user.roles || []).map((role) => String(role).trim().toLowerCase());
    const result = await findAssignmentHistory(id, req.user.id, roles.includes('administrador'));
    if (!result) return res.status(404).json({ error: 'Pedido no encontrado' });
    res.json({ success: true, ...result });
  } catch (error) {
    return sendModelError(res, error);
  }
};

export const addDeliveryEvidence = async (req, res) => {
  const id = parseOrderId(req.params.id);
  if (!id) return res.status(400).json({ error: 'El ID del pedido no es válido' });
  if (!req.file?.buffer) return res.status(400).json({ error: 'Debes seleccionar una imagen como evidencia' });

  let metadata;
  try {
    metadata = getImageMetadata(req.file.buffer);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }

  try {
    const confirmed = await confirmDeliveryWithEvidence({
      orderId: id,
      courierId: req.user.id,
      buffer: req.file.buffer
    });
    if (!confirmed) return res.status(404).json({ error: 'Pedido no encontrado' });
    return res.json({
      success: true,
      message: 'Entrega confirmada y evidencia guardada',
      evidence: { mimeType: metadata.mimeType, size: metadata.size }
    });
  } catch (error) {
    if (error.code === 'INVALID_IMAGE') return res.status(400).json({ error: error.message });
    return sendModelError(res, error);
  }
};

export const getOrderEvidence = async (req, res) => {
  const id = parseOrderId(req.params.id);
  if (!id) return res.status(400).json({ error: 'El ID del pedido no es válido' });

  try {
    const roles = (req.user.roles || []).map((role) => String(role).trim().toLowerCase());
    const evidence = await findDeliveryEvidence(id, req.user.id, roles);
    if (!evidence) return res.status(404).json({ error: 'Pedido no encontrado' });
    return res.json({ success: true, evidence });
  } catch (error) {
    return sendModelError(res, error);
  }
};

export const getEvidenceImage = async (req, res) => {
  const evidenceId = parseOrderId(req.params.id);
  if (!evidenceId) return res.status(400).json({ error: 'El ID de la evidencia no es válido' });

  try {
    const roles = (req.user.roles || []).map((role) => String(role).trim().toLowerCase());
    const evidence = await findDeliveryEvidenceImage(evidenceId, req.user.id, roles);
    if (!evidence) return res.status(404).json({ error: 'Evidencia no encontrada' });

    const match = /^entregas\/([0-9a-f-]{36}\.(?:jpg|png|webp))$/.exec(evidence.relativePath);
    if (!match) {
      console.error('La evidencia registrada contiene una ruta no válida:', evidence.id);
      return res.status(500).json({ error: 'No se pudo recuperar la evidencia' });
    }
    const filename = match[1];
    res.set('Cache-Control', 'private, no-store');
    res.set('X-Content-Type-Options', 'nosniff');
    return res.type(evidence.mimeType).sendFile(filename, { root: deliveryImagesDirectory }, (error) => {
      if (error && !res.headersSent) {
        if (error.code === 'ENOENT') return res.status(404).json({ error: 'El archivo de evidencia no está disponible' });
        console.error('Error al servir evidencia de entrega:', error);
        return res.status(500).json({ error: 'No se pudo recuperar la evidencia' });
      }
    });
  } catch (error) {
    return sendModelError(res, error);
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const orders = req.user.id
      ? await findOrdersByUser(req.user.id)
      : await findOrdersByEmail(req.user.email);
    res.json({ success: true, orders });
  } catch (error) {
    console.error('Error al consultar mis pedidos:', error);
    res.status(500).json({ error: 'No se pudieron consultar tus pedidos' });
  }
};

export const placeOrder = async (req, res) => {
  const { direccion, ciudad, telefono, pago, productos } = req.body;
  if (!direccion || !ciudad || !telefono || !pago || !Array.isArray(productos) || productos.length === 0) {
    return res.status(400).json({ error: 'Faltan datos del pedido' });
  }

  try {
    const id = await createOrder({ userId: req.user.id, userEmail: req.user.email, direccion, ciudad, telefono, pago, productos });
    res.status(201).json({ success: true, message: 'Pedido creado correctamente', id });
  } catch (error) {
    console.error('Error al crear pedido:', error);
    if (error.code === 'CLIENT_NOT_FOUND') return res.status(400).json({ error: error.message });
    if (error.code === 'INSUFFICIENT_STOCK') return res.status(409).json({ error: error.message });
    res.status(500).json({ error: 'No se pudo crear el pedido' });
  }
};

export const changeOrderStatus = async (req, res) => {
  const id = Number(req.params.id);
  const { estado } = req.body;

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'El ID del pedido no es válido' });
  }
  if (!allowedStatuses.includes(estado)) {
    return res.status(400).json({ error: 'El estado del pedido no es válido' });
  }

  const roles = (req.user.roles || []).map((role) => String(role).trim().toLowerCase());
  if (roles.includes('mensajero') && !['En camino', 'Entregado'].includes(estado)) {
    return res.status(403).json({ error: 'El mensajero solo puede iniciar o completar una entrega' });
  }

  try {
    const updated = await updateOrderStatus(id, estado, req.user.id, roles);
    if (!updated) return res.status(404).json({ error: 'Pedido no encontrado' });

    res.json({ success: true, message: 'Estado del pedido actualizado correctamente' });
  } catch (error) {
    return sendModelError(res, error);
  }
};
