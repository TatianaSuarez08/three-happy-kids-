export const API_CONFIG = {
  BASE_URL: import.meta.env?.VITE_BACKEND_URL || 'http://localhost:3000',
  API_PREFIX: '/api/v1',
  TIMEOUT_MS: 20000,
};

export const buildApiUrl = (path = '') => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_CONFIG.BASE_URL}${API_CONFIG.API_PREFIX}${normalizedPath}`;
};
