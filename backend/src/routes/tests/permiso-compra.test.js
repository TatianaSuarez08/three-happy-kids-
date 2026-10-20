import { buildRolePermissions } from '../../middleware/role.js';

describe('permiso de compra', () => {
  test('todos los roles habilitados para compra incluyen comprar', () => {
    const administrador = buildRolePermissions(['administrador']);
    const bodeguero = buildRolePermissions(['bodeguero']);
    const mensajero = buildRolePermissions(['mensajero']);
    const cliente = buildRolePermissions(['cliente']);

    expect(administrador).toContain('comprar');
    expect(bodeguero).toContain('comprar');
    expect(mensajero).toContain('comprar');
    expect(cliente).toContain('comprar');
  });
});
