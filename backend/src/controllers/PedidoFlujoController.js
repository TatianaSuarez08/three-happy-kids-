import path from 'path';
import {
  assignCourierOrder,
  assignWarehouseOrder,
  releaseWarehouseOrder,
  getAvailableCourierOrders,
  getAvailableWarehouseOrders,
  getCourierOrders,
  getCourierHistory,
  getDeliveryEvidence,
  getOrderNovelties,
  getWarehouseOrders,
  resolveOrderNovelty,
  releaseCourierOrder,
  saveDeliveryEvidence,
  savePreparation,
  updateCourierOrderStatus
} from '../models/PedidoFlujoModel.js';
import { defaultDeliveryImagesDirectory, persistEvidenceImage, removeEvidenceImage } from '../services/evidenciaEntregaService.js';

const validId = (value) => {
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
};

const statusFor = (error) => ({
  ORDER_NOT_FOUND: 404,
  EVIDENCE_NOT_FOUND: 404,
  NOVELTY_NOT_FOUND: 404,
  ORDER_NOT_AVAILABLE: 409,
  ORDER_NOT_ASSIGNED: 403,
  INVALID_ORDER_STATE: 409,
  OPEN_NOVELTIES: 409,
  EVIDENCE_REQUIRED: 409,
  EVIDENCE_ALREADY_SAVED: 409,
  INVALID_TRANSITION: 409,
  INVALID_OBSERVATION: 400,
  INVALID_IMAGE: 400,
  PREPARATION_INVALID: 400,
  NOVELTY_ALREADY_RESOLVED: 409
}[error.code] || 500);

const handleError = (res, error, operation) => {
  const status = statusFor(error);
  if (status === 500) console.error(operation, error);
  return res.status(status).json({
    error: status === 500 ? 'No se pudo completar la operación' : error.message
  });
};

const readId = (req, res) => {
  const id = validId(req.params.id);
  if (!id) {
    res.status(400).json({ error: 'El ID debe ser un entero positivo' });
    return null;
  }
  return id;
};

export const getWarehouseAvailable = async (_req, res) => {
  try {
    res.json({ success: true, orders: await getAvailableWarehouseOrders() });
  } catch (error) {
    handleError(res, error, 'Error al consultar pedidos disponibles para Bodega:');
  }
};

export const getWarehouseAssigned = async (req, res) => {
  try {
    res.json({ success: true, orders: await getWarehouseOrders(req.user.id) });
  } catch (error) {
    handleError(res, error, 'Error al consultar pedidos asignados a Bodega:');
  }
};

export const assignWarehouse = async (req, res) => {
  const id = readId(req, res);
  if (!id) return;
  try {
    await assignWarehouseOrder(id, req.user.id);
    res.json({ success: true, message: 'Pedido asignado a tu usuario' });
  } catch (error) {
    handleError(res, error, 'Error al asignar pedido a Bodega:');
  }
};

export const releaseWarehouse = async (req, res) => {
  const id = readId(req, res);
  if (!id) return;
  try {
    await releaseWarehouseOrder(id, req.user.id);
    res.json({ success: true, message: 'El pedido volvió a quedar disponible para Bodega' });
  } catch (error) {
    handleError(res, error, 'Error al liberar pedido de Bodega:');
  }
};

export const submitPreparation = async (req, res) => {
  const id = readId(req, res);
  if (!id) return;
  if (!Array.isArray(req.body?.productos)) {
    return res.status(400).json({ error: 'Envía la lista de productos verificados' });
  }
  try {
    const result = await savePreparation(id, req.user.id, req.body.productos);
    res.json({ success: true, ...result });
  } catch (error) {
    handleError(res, error, 'Error al registrar la preparación del pedido:');
  }
};

export const getCourierAvailable = async (_req, res) => {
  try {
    res.json({ success: true, orders: await getAvailableCourierOrders() });
  } catch (error) {
    handleError(res, error, 'Error al consultar pedidos disponibles para Mensajería:');
  }
};

export const getCourierAssigned = async (req, res) => {
  try {
    res.json({ success: true, orders: await getCourierOrders(req.user.id) });
  } catch (error) {
    handleError(res, error, 'Error al consultar entregas asignadas:');
  }
};

