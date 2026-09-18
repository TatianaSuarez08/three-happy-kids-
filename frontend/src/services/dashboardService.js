import { request } from './httpClient';

export const getDashboard = () => request('/dashboard');
export const getLogistica = () => request('/logistica');