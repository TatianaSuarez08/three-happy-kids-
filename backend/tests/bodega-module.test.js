import test from 'node:test';
import assert from 'node:assert/strict';
import { buildRolePermissions } from '../src/middleware/role.js';

test('el rol bodeguero incluye permisos de bodega e inventario', () => {
  const permissions = buildRolePermissions(['bodeguero']);

  assert.ok(permissions.includes('inventario:read'));
  assert.ok(permissions.includes('inventario:write'));
  assert.ok(permissions.includes('bodega:read'));
  assert.ok(permissions.includes('bodega:write'));
});
