import { request } from './httpClient';

export const login = (credentials) => request('/login', {
  method: 'POST',
  body: JSON.stringify(credentials)
});

export const register = (user) => request('/registro', {
  method: 'POST',
  body: JSON.stringify(user)
});

export const healthCheck = () => request('/health');