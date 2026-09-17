import { apiClient } from '../../../API/services/apiClient.js';

export const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;
export const API_ROOT = `${API_BASE_URL}/api/v1`;

export const getSessionToken = () => {
  const storage = localStorage.getItem('token') ? localStorage : sessionStorage;
  return storage.getItem('token');
};

export const request = async (path, options = {}) => apiClient(path, options);

