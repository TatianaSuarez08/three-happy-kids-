import mysql from 'mysql2/promise'; // Cliente MySQL que soporta Promises (async/await)
import { env } from './config/env.js';

// Configuración de la conexión y del pool de conexiones usando variables de entorno
const config = {
  host: env.DB_HOST, // Host de la base de datos (ej. 'localhost')
  user: env.DB_USER, // Usuario de la base de datos
  password: env.DB_PASSWORD, // Contraseña del usuario
  database: env.DB_DATABASE, // Nombre de la base de datos a usar
  waitForConnections: true, // Esperar por conexiones disponibles antes de fallar
  connectionLimit: 10, // Número máximo de conexiones en el pool
  queueLimit: 0, // Límite de cola de peticiones (0 = sin límite)
};

// Crea y exporta un pool de conexiones reutilizable para consultas a la base de datos
export const pool = mysql.createPool(config);

export const verifyDatabaseConnection = async () => {
  const connection = await pool.getConnection();
  try {
    await connection.query('SELECT 1');
  } finally {
    connection.release();
  }
};

export default pool; // Export por defecto del pool para importaciones sencillas
