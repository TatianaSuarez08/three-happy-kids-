import express from 'express';
import request from 'supertest';

jest.mock('../../db.js', () => ({
  pool: {
    query: jest.fn()
  }
}));

import { pool } from '../../db.js';
import healthRouter from '../HealthRoute.js';

const app = express();
app.use(healthRouter);

describe('GET /health', () => {
  beforeEach(() => {
    pool.query.mockReset();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('responde que la API está saludable cuando la base de datos responde', async () => {
    pool.query.mockResolvedValueOnce([[]]);

    const response = await request(app).get('/health');

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ ok: true });
    expect(pool.query).toHaveBeenCalledWith('SELECT 1');
  });

  test('responde con error de servicio cuando falla la conexión a la base de datos', async () => {
    const databaseError = new Error('Database unavailable');
    pool.query.mockRejectedValueOnce(databaseError);
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

    const response = await request(app).get('/health');

    expect(response.statusCode).toBe(503);
    expect(response.body).toEqual({
      ok: false,
      error: 'Base de datos no disponible'
    });
    expect(consoleError).toHaveBeenCalledWith(
      'Health check de base de datos falló:',
      databaseError.message
    );
  });
});
