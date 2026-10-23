import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const currentFile = fileURLToPath(import.meta.url);
const currentDirectory = path.dirname(currentFile);
dotenv.config({ path: path.resolve(currentDirectory, '../../.env') });
dotenv.config({ path: path.resolve(currentDirectory, '../../../backend/.env') });
dotenv.config({ path: path.resolve(currentDirectory, '../../../.env') });

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET es obligatorio. Configúralo en el archivo .env raíz antes de iniciar el servidor.');
}

export const env = {
  PORT: process.env.API_PORT || '3001',
  JWT_SECRET: process.env.JWT_SECRET,
  DB_HOST: process.env.DB_HOST,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD || '',
  DB_DATABASE: process.env.DB_DATABASE,
  CORS_ORIGIN: (process.env.CORS_ORIGIN || 'http://localhost:5173,http://127.0.0.1:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
};