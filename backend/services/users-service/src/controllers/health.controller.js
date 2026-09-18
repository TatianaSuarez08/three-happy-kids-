import { checkHealth } from '../services/health.service.js';

export const getHealth = (_req, res) => {
  res.status(200).json({
    success: true,
    data: checkHealth(),
  });
};
