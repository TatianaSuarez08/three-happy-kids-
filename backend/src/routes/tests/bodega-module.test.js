import { buildRolePermissions } from '../../middleware/role.js';

describe('permisos del rol bodeguero', () => {
  test('incluye permisos de bodega e inventario', () => {
    const permissions = buildRolePermissions(['bodeguero']);

    expect(permissions).toContain('inventario:read');
    expect(permissions).toContain('inventario:write');
    expect(permissions).toContain('bodega:read');
    expect(permissions).toContain('bodega:write');
  });
});
