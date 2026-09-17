import { request } from './httpClient';

export const getColors = () => request('/colores');
export const getProduct = (id) => request(`/productos/${id}`);
export const createProduct = (product) => request('/productos', { method: 'POST', body: product });
export const updateProduct = (id, product) => request(`/productos/${id}`, { method: 'PUT', body: product });