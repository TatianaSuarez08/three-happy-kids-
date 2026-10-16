import { findActiveCategories, findActiveDocumentTypes } from '../models/CatalogoModel.js';

export const getCategories = async (_req, res) => {
  try {
    const categories = await findActiveCategories();
    res.json({ success: true, categories });
  } catch (error) {
    console.error('Error al consultar categorías:', error);
    res.status(500).json({ error: 'No se pudieron consultar las categorías' });
  }
};

export const getDocumentTypes = async (_req, res) => {
  try {
    const documentTypes = await findActiveDocumentTypes();
    res.json({ success: true, documentTypes });
  } catch (error) {
    console.error('Error al consultar tipos de documento:', error);
    res.status(500).json({ error: 'No se pudieron consultar los tipos de documento' });
  }
};
