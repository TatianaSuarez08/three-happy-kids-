import crypto from 'node:crypto';
import { env } from '../config/env.js';

export const addInternalServiceHeader = (proxyReq) => {
  if (env.INTERNAL_API_KEY) {
    proxyReq.setHeader('x-internal-api-key', env.INTERNAL_API_KEY);
  }
};

export const errorHandler = (error, _req, res, _next) => {
  if (error.message === 'Origen no permitido por la API Gateway.') {
    return res.status(403).json({ error: error.message });
  }

  console.error('[gateway]', error.message);
  return res.status(500).json({ error: 'Error interno de la API Gateway.' });
};

export const notFoundHandler = (_req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada en la API Gateway.' });
};

export const createRequestId = (_req, res, next) => {
  const requestId = crypto.randomUUID();
  res.setHeader('X-Request-Id', requestId);
  next();
};
