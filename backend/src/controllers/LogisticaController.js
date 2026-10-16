import { getLogisticaResumen } from '../models/LogisticaModel.js';

export const getLogistica = async (req, res) => {
  try {
    const roles = (req.user.roles || []).map((role) => String(role).trim().toLowerCase());
    const isCourier = roles.includes('mensajero');
    const data = await getLogisticaResumen({ userId: req.user.id, isCourier });
    res.json({ success: true, ...data });
  } catch (error) {
    console.error('Error al consultar logística:', error);
    res.status(500).json({ error: 'No se pudo consultar la información logística' });
  }
};
