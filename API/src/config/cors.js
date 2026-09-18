import cors from 'cors';
import { env } from './env.js';

const isAllowedOrigin = (origin) => !origin || env.FRONTEND_ORIGINS.includes(origin);

export const corsMiddleware = cors({
  origin(origin, callback) {
    if (isAllowedOrigin(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Origen no permitido por la API Gateway.'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Internal-Api-Key'],
});
