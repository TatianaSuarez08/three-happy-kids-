import {
  adjustInventory,
  createPurchaseRecord,
  createAdminActivityReport,
  findEmployeeActivity,
  findAdminActivityReports,
  findInventoryActivityEmployees,
  findInventoryMovementsByProductId,
  findPurchaseCreationOptions,
  findPurchasesForReceipt,
  receivePurchaseItems
} from '../models/InventarioModel.js';

const isAdministrator = (req) => {
  const roles = Array.isArray(req.user?.roles)
    ? req.user.roles
    : req.user?.roles
      ? [req.user.roles]
      : req.user?.role
        ? [req.user.role]
        : [];
  return roles.some((role) => String(role).trim().toLowerCase() === 'administrador');
};

export const getInventoryHistory = async (req, res) => {
  const productId = Number(req.params.id);

  if (!Number.isSafeInteger(productId) || productId <= 0) {
    return res.status(400).json({ error: 'El ID del producto no es válido' });
  }

  try {
    const usuarioId = isAdministrator(req) ? null : req.user.id;
    const movements = await findInventoryMovementsByProductId(productId, usuarioId);
    res.json({ success: true, movements });
  } catch (error) {
    console.error('Error al consultar historial del inventario:', error);
    res.status(500).json({ error: 'No se pudo consultar el historial de inventario' });
  }
};

export const getInventoryActivity = async (req, res) => {
  const isAdmin = isAdministrator(req);
  const requestedUserId = req.query.usuarioId;
  if (isAdmin && requestedUserId !== undefined
    && (!Number.isSafeInteger(Number(requestedUserId)) || Number(requestedUserId) <= 0)) {
    return res.status(400).json({ error: 'El empleado seleccionado no es válido' });
  }
  const { rol = '', categoria = '', evento = '', desde = '', hasta = '' } = req.query;
  if ([rol, categoria, evento, desde, hasta].some((value) => typeof value !== 'string')) {
    return res.status(400).json({ error: 'Los filtros de actividad no son válidos' });
  }
  const isValidDate = (value) => !value || (
    /^\d{4}-\d{2}-\d{2}$/.test(value)
    && !Number.isNaN(Date.parse(`${value}T00:00:00Z`))
    && new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value
  );
  if (!isValidDate(desde) || !isValidDate(hasta) || (desde && hasta && desde > hasta)) {
    return res.status(400).json({ error: 'El intervalo de fechas no es válido' });
  }
  if (rol.length > 50 || categoria.length > 50 || evento.length > 80) {
    return res.status(400).json({ error: 'Uno de los filtros supera la longitud permitida' });
  }

  try {
    const usuarioId = isAdmin
      ? requestedUserId === undefined ? null : Number(requestedUserId)
      : req.user.id;
    const filters = isAdmin
      ? { rol, categoria, evento, desde: desde || null, hasta: hasta || null }
      : {};
    const activity = await findEmployeeActivity(usuarioId, filters);
    const employees = isAdmin ? await findInventoryActivityEmployees() : undefined;
    const reports = isAdmin ? await findAdminActivityReports() : undefined;
    res.json({ success: true, activity, ...(isAdmin ? { employees, reports } : {}) });
  } catch (error) {
    console.error('Error al consultar la actividad de inventario:', error);
    res.status(500).json({ error: 'No se pudo consultar la actividad de inventario' });
  }
};

