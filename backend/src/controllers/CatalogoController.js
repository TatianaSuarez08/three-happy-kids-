import { findActiveCategories } from '../models/CatalogoModel.js';

export const getCategories = async (_req, res) => {
  try {
    const categories = await findActiveCategories();
    res.json({ success: true, categories });
  } catch (error) {
    console.error('Error al consultar categorías:', error);
    res.status(500).json({ error: 'No se pudieron consultar las categorías' });
  }
};
