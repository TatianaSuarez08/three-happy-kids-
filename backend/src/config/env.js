import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseCorsOrigins } from './corsOrigins.js';

const currentFile = fileURLToPath(import.meta.url);
const currentDirectory = path.dirname(currentFile);
dotenv.config({ path: path.resolve(currentDirectory, '../../.env') });
dotenv.config({ path: path.resolve(currentDirectory, '../../../.env') });

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET es obligatorio. Configúralo en backend/.env o en el archivo .env raíz antes de iniciar el servidor.');
}

export const env = {
  PORT: process.env.PORT || '3000',
  JWT_SECRET: process.env.JWT_SECRET,
  DB_HOST: process.env.DB_HOST,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD || '',
  DB_DATABASE: process.env.DB_DATABASE,
  CORS_ORIGIN: parseCorsOrigins(process.env.CORS_ORIGIN)
};