import test from 'node:test';
import assert from 'node:assert/strict';
import { buildRolePermissions } from '../src/middleware/role.js';

test('todos los roles habilitados para compra incluyen permiso comprar', () => {
  const administrador = buildRolePermissions(['administrador']);
  const bodeguero = buildRolePermissions(['bodeguero']);
  const mensajero = buildRolePermissions(['mensajero']);
  const cliente = buildRolePermissions(['cliente']);

  assert.ok(administrador.includes('comprar'));
  assert.ok(bodeguero.includes('comprar'));
  assert.ok(mensajero.includes('comprar'));
  assert.ok(cliente.includes('comprar'));
});
