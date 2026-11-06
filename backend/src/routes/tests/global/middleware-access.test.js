import express from 'express';
import jwt from 'jsonwebtoken';
import request from 'supertest';

jest.mock('../../../config/env.js', () => ({
  env: { JWT_SECRET: 'test-secret' }
}));

import auth from '../../../middleware/autenticacion.js';
import permitRoles, {
  buildRolePermissions,
  normalizePermissions
} from '../../../middleware/role.js';

const app = express();
app.get(
  '/admin',
  auth,
  permitRoles('administrador', { permission: 'usuarios:read' }),
  (req, res) => res.json({ ok: true, user: req.user })
);

const createToken = (payload) => jwt.sign(payload, 'test-secret');

describe('middleware de autenticación y autorización', () => {
  const evaluateRoleGate = (user, ...allowed) => {
    const req = user === undefined ? {} : { user };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const next = jest.fn();

    permitRoles(...allowed)(req, res, next);
    return { res, next };
  };

  test('normaliza roles y elimina permisos vacíos o duplicados', () => {
    expect(buildRolePermissions()).toEqual([]);
    expect(buildRolePermissions(' CLIENTE ')).toEqual([
      'catalogo:read',
      'pedidos:own:read',
      'pedidos:own:write',
      'comprar'
    ]);
    expect(buildRolePermissions([null, undefined, ' ', 'desconocido', 'cliente']))
      .toEqual(buildRolePermissions('cliente'));
    expect(normalizePermissions()).toEqual([]);
    expect(normalizePermissions('usuarios:read')).toEqual([]);
    expect(normalizePermissions([null, '', ' Usuarios:Read ', 'usuarios:read']))
      .toEqual(['usuarios:read']);
  });

  test('deniega usuarios ausentes y usuarios sin roles ni permisos', () => {
    for (const user of [undefined, {}, { roles: [] }, { permissions: 'usuarios:read' }]) {
      const { res, next } = evaluateRoleGate(user, 'administrador');
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Acceso denegado: credenciales no disponibles'
      });
      expect(next).not.toHaveBeenCalled();
    }
  });

  test('acepta roles, permisos directos y formatos de permiso por módulo', () => {
    const stringRole = evaluateRoleGate({ roles: 'CLIENTE' }, { permission: 'comprar' });
    expect(stringRole.next).toHaveBeenCalledTimes(1);

    const fallbackRole = evaluateRoleGate({ role: 'cliente' }, ' CLIENTE ');
    expect(fallbackRole.next).toHaveBeenCalledTimes(1);

    const directPermission = evaluateRoleGate(
      { roles: [], permissions: [' pedidos:read '] },
      { module: 'pedidos', action: 'read' }
    );
    expect(directPermission.next).toHaveBeenCalledTimes(1);

    const explicitPermission = evaluateRoleGate(
      { permissions: ['custom:access'] },
      { permission: 'custom:access' }
    );
    expect(explicitPermission.next).toHaveBeenCalledTimes(1);
  });

  test('deniega roles desconocidos y especificaciones de permiso vacías', () => {
    const unknownRole = evaluateRoleGate({ roles: ['desconocido'] }, 'administrador');
    expect(unknownRole.res.json).toHaveBeenCalledWith({
      error: 'Acceso denegado: permisos insuficientes'
    });

    const emptyPermission = evaluateRoleGate(
      { roles: [], permissions: ['another:permission'] },
      null,
      [],
      {},
      { permission: '' },
      { module: '', action: 'read' }
    );
    expect(emptyPermission.res.status).toHaveBeenCalledWith(403);
    expect(emptyPermission.res.json).toHaveBeenCalledWith({
      error: 'Acceso denegado: permisos insuficientes'
    });
  });

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
