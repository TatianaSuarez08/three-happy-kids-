import { request } from './httpClient';

export const getPublicProducts = async () => {
  const data = await request('/productos-publicos');
  return data?.products || [];
};

export const getPublicProduct = async (productId) => {
  const data = await request(`/productos-publicos/${productId}`);
  return data?.product || null;
};

export const getProducts = async () => {
  const data = await request('/productos');
  return data?.products || [];
};

export const getProduct = async (productId) => {
  const data = await request(`/productos/${productId}`);
  return data?.product || null;
};

export const removeProduct = async (productId) => {
  return request(`/productos/${productId}`, { method: 'DELETE' });
};
