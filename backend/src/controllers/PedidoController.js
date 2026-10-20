import { createOrder, findOrders, findOrdersByEmail, findOrdersByUser, updateOrderStatus } from '../models/PedidoModel.js';

const allowedStatuses = ['Pendiente', 'En camino', 'Entregado', 'Cancelado'];

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
  const id = Number.parseInt(req.params.id, 10);
  const { estado } = req.body;

  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: 'El ID del pedido no es válido' });
  }
  if (!allowedStatuses.includes(estado)) {
    return res.status(400).json({ error: 'El estado del pedido no es válido' });
  }

  try {
    const updated = await updateOrderStatus(id, estado);
    if (!updated) return res.status(404).json({ error: 'Pedido no encontrado' });

    res.json({ success: true, message: 'Estado del pedido actualizado correctamente' });
  } catch (error) {
    console.error('Error al actualizar pedido:', error);
    res.status(500).json({ error: 'No se pudo actualizar el estado del pedido' });
  }
};
