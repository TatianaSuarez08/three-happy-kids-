import {
  addFavorite,
  findFavoritesByUser,
  removeFavorite
} from '../models/FavoritoModel.js';

const parseProductId = (value) => Number.parseInt(value, 10);

export const getFavorites = async (req, res) => {
  try {
    const favorites = await findFavoritesByUser(req.user.id);
    res.json({ success: true, favorites });
  } catch (error) {
    console.error('Error al consultar favoritos:', error);
    res.status(500).json({ error: 'No se pudieron consultar los favoritos' });
  }
};

export const createFavorite = async (req, res) => {
  const productId = parseProductId(req.body.productId ?? req.body.id_producto);
  if (!Number.isInteger(productId)) {
    return res.status(400).json({ error: 'El ID del producto no es válido' });
  }

  try {
    const favorite = await addFavorite(req.user.id, productId);
    if (!favorite) return res.status(404).json({ error: 'Producto no encontrado' });
    res.status(201).json({ success: true, favorite });
  } catch (error) {
    console.error('Error al agregar favorito:', error);
    res.status(500).json({ error: 'No se pudo agregar el favorito' });
  }
};

export const deleteFavorite = async (req, res) => {
  const productId = parseProductId(req.params.productId);
  if (!Number.isInteger(productId)) {
    return res.status(400).json({ error: 'El ID del producto no es válido' });
  }

  try {
    const removed = await removeFavorite(req.user.id, productId);
    if (!removed) return res.status(404).json({ error: 'Favorito no encontrado' });
    res.json({ success: true });
  } catch (error) {
    console.error('Error al eliminar favorito:', error);
    res.status(500).json({ error: 'No se pudo eliminar el favorito' });
  }
};
