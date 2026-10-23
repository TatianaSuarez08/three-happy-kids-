import { request } from './httpClient';

export const getInventoryHistory = async (productId) => {
  const data = await request(`/inventario/${productId}/historial`);
  return data?.movements || [];
};

export const createInventoryMovement = async (movement) => {
  return request('/inventario/movimiento', {
    method: 'POST',
    body: JSON.stringify(movement)
  });
};

export const getAllMovements = async (products) => {
  const movementLists = await Promise.all(
    products.map(async (product) => {
      const movements = await getInventoryHistory(product.id);
      return movements.map((movement) => ({
        ...movement,
        nombreProducto: product.nombre
      }));
    })
  );

  return movementLists
    .flat()
    .sort((first, second) => new Date(second.fecha_movimiento) - new Date(first.fecha_movimiento));
};

export const getEmployeeActivity = async (usuarioId = null, filters = {}) => {
  const params = new URLSearchParams();
  if (usuarioId) params.set('usuarioId', usuarioId);
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  const search = params.toString();
  const query = search ? `?${search}` : '';
  const data = await request(`/inventario/actividad${query}`);
  return {
    activity: data?.activity || [],
    employees: data?.employees || [],
    reports: data?.reports || []
  };
};

export const createActivityReport = (report) => request('/inventario/actividad/reportes', {
  method: 'POST',
  body: JSON.stringify(report)
});

export const getPurchasesForReceipt = async () => {
  const data = await request('/bodega/compras');
  return data?.purchases || [];
};

export const getPurchaseCreationOptions = async () => {
  const data = await request('/admin/compras/opciones');
  return {
    proveedores: data?.proveedores || [],
    productos: data?.productos || []
  };
};

export const createPurchase = (proveedorId, productos) => request('/admin/compras', {
  method: 'POST',
  body: JSON.stringify({ proveedorId, productos })
});

export const receivePurchase = async (purchaseId, productos, novedades, idempotencyKey) => request(
  `/bodega/compras/${purchaseId}/recepcion`,
  {
    method: 'POST',
    body: JSON.stringify({ productos, novedades }),
    idempotencyKey
  }
);
