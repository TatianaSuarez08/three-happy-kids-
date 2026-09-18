import { request } from './httpClient';

export const getOrders = async () => {
  const data = await request('/pedidos');
  return data?.orders || [];
};

export const getMyOrders = async () => {
  const data = await request('/mis-pedidos');
  return data?.orders || [];
};

export const createOrder = async (order) => {
  return request('/pedidos', {
    method: 'POST',
    body: JSON.stringify(order)
  });
};

export const updateOrderStatus = async (orderId, estado) => {
  return request(`/pedidos/${orderId}/estado`, {
    method: 'PUT',
    body: JSON.stringify({ estado })
  });
};
