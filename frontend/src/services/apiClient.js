const API_BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
const API_PREFIX = '/api/v1';
const REQUEST_TIMEOUT_MS = 20000;

const getStoredToken = () => {
  const storage = localStorage.getItem('token') ? localStorage : sessionStorage;
  return storage.getItem('token');
};

const readJsonResponse = async (response) => {
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) return response.json();
  const text = await response.text();
  return text ? { message: text } : {};
};

export const apiClient = async (path, options = {}) => {
  const token = getStoredToken();
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const headers = {
    ...(options.body && !isFormData ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${API_BASE_URL}${API_PREFIX}${normalizedPath}`, {
      ...options,
      headers,
      signal: controller.signal,
    });
    const data = await readJsonResponse(response);

    if (!response.ok) {
      throw new Error(data?.error || data?.message || `Solicitud fallida (${response.status})`);
    }

    return data;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('La solicitud tardó demasiado y fue cancelada.', { cause: error });
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
};
