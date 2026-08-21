import { findDashboardData } from '../models/DashboardModel.js';

export const getDashboard = async (_req, res) => {
  try {
    const dashboard = await findDashboardData();
    res.json({ success: true, ...dashboard });
  } catch (error) {
    console.error('Error al consultar dashboard:', error);
    res.status(500).json({ error: 'No se pudo cargar el dashboard' });
  }
};