export const createActivityReport = async (req, res) => {
  const usuarioId = Number(req.body?.usuarioId);
  const { rol, actividadId, motivo, descripcion } = req.body || {};
  if (!Number.isSafeInteger(usuarioId) || usuarioId <= 0
    || typeof rol !== 'string' || rol.trim().length === 0 || rol.length > 50
    || typeof actividadId !== 'string' || actividadId.length > 64
    || typeof motivo !== 'string' || !motivo.trim() || motivo.trim().length > 150
    || typeof descripcion !== 'string' || !descripcion.trim() || descripcion.trim().length > 1000) {
    return res.status(400).json({ error: 'Completa usuario, rol, actividad, motivo y descripción válida' });
  }
  try {
    const report = await createAdminActivityReport({
      adminId: req.user.id,
      usuarioId,
      rol: rol.trim(),
      actividadId,
      motivo: motivo.trim(),
      descripcion: descripcion.trim()
    });
    res.status(201).json({ success: true, report, message: 'Reporte administrativo registrado' });
  } catch (error) {
    if (error.code === 'ACTIVITY_NOT_FOUND') {
      return res.status(404).json({ error: error.message });
    }
    if (error.code === 'INVALID_REPORT_ROLE') {
      return res.status(400).json({ error: error.message });
    }
    console.error('Error al registrar reporte de actividad:', error);
    res.status(500).json({ error: 'No se pudo registrar el reporte' });
  }
};

export const getPurchasesForReceipt = async (_req, res) => {
  try {
    res.json({ success: true, purchases: await findPurchasesForReceipt() });
  } catch (error) {
    console.error('Error al consultar compras pendientes de recepción:', error);
    res.status(500).json({ error: 'No se pudieron consultar las compras' });
  }
};

export const getPurchaseCreationOptions = async (_req, res) => {
  try {
    res.json({ success: true, ...(await findPurchaseCreationOptions()) });
  } catch (error) {
    console.error('Error al consultar opciones de compra:', error);
    res.status(500).json({ error: 'No se pudieron consultar proveedores y productos' });
  }
};

export const createPurchase = async (req, res) => {
  const providerId = Number(req.body?.proveedorId);
  const items = req.body?.productos;
  if (!Number.isSafeInteger(providerId) || providerId <= 0
    || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Selecciona un proveedor y agrega productos a la compra' });
  }
  const seenProducts = new Set();
  const validItems = items.every((item) => {
    const productId = Number(item?.productoId);
    const quantity = Number(item?.cantidad);
    if (!Number.isSafeInteger(productId) || productId <= 0
      || !Number.isSafeInteger(quantity) || quantity <= 0
      || seenProducts.has(productId)) {
      return false;
    }
    seenProducts.add(productId);
    return true;
  });
  if (!validItems) {
    return res.status(400).json({ error: 'Los productos deben ser únicos y tener cantidades enteras mayores a cero' });
  }

  try {
    const purchase = await createPurchaseRecord(
      providerId,
      items.map((item) => ({ productId: Number(item.productoId), quantity: Number(item.cantidad) }))
    );
    res.status(201).json({ success: true, purchase, message: 'Compra registrada y disponible para recepción' });
  } catch (error) {
    if (error.code === 'PROVIDER_NOT_FOUND') {
      return res.status(404).json({ error: 'El proveedor no existe o está inactivo' });
    }
    if (error.code === 'INVALID_PURCHASE_PRODUCTS') {
      return res.status(400).json({ error: 'Uno o más productos no existen, están inactivos o no tienen precio de compra' });
    }
    console.error('Error al registrar compra:', error);
    return res.status(500).json({ error: 'No se pudo registrar la compra' });
  }
};

