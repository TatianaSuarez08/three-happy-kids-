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