export const assignCourier = async (req, res) => {
  const id = readId(req, res);
  if (!id) return;
  try {
    await assignCourierOrder(id, req.user.id);
    res.json({ success: true, message: 'Pedido asignado a tu usuario' });
  } catch (error) {
    handleError(res, error, 'Error al asignar pedido a Mensajería:');
  }
};

export const releaseCourier = async (req, res) => {
  const id = readId(req, res);
  if (!id) return;
  try {
    await releaseCourierOrder(id, req.user.id);
    res.json({ success: true, message: 'La asignación se liberó y el pedido volvió a estar disponible' });
  } catch (error) {
    handleError(res, error, 'Error al liberar pedido de Mensajería:');
  }
};

export const getCourierActivityHistory = async (req, res) => {
  try {
    res.json({ success: true, history: await getCourierHistory(req.user.id) });
  } catch (error) {
    handleError(res, error, 'Error al consultar el historial de Mensajería:');
  }
};

export const changeCourierStatus = async (req, res) => {
  const id = readId(req, res);
  if (!id) return;
  const { estado, observacion = '' } = req.body || {};
  if (!['En camino', 'Entrega fallida', 'Entregado'].includes(estado)
    || typeof observacion !== 'string' || observacion.length > 1000) {
    return res.status(400).json({ error: 'El estado o la observación no son válidos' });
  }
  try {
    await updateCourierOrderStatus(id, req.user.id, estado, observacion);
    res.json({ success: true, message: 'Estado de entrega actualizado' });
  } catch (error) {
    handleError(res, error, 'Error al actualizar el estado de entrega:');
  }
};

export const uploadCourierEvidence = async (req, res) => {
  const id = readId(req, res);
  if (!id) return;
  if (!req.file?.buffer) return res.status(400).json({ error: 'Selecciona una fotografía de evidencia' });

  let persisted;
  try {
    persisted = await persistEvidenceImage(req.file.buffer);
    await saveDeliveryEvidence(id, req.user.id, persisted.filename);
    res.status(201).json({
      success: true,
      message: 'Evidencia guardada correctamente',
      evidencia: `/api/v1/mensajeria/pedidos/${id}/evidencia`,
      fecha: new Date().toISOString()
    });
  } catch (error) {
    if (persisted) await removeEvidenceImage(persisted.filename);
    handleError(res, error, 'Error al guardar la evidencia de entrega:');
  }
};

export const getCourierEvidence = async (req, res) => {
  const id = readId(req, res);
  if (!id) return;
  try {
    const isAdmin = Array.isArray(req.user.roles)
      && req.user.roles.some((role) => String(role).toLowerCase() === 'administrador');
    const filename = await getDeliveryEvidence(
      id,
      req.user.id,
      isAdmin
    );
    if (!/^[0-9a-f-]{36}\.(jpg|png|webp)$/.test(filename)) {
      return res.status(500).json({ error: 'La referencia de evidencia almacenada no es válida' });
    }
    return res.sendFile(path.join(defaultDeliveryImagesDirectory, filename), (error) => {
      if (error && !res.headersSent) res.status(404).json({ error: 'No se encontró el archivo de evidencia' });
    });
  } catch (error) {
    handleError(res, error, 'Error al consultar la evidencia de entrega:');
  }
};

export const getAdminNovelties = async (_req, res) => {
  try {
    res.json({ success: true, novelties: await getOrderNovelties() });
  } catch (error) {
    handleError(res, error, 'Error al consultar novedades de pedidos:');
  }
};

export const resolveAdminNovelty = async (req, res) => {
  const id = readId(req, res);
  if (!id) return;
  const decision = typeof req.body?.decision === 'string' ? req.body.decision.trim() : '';
  if (!decision || decision.length > 1000) {
    return res.status(400).json({ error: 'Describe la decisión administrativa (máximo 1000 caracteres)' });
  }
  try {
    await resolveOrderNovelty(id, req.user.id, decision);
    res.json({ success: true, message: 'Novedad resuelta' });
  } catch (error) {
    handleError(res, error, 'Error al resolver novedad de pedido:');
  }
};