export const receivePurchase = async (req, res) => {
  const purchaseId = Number(req.params.id);
  if (!Number.isSafeInteger(purchaseId) || purchaseId <= 0) {
    return res.status(400).json({ error: 'El ID de compra no es válido' });
  }
  const idempotencyKey = req.get('Idempotency-Key');
  if (!idempotencyKey || idempotencyKey.length > 128) {
    return res.status(400).json({ error: 'La recepción requiere una clave de idempotencia válida' });
  }
  const items = req.body?.productos;
  const novelties = req.body?.novedades;
  const validItems = Array.isArray(items) && items.every((item) => (
    Number.isSafeInteger(Number(item?.idDetalle))
    && Number(item.idDetalle) > 0
    && Number.isSafeInteger(Number(item?.cantidad))
    && Number(item.cantidad) >= 0
  ));
  const validNoveltyTypes = ['Faltante', 'Sobrante', 'Dañado', 'Talla incorrecta', 'Color incorrecto', 'Otra novedad'];
  const validNovelties = Array.isArray(novelties) && novelties.every((novelty) => (
    Number.isSafeInteger(Number(novelty?.idDetalle))
    && Number(novelty.idDetalle) > 0
    && validNoveltyTypes.includes(novelty.tipo)
    && Number.isSafeInteger(Number(novelty.cantidad))
    && Number(novelty.cantidad) > 0
    && typeof novelty.descripcion === 'string'
    && novelty.descripcion.trim().length > 0
    && novelty.descripcion.length <= 1000
  ));
  if (!validItems || !validNovelties || (!items.length && !novelties.length)) {
    return res.status(400).json({ error: 'Indica cantidades y novedades válidas para la recepción' });
  }

  try {
    const result = await receivePurchaseItems(
      purchaseId,
      req.user.id,
      items.map((item) => ({ idDetalle: Number(item.idDetalle), cantidad: Number(item.cantidad) })),
      novelties.map((novelty) => ({
        idDetalle: Number(novelty.idDetalle),
        tipo: novelty.tipo,
        cantidad: Number(novelty.cantidad),
        descripcion: novelty.descripcion.trim()
      })),
      idempotencyKey
    );
    res.json({ success: true, ...result, message: 'Recepción registrada correctamente' });
  } catch (error) {
    const responses = {
      PURCHASE_NOT_FOUND: [404, 'La compra no existe'],
      PURCHASE_NOT_RECEIVABLE: [409, 'La compra no admite más recepciones'],
      PURCHASE_EMPTY: [409, 'La compra no tiene productos registrados'],
      INVALID_RECEIPT_ITEMS: [400, 'La lista de productos recibidos no es válida'],
      RECEIPT_EXCEEDS_ORDER: [409, 'La cantidad supera lo que falta por recibir'],
      IDEMPOTENCY_KEY_REUSED: [409, 'La clave ya se utilizó para otra recepción']
    };
    const response = responses[error.code];
    if (response) return res.status(response[0]).json({ error: response[1] });
    console.error('Error al registrar recepción de compra:', error);
    return res.status(500).json({ error: 'No se pudo registrar la recepción de compra' });
  }
};

export const createInventoryMovement = async (req, res) => {
  const { productId, tipo, cantidad, motivo, referencia } = req.body;

  if (!Number.isInteger(Number(productId)) || Number(productId) <= 0) {
    return res.status(400).json({ error: 'El producto es obligatorio' });
  }

  if (!['entrada', 'salida', 'ajuste'].includes(String(tipo || '').trim().toLowerCase())) {
    return res.status(400).json({ error: 'El tipo de movimiento no es válido' });
  }

  const parsedCantidad = Number(cantidad);
  if (!Number.isSafeInteger(parsedCantidad) || parsedCantidad <= 0) {
    return res.status(400).json({ error: 'La cantidad debe ser un número entero mayor a cero' });
  }
  const movementReference = String(referencia || '').toUpperCase();
  if (motivo === 'Recepción de compra'
    || movementReference.startsWith('COMPRA:')
    || movementReference.startsWith('RECEPCION_COMPRA:')) {
    return res.status(400).json({ error: 'Registra las compras desde la recepción asociada a su compra' });
  }

  try {
    const movement = await adjustInventory({
      productId: Number(productId),
      tipo,
      cantidad: parsedCantidad,
      delta: String(tipo).trim().toLowerCase() === 'salida' ? -parsedCantidad : parsedCantidad,
      motivo: motivo || 'Ajuste de inventario',
      referencia: referencia || null,
      usuarioId: req.user?.id || null
    });

    res.status(201).json({ success: true, message: 'Movimiento de inventario registrado', movement });
  } catch (error) {
    console.error('Error al registrar movimiento de inventario:', error);

    if (error.code === 'INSUFFICIENT_STOCK') {
      return res.status(400).json({ error: 'No hay suficiente stock para realizar la salida' });
    }

    if (error.code === 'PRODUCT_NOT_FOUND') {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.status(500).json({ error: 'No se pudo registrar el movimiento de inventario' });
  }
};
