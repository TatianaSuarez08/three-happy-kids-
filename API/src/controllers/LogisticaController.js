import { getLogisticaResumen } from '../models/LogisticaModel.js';

export const getLogistica = async (_req, res) => {
  try {
    const data = await getLogisticaResumen();
    res.json({ success: true, ...data });
  } catch (error) {
    console.error('Error al consultar logística:', error);
    res.status(500).json({ error: 'No se pudo consultar la información logística' });
  }
};
