import { request } from './httpClient';

export const getCategorias = () => request('/categorias');