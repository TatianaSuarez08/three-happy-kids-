import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const currentFile = fileURLToPath(import.meta.url);
const currentDirectory = path.dirname(currentFile);
dotenv.config({ path: path.resolve(currentDirectory, '../../../.env') });
dotenv.config({ path: path.resolve(currentDirectory, '../../.env') });
dotenv.config({ path: path.resolve(currentDirectory, '../../../backend/.env') });

export const env = {
  PORT: process.env.API_PORT || '3001',
  BACKEND_URL: process.env.API_BACKEND_URL || 'http://localhost:3000',
  CORS_ORIGIN: (process.env.CORS_ORIGIN || 'http://localhost:5173,http://127.0.0.1:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
};