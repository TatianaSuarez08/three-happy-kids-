import { adjustInventory, findInventoryMovementsByProductId } from '../models/InventarioModel.js';

export const getInventoryHistory = async (req, res) => {
  const productId = Number.parseInt(req.params.id, 10);

  if (!Number.isInteger(productId)) {
    return res.status(400).json({ error: 'El ID del producto no es válido' });
  }

  try {
    const movements = await findInventoryMovementsByProductId(productId);
    res.json({ success: true, movements });
  } catch (error) {
    console.error('Error al consultar historial del inventario:', error);
    res.status(500).json({ error: 'No se pudo consultar el historial de inventario' });
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
  if (!Number.isFinite(parsedCantidad) || parsedCantidad <= 0) {
    return res.status(400).json({ error: 'La cantidad debe ser un número mayor a cero' });
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
