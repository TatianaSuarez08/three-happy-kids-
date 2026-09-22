import {
  addCartItem,
  clearCart,
  findCartByUser,
  removeCartItem,
  updateCartItem
} from '../models/CarritoModel.js';

const parseId = (value) => Number.parseInt(value, 10);
const parseQuantity = (value) => Number.parseInt(value, 10);

export const getCart = async (req, res) => {
  try {
    const cart = await findCartByUser(req.user.id);
    res.json({ success: true, cart });
  } catch (error) {
    console.error('Error al consultar carrito:', error);
    res.status(500).json({ error: 'No se pudo consultar el carrito' });
  }
};

export const createCartItem = async (req, res) => {
  const productId = parseId(req.body.productId ?? req.body.id_producto ?? req.body.id);
  const quantity = parseQuantity(req.body.quantity ?? req.body.cantidad ?? 1);
  if (!Number.isInteger(productId) || !Number.isInteger(quantity) || quantity < 1) {
    return res.status(400).json({ error: 'Producto o cantidad no válidos' });
  }

  try {
    const cart = await addCartItem(req.user.id, productId, quantity);
    if (!cart) return res.status(404).json({ error: 'Producto no encontrado' });
    res.status(201).json({ success: true, cart });
  } catch (error) {
    console.error('Error al agregar al carrito:', error);
    if (error.code === 'CLIENT_NOT_FOUND') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'No se pudo agregar el producto al carrito' });
  }
};

export const changeCartItem = async (req, res) => {
  const productId = parseId(req.params.productId);
  const quantity = parseQuantity(req.body.quantity ?? req.body.cantidad);
  if (!Number.isInteger(productId) || !Number.isInteger(quantity) || quantity < 1) {
    return res.status(400).json({ error: 'Producto o cantidad no válidos' });
  }

  try {
    const cart = await updateCartItem(req.user.id, productId, quantity);
    if (!cart) return res.status(404).json({ error: 'Producto no encontrado en tu carrito' });
    res.json({ success: true, cart });
  } catch (error) {
    console.error('Error al actualizar carrito:', error);
    res.status(500).json({ error: 'No se pudo actualizar el carrito' });
  }
};

export const deleteCartItem = async (req, res) => {
  const productId = parseId(req.params.productId);
  if (!Number.isInteger(productId)) {
    return res.status(400).json({ error: 'El ID del producto no es válido' });
  }

  try {
    const cart = await removeCartItem(req.user.id, productId);
    res.json({ success: true, cart });
  } catch (error) {
    console.error('Error al eliminar del carrito:', error);
    res.status(500).json({ error: 'No se pudo eliminar el producto del carrito' });
  }
};

export const deleteCart = async (req, res) => {
  try {
    await clearCart(req.user.id);
    res.json({ success: true, cart: [] });
  } catch (error) {
    console.error('Error al vaciar carrito:', error);
    res.status(500).json({ error: 'No se pudo vaciar el carrito' });
  }
};
