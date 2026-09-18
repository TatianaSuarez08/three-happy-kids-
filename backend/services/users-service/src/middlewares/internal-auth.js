import crypto from 'node:crypto';
import { env } from '../config/env.js';

export const requireInternalGateway = (req, res, next) => {
  if (!env.INTERNAL_API_KEY) {
    return next();
  }

  const receivedKey = Buffer.from(req.get('x-internal-api-key') || '');
  const expectedKey = Buffer.from(env.INTERNAL_API_KEY);
  const isValid = receivedKey.length === expectedKey.length
    && crypto.timingSafeEqual(receivedKey, expectedKey);

  if (!isValid) {
    return res.status(403).json({ error: 'Solicitud interna no autorizada.' });
  }

  return next();
};
