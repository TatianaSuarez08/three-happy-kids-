import express from 'express';
import jwt from 'jsonwebtoken';
import request from 'supertest';

jest.mock('../../config/env.js', () => ({
  env: { JWT_SECRET: 'test-secret' }
}));

import auth from '../../middleware/autenticacion.js';
import permitRoles from '../../middleware/role.js';

const app = express();
app.get(
  '/admin',
  auth,
  permitRoles('administrador', { permission: 'usuarios:read' }),
  (req, res) => res.json({ ok: true, user: req.user })
);

const createToken = (payload) => jwt.sign(payload, 'test-secret');

describe('middleware de autenticación y autorización', () => {
  test('rechaza solicitudes sin token', async () => {
    const response = await request(app).get('/admin');

    expect(response.statusCode).toBe(401);
    expect(response.body).toEqual({ error: 'Token no proporcionado' });
  });

  test('rechaza tokens inválidos', async () => {
    const response = await request(app)
      .get('/admin')
      .set('Authorization', 'Bearer token-invalido');

    expect(response.statusCode).toBe(401);
    expect(response.body).toEqual({ error: 'Token inválido' });
  });

  test('permite el acceso a un rol autorizado y adjunta su identidad', async () => {
    const token = createToken({ id: 7, roles: ['administrador'] });

    const response = await request(app)
      .get('/admin')
      .set('Authorization', `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      ok: true,
      user: { id: 7, roles: ['administrador'], iat: expect.any(Number) }
    });
  });

  test('permite acceso mediante el permiso incluido en el token', async () => {
    const token = createToken({ id: 8, roles: ['cliente'], permissions: ['usuarios:read'] });

    const response = await request(app)
      .get('/admin')
      .set('Authorization', `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.user.id).toBe(8);
  });

  test('deniega usuarios autenticados sin rol ni permiso requerido', async () => {
    const token = createToken({ id: 9, roles: ['cliente'], permissions: [] });

    const response = await request(app)
      .get('/admin')
      .set('Authorization', `Bearer ${token}`);

    expect(response.statusCode).toBe(403);
    expect(response.body).toEqual({
      error: 'Acceso denegado: permisos insuficientes'
    });
  });
});
