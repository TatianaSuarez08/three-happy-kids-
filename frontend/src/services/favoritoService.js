import { request } from './httpClient';

export const getFavorites = async () => {
  const data = await request('/favoritos');
  return data?.favorites || [];
};

export const addFavorite = async (productId) => {
  const data = await request('/favoritos', {
    method: 'POST',
    body: JSON.stringify({ productId })
  });
  return data?.favorite || null;
};

export const removeFavorite = (productId) => request(`/favoritos/${productId}`, { method: 'DELETE' });
