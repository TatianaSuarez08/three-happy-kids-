export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';

export const getSessionToken = () => {
  const storage = localStorage.getItem('token') ? localStorage : sessionStorage;
  return storage.getItem('token');
};

export const request = async (path, options = {}) => {
  const token = getSessionToken();
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  const headers = {
    ...(options.body && !isFormData ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers
  };

  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await response.json() : null;

  if (!response.ok) {
    throw new Error(data?.error || `No se pudo completar la solicitud (${response.status}).`);
  }

  return data;
};

export const requestBlob = async (path) => {
  const token = getSessionToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });

  if (!response.ok) {
    const contentType = response.headers.get('content-type') || '';
    const data = contentType.includes('application/json') ? await response.json() : null;
    throw new Error(data?.error || `No se pudo consultar la evidencia (${response.status}).`);
  }

  return response.blob();
};
