import test from 'node:test';
import assert from 'node:assert/strict';
import permitRoles, { buildRolePermissions } from '../src/middleware/role.js';

test('el rol bodeguero incluye permisos de bodega e inventario', () => {
  const permissions = buildRolePermissions(['bodeguero']);

  assert.ok(permissions.includes('inventario:read'));
  assert.ok(permissions.includes('inventario:write'));
  assert.ok(permissions.includes('bodega:read'));
  assert.ok(permissions.includes('bodega:write'));
});

test('el rol bodeguero no puede reasignar pedidos', () => {
  const permissions = buildRolePermissions(['bodeguero']);

  assert.ok(!permissions.includes('entregas:reassign'));
  assert.ok(!permissions.includes('entregas:write'));
  assert.ok(!permissions.includes('pedidos:write'));
});

test('administración conserva supervisión y permisos de reasignación', () => {
  const permissions = buildRolePermissions(['administrador']);

  assert.ok(permissions.includes('pedidos:read'));
  assert.ok(permissions.includes('pedidos:write'));
  assert.ok(permissions.includes('entregas:reassign'));
});

test('rutas de asignación y cambio de estados rechazan el rol bodeguero', () => {
  const authorizeMessenger = permitRoles('mensajero');
  const authorizeStateChange = permitRoles('administrador', 'mensajero', { permission: 'pedidos:write' });

  [authorizeMessenger, authorizeStateChange].forEach((authorize) => {
    let statusCode;
    let continued = false;
    authorize(
      { user: { id: 12, roles: ['bodeguero'] } },
      { status(code) { statusCode = code; return this; }, json() {} },
      () => { continued = true; }
    );
    assert.equal(statusCode, 403);
    assert.equal(continued, false);
  });
});
