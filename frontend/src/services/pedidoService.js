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

export const getOrdersForPreparation = async () => {
  const data = await request('/pedidos/preparacion');
  return data?.orders || [];
};

export const getPreparedOrders = async () => {
  const data = await request('/pedidos/envio');
  return data?.orders || [];
};

export const getPreparationHistory = async (orderId) => {
  const data = await request(`/pedidos/${orderId}/alistamientos`);
  return data?.history || [];
};

export const getOrderOperationHistory = async (orderId) => {
  const data = await request(`/pedidos/${orderId}/operaciones`);
  return data?.history || [];
};

export const getBodegaIssues = async () => {
  const data = await request('/bodega/novedades');
  return data?.issues || [];
};

export const getBodegaOrderIssues = async (orderId) => {
  const data = await request(`/bodega/pedidos/${orderId}/novedades`);
  return data?.issues || [];
};

export const respondToBodegaIssue = async (issueId, update) => request(`/bodega/novedades/${issueId}`, {
  method: 'PATCH',
  body: JSON.stringify(update)
});

export const startOrderPreparation = async (orderId) => {
  return request(`/pedidos/${orderId}/preparacion/iniciar`, { method: 'POST' });
};

export const markOrderPrepared = async (orderId, preparation) => {
  return request(`/pedidos/${orderId}/preparacion`, {
    method: 'PUT',
    body: JSON.stringify(preparation)
  });
};
