import { request } from './httpClient';

export const getCart = async () => {
  const data = await request('/carrito');
  return data?.cart || [];
};

export const addCartItem = async (productId, quantity = 1) => {
  const data = await request('/carrito', {
    method: 'POST',
    body: JSON.stringify({ productId, quantity })
  });
  return data?.cart || [];
};

export const updateCartItem = async (productId, quantity) => {
  const data = await request(`/carrito/${productId}`, {
    method: 'PUT',
    body: JSON.stringify({ quantity })
  });
  return data?.cart || [];
};

export const removeCartItem = async (productId) => {
  const data = await request(`/carrito/${productId}`, { method: 'DELETE' });
  return data?.cart || [];
};

export const clearCart = async () => {
  const data = await request('/carrito', { method: 'DELETE' });
  return data?.cart || [];
};
