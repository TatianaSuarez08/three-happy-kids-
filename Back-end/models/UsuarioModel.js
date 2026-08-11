import pool from './db.js';

export const findUserByEmail = async (email) => {
  const [rows] = await pool.execute('SELECT * FROM Usuarios WHERE email = ?', [email]);
  return rows[0];
};

export const createUser = async ({ nombre, email, password }) => {
  await pool.execute(
    'INSERT INTO Usuarios (nombre, email, password) VALUES (?, ?, ?)',
    [nombre, email, password]
  );
  return { nombre, email };
};
