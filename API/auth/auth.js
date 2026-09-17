import { apiClient } from '../services/apiClient.js';

export const login = (credentials) => apiClient('/login', {
  method: 'POST',
  body: JSON.stringify(credentials)
});

export const register = (payload) => apiClient('/registro', {
  method: 'POST',
  body: JSON.stringify(payload)
});

export const getProfile = () => apiClient('/me');
