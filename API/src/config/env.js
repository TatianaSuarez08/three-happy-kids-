import dotenv from 'dotenv';

dotenv.config({ path: new URL('../../../.env', import.meta.url) });
dotenv.config({ path: new URL('../../.env', import.meta.url) });

const parseOrigins = (value) => value
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const required = (name, value) => {
  if (!value) {
    throw new Error(`${name} es obligatorio para iniciar la API Gateway.`);
  }
  return value;
};

export const env = {
  PORT: Number(process.env.GATEWAY_PORT || 3001),
  BACKEND_URL: required('BACKEND_URL', process.env.BACKEND_URL || 'http://localhost:3000'),
  USERS_SERVICE_URL: required(
    'USERS_SERVICE_URL',
    process.env.USERS_SERVICE_URL || 'http://localhost:4001',
  ),
  INTERNAL_API_KEY: process.env.INTERNAL_API_KEY || '',
  FRONTEND_ORIGINS: parseOrigins(
    process.env.FRONTEND_ORIGINS || process.env.CORS_ORIGIN || 'http://localhost:5173',
  ),
  PROXY_TIMEOUT_MS: Number(process.env.PROXY_TIMEOUT_MS || 20000),
  NODE_ENV: process.env.NODE_ENV || 'development',
};
