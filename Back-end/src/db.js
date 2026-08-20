import mysql from 'mysql2/promise'; // Cliente MySQL que soporta Promises (async/await)
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const currentFile = fileURLToPath(import.meta.url);
const currentDirectory = path.dirname(currentFile);
dotenv.config({ path: path.resolve(currentDirectory, '../../.env') });

// Configuración de la conexión y del pool de conexiones usando variables de entorno
const config = {
  host: process.env.DB_HOST, // Host de la base de datos (ej. 'localhost')
  user: process.env.DB_USER, // Usuario de la base de datos
  password: process.env.DB_PASSWORD, // Contraseña del usuario
  database: process.env.DB_DATABASE, // Nombre de la base de datos a usar
  waitForConnections: true, // Esperar por conexiones disponibles antes de fallar
  connectionLimit: 10, // Número máximo de conexiones en el pool
  queueLimit: 0, // Límite de cola de peticiones (0 = sin límite)
};

// Crea y exporta un pool de conexiones reutilizable para consultas a la base de datos
export const pool = mysql.createPool(config);

export default pool; // Export por defecto del pool para importaciones sencillas
