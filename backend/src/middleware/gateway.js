import crypto from 'crypto';
import { env } from '../config/env.js';

export default function requireGateway(req, res, next) {
  if (!env.INTERNAL_API_KEY) {
    return next();
  }

  const receivedKey = req.get('x-internal-api-key') || '';
  const expectedKey = Buffer.from(env.INTERNAL_API_KEY);
  const actualKey = Buffer.from(receivedKey);
  const isValid = expectedKey.length === actualKey.length
    && crypto.timingSafeEqual(expectedKey, actualKey);

  if (!isValid) {
    return res.status(403).json({ error: 'Solicitud interna no autorizada.' });
  }

  return next();
}
