import { createOrder, findOrders, findOrdersByEmail, findOrdersByUser, updateOrderStatus } from '../models/PedidoModel.js';

const allowedStatuses = ['Cancelado'];
const metodosPago = new Set(['efectivo', 'transferencia', 'nequi', 'daviplata']);

export const getOrders = async (_req, res) => {
  try {
    const orders = await findOrders();
    res.json({ success: true, orders });
  } catch (error) {
    console.error('Error al consultar pedidos:', error);
    res.status(500).json({ error: 'No se pudieron consultar los pedidos' });
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
  const direccion = typeof req.body.direccion === 'string' ? req.body.direccion.trim() : '';
  const ciudad = typeof req.body.ciudad === 'string' ? req.body.ciudad.trim() : '';
  const telefono = typeof req.body.telefono === 'string' ? req.body.telefono.trim() : '';
  const pago = typeof req.body.pago === 'string' ? req.body.pago.trim().toLowerCase() : '';
  const { productos } = req.body;
  if (!direccion || !ciudad || !telefono || !pago || !Array.isArray(productos) || productos.length === 0) {
    return res.status(400).json({ error: 'Completa la dirección, ciudad, teléfono, método de pago y productos' });
  }
  if (direccion.length > 150 || ciudad.length > 60) {
    return res.status(400).json({ error: 'La dirección o la ciudad superan la longitud permitida' });
  }
  if (!/^[0-9]{10}$/.test(telefono)) {
    return res.status(400).json({ error: 'El teléfono debe tener exactamente 10 números, sin espacios ni símbolos' });
  }
  if (!metodosPago.has(pago)) {
    return res.status(400).json({ error: 'El método de pago seleccionado no es válido' });
  }

  try {
    const id = await createOrder({ userId: req.user.id, userEmail: req.user.email, direccion, ciudad, telefono, pago, productos });
    res.status(201).json({
      success: true,
      message: 'Pedido creado correctamente. El pago está pendiente según el método seleccionado.',
      id,
      estadoPago: 'Pendiente'
    });
  } catch (error) {
    console.error('Error al crear pedido:', error);
    if (error.code === 'CLIENT_NOT_FOUND') return res.status(400).json({ error: error.message });
    if (error.code === 'INVALID_ORDER_ITEMS') return res.status(400).json({ error: error.message });
    if (error.code === 'CART_CHANGED') return res.status(409).json({ error: error.message });
    if (error.code === 'INSUFFICIENT_STOCK') return res.status(409).json({ error: error.message });
    res.status(500).json({ error: 'No se pudo crear el pedido' });
  }
};

export const changeOrderStatus = async (req, res) => {
  const id = Number(req.params.id);
  const { estado } = req.body;

  if (!Number.isSafeInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'El ID del pedido no es válido' });
  }
  if (!allowedStatuses.includes(estado)) {
    return res.status(400).json({ error: 'El estado del pedido no es válido' });
  }

  try {
    const updated = await updateOrderStatus(id, estado, req.user.id);
    if (!updated) return res.status(404).json({ error: 'Pedido no encontrado' });

    res.json({ success: true, message: 'Estado del pedido actualizado correctamente' });
  } catch (error) {
    console.error('Error al actualizar pedido:', error);
    if (error.code === 'ORDER_STATUS_CONFLICT') {
      return res.status(409).json({ error: error.message });
    }
    res.status(500).json({ error: 'No se pudo actualizar el estado del pedido' });
  }
};
