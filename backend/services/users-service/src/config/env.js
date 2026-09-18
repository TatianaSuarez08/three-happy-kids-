import dotenv from 'dotenv';

dotenv.config({ path: new URL('../../../../.env', import.meta.url) });
dotenv.config({ path: new URL('../../../.env', import.meta.url) });

export const env = {
  PORT: Number(process.env.USERS_SERVICE_PORT || 4001),
  NODE_ENV: process.env.NODE_ENV || 'development',
  INTERNAL_API_KEY: process.env.INTERNAL_API_KEY || '',
};
